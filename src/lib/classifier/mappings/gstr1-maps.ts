import { GSTR1_SCHEMA } from "./gstr1-schema";

export const GSTR1_STRING_FIELDS_MAP = {
    A1: ["legalName"],
    A2: ["taxPeriod"],
    A3: ["financialYear"],
    A4: ["gstin"],
} as const satisfies Record<string, (keyof typeof GSTR1_SCHEMA)[]>;

export const GSTR1_NUMBERS_COLUMN_MAP = {
    B: ["value4a"],
    C: ["value4b"],
    D: ["value5"],
    E: ["value7"],
    F: ["value6a", "value6b", "value6c"],
    G: ["value8"],
    H: ["value9a_regular", "value9a_reverse", "value9a_b2cl"],
    I: ["value9a_expwpOrExpwop", "value9a_sezwpOrSezwop", "value9a_deemedExport"],
    K: ["value9b_cdnr", "value9b_cdnur"],
    L: ["value9c_cdnra", "value9c_cdnura", "value10"],
    M: ["value11a1_11a2"],
    N: ["value11b1_11b2"],
    P: ["igst4a", "igst5", "igst6a", "igst6b", "igst6c", "igst7"],
    Q: ["cgst4a", "cgst7"],
    R: ["sgst4a", "sgst7"],
    S: ["cess4a", "cess5", "cess6a", "cess6b", "cess6c", "cess7"],
    U: ["igst9b_cdnr", "igst9b_cdnur"],
    V: ["cgst9b_cdnr"],
    W: ["sgst9b_cdnr"],
    X: ["cess9b_cdnr", "cess9b_cdnur"],
} as const satisfies Record<string, (keyof typeof GSTR1_SCHEMA)[]>;
