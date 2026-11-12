/** Trimmed, non-empty, de-duplicated (first occurrence kept, order preserved). */
export function uniqueValues(values: string[]) {
    return Array.from(new Set(values.map((value) => `${value || ''}`.trim()).filter(Boolean)));
}
