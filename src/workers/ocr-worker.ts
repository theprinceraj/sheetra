import { Worker } from "tesseract.js";
import { InitedMsg, InitMsg, RecognizedMsg, RecognizeMsg, Rectangle, TerminatedMsg, TermMsg } from "../types";

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
        tessWorker = await globalThis.Tesseract.createWorker(lang, undefined, {
            logger: function (m: any) {
                self.postMessage({ type: "progress", id: null, message: m });
            },
        });
    }
    self.postMessage({ type: "inited", success: true } as InitedMsg);
    return;
}

async function onRecognizeMsg(msg: RecognizeMsg): Promise<void> {
    const { id, blob, pageNumber, rectangles } = msg;

    const results: Array<{ box?: Rectangle; text: string; confidence: number }> = [];

    if (!rectangles || rectangles.length === 0) {
        const { data } = await tessWorker!.recognize(blob);
        results.push({ text: data.text, confidence: data.confidence });
    } else {
        for (const r of rectangles) {
            const { data } = await tessWorker!.recognize(blob, { rectangle: r });
            results.push({ box: r, text: data.text, confidence: data.confidence });
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
