export interface PipelineOutput {
    rawText: string;
    extractedData: Record<string, any>;
    errors?: string[];
    warnings?: string[];
}

export interface PDFProcessorOutput {
    result: { [pageNumber: number]: Blob };
    errors?: string[];
}

export interface OCRProcessorOutput {
    results: { [pageNumber: number]: Array<RecognizedBlockResult> };
    errors?: string[];
}

export type Gstr1RectanglesType = {
    [pageNum: number]: Array<Rectangle>;
};

export type Rectangle = { top: number; left: number; width: number; height: number };

export type RecognizeMsg = {
    type: "recognize";
    id: string;
    blob: Blob;
    pageNumber: number;
    rectangles: Array<Rectangle>;
};

export type InitMsg = { type: "init"; lang?: string };

export type InitedMsg = { type: "inited"; success: boolean };

export type RecognizedBlockResult = { rectangle: Rectangle; text: string; confidence: number };

export type RecognizedMsg = {
    type: "recognized";
    id: string;
    pageNumber?: number;
    results: Array<RecognizedBlockResult>;
};

export type TermMsg = { type: "terminate" };

export type TerminatedMsg = { type: "terminated"; success: boolean };

export type ErrorMsg = { type: "error"; id?: string; message: string };

export type TaskRequest = {
    id: string;
    blob: Blob;
    pageNumber: number;
    rectangles: Rectangle[];
    resolve: (v: any) => void;
    reject: (err: any) => void;
    onProgress?: (p: string) => void;
};
