import { Workbook, Worksheet } from "exceljs";
import type { DataClassifierOutput, NewExcelGeneratorOutput } from "../../types";
import { GSTR1_NUMBERS_COLUMN_MAP, GSTR1_STRING_FIELDS_MAP } from "../classifier/mappings/gstr1-maps";

const TAX_PERIOD_ROW_MAP = {
    April: 9,
    May: 10,
    June: 11,
    July: 12,
    August: 13,
    September: 14,
    October: 15,
    November: 16,
    December: 17,
    January: 18,
    February: 19,
    March: 20,
} as const;

enum WORKBOOK_PAGES_NAMES {
    GSTR1_VS_BOOKS = "GSTR-1 vs Books",
    GSTR3B_VS_BOOKS = "GSTR-3B vs Books",
    GSTR1_VS_GSTR3B = "GSTR-1 vs GSTR-3B",
    ALL_DATE_FILLING_RETURN = "All-Date of Filling Return",
    PAYABLE_RECO = "Payable Reco",
}

export class NewExcelGenerator {
    private workbook: Workbook;
    private worksheet: Worksheet;
    private static readonly workbookTemplateUrl = "/workbook-template.xlsx";

    private async loadNewWorkbookAndSheet(): Promise<void> {
        this.workbook = new Workbook();
        const response = await fetch(NewExcelGenerator.workbookTemplateUrl);
        if (!response.ok) {
            throw new Error(`Failed to load workbook template: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        await this.workbook.xlsx.load(arrayBuffer);

        const sheet = this.workbook.getWorksheet(WORKBOOK_PAGES_NAMES.GSTR1_VS_BOOKS);
        if (!sheet) {
            throw new Error(`Worksheet "${WORKBOOK_PAGES_NAMES.GSTR1_VS_BOOKS}" not found in template`);
        }
        this.worksheet = sheet;
    }

    async generate(classifierOutput: DataClassifierOutput): Promise<NewExcelGeneratorOutput> {
        const warnings: string[] = [],
            errors: string[] = [];

        await this.loadNewWorkbookAndSheet();
        const classifiedData = classifierOutput.classifiedData;
        if (!classifiedData["taxPeriod"]) {
            errors.push("Missing required field: taxPeriod");
            return { buffer: undefined, warnings, errors };
        }
        const taxPeriod = classifiedData["taxPeriod"]!;
        const row = TAX_PERIOD_ROW_MAP[taxPeriod];
        if (!row) {
            errors.push(`Unable to determine row number for tax period: ${taxPeriod}`);
            return { buffer: undefined, warnings, errors };
        }

        // Write string fields
        for (const [cellRef, fieldNames] of Object.entries(GSTR1_STRING_FIELDS_MAP)) {
            const fieldName = fieldNames[0];
            const value = classifiedData[fieldName];
            if (value) this.writeField(this.worksheet, cellRef, value);
        }

        // Write number fields
        for (const [colName, fieldNames] of Object.entries(GSTR1_NUMBERS_COLUMN_MAP)) {
            const values = fieldNames
                .map((field: string) => classifiedData[field])
                .filter((val): val is string => val !== null && val !== undefined);

            if (values.length === 0) continue;

            const sum = NewExcelGenerator.sumNumericValues(values, warnings);

            const cellRef = `${colName}${row}`;
            this.writeField(this.worksheet, cellRef, sum);
        }

        const buffer = await this.workbook.xlsx.writeBuffer();
        return { buffer: new Uint8Array(buffer), warnings, errors };
    }

    private writeField(worksheet: Worksheet, cellRef: string, value: string | number): void {
        const cell = worksheet.getCell(cellRef);
        if (cell.value && typeof value === "string" && typeof cell.value === "string") {
            cell.value = cell.value + " " + value; // concatenate if there's already a value
            return;
        }
        cell.value = value;
    }

    private static sumNumericValues(values: string[], warnings?: string[]): number {
        return values.reduce((sum, val) => {
            const num = parseFloat(val.replaceAll(",", "").replaceAll(" ", ""));
            if (isNaN(num) && warnings) {
                warnings.push(`Failed to parse numeric value: ${val}`);
            }
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
    }
}
