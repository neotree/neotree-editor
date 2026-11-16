/**
 * Fraction data keys (NEOAPP-1575): a value captured as two numbers shown together,
 * e.g. blood pressure 120 / 80. The key is of data type "fraction" and carries the label
 * of each number in its metadata, so every field that uses the key shows the same labels.
 */

export const FRACTION_DATA_TYPE = "fraction";

export type FractionLabels = {
    numeratorLabel: string;
    denominatorLabel: string;
};

export function isFractionDataType(dataType?: string | null) {
    return `${dataType || ""}`.trim().toLowerCase() === FRACTION_DATA_TYPE;
}

/** The numerator and denominator labels kept in a fraction key's metadata ("" when not set). */
export function getFractionLabels(metadata?: Record<string, any> | null): FractionLabels {
    return {
        numeratorLabel: `${metadata?.numeratorLabel ?? ""}`.trim(),
        denominatorLabel: `${metadata?.denominatorLabel ?? ""}`.trim(),
    };
}

/** Problems with a fraction key's labels. Empty for other data types and for a valid key. */
export function validateFractionDataKey(
    dataKey: { name?: string | null; dataType?: string | null; metadata?: Record<string, any> | null },
): string[] {
    if (!isFractionDataType(dataKey?.dataType)) return [];

    const { numeratorLabel, denominatorLabel } = getFractionLabels(dataKey.metadata);
    const name = `${dataKey?.name || ""}`.trim();
    const subject = name ? `Fraction data key "${name}"` : "A fraction data key";
    const errors: string[] = [];

    if (!numeratorLabel) errors.push(`${subject} needs a numerator label.`);
    if (!denominatorLabel) errors.push(`${subject} needs a denominator label.`);
    if (numeratorLabel && numeratorLabel.toLowerCase() === denominatorLabel.toLowerCase()) {
        errors.push(`${subject} needs different numerator and denominator labels.`);
    }

    return errors;
}

/**
 * What a field copies from its data key besides the usual key, label and confidentiality:
 * a fraction field shows its key's numerator and denominator labels. Nothing for other keys,
 * so syncing them leaves their fields untouched.
 */
export function fractionFieldPatch(
    dataKey?: { dataType?: string | null; metadata?: Record<string, any> | null } | null,
): Partial<FractionLabels> {
    if (!isFractionDataType(dataKey?.dataType)) return {};
    return getFractionLabels(dataKey?.metadata);
}
