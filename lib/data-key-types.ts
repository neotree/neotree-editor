export function normalizeDataKeyType(dataType?: string | null) {
    const normalized = `${dataType || ''}`.trim().toLowerCase();
    if (!normalized) return '';

    if (normalized === 'option' || normalized.endsWith('_option')) {
        return 'option';
    }

    return normalized;
}

export function buildNormalizedDataKeyMatchKey(value: string, dataType?: string | null) {
    return `${normalizeDataKeyType(dataType)}::${value.trim()}`;
}
