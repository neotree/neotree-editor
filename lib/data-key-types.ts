export function normalizeDataKeyType(dataType?: string | null) {
    const normalized = `${dataType || ''}`.trim().toLowerCase();
    if (!normalized) return '';

    if (normalized === 'option' || normalized.endsWith('_option')) {
        return 'option';
    }

    if (normalized === 'single_select' || normalized === 'dropdown') {
        return 'single_select';
    }

    if (normalized === 'number' || normalized === 'timer') {
        return 'number';
    }

    return normalized;
}

export function buildNormalizedDataKeyMatchKey(value: string, dataType?: string | null) {
    return `${normalizeDataKeyType(dataType)}::${value.trim()}`;
}
