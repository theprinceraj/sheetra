import { OcrProcessor } from "./ocr-processor";
import { PDFProcessor } from "./pdf-processor";
import { OCRProcessorResult, PipelineResult } from "../types";

export class Pipeline {
    private readonly pdfProcessor: PDFProcessor;
    private readonly ocrProcessor: OcrProcessor;
    constructor() {
        this.pdfProcessor = new PDFProcessor();
        this.ocrProcessor = new OcrProcessor();
    }

    async processFile(file: File): Promise<PipelineResult> {
        const pdfProcessorResult = await this.pdfProcessor.processPDF(file);
        if (pdfProcessorResult.errors && pdfProcessorResult.errors.length > 0) {
            return { rawText: "", extractedData: {}, errors: pdfProcessorResult.errors };
        }

        const ocrResults = {} as OCRProcessorResult;

        return { rawText: "", extractedData: {} };
    }
}
