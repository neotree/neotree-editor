import type { ScreenTableConfig, ScriptField } from "@/types";

/**
 * Table display of a repeatable form screen (NEOAPP-1575).
 *
 * A table is not a new kind of screen: it is a repeatable form whose fields are the
 * columns and whose collection entries are the rows. Everything that walks a screen's
 * fields (data keys, integrity, import, search) therefore keeps working unchanged, and
 * an app that does not know about tables still captures the same data as a repeatable form.
 *
 * In the editor a table is offered as its own screen type ("Table"). That choice is only
 * a way of creating and showing the screen: what is stored is a form with repeatable on
 * and table settings.
 */

/** The "Table" choice in the screen type picker. Never stored: the stored type is "form". */
export const TABLE_SCREEN_TYPE = "table";

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

/** A repeatable form with table settings. */
export function isTableScreen(screen?: TableScreen | null) {
    return !!screen && canScreenBeTable(screen) && !!screen.tableConfig;
}

/** The type to show for a screen: "table" for a table, its stored type otherwise. */
export function getDisplayedScreenType(screen?: TableScreen | null) {
    return isTableScreen(screen) ? TABLE_SCREEN_TYPE : `${screen?.type || ""}`;
}

/**
 * The collection a table's rows are stored under, derived from the table name so it does
 * not have to be typed twice. Only used while the screen has no collection name yet:
 * renaming a table later never moves its data to another collection.
 */
export function tableCollectionName(tableName?: string | null) {
    return `${tableName || ""}`.trim().replace(/\s+/g, " ");
}

/** Heading of a table column: the field's own column heading, or its label. */
export function getTableColumnHeading(field?: Pick<ScriptField, "tableHeading" | "label" | "key"> | null) {
    return `${field?.tableHeading || ""}`.trim() || `${field?.label || ""}`.trim() || `${field?.key || ""}`.trim();
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

    if (!`${config.title || ""}`.trim()) errors.push(`${context}: give the table a name.`);

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

/**
 * Problems with the collection a table is stored under: it needs a name, and two repeatable
 * screens of a script must not share one, or their rows are mixed in the captured data.
 */
export function validateTableCollectionName(
    collectionName: string | null | undefined,
    otherCollectionNames: (string | null | undefined)[] = [],
    context = "Table",
): string[] {
    const name = tableCollectionName(collectionName).toLowerCase();
    if (!name) return [`${context}: give the table a name.`];
    const taken = otherCollectionNames.some((other) => tableCollectionName(other).toLowerCase() === name);
    return taken ? [`${context}: another screen in this script already stores its rows as "${tableCollectionName(collectionName)}". Use a different table name.`] : [];
}

/** Table problems of one screen, as shown when a draft is saved. */
export function validateScreenTable(screen: TableScreen, screenLabel: string): string[] {
    return validateScreenTableConfig(screen?.tableConfig as ScreenTableConfig | null | undefined, `Screen "${screenLabel}" table`);
}

/**
 * The collection label a table saves for app versions that do not know about tables. Those apps show a
 * table as a repeatable form, which names each entry after its collection label field and only counts
 * an entry as filled in once that field has a value; with no label no entry could ever be completed.
 * The first required column is used, else the first column; fraction columns are skipped (older apps
 * cannot capture them). Empty when the table has no usable column.
 */
export function tableLegacyCollectionLabel(fields?: { key?: string | null; type?: string | null; optional?: boolean | null; }[] | null) {
    const columns = (fields || []).filter(f => `${f?.key || ""}`.trim() && `${f?.type || ""}`.trim().toLowerCase() !== "fraction");
    const pick = columns.find(f => !f.optional) || columns[0];
    return pick ? `${pick.key}`.trim() : "";
}
