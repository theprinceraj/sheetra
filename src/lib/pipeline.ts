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
    private excelGenerator: NewExcelGenerator;

    private constructor() {
        this.pdfProcessor = new PDFProcessor();
        this.ocrProcessor = new OcrProcessor();
        this.dataClassifier = new DataClassifier();
    }

    static async create(type: PipelineTypes): Promise<Pipeline> {
        const pipeline = new Pipeline();
        if (type === "new") {
            pipeline.excelGenerator = await NewExcelGenerator.create();
        } else pipeline.excelGenerator = null as any; // Placeholder for ExisitingExcelGenerator
        return pipeline;
    }

    async processFile(file: File): Promise<PipelineOutput> {
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

    private static processErrorsAndWarnings(
        output: PDFProcessorOutput | OCRProcessorOutput | DataClassifierOutput | NewExcelGeneratorOutput,
    ): boolean {
        if ("errors" in output && output.errors && output.errors.length > 0) {
            return false;
        }
        if ("warnings" in output && output.warnings && output.warnings.length > 0) {
            console.warn("Warnings:", output.warnings);
        }
        return true;
    }
}
