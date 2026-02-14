import { OcrProcessor } from "./ocr/ocr-processor";
import { PDFProcessor } from "./pdf-processor";
import type { PipelineOutput } from "../types";
import { DataClassifier } from "./classifier/data-classifier";
import { NewExcelGenerator } from "./excel/new-excel-generator";

export class Pipeline {
    private readonly pdfProcessor: PDFProcessor;
    private readonly ocrProcessor: OcrProcessor;
    private readonly dataClassifier: DataClassifier;
    private readonly excelGenerator: NewExcelGenerator;

    constructor({ type = "new" }: { type: "new" | "existing" }) {
        this.pdfProcessor = new PDFProcessor();
        this.ocrProcessor = new OcrProcessor();
        this.dataClassifier = new DataClassifier();
        if (type === "existing") {
            this.excelGenerator = null as any; // Placeholder for existing ExcelGenerator
        } else this.excelGenerator = new NewExcelGenerator();
    }

    async processFile(file: File): Promise<PipelineOutput> {
        const pdfProcessorOutput = await this.pdfProcessor.processPDF(file);
        if (pdfProcessorOutput.errors && pdfProcessorOutput.errors.length > 0) {
            return { excelBuffer: null, errors: pdfProcessorOutput.errors };
        }

        const ocrProcessorOutput = await this.ocrProcessor.processOcr(pdfProcessorOutput.result);
        if (ocrProcessorOutput.errors && ocrProcessorOutput.errors.length > 0) {
            console.error("OCR Errors:", ocrProcessorOutput.errors);
            return { excelBuffer: null, errors: ocrProcessorOutput.errors };
        }

        const recognizedBlocks = Object.values(ocrProcessorOutput.results).flat(1);
        const dataClassifierOutput = this.dataClassifier.classifyResults(recognizedBlocks);
        if (dataClassifierOutput.warnings.length > 0) {
            console.warn("Data Classification Warnings:", dataClassifierOutput.warnings);
        }
        console.log("Classified Data:", dataClassifierOutput);

        const excelOutput = await this.excelGenerator.generate(dataClassifierOutput);
        if (excelOutput.warnings && excelOutput.warnings.length > 0) {
            console.warn("Excel Generation Warnings:", excelOutput.warnings);
        }

        return {
            excelBuffer: excelOutput.buffer,
            warnings: [...dataClassifierOutput.warnings, ...excelOutput.warnings],
        };
    }
}
