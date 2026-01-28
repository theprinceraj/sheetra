import * as PDFJS from "pdfjs-dist";

declare global {
    var pdfjsLib: typeof PDFJS;

    interface Window {
        pdfjsLib: typeof PDFJS;
    }
}

export {};
