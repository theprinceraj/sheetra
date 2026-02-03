import { RecognizedBlockResult } from "../../types";
import { GSTR1_SCHEMA } from "./mappings/gstr1-schema";

export class DataClassifier {
    private static readonly MIN_CONFIDENCE_THRESHOLD = 40;
    private readonly reverseGstr1SchemaMap: Map<string, string>;

    constructor() {
        this.reverseGstr1SchemaMap = new Map(Object.entries(GSTR1_SCHEMA).map(([k, v]) => [v, k]));
    }

    classifyGstr1Results(blocks: Array<RecognizedBlockResult>): ClassifiedDataType {
        const classifiedData: ClassifiedDataType = {};
        for (const block of blocks) {
            const text = block.text.trim();
            const rectangle = block.rectangle;

            if (block.confidence < DataClassifier.MIN_CONFIDENCE_THRESHOLD && text.length === 0) {
                console.warn("Low confidence text skipped:", text, "Confidence:", block.confidence);
                continue;
            }
            const searchValue = `${rectangle.top}_${rectangle.left}_${rectangle.width}_${rectangle.height}`;
            const key = this.reverseGstr1SchemaMap.get(searchValue);
            if (!key) continue;

            classifiedData[key] = text;
        }
        return classifiedData;
    }
}

type ClassifiedDataType = Partial<Record<keyof typeof GSTR1_SCHEMA, string>> | {};
