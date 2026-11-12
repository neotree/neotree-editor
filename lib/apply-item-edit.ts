/**
 * Applies an option/item form's values to the stored item without changing it
 * for nothing. The forms fill every field (condition "", forbidWith [], …), but
 * stored items often lack those keys; copying the blanks in made an unchanged
 * save look like an edit, so closing the field or screen asked to discard
 * changes that didn't exist.
 *
 * A blank value for a key the item doesn't have is left out, and when nothing
 * really changed the item is returned as it was (same object).
 */
const isBlank = (value: unknown) => value === undefined
    || value === null
    || value === ''
    || value === false
    || (Array.isArray(value) && !value.length);

const same = (a: unknown, b: unknown) => (isBlank(a) && isBlank(b)) || JSON.stringify(a) === JSON.stringify(b);

export function applyItemEdit<T extends Record<string, any>>(item: T, edits: Record<string, any>): { next: T; changed: boolean; } {
    const next: Record<string, any> = { ...item };
    let changed = false;

    for (const [key, value] of Object.entries(edits)) {
        if (same(item[key], value)) continue;
        next[key] = value;
        changed = true;
    }

    return changed ? { next: next as T, changed } : { next: item, changed };
}
