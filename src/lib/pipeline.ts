import { OcrProcessor } from "./ocr/ocr-processor";
import { PDFProcessor } from "./pdf-processor";
import type {
    DataClassifierOutput,
    NewExcelGeneratorOutput,
    OCRProcessorOutput,
    PDFProcessorOutput,
    PipelineOutput,
} from "../types";
import { DataClassifier } from "./classifier/data-classifier";
import { NewExcelGenerator } from "./excel/new-excel-generator";

type PipelineTypes = "new" | "existing";

export class Pipeline {
    private readonly pdfProcessor: PDFProcessor;
    private readonly ocrProcessor: OcrProcessor;
    private readonly dataClassifier: DataClassifier;
    private readonly excelGenerator: NewExcelGenerator;
    private terminated = false;

    constructor(type: PipelineTypes) {
        this.pdfProcessor = new PDFProcessor();
        this.ocrProcessor = new OcrProcessor();
        this.dataClassifier = new DataClassifier();
        if (type === "new") this.excelGenerator = new NewExcelGenerator();
        else {
            // TODO: Implement ExistingExcelGenerator
            throw new Error("Pipeline type 'existing' is not yet implemented");
        }
    }

    async processFile(file: File): Promise<PipelineOutput> {
        if (this.terminated) {
            throw new Error("Pipeline has been terminated");
        }
        const pdfProcessorOutput = await this.pdfProcessor.processPDF(file);
        if (!Pipeline.processErrorsAndWarnings(pdfProcessorOutput))
            return { excelBuffer: undefined, errors: pdfProcessorOutput.errors };

        const ocrProcessorOutput = await this.ocrProcessor.processOcr(pdfProcessorOutput.result);
        if (!Pipeline.processErrorsAndWarnings(ocrProcessorOutput))
            return { excelBuffer: undefined, errors: ocrProcessorOutput.errors };

        const recognizedBlocks = Object.values(ocrProcessorOutput.results).flat(1);
        const dataClassifierOutput = this.dataClassifier.classifyResults(recognizedBlocks);
        // No errors in classifying, just log warnings if any and proceed with excel generation
        // Classification errors will likely be caught in excel generation step as missing fields or similar issues.
        Pipeline.processErrorsAndWarnings(dataClassifierOutput);
        console.log("Classified Data:", dataClassifierOutput);

        const excelOutput = await this.excelGenerator.generate(dataClassifierOutput);
        if (!Pipeline.processErrorsAndWarnings(excelOutput))
            return { excelBuffer: undefined, errors: excelOutput.errors };

        return {
            excelBuffer: excelOutput.buffer,
            warnings: [...dataClassifierOutput.warnings, ...excelOutput.warnings],
        };
    }

    async terminate(): Promise<void> {
        if (this.terminated) return;
        this.terminated = true;
        await this.ocrProcessor.terminate();
    }

    private static processErrorsAndWarnings(
        output: PDFProcessorOutput | OCRProcessorOutput | DataClassifierOutput | NewExcelGeneratorOutput,
    ): boolean {
        if ("errors" in output && output.errors && output.errors.length > 0) {
            console.log("Errors:", output.errors);
            return false;
        }
        if ("warnings" in output && output.warnings && output.warnings.length > 0) {
            console.warn("Warnings:", output.warnings);
        }
        return true;
    }
}
