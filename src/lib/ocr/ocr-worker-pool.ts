import {
    ErrorMsg,
    InitedMsg,
    InitMsg,
    RecognizedMsg,
    RecognizeMsg,
    TaskRequest,
    TerminatedMsg,
    TermMsg,
} from "../../types";

export class OcrWorkerPool {
    private workers: Array<Worker> = [];
    private queue: Array<TaskRequest> = [];
    private readonly busyWorkers: Set<number> = new Set();
    private taskMap: Record<string, TaskRequest> = {};
    private workerTaskIndex: Record<number, string | null> = {};
    private idCounter = 0;

    private workerScriptUrl: string;
    private readonly lang: string;

    // Track initialization state
    private initPromise: Promise<void> | null = null;
    private initResolvers: Array<() => void> = [];

    constructor(
        workerScriptUrl: string,
        lang = "eng",
        private readonly size = Math.max(1, navigator.hardwareConcurrency - 1),
    ) {
        this.workerScriptUrl = workerScriptUrl;
        this.lang = lang;
    }

    async init() {
        if (this.workers.length > 0) return;

        const _initResolvers = Array(this.size)
            .fill(null)
            .map(() => {
                let resolver: (() => void) | null = null;
                const promise = new Promise<void>((resolve) => {
                    resolver = resolve;
                });
                return { promise, resolver: resolver! };
            });

        // Create a single promise that waits for all workers
        this.initPromise = Promise.all(_initResolvers.map(({ promise }) => promise)).then();
        this.initResolvers = _initResolvers.map(({ resolver }) => resolver);

        for (let i = 0; i < this.size; i++) {
            const w = new Worker(this.workerScriptUrl, { type: "module" });
            this.workers[i] = w;
            this.workerTaskIndex[i] = null;
            w.onmessage = (e: MessageEvent) => this.handleMessage(e.data, i, w);
            w.onerror = (e: ErrorEvent) => {
                const runningTaskId = this.workerTaskIndex[i];
                if (runningTaskId) {
                    const task = this.taskMap[runningTaskId];
                    if (task) {
                        task.reject(new Error(`Worker ${i} error: ${e.message}`));
                        delete this.taskMap[runningTaskId];
                        this.workerTaskIndex[i] = null;
                    }
                }
                this.busyWorkers.delete(i);
                this.dequeue();
            };
            w.postMessage({ type: "init", lang: this.lang } as InitMsg);
        }
        await this.initPromise;
    }

    recognize(
        blob: TaskRequest["blob"],
        rectangles: TaskRequest["rectangles"],
        pageNumber: TaskRequest["pageNumber"],
        onProgress?: TaskRequest["onProgress"],
    ): Promise<RecognizedMsg["results"]> {
        const id = `ocr-task-${this.idCounter++}`;
        console.log(`Queued OCR task ${id}`);

        return new Promise<RecognizedMsg["results"]>((resolve, reject) => {
            if (!this.initPromise) {
                return reject(new Error("OCR worker pool not initialized. Call init() first."));
            }

            const task: TaskRequest = {
                id,
                blob,
                rectangles,
                pageNumber,
                onProgress,
                resolve,
                reject,
            };
            this.queue.push(task);
            this.dequeue();
        });
    }

    private handleMessage(msg: InitedMsg | RecognizedMsg | TerminatedMsg | ErrorMsg, workerIndex: number, w: Worker) {
        switch (msg.type) {
            case "inited":
                if (this.initResolvers[workerIndex] instanceof Function) {
                    this.initResolvers[workerIndex]();
                }
                break;
            case "error":
            case "recognized":
                const taskId = msg.id;
                if (!taskId) return;
                const task = this.taskMap[taskId];
                if (!task) return;

                if (msg.type === "recognized") {
                    task.resolve(msg.results);
                    console.log(`OCR task ${taskId} completed`);
                } else {
                    task.reject(new Error(msg.message || "OCR worker error"));
                }

                delete this.taskMap[taskId];
                this.busyWorkers.delete(workerIndex);
                this.workerTaskIndex[workerIndex] = null;
                this.dequeue();
                break;
            case "terminated":
                const termedTaskId = this.workerTaskIndex[workerIndex];
                if (termedTaskId) {
                    const termedTask = this.taskMap[termedTaskId];
                    if (termedTask) {
                        termedTask.reject(new Error("OCR worker terminated unexpectedly"));
                        delete this.taskMap[termedTaskId];
                    }
                }
                this.busyWorkers.delete(workerIndex);
                this.workerTaskIndex[workerIndex] = null;
                this.dequeue();
                break;
            default:
                console.error("Unknown message type from OCR worker:", msg);
        }
    }

    async terminate() {
        for (const q of this.queue) {
            q.reject(new Error("OCR worker pool terminated before processing the task"));
        }
        for (const w of this.workers) {
            try {
                w.postMessage({ type: "terminate" } as TermMsg);
            } catch {}
            try {
                w.terminate();
            } catch {}
        }
        this.workers = [];
        this.queue = [];
        this.busyWorkers.clear();
        this.workerTaskIndex = {};
        this.taskMap = {};
        this.initPromise = null;
    }

    private dequeue() {
        if (this.queue.length === 0) return;

        const freeIndex = this.workers.findIndex((_, idx) => !this.busyWorkers.has(idx));
        if (freeIndex === -1) return;

        const task = this.queue.shift();
        if (!task) return;

        this.busyWorkers.add(freeIndex);
        this.taskMap[task.id] = task;
        this.workerTaskIndex[freeIndex] = task.id;
        this.workers[freeIndex].postMessage({
            type: "recognize",
            id: task.id,
            blob: task.blob,
            pageNumber: task.pageNumber,
            rectangles: task.rectangles,
        } as RecognizeMsg);
    }
}
