import { PSM, type Worker, createWorker } from "tesseract.js";
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
        // TODO: type: "error" need to be added to types.ts and handled properly
        self.postMessage({ type: "error", id, message: error?.message || String(error) });
    }
};

async function onInitMsg(lang?: string): Promise<void> {
    currentLang = lang ?? "eng";
    const SPACE_CHAR = " ";
    const CAP_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const LOW_LETTERS = "abcdefghijklmnopqrstuvwxyz";
    const NUMBERS = "0123456789";
    const DASH = "-";
    const DOT = ".";
    const COMMA = ",";
    const WHITELISTED_CHARS = `${CAP_LETTERS}${LOW_LETTERS}${NUMBERS}${COMMA}${DOT}${DASH}${SPACE_CHAR}`;
    if (!tessWorker) {
        tessWorker = await createWorker(currentLang, undefined);
        await tessWorker.setParameters({
            tessedit_char_whitelist: WHITELISTED_CHARS,
            preserve_interword_spaces: "1",
            tessedit_pageseg_mode: PSM.SINGLE_LINE,
        });
    }
    self.postMessage({ type: "inited", success: true } as InitedMsg);
}

async function onRecognizeMsg(msg: RecognizeMsg): Promise<void> {
    if (!tessWorker) throw new Error("Tesseract worker is not initialized. Call init before recognize.");

    const { id, blob, pageNumber, rectangles } = msg;
    const results: Array<{ rectangle: Rectangle; text: string; confidence: number }> = [];
    const CONFIDENCE_ERROR_VALUE = -1;

    if (rectangles.length === 0) {
        return self.postMessage({ type: "recognized", id, pageNumber, results } as RecognizedMsg);
    }
    for (const r of rectangles) {
        try {
            const { data } = await tessWorker!.recognize(blob, { rectangle: r });
            results.push({ rectangle: r, text: data.text.trim(), confidence: data.confidence });
        } catch (error) {
            results.push({ rectangle: r, text: "", confidence: CONFIDENCE_ERROR_VALUE });
        }
    }

    return self.postMessage({ type: "recognized", id, pageNumber, results } as RecognizedMsg);
}

async function onTermMsg(): Promise<void> {
    if (tessWorker) {
        await tessWorker.terminate();
        tessWorker = null;
    }
    self.postMessage({ type: "terminated", success: true } as TerminatedMsg);
}

type TesseractLoggerMessage = {
    jobId: string;
    progress: number;
    status: string;
    userJobId: string;
    workerId: string;
};
