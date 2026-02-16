import { DataClassifierOutput, RecognizedBlockResult } from "../../types";
import { GSTR1_NUMBERS_COLUMN_MAP, GSTR1_STRING_FIELDS_MAP } from "./mappings/gstr1-maps";
import { GSTR1_SCHEMA } from "./mappings/gstr1-schema";

export class DataClassifier {
    private static readonly MIN_CONFIDENCE_THRESHOLD = 40;
    private static readonly REVERSE_SCHEMA_MAP = DataClassifier.createReverseSchemaMap();
    private static readonly SCHEMA_KEY_TO_FIELD_MAP = DataClassifier.createSchemaKeyToFieldMap();

    private static createReverseSchemaMap(): Map<string, string> {
        return new Map(Object.entries(GSTR1_SCHEMA).map(([k, v]) => [v, k]));
    }

    private static createSchemaKeyToFieldMap(): Map<string, { type: "string" | "float"; key: string }> {
        const map = new Map<string, { type: "string" | "float"; key: string }>();

        // Add string fields
        for (const [key, fields] of Object.entries(GSTR1_STRING_FIELDS_MAP)) {
            for (const field of fields) {
                map.set(field, { type: "string", key });
            }
        }

        // Add number fields
        for (const [key, fields] of Object.entries(GSTR1_NUMBERS_COLUMN_MAP)) {
            for (const field of fields) {
                map.set(field, { type: "float", key });
            }
        }

        return map;
    }

    classifyResults(blocks: Array<RecognizedBlockResult>): DataClassifierOutput {
        const output: DataClassifierOutput = {
            classifiedData: {},
            excelData: {
                numberFieldData: {},
                stringFieldData: {},
            },
            warnings: [],
        };
        for (const block of blocks) {
            const text = block.text.trim();
            const rectangle = block.rectangle;

            if (block.confidence < DataClassifier.MIN_CONFIDENCE_THRESHOLD && text.length === 0) {
                output.warnings.push(`Low confidence and empty text, skipped. Confidence: ${block.confidence}`);
                continue;
            }
            const searchValue = `${rectangle.top}_${rectangle.left}_${rectangle.width}_${rectangle.height}`;
            const key = DataClassifier.REVERSE_SCHEMA_MAP.get(searchValue);
            if (!key) {
                output.warnings.push(`No matching schema for rectangle: ${searchValue} with text: ${text}`);
                continue;
            }

            output.classifiedData[key] = text;
            this.categorizeFields(key, text, output);
        }
        return output;
    }

    private categorizeFields(schemaKey: string, text: string, output: DataClassifierOutput) {
        const fieldInfo = DataClassifier.SCHEMA_KEY_TO_FIELD_MAP.get(schemaKey);
        if (!fieldInfo) {
            output.warnings.push(`No field mapping found for schema key: ${schemaKey} with text: ${text}`);
            return;
        }

        if (fieldInfo.type === "string") {
            output.excelData.stringFieldData[fieldInfo.key as keyof typeof GSTR1_STRING_FIELDS_MAP] = text;
        } else if (fieldInfo.type === "float") {
            const numValue = parseFloat(text.replaceAll(",", "").replaceAll(" ", ""));
            const numfieldKey = fieldInfo.key as keyof typeof GSTR1_NUMBERS_COLUMN_MAP;
            if (!isNaN(numValue)) {
                output.excelData.numberFieldData[numfieldKey] = text;
            } else {
                output.warnings.push(`Failed to parse number for key: ${schemaKey} with text: ${text}`);
                output.excelData.numberFieldData[numfieldKey] = null;
            }
        }
    }
}
