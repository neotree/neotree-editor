import type { GetScriptsMetadataResponse } from "@/databases/queries/scripts";

type ScriptMetadata = GetScriptsMetadataResponse["data"][number];

export type ScriptScreenMetadataRow = {
    Script: string;
    Hospital: string;
    Screen: string;
    "Screen Ref": string;
    "Screen Type": string;
    Key: string;
    Label: string;
    "Data Type": string;
    Value: string;
    "Value Label": string;
    Confidential: string;
    "Confidential (Label Only)": string;
    Optional: string;
    "Field Condition": string;
    "Field Options": string;
    "Screen Condition": string;
    "Item Condition": string;
    "Item Options": string;
    "Skip To Screen Conditional Expression": string;
    "Skip To Screen": string;
    "Disable other options if selected": string;
    "Forbid With": string;
    "Management Metadata": string;
};

const cellValue = (value: unknown) => value == null ? "" : `${value}`;

/**
 * Builds the screen worksheet rows used by the script metadata Excel export.
 * Selectable fields are expanded to one row per option so the dedicated Value
 * and Value Label columns contain the same option data exposed in Field Options.
 */
export function buildScriptScreenMetadataRows(script: ScriptMetadata): ScriptScreenMetadataRow[] {
    const rows: ScriptScreenMetadataRow[] = [];

    script.screens.forEach((screen) => {
        if (screen.type === "management" && !screen.fields.length) {
            rows.push({
                Script: script.title,
                Hospital: script.hospitalName || "",
                Screen: screen.title,
                "Screen Ref": screen.ref || "",
                "Screen Type": screen.type || "",
                Key: "",
                Label: "",
                "Data Type": "",
                Value: "",
                "Value Label": "",
                Confidential: "",
                "Confidential (Label Only)": "",
                Optional: "",
                "Field Condition": "",
                "Field Options": "",
                "Screen Condition": screen.condition || "",
                "Item Condition": "",
                "Item Options": "",
                "Skip To Screen Conditional Expression": screen.skipToCondition || "",
                "Skip To Screen": screen.skipToScreen ? JSON.stringify(screen.skipToScreen) : "",
                "Disable other options if selected": "",
                "Forbid With": "",
                "Management Metadata": screen.managementMetadata
                    ? JSON.stringify(screen.managementMetadata)
                    : "",
            });
        }

        screen.fields.forEach((field) => {
            const fieldOptions = field.options?.length ? JSON.stringify(field.options) : "";
            const values = field.options?.length
                ? field.options
                : [{
                    value: field.value,
                    valueLabel: field.valueLabel,
                    disabledOtherOptionsIfSelected: field.disableOtherOptionsIfSelected,
                    forbidWIth: field.forbidWith,
                }];

            values.forEach((option) => {
                rows.push({
                    Script: script.title,
                    Hospital: script.hospitalName || "",
                    Screen: screen.title,
                    "Screen Ref": screen.ref || "",
                    "Screen Type": screen.type || "",
                    Key: field.key,
                    Label: field.label,
                    "Data Type": field.dataType || "",
                    Value: cellValue(option.value),
                    "Value Label": cellValue(option.valueLabel),
                    Confidential: field.confidential ? "Yes" : "No",
                    "Confidential (Label Only)": field.confidentialLabelOnly ? "Yes" : "No",
                    Optional: field.optional ? "Yes" : "No",
                    "Field Condition": field.condition || "",
                    "Field Options": fieldOptions,
                    "Screen Condition": screen.condition || "",
                    "Item Condition": "",
                    "Item Options": "",
                    "Skip To Screen Conditional Expression": screen.skipToCondition || "",
                    "Skip To Screen": screen.skipToScreen ? JSON.stringify(screen.skipToScreen) : "",
                    "Disable other options if selected": typeof option.disabledOtherOptionsIfSelected === "boolean"
                        ? (option.disabledOtherOptionsIfSelected ? "Yes" : "No")
                        : "",
                    "Forbid With": option.forbidWIth?.join(", ") || "",
                    "Management Metadata": screen.type === "management" && screen.managementMetadata
                        ? JSON.stringify(screen.managementMetadata)
                        : "",
                });
            });
        });
    });

    return rows;
}

export type ScriptDiagnosisMetadataRow = {
    Script: string;
    Hospital: string;
    "Diagnosis Name": string;
    "Diagnosis Description": string;
    Key: string;
    "Key ID": string;
    Label: string;
    Position: string;
    Source: string;
    "Severity Order": string;
    Expression: string;
    "Expression Meaning": string;
    Symptoms: string;
    "Text 1": string;
    "Text 2": string;
    "Text 3": string;
    "Image 1": string;
    "Image 2": string;
    "Image 3": string;
    "Data Type": string;
    Value: string;
    "Value Label": string;
    Condition: string;
    "Disable other options if selected": string;
    "Forbid With": string;
};

/**
 * Builds the diagnoses worksheet rows used by the script metadata Excel export.
 */
export function buildScriptDiagnosisMetadataRows(script: ScriptMetadata): ScriptDiagnosisMetadataRow[] {
    return script.diagnoses.map((d) => ({
        Script: script.title,
        Hospital: script.hospitalName || "",
        "Diagnosis Name": d.name,
        "Diagnosis Description": `${d.description || ""}`,
        Key: d.key,
        "Key ID": `${d.keyId || ""}`,
        Label: d.name,
        Position: `${d.position || ""}`,
        Source: `${d.source || ""}`,
        "Severity Order": `${d.severityOrder || ""}`,
        Expression: `${d.expression || ""}`,
        "Expression Meaning": `${d.expressionMeaning || ""}`,
        Symptoms: JSON.stringify(d.symptoms || []),
        "Text 1": `${d.text1 || ""}`,
        "Text 2": `${d.text2 || ""}`,
        "Text 3": `${d.text3 || ""}`,
        "Image 1": d.image1 ? JSON.stringify(d.image1) : "",
        "Image 2": d.image2 ? JSON.stringify(d.image2) : "",
        "Image 3": d.image3 ? JSON.stringify(d.image3) : "",
        "Data Type": "diagnosis",
        Value: d.key,
        "Value Label": d.name,
        Condition: `${d.expression || ""}`,
        "Disable other options if selected": "",
        "Forbid With": "",
    }));
}

export type MetadataWorkbookSheet = {
    name: string;
    rows: Record<string, string>[];
};

const SHEET_NAME_MAX_LENGTH = 31;

/**
 * Sheet names are `<prefix><script title>` cut to Excel's 31 character limit,
 * exactly as the single-script export has always named them. Names are only
 * altered when the xlsx writer would otherwise throw: characters Excel rejects
 * (: \\ / ? * [ ]) become spaces, and a name already taken in the workbook
 * (e.g. two long titles truncated to the same text) gets a " (2)" style suffix.
 */
function sheetName(name: string, used: Set<string>) {
    const base = name.replace(/[:\\/?*[\]]/g, " ").substring(0, SHEET_NAME_MAX_LENGTH);

    let candidate = base;
    let counter = 2;
    while (used.has(candidate)) {
        const suffix = ` (${counter++})`;
        candidate = `${base.substring(0, SHEET_NAME_MAX_LENGTH - suffix.length)}${suffix}`;
    }

    used.add(candidate);
    return candidate;
}

/**
 * Lays out the worksheets for a metadata export of one or more scripts, in the
 * same order the single-script export uses: every script's screens sheet,
 * followed by every script's diagnoses sheet.
 */
export function buildScriptsMetadataWorkbookSheets(data: ScriptMetadata[]): MetadataWorkbookSheet[] {
    const used = new Set<string>();
    const sheets: MetadataWorkbookSheet[] = [];

    data.forEach((script) => {
        sheets.push({
            name: sheetName(`Screens - ${script.title || ""}`, used),
            rows: buildScriptScreenMetadataRows(script),
        });
    });

    data.forEach((script) => {
        sheets.push({
            name: sheetName(`Diagnoses - ${script.title || ""}`, used),
            rows: buildScriptDiagnosisMetadataRows(script),
        });
    });

    return sheets;
}
