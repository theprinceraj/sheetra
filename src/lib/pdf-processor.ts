import type { RenderParameters, PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { PDFProcessorResult } from "./types";

export class PDFProcessor {
    private static readonly scale = 2.0;
    private readonly errors: string[] = [];
    constructor() {}

    static {
        if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc)
            pdfjsLib.GlobalWorkerOptions.workerSrc = "//unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs";
    }

    async processPDF(file: File): Promise<PDFProcessorResult> {
        if (!this.validateFileAndCollectErrors(file)) {
            return { result: {}, errors: this.errors };
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const result = {} as PDFProcessorResult;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const blob = await this.renderToBlob(page);
            result[i] = blob;
        }
        return result;
    }

    private async renderToBlob(page: PDFPageProxy): Promise<Blob> {
        // Prepare canvas
        const viewport = page.getViewport({ scale: PDFProcessor.scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        } as RenderParameters;
        await page.render(renderContext).promise;

        return new Promise((resolve, rej) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else rej(new Error("Canvas to blob conversion failed"));
            }, "image/png");
        });
    }

    private validateFileAndCollectErrors(file: File): boolean {
        if (file.size > 10 * 1024 * 1024) {
            this.errors.push("File size exceeds 10MB limit");
        } else if (file.type !== "application/pdf") {
            this.errors.push("Invalid file type. Please upload a PDF file.");
        } else if (file.name.trim() === "") {
            this.errors.push("File name cannot be empty.");
        }
        return this.errors.length === 0;
    }
}
