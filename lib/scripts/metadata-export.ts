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
