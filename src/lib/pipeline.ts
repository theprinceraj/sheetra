import { OcrProcessor } from "./ocr/ocr-processor";
import { PDFProcessor } from "./pdf-processor";
import type { PipelineOutput } from "../types";
import { DataClassifier } from "./classifier/data-classifier";

export class Pipeline {
    private readonly pdfProcessor: PDFProcessor;
    private readonly ocrProcessor: OcrProcessor;
    private readonly dataClassifier: DataClassifier;

    constructor() {
        this.pdfProcessor = new PDFProcessor();
        this.ocrProcessor = new OcrProcessor();
        this.dataClassifier = new DataClassifier();
    }

    async processFile(file: File): Promise<PipelineOutput> {
        const pdfProcessorOutput = await this.pdfProcessor.processPDF(file);
        if (pdfProcessorOutput.errors && pdfProcessorOutput.errors.length > 0) {
            return { rawText: "", extractedData: {}, errors: pdfProcessorOutput.errors };
        }

        const ocrProcessorOutput = await this.ocrProcessor.processOcr(pdfProcessorOutput.result);
        if (ocrProcessorOutput.errors && ocrProcessorOutput.errors.length > 0) {
            console.error("OCR Errors:", ocrProcessorOutput.errors);
            return { rawText: "", extractedData: {}, errors: ocrProcessorOutput.errors };
        }

        const recognizedBlocks = Object.values(ocrProcessorOutput.results).flat(1);
        const dataClassifierOutput = this.dataClassifier.classifyResults(recognizedBlocks);
        if (dataClassifierOutput.warnings.length > 0) {
            console.warn("Data Classification Warnings:", dataClassifierOutput.warnings);
        }
        console.log("Classified Data:", dataClassifierOutput);

        return { rawText: "", extractedData: {} };
    }
}
