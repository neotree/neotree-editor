export function normalizeDataKeyMatchValue(value: string) {
    return `${value || ''}`
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function normalizeDataKeyType(dataType?: string | null) {
    const normalized = `${dataType || ''}`.trim().toLowerCase();
    if (!normalized) return '';

    if (normalized === 'yes_no') {
        return 'yesno';
    }

    if (normalized === 'date_time') {
        return 'datetime';
    }

    if (
        normalized === 'edliz_table' ||
        normalized === 'edliz_summary_table' ||
        normalized === 'zw_edliz_summary_table' ||
        normalized === 'mwi_edliz_summary_table'
    ) {
        return 'edliz_table';
    }

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

export function normalizeDataKeyCompatibilityType(dataType?: string | null) {
    const normalized = normalizeDataKeyType(dataType);

    if (normalized === 'date' || normalized === 'datetime') {
        return 'date';
    }

    return normalized;
}

export function buildNormalizedDataKeyMatchKey(value: string, dataType?: string | null) {
    return `${normalizeDataKeyType(dataType)}::${normalizeDataKeyMatchValue(value)}`;
}
