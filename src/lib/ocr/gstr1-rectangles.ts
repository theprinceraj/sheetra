import { Rectangle } from "../../types";
import {
    GSTR1_SCHEMA,
    gstr1Page1FieldNames,
    gstr1Page2FieldNames,
    gstr1Page3FieldNames,
    gstr1Page4FieldNames,
} from "../classifier/mappings/gstr1-schema";

export function getGstr1Rectangles(pageNumber: number | string): Array<Rectangle> | undefined {
    let rectangles: Array<Rectangle> | undefined;

    switch (Number(pageNumber)) {
        case 1:
            rectangles = getRectanglesFromFieldNames(gstr1Page1FieldNames);
            break;
        case 2:
            rectangles = getRectanglesFromFieldNames(gstr1Page2FieldNames);
            break;
        case 3:
            rectangles = getRectanglesFromFieldNames(gstr1Page3FieldNames);
            break;
        case 4:
            rectangles = getRectanglesFromFieldNames(gstr1Page4FieldNames);
            break;
        default:
            rectangles = undefined;
            break;
    }

    return rectangles;
}

function getRectanglesFromFieldNames(fieldNames: Array<keyof typeof GSTR1_SCHEMA>): Array<Rectangle> {
    return fieldNames.map((field) => {
        const [top, left, width, height] = GSTR1_SCHEMA[field].split("_").map((v) => Number(v));
        return { top, left, width, height };
    });
}
