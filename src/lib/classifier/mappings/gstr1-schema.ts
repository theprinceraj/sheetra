/*
 * GSTR-1 Schema
 * Defines rectangles for extracting specific fields from GSTR-1 forms.
 * Each field is mapped to a rectangle defined by its top, left, width, and height.
 * Values are based on the document pages being rendered at 2x scale.
 * Example: A value "10_30_100_50" translates to { top: 10, left: 30, width: 100, height: 50 }
 */
export const GSTR1_SCHEMA = {
    // Page 1 Fields

    /*
     * String Fields
     */
    legalName: "314_713_887_23", // 713,314,1600,337
    financialYear: "203_1455_112_28", // 1455,203,1567,231
    taxPeriod: "233_1458_147_23", // 1458,233,1603,256
    gstin: "289_712_344_23", // 712,289,1056,312
    /*
     * Number Fields
     */
    // 4A
    value4a: "528_757_170_21", // 757,528,927,549
    igst4a: "528_927_170_21",
    cgst4a: "528_1097_170_21",
    sgst4a: "528_1267_170_21",
    cess4a: "528_1437_170_21",
    // 4B
    value4b: "607_757_170_21", // 757, 607, 927, 628
    // 5
    value5: "686_757_170_21", // 757, 686, 927, 707
    igst5: "686_927_170_21",
    cess5: "686_1437_170_21",
    // 6A
    value6a: "765_757_170_21", // 757, 765, 927, 786
    igst6a: "765_927_170_21",
    cess6a: "765_1437_170_21",
    // 6B
    value6b: "895_757_170_21", // 757, 895, 927, 916
    igst6b: "895_927_170_21",
    cess6b: "895_1437_170_21",
    // 6C
    value6c: "1025_757_170_21", // 757, 1025, 927, 1046
    igst6c: "1025_927_170_21",
    cess6c: "1025_1437_170_21",

    // Page 2 Fields

    /*
     * Number Fields
     */
    // 7
    value7: "132_757_170_23", // 757, 129, 927, 150
    igst7: "132_927_170_23",
    cgst7: "132_1097_170_23",
    sgst7: "132_1267_170_23",
    cess7: "132_1437_170_23",
    // 8
    value8: "208_757_170_23", // 757, 208, 927, 229
    // 9A
    value9a_regular: "366_757_170_21", // 757, 366, 927, 387
    value9a_reverse: "472_757_170_21",
    value9a_b2cl: "578_757_170_21",
    value9a_expwpOrExpwop: "683_757_170_21",
    value9a_sezwpOrSezwop: "839_757_170_21",
    value9a_deemedExport: "996_757_170_21",

    // Page 3 Fields

    /*
     * Number Fields
     */
    // 9B
    value9b_cdnr: "131_757_170_21", // 757, 131, 927, 152
    igst9b_cdnr: "131_927_170_21",
    cgst9b_cdnr: "131_1096_170_21",
    sgst9b_cdnr: "131_1267_170_21",
    cess9b_cdnr: "131_1437_170_21",
    value9b_cdnur: "421_757_170_21",
    igst9b_cdnur: "421_927_170_21",
    cess9b_cdnur: "421_1437_170_21",
    // 9C
    value9c_cdnra: "603_757_170_21", // 757, 603, 927, 624
    value9c_cdnura: "1006_757_170_21",

    // Page 4 Fields

    /*
     * Number Fields
     */
    // 10
    value10: "263_757_170_21", // 757, 263, 927, 284
    // 11A(1), 11A(2)
    value11a1_11a2: "368_757_170_21", // 757, 368, 927, 389
    // 11B(1), 11B(2)
    value11b1_11b2: "447_757_170_21", // 757, 447, 927, 468
} as const satisfies Record<string, string>;

export const gstr1Page1FieldNames = [
    "legalName",
    "taxPeriod",
    "financialYear",
    "gstin",
    "value4a",
    "value4b",
    "value5",
    "value6a",
    "value6b",
    "value6c",
    "igst4a",
    "igst5",
    "igst6a",
    "igst6b",
    "igst6c",
    "cgst4a",
    "sgst4a",
    "cess4a",
    "cess5",
    "cess6a",
    "cess6b",
    "cess6c",
] as const satisfies Array<keyof typeof GSTR1_SCHEMA>;

export const gstr1Page2FieldNames = [
    "value7",
    "igst7",
    "cgst7",
    "sgst7",
    "cess7",
    "value8",
    "value9a_regular",
    "value9a_reverse",
    "value9a_b2cl",
    "value9a_expwpOrExpwop",
    "value9a_sezwpOrSezwop",
    "value9a_deemedExport",
] as const satisfies Array<keyof typeof GSTR1_SCHEMA>;

export const gstr1Page3FieldNames = [
    "value9b_cdnr",
    "value9b_cdnur",
    "value9c_cdnra",
    "value9c_cdnura",
    "igst9b_cdnr",
    "igst9b_cdnur",
    "cgst9b_cdnr",
    "sgst9b_cdnr",
    "cess9b_cdnr",
    "cess9b_cdnur",
] as const satisfies Array<keyof typeof GSTR1_SCHEMA>;

export const gstr1Page4FieldNames = ["value10", "value11a1_11a2", "value11b1_11b2"] as const satisfies Array<
    keyof typeof GSTR1_SCHEMA
>;
