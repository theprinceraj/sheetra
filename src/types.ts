import { Worker } from "tesseract.js";
import { onInitMsg } from "./workers/ocr-worker";

export interface PipelineResult {
    rawText: string;
    extractedData: Record<string, any>;
    errors?: string[];
    warnings?: string[];
}

export interface PDFProcessorResult {
    result: { [pageNumber: number]: Blob };
    errors?: string[];
}

export interface OCRProcessorResult {
    text: string;

    blocks: Array<{
        text: string;
        boundingBox: { x: number; y: number; width: number; height: number };
        confidence: number;
    }>;

    errors?: string[];
    warnings?: string[];
}

export type Rectangle = { top: number; left: number; width: number; height: number };

export type RecognizeMsg = {
    type: "recognize";
    id: string;
    blob: Blob;
    pageNumber?: number;
    rectangles?: Array<Rectangle>;
};

export type InitMsg = { type: "init"; lang?: string };

export type InitedMsg = { type: "inited"; success: boolean };

export type ProgressMsg = {
    type: "progress";
    id: string | null;
    message: any;
};

export type RecognizedMsg = {
    type: "recognized";
    id: string;
    pageNumber?: number;
    results: Array<{ box?: Rectangle; text: string; confidence: number }>;
};

export type TermMsg = { type: "terminate" };

export type TerminatedMsg = { type: "terminated"; success: boolean };

export type ErrorMsg = { type: "error"; id?: string; message: string };

export type TaskRequest = {
    id: string;
    blob: Blob;
    page?: number;
    boxes?: Rectangle[];
    resolve: (v: any) => void;
    reject: (err: any) => void;
    onProgress?: (p: string) => void;
};
