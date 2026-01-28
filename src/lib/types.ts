export interface PipelineResult {
    rawText: string;
    extractedData: Record<string, any>;
    errors?: string[];
    warnings?: string[];
}

export interface PDFProcessorResult {
    result: { [pageNumber: number]: Blob };
    errors?: string[];
}
