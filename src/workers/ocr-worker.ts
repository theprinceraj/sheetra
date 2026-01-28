import { createWorker } from "tesseract.js";

self.onmessage = async (e: MessageEvent) => {
    const { blob, pageNumber } = e.data;

    try {
        const worker = await createWorker("eng");
        const result = await worker.recognize(blob);
        const { text, confidence } = result.data;

        console.log("OCR result data:", result.data); // Debug log

        await worker.terminate();

        self.postMessage({
            success: true,
            result: { text, confidence, pageNumber },
        });
    } catch (error) {
        console.error("OCR worker error:", error);
        self.postMessage({
            success: false,
            error: (error as Error).message,
            pageNumber,
        });
    }
};
