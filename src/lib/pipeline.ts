import { PDFProcessor } from "./pdf-processor";
import { PipelineResult } from "./types";

export class Pipeline {
    private readonly pdfProcessor: PDFProcessor;
    private readonly errors: string[];
    private readonly warnings: string[];
    constructor(errors: string[], warnings: string[]) {
        this.pdfProcessor = new PDFProcessor();
        this.errors = errors;
        this.warnings = warnings;
    }

    async processFile(file: File): Promise<PipelineResult> {
        const pdfBlobs = await this.pdfProcessor.processPDF(file);
        const imgContainer = document.getElementById("images-container");
        if (!imgContainer) {
            this.errors.push("Images container not found in DOM");
            return { rawText: "", extractedData: {}, errors: this.errors };
        }
        for (const pageNumber in pdfBlobs) {
            const label = document.createElement("p");
            label.textContent = `Page ${pageNumber}`;
            imgContainer.appendChild(label);

            const img = document.createElement("img");
            img.src = URL.createObjectURL(pdfBlobs[Number(pageNumber)]);
            img.alt = `Page ${Number(pageNumber) + 1}`;
            img.className = "block mb-2 border border-amber-200 rounded-lg max-w-full";
            imgContainer.appendChild(img);
        }

        return { rawText: "", extractedData: {} };
    }
}
