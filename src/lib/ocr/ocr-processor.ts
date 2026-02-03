import { OCRProcessorOutput, PDFProcessorOutput } from "../../types";
import { getGstr1Rectangles } from "./gstr1-rectangles";
import { OcrWorkerPool } from "./ocr-worker-pool";

export class OcrProcessor {
    private static readonly wScriptUrl: string = new URL("../../workers/ocr-worker.ts", import.meta.url).toString();
    private readonly ocrWorkerPool: OcrWorkerPool;

    constructor() {
        this.ocrWorkerPool = new OcrWorkerPool(OcrProcessor.wScriptUrl, "eng");
        this.ocrWorkerPool.init();
    }

    async processOcr(blobsObj: PDFProcessorOutput["result"]): Promise<OCRProcessorOutput> {
        const ocrFinalOutput: OCRProcessorOutput = { results: {}, errors: [] };

        // Queue all tasks concurrently
        const promises = Object.entries(blobsObj).map(([pageNum, blob]) => {
            const pageNumber = Number(pageNum);
            const rectangles = getGstr1Rectangles(pageNumber);
            if (!rectangles) {
                return Promise.resolve({
                    pageNumber,
                    pageResults: null,
                    error: null,
                });
            }
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

        return ocrFinalOutput;
    }
}
