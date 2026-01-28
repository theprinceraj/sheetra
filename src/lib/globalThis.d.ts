import * as PDFJS from "pdfjs-dist";
import Tesseract from "tesseract.js";
declare global {
    var pdfjsLib: typeof import("pdfjs-dist");

    interface Window {
        pdfjsLib: typeof import("pdfjs-dist");
    }

    var Tesseract: typeof import("tesseract.js");

    interface Window {
        Tesseract: typeof import("tesseract.js");
    }
}

export {};
