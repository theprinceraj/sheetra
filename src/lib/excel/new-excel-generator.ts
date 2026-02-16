import { Style, Workbook, Worksheet } from "exceljs";
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

    private constructor() {}

    static async create(): Promise<NewExcelGenerator> {
        const instance = new NewExcelGenerator();
        instance.workbook = new Workbook();

        const response = await fetch(NewExcelGenerator.workbookTemplateUrl);
        const arrayBuffer = await response.arrayBuffer();
        await instance.workbook.xlsx.load(arrayBuffer);

        const sheet = instance.workbook.getWorksheet(WORKBOOK_PAGES_NAMES.GSTR1_VS_BOOKS);
        if (!sheet) {
            throw new Error(`Worksheet "${WORKBOOK_PAGES_NAMES.GSTR1_VS_BOOKS}" not found in template`);
        }
        instance.worksheet = sheet;
        return instance;
    }

    async generate(classifierOutput: DataClassifierOutput): Promise<NewExcelGeneratorOutput> {
        const warnings: string[] = [],
            errors: string[] = [];

        const classifiedData = classifierOutput.classifiedData;
        const taxPeriod = classifiedData["taxPeriod"];
        const row = TAX_PERIOD_ROW_MAP[taxPeriod!];
        if (!row) {
            errors.push(`Unable to determine row number for tax period: ${taxPeriod}`);
            return { buffer: undefined, warnings, errors };
        }

        // Write string fields
        for (const [cellRef, fieldNames] of Object.entries(GSTR1_STRING_FIELDS_MAP)) {
            const fieldName = fieldNames[0];
            const value = classifiedData[fieldName];
            if (value) this.writeField(cellRef, value);
        }

        // Write number fields
        for (const [colName, fieldNames] of Object.entries(GSTR1_NUMBERS_COLUMN_MAP)) {
            const values = fieldNames
                .map((field: string) => classifiedData[field])
                .filter((val): val is string => val !== null && val !== undefined);

            if (values.length === 0) continue;

            const sum = NewExcelGenerator.sumNumericValues(values);

            const cellRef = `${colName}${row}`;
            this.writeField(cellRef, sum);
        }

        const buffer = await this.workbook.xlsx.writeBuffer();
        return { buffer: new Uint8Array(buffer), warnings, errors };
    }

    private writeField(cellRef: string, value: string | number): void {
        const cell = this.worksheet.getCell(cellRef);
        cell.value = value;
    }

    private static sumNumericValues(values: string[]): number {
        return values.reduce((sum, val) => {
            const num = parseFloat(val.replaceAll(",", "").replaceAll(" ", ""));
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
    }
}
