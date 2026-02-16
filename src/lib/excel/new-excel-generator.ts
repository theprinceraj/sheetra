import { Style, Workbook, Worksheet } from "exceljs";
import type { DataClassifierOutput } from "../../types";
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

export class NewExcelGenerator {
    private workbook: Workbook;
    private worksheet: Worksheet;
    private readonly headerCellStyle: Partial<Style> = {
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "0070C0" } },
    };

    constructor() {
        this.workbook = new Workbook();
        this.worksheet = this.workbook.addWorksheet("GSTR-1");
        this.addInitialStyles();
    }

    async generate(classifierOutput: DataClassifierOutput): Promise<{ buffer: Uint8Array; warnings: string[] }> {
        const warnings: string[] = [];

        const classifiedData = classifierOutput.classifiedData;
        const taxPeriod = classifiedData["taxPeriod"];

        // Write string fields
        for (const [cellRef, fieldNames] of Object.entries(GSTR1_STRING_FIELDS_MAP)) {
            const fieldName = fieldNames[0];
            const value = classifiedData[fieldName];

            console.log(`Processing string field "${fieldName}" for cell ${cellRef}: value="${value}"`);

            if (value) this.writeField(cellRef, value, "string");
        }

        // Write number fields
        for (const [colName, fieldNames] of Object.entries(GSTR1_NUMBERS_COLUMN_MAP)) {
            const values = fieldNames
                .map((field: string) => classifiedData[field])
                .filter((val): val is string => val !== null && val !== undefined);

            if (values.length === 0) continue;

            const sum = this.sumNumericValues(values);

            // Get row from tax period
            const row = TAX_PERIOD_ROW_MAP[taxPeriod!];
            if (!row) {
                warnings.push(`Unable to determine row number for tax period: ${taxPeriod}`);
                continue;
            }

            const cellRef = `${colName}${row}`;
            this.writeField(cellRef, sum, "number");
        }

        const buffer = await this.workbook.xlsx.writeBuffer();
        return { buffer: new Uint8Array(buffer as ArrayBuffer), warnings };
    }

    private writeField(cellRef: string, value: string | number, type: "string" | "number"): void {
        const cell = this.worksheet.getCell(cellRef);
        if (type === "number") {
            cell.alignment = { horizontal: "right" };
            cell.numFmt = "##,##,##0.00";
        } else if (type === "string") {
            cell.alignment = { horizontal: "left" };
            cell.font = { bold: true };
        }

        cell.value = value;
    }

    private sumNumericValues(values: string[]): number {
        return values.reduce((sum, val) => {
            const num = parseFloat(val.replaceAll(",", "").replaceAll(" ", ""));
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
    }

    private addInitialStyles(): void {
        this.worksheet.properties.defaultColWidth = 21;

        this.mergeNecessaryCells();
        this.defineTable("GSTR-1", 7);
        this.defineTable("Books", 23);
        this.defineTable("Difference", 39);
    }

    private defineTable(name: string, headingRowNum: number): void {
        const fillHeaderNames = (rowNum: number): void => {
            const headerNames = [
                "Month",
                "B2B Forward Charges",
                "B2B Reverse Charges",
                "B2CL",
                "B2CS",
                "Export Sales",
                "Exempted",
                "Amendments in Local",
                "Amendments in Exempted Sales",
                "Total Sales",
                "DN/CN",
                "Amendments in DN/CN",
                "Advance Received (11A)",
                "Advance Adjusted (11B)",
                "Net Sales",
                "IGST",
                "CGST",
                "SGST",
                "CESS",
                "Total Tax",
                // Tax Reversed due to DN/CN issued
                "IGST",
                "CGST",
                "SGST",
                "CESS",
                // Net Tax
                "IGST",
                "CGST",
                "SGST",
                "CESS",
            ];
            const row = this.worksheet.getRow(rowNum);
            row.height = 28.35;
            for (let i = 0; i < headerNames.length; i++) {
                const cell = row.getCell(i + 1);
                cell.style = this.headerCellStyle;
                cell.font = { name: "Calibri", bold: true, color: { argb: "FFFFFF" } };
                cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
                cell.value = headerNames[i];
            }

            const categoryHeadersNames = ["Tax reversed due to DN/CN issued", "Net Tax"];
            const taxtReversedCell = this.worksheet.getCell(`U${rowNum}`);
            taxtReversedCell.style = this.headerCellStyle;
            taxtReversedCell.font = { name: "Calibri", bold: true, color: { argb: "FFFFFF" } };
            taxtReversedCell.alignment = { vertical: "middle", horizontal: "center" };
            taxtReversedCell.value = categoryHeadersNames[0];
            const netTaxCell = this.worksheet.getCell(`Y${rowNum}`);
            netTaxCell.style = this.headerCellStyle;
            netTaxCell.font = { name: "Calibri", bold: true, color: { argb: "FFFFFF" } };
            netTaxCell.alignment = { vertical: "middle", horizontal: "center" };
            netTaxCell.value = categoryHeadersNames[1];
        };

        const fillMonthNames = (startingRowNum: number): void => {
            const months = Object.keys(TAX_PERIOD_ROW_MAP);
            months.forEach((month, index) => {
                const cell = this.worksheet.getCell(`A${startingRowNum + index}`);
                cell.alignment = { vertical: "middle", horizontal: "left" };
                cell.font = { bold: true, name: "Calibri" };
                cell.value = month;
            });
        };

        const defineTotalRow = (rowNum: number): void => {
            const row = this.worksheet.getRow(rowNum);
            row.getCell(1).value = "Total";
            row.getCell(1).font = { bold: true };
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            for (let i = 2; i <= 29; i++) {
                const cell = row.getCell(i);
                const column = cell.address.replace(/\d/g, ""); // Extract column letters
                cell.font = { bold: true };
                cell.alignment = { vertical: "middle", horizontal: "right" };
                cell.numFmt = "##,##,##0.00";
                console.log(cell);
                cell.value = { formula: `SUM(${column}9:${column}${rowNum - 1})` };
            }
        };

        fillHeaderNames(headingRowNum + 1);
        fillMonthNames(headingRowNum + 2);
        defineTotalRow(headingRowNum + 14);
    }

    private mergeNecessaryCells(): void {
        this.worksheet.mergeCells("A1:C1");
        this.worksheet.mergeCells("A2:C2");
        this.worksheet.mergeCells("A3:C3");
        this.worksheet.mergeCells("A4:C4");

        this.worksheet.mergeCells("U7:X7");
        this.worksheet.mergeCells("Y7:AB7");
        this.worksheet.mergeCells("U23:X23");
        this.worksheet.mergeCells("Y23:AB23");
    }
}
