export interface PipelineResult {
    rawText: string;
    extractedData: Record<string, any>;
    errors?: string[];
    warnings?: string[];
}

export interface PDFProcessorResult {
    [pageNumber: number]: Blob;
}
