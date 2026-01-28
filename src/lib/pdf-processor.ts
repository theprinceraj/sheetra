import type { RenderParameters, PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { PDFProcessorResult } from "./types";

export class PDFProcessor {
    private static readonly scale = 2.0;
    private static readonly IMG_CONTAINER_ID = "images-container";
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
        const _result = {} as PDFProcessorResult;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const blob = await this.renderToBlob(page);
            const response = this.displayBlobAsImage({ pageNumber: i, blob }, PDFProcessor.IMG_CONTAINER_ID);
            if (!response) return { result: {}, errors: this.errors };
            _result.result[i] = blob;
        }
        return _result;
    }

    private displayBlobAsImage(obj: { pageNumber: number; blob: Blob }, containerElementId: string): boolean {
        const imgContainer = document.getElementById(containerElementId);
        if (!imgContainer) {
            this.errors.push("Images container not found in DOM");
            return false;
        }

        const label = document.createElement("p");
        label.textContent = `Page ${obj.pageNumber}`;
        imgContainer.appendChild(label);

        const img = document.createElement("img");
        img.src = URL.createObjectURL(obj.blob);
        img.alt = `Page ${Number(obj.pageNumber) + 1}`;
        img.className = "block mb-2 border border-amber-200 rounded-lg max-w-full";
        imgContainer.appendChild(img);
        return true;
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
