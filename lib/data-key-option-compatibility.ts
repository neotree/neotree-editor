type DataKeyOptionShape = {
    dataType?: string | null;
    name?: string | null;
    options?: string[] | null;
};

function normalizeDataType(value?: string | null) {
    return `${value || ''}`.trim().toLowerCase();
}

function normalizeOptionKeys(options?: string[] | null) {
    return Array.from(new Set((options || []).map((option) => `${option || ''}`.trim()).filter(Boolean)));
}

export function getDataKeyReplacementCompatibilityError({
    target,
    replacement,
}: {
    target: DataKeyOptionShape;
    replacement: DataKeyOptionShape;
}) {
    const targetType = normalizeDataType(target.dataType);
    const replacementType = normalizeDataType(replacement.dataType);

    if (targetType !== replacementType) {
        return 'Replacement data key must use the same data type.';
    }

    const targetOptions = normalizeOptionKeys(target.options);
    if (!targetOptions.length) return null;

    const replacementOptions = new Set(normalizeOptionKeys(replacement.options));
    const missingOptions = targetOptions.filter((option) => !replacementOptions.has(option));

    if (missingOptions.length) {
        return [
            'Replacement data key must include the same option pool as the data key being deleted.',
            `Missing ${missingOptions.length} option${missingOptions.length === 1 ? '' : 's'}.`,
        ].join(' ');
    }

    return null;
}

export function isDataKeyReplacementCompatible({
    target,
    replacement,
}: {
    target: DataKeyOptionShape;
    replacement: DataKeyOptionShape;
}) {
    return !getDataKeyReplacementCompatibilityError({ target, replacement });
}
