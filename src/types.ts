import { GSTR1_NUMBERS_COLUMN_MAP, GSTR1_STRING_FIELDS_MAP } from "./lib/classifier/mappings/gstr1-maps";
import { GSTR1_SCHEMA } from "./lib/classifier/mappings/gstr1-schema";

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

export interface DataClassifierOutput {
    classifiedData: ClassifiedDataType;
    excelData: ExcelDataType;
    warnings: string[];
    errors: string[];
}

export type ExcelDataType = {
    stringFieldData: Partial<Record<keyof typeof GSTR1_STRING_FIELDS_MAP, string>>;
    numberFieldData: Partial<Record<keyof typeof GSTR1_NUMBERS_COLUMN_MAP, string | null>>; // number field stored as string to preserve formatting
};

export type ClassifiedDataType = Partial<Record<keyof typeof GSTR1_SCHEMA, string>> | {};

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
