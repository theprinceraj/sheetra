import { RecognizedBlockResult } from "../../types";
import { GSTR1_SCHEMA } from "./mappings/gstr1-schema";

export class DataClassifier {
    classifyGstr1Results(blocks: Array<RecognizedBlockResult>): Record<keyof typeof GSTR1_SCHEMA, string> | {} {
        const classifiedData: ClassifiedDataType = {};
        for (const block of blocks) {
            const text = block.text.trim();
            const rectangle = block.rectangle;

            if (block.confidence < 40 && text.trim().length === 0) {
                console.error("Low confidence text skipped:", text, "Confidence:", block.confidence);
                continue;
            }
            const searchValue = `${rectangle.top}_${rectangle.left}_${rectangle.width}_${rectangle.height}`;
            const key = this.getKeyByValue(searchValue);
            if (!key) continue;

            classifiedData[key] = text;
        }
        return classifiedData;
    }

    private getKeyByValue(value: string) {
        return Object.keys(GSTR1_SCHEMA).find((k) => GSTR1_SCHEMA[k] === value);
    }
}

type ClassifiedDataType = Record<keyof typeof GSTR1_SCHEMA, string> | {};
