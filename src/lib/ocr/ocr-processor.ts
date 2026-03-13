import { OCRProcessorOutput, PDFProcessorOutput } from "../../types";
import { getGstr1Rectangles } from "./gstr1-rectangles";
import { OcrWorkerPool } from "./ocr-worker-pool";

import OcrWorkerUrl from "../../workers/ocr-worker.ts?worker&url";

export class OcrProcessor {
    private static readonly wScriptUrl: string = OcrWorkerUrl;
    private readonly ocrWorkerPool: OcrWorkerPool;
    private initPromise: Promise<void> | null = null;

    constructor() {
        this.ocrWorkerPool = new OcrWorkerPool(OcrProcessor.wScriptUrl, "eng");
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initPromise) {
            this.initPromise = this.ocrWorkerPool.init().catch((error) => {
                this.initPromise = null;
                throw error;
            });
        }
        return this.initPromise;
    }

    async processOcr(blobsObj: PDFProcessorOutput["result"]): Promise<OCRProcessorOutput> {
        await this.ensureInitialized();
        const ocrFinalOutput: OCRProcessorOutput = { results: {}, errors: [] };

        const validPagesWithRectangles = Object.entries(blobsObj)
            .map(([pageNum, blob]) => {
                const rectangles = getGstr1Rectangles(Number(pageNum));
                if (!rectangles) return null;
                return { pageNum: Number(pageNum), blob, rectangles };
            })
            .filter((x) => x !== null);

        // Queue all tasks concurrently
        const promises = validPagesWithRectangles.map(async ({ pageNum, blob, rectangles }) => {
            const pageNumber = Number(pageNum);
            return this.ocrWorkerPool
                .recognize(blob, rectangles, pageNumber)
                .then((pageResults) => ({ pageNumber, pageResults, error: null }))
                .catch((err) => ({ pageNumber, pageResults: null, error: err }));
        });

        const results = await Promise.all(promises);

        for (const { pageNumber, pageResults, error } of results) {
            if (error) {
                ocrFinalOutput.errors!.push(`OCR failed for page ${pageNumber}: ${error?.message ?? error}`);
            } else if (pageResults) {
                ocrFinalOutput.results[pageNumber] = pageResults;
            }
        }
        await this.terminate();
        return ocrFinalOutput;
    }

    async terminate(): Promise<void> {
        await this.ocrWorkerPool.terminate();
        this.initPromise = null;
    }
}
