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

/**
 * How a captured fraction is stored: as two plain numbers, each under a key of its own, so
 * conditions, exports and analytics read them like any other number key. For a fraction key
 * "BP" with labels Systolic / Diastolic, 120 / 80 is stored as BP_numerator = 120 and
 * BP_denominator = 80. The suffixes never follow the labels, so relabelling a key does not
 * move its stored data.
 */
export const FRACTION_NUMERATOR_SUFFIX = "_numerator";
export const FRACTION_DENOMINATOR_SUFFIX = "_denominator";

export type FractionStorageKeys = {
    numeratorKey: string;
    denominatorKey: string;
};

export function getFractionStorageKeys(key?: string | null): FractionStorageKeys {
    const name = `${key || ""}`.trim();
    return {
        numeratorKey: `${name}${FRACTION_NUMERATOR_SUFFIX}`,
        denominatorKey: `${name}${FRACTION_DENOMINATOR_SUFFIX}`,
    };
}

type NamedDataKey = { name?: string | null; dataType?: string | null; metadata?: Record<string, any> | null };

/**
 * Name clashes between fraction storage keys and other data keys. A fraction key "BP" stores
 * its numbers under BP_numerator and BP_denominator, so no other data key may use those names
 * (the two values would overwrite each other in a session). Checks `dataKey` against
 * `otherKeys` both ways: its own storage keys, and its name against theirs.
 */
export function validateFractionStorageKeyClashes(dataKey: NamedDataKey, otherKeys: NamedDataKey[]): string[] {
    const name = `${dataKey?.name || ""}`.trim();
    if (!name) return [];
    const lower = name.toLowerCase();
    const others = (otherKeys || []).filter(k => `${k?.name || ""}`.trim() && `${k?.name || ""}`.trim().toLowerCase() !== lower);
    const errors: string[] = [];

    if (isFractionDataType(dataKey?.dataType)) {
        const { numeratorKey, denominatorKey } = getFractionStorageKeys(name);
        for (const storageKey of [numeratorKey, denominatorKey]) {
            const clash = others.find(k => `${k.name}`.trim().toLowerCase() === storageKey.toLowerCase());
            if (clash) {
                errors.push(`Fraction data key "${name}" stores a number under "${storageKey}", but a data key with that name already exists.`);
            }
        }
    }

    for (const other of others) {
        if (!isFractionDataType(other?.dataType)) continue;
        const { numeratorKey, denominatorKey } = getFractionStorageKeys(other.name);
        if ([numeratorKey, denominatorKey].some(k => k.toLowerCase() === lower)) {
            errors.push(`"${name}" is where fraction data key "${`${other.name}`.trim()}" stores one of its numbers; choose another name.`);
        }
    }

    return errors;
}
