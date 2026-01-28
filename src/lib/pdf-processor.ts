import type { RenderParameters, PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { PDFProcessorResult } from "./types";

export class PDFProcessor {
    private static readonly scale = 2.0;
    constructor() {}

    static {
        if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc)
            pdfjsLib.GlobalWorkerOptions.workerSrc = "//unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs";
    }

    async processPDF(file: File): Promise<PDFProcessorResult> {
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
}
