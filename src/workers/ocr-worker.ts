import { PSM, type ConfigResult, type Worker } from "tesseract.js";
import {
    InitedMsg,
    InitMsg,
    ProgressMsg,
    RecognizedMsg,
    RecognizeMsg,
    Rectangle,
    TerminatedMsg,
    TermMsg,
} from "../types";

let tessWorker: Worker | null = null;
let currentLang = "eng";

self.onmessage = async (e: MessageEvent) => {
    const msg = e.data as RecognizeMsg | InitMsg | TermMsg;
    try {
        switch (msg.type) {
            case "init":
                await onInitMsg(msg.lang);
                break;
            case "recognize":
                await onRecognizeMsg(msg);
                break;
            case "terminate":
                await onTermMsg();
                break;
            default:
                console.error("Unknown message type:", msg);
                break;
        }
    } catch (error: any) {
        const id = e.data.id ?? undefined;
        self.postMessage({ type: "error", id, message: error?.message || String(error) });
    }
};

export async function onInitMsg(lang?: string): Promise<void> {
    currentLang = lang ?? "eng";
    if (!tessWorker) {
        const { createWorker } = await import("tesseract.js");
        tessWorker = await createWorker(currentLang, undefined, {
            logger: function (m: TesseractLoggerMessage) {
                self.postMessage({ type: "progress", id: m.jobId, message: m.status } as ProgressMsg);
            },
        });
        await tessWorker.setParameters({
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.- ",
            preserve_interword_spaces: "1",
            tessedit_pageseg_mode: PSM.SINGLE_LINE,
        });
    }
    self.postMessage({ type: "inited", success: true } as InitedMsg);
    return;
}

async function onRecognizeMsg(msg: RecognizeMsg): Promise<void> {
    const { id, blob, pageNumber, rectangles } = msg;
    const results: Array<{ rectangle: Rectangle; text: string; confidence: number }> = [];

    if (rectangles.length === 0) {
        return;
    } else {
        for (const r of rectangles) {
            try {
                const { data } = await tessWorker!.recognize(blob, { rectangle: r });
                results.push({ rectangle: r, text: data.text.trim(), confidence: data.confidence });
            } catch (error) {
                results.push({ rectangle: r, text: "", confidence: -1 });
            }
        }
    }

    self.postMessage({ type: "recognized", id, pageNumber, results } as RecognizedMsg);
    return;
}

async function onTermMsg(): Promise<void> {
    if (tessWorker) {
        await tessWorker.terminate();
        tessWorker = null;
    }
    self.postMessage({ type: "terminated", success: true } as TerminatedMsg);
    return;
}

type TesseractLoggerMessage = {
    jobId: string;
    progress: number;
    status: string;
    userJobId: string;
    workerId: string;
};
