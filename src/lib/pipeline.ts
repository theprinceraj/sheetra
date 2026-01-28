import { PDFProcessor } from "./pdf-processor";
import { PipelineResult } from "./types";

export class Pipeline {
    private readonly pdfProcessor: PDFProcessor;
    private readonly errors: string[] = [];
    private readonly warnings: string[] = [];
    constructor() {
        this.pdfProcessor = new PDFProcessor();
    }

    async processFile(file: File): Promise<PipelineResult> {
        const pdfProcessorResult = await this.pdfProcessor.processPDF(file);
        if (pdfProcessorResult.errors) {
            return { rawText: "", extractedData: {}, errors: pdfProcessorResult.errors };
        }

        // OCR Module here

        return { rawText: "", extractedData: {} };
    }
}
