import type { ScreenTableConfig, ScriptField } from "@/types";

/**
 * Table display of a repeatable form screen (NEOAPP-1575).
 *
 * A table is not a new kind of screen: it is a repeatable form whose fields are the
 * columns and whose collection entries are the rows. Everything that walks a screen's
 * fields (data keys, integrity, import, search) therefore keeps working unchanged, and
 * an app that does not know about tables still captures the same data as a repeatable form.
 */

type TableScreen = {
    type?: string | null;
    repeatable?: boolean | null;
    tableConfig?: Partial<ScreenTableConfig> | null;
    fields?: Partial<ScriptField>[] | null;
};

const toRowLimit = (value: unknown) => {
    if (value === null || value === undefined || `${value}`.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
};

/** Only a repeatable form can be shown as a table. */
export function canScreenBeTable(screen: Pick<TableScreen, "type" | "repeatable">) {
    return screen?.type === "form" && !!screen?.repeatable;
}

/**
 * The table settings as they are stored: trimmed, with ids on fixed rows, and without
 * the settings of the row mode that is not in use. null when the screen is not a table.
 */
export function normalizeScreenTableConfig(
    screen: TableScreen,
    makeRowId: () => string,
): ScreenTableConfig | null {
    const config = screen?.tableConfig;
    if (!config || !canScreenBeTable(screen)) return null;

    const rowMode = config.rowMode === "fixed" ? "fixed" : "dynamic";
    const fixed = rowMode === "fixed";

    return {
        title: `${config.title || ""}`.trim(),
        rowMode,
        rowsHeading: fixed ? `${config.rowsHeading || ""}`.trim() : "",
        rows: !fixed ? [] : (config.rows || []).map((row) => ({
            rowId: `${row?.rowId || ""}`.trim() || makeRowId(),
            label: `${row?.label || ""}`.trim(),
        })),
        minRows: fixed ? null : toRowLimit(config.minRows),
        maxRows: fixed ? null : toRowLimit(config.maxRows),
    };
}

/** Problems that stop a table from working on the app. Empty when the settings are valid. */
export function validateScreenTableConfig(config: ScreenTableConfig | null | undefined, context = "Table"): string[] {
    if (!config) return [];

    const errors: string[] = [];

    if (config.rowMode === "fixed") {
        if (!config.rows.length) errors.push(`${context}: add at least one row heading, or let rows be added during capture.`);
        if (config.rows.some((row) => !row.label)) errors.push(`${context}: every row needs a heading.`);

        const seen = new Set<string>();
        const duplicates = new Set<string>();
        config.rows.forEach((row) => {
            const label = row.label.toLowerCase();
            if (!label) return;
            if (seen.has(label)) duplicates.add(row.label);
            seen.add(label);
        });
        if (duplicates.size) {
            errors.push(`${context}: row headings must be different (${Array.from(duplicates).map((l) => `"${l}"`).join(", ")}).`);
        }
    } else {
        const limits = [
            { name: "Minimum rows", value: config.minRows },
            { name: "Maximum rows", value: config.maxRows },
        ];
        limits.forEach(({ name, value }) => {
            if (value === null || value === undefined) return;
            if (!Number.isInteger(value) || value < 0) errors.push(`${context}: ${name.toLowerCase()} must be a whole number.`);
        });
        if (Number.isInteger(config.maxRows) && (config.maxRows as number) < 1) {
            errors.push(`${context}: maximum rows must be at least 1.`);
        }
        if (
            Number.isInteger(config.minRows) &&
            Number.isInteger(config.maxRows) &&
            (config.minRows as number) > (config.maxRows as number)
        ) {
            errors.push(`${context}: minimum rows cannot be greater than maximum rows.`);
        }
    }

    return errors;
}

/** Table problems of one screen, as shown when a draft is saved. */
export function validateScreenTable(screen: TableScreen, screenLabel: string): string[] {
    return validateScreenTableConfig(screen?.tableConfig as ScreenTableConfig | null | undefined, `Screen "${screenLabel}" table`);
}
