# Sheetra - Client-Side GSTR PDF to Excel Converter

A secure, client-side application that converts GSTR1 PDF forms to structured Excel files using OCR technology, ensuring your confidential documents never leave your computer.

## Architecture Overview

### Modular Pipeline Architecture

The application uses a clean, modular pipeline with well-defined interfaces between each stage:

```
PDF Load → PDF Processing → OCR → Data Normalization → Validation → Excel Generation → Download
```

### Core Components

#### 1. **PDF Processor** (`src/lib/pdf-processor.ts`)

- Uses `pdfjs-dist` for client-side PDF parsing
- Extracts text directly from text-based PDFs
- Renders image-based pages to canvas for OCR processing
- Supports incremental page-by-page processing for large files

#### 2. **OCR Processor** (`src/lib/ocr-processor.ts`)

- Uses `tesseract.js` with dedicated Web Workers
- Worker pool architecture to avoid blocking the main thread
- Processes pages asynchronously with progress reporting
- Confidence scoring for quality assessment

#### 3. **Data Normalizer** (`src/lib/data-normalizer.ts`)

- Parses GSTR1 specific form structures
- Extracts structured data (GSTIN, periods, invoice details, amounts)

#### 4. **Validator** (`src/lib/validator.ts`)

- Validates GSTIN format and period formats
- Checks OCR confidence levels
- Performs form-specific data validation
- Provides detailed error and warning reports

#### 5. **Excel Generator** (`src/lib/excel-generator.ts`)

- Uses `exceljs` for structured Excel file creation
- Applies proper formatting, column typing, and totals
- Creates CA-ready Excel files

#### 6. **Pipeline Orchestrator** (`src/lib/pipeline.ts`)

- Coordinates all processing stages
- Manages progress reporting and error handling
- Ensures proper cleanup of resources
- Provides unified API for the UI

### Key Features

- **100% Client-Side**: All processing happens in the browser
- **OCR Support**: Handles both text-based and scanned PDF forms
- **Web Workers**: OCR processing doesn't block the UI
    <!-- - **Progress Tracking**: Real-time progress updates during processing -->
- **Error Handling**: Comprehensive validation and error reporting
  <!-- - **Memory Efficient**: Incremental processing for large files -->
- **Secure**: Documents never leave the user's device
  <!-- - **OCR Coordinate Access**: Query specific regions using bounding box coordinates -->

### Technical Stack

- **Frontend**: Tanstack Start + React + TypeScript + Tailwind CSS
- **PDF Processing**: pdfjs-dist
- **OCR**: tesseract.js with Web Workers
- **Excel Generation**: exceljs
- **Build Tool**: Vite

### Security & Privacy

- All processing occurs client-side
- Files are processed in memory only
- No data is transmitted to external servers
- Web Workers ensure main thread remains responsive
- Automatic cleanup of temporary resources

### Performance Considerations

- Web Workers prevent UI blocking during OCR
- File size limits to prevent browser crashes
- Progress callbacks for user feedback
