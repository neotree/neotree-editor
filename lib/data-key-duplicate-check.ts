/**
 * Checks a data key being created (or renamed) against the keys that already
 * exist — in this library and in the linked editor's (DEV <-> LIVE):
 *   - the same key name, exact casing  -> blocked: it already exists;
 *   - the same name, different casing  -> warned: a separate key, but the app
 *     lowercases conditions, so no condition can tell the two apart;
 *   - a different name, the same label -> warned, allowed;
 *   - a similar name (the same apart from spaces, underscores, hyphens and dots)
 *     or a similar label (two or more meaningful words in common, covering most
 *     of the shorter label) -> warned, allowed: worth a look before creating.
 */

export type ExistingDataKey = {
    uuid: string;
    uniqueKey: string;
    name: string;
    label?: string | null;
    dataType?: string | null;
    /** Unpublished (a draft that was never published, or edits not yet published). */
    isDraft?: boolean;
};

export type DataKeyDuplicateCheck = {
    /** Exact name matches: creating another is not allowed. */
    sameName: ExistingDataKey[];
    /** Same name in another casing. */
    sameNameOtherCase: ExistingDataKey[];
    /** Same label, different name. */
    sameLabel: ExistingDataKey[];
    /** The same name apart from spaces, underscores, hyphens and dots (Birth_Weight ~ birth weight). */
    similarName: ExistingDataKey[];
    /** Most of the label's words in common ("Birth weight (g)" ~ "Birth weight"). */
    similarLabel: ExistingDataKey[];
};

const trim = (value?: string | null) => `${value || ''}`.trim();
const fold = (value?: string | null) => trim(value).toLowerCase();

/** A key name without casing and separators: "Birth_Weight", "birth weight" and "BirthWeight" are one. */
export const compactDataKeyName = (value?: string | null) => fold(value).replace(/[\s_\-.]+/g, '');

/** The words that carry a label's meaning: lowercase, no numbers, no 1-2 letter words. */
export const meaningfulLabelWords = (value?: string | null) =>
    Array.from(new Set(fold(value).split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !/^\d+$/.test(word))));

/**
 * Labels are similar when they share at least two meaningful words and those
 * cover most (3/4) of the shorter label. Two words keeps one-word labels such
 * as "Yes" or "Other" from matching everything.
 */
export function labelsAreSimilar(a?: string | null, b?: string | null) {
    const left = meaningfulLabelWords(a);
    const right = new Set(meaningfulLabelWords(b));
    if (!left.length || !right.size) return false;
    const shared = left.filter((word) => right.has(word)).length;
    return shared >= 2 && shared / Math.min(left.length, right.size) >= 0.75;
}

export function checkDataKeyDuplicates({
    name,
    label,
    existing,
    excludeUuid,
}: {
    name?: string | null;
    label?: string | null;
    existing: ExistingDataKey[];
    /** The key being edited, which never conflicts with itself. */
    excludeUuid?: string | null;
}): DataKeyDuplicateCheck {
    const result: DataKeyDuplicateCheck = { sameName: [], sameNameOtherCase: [], sameLabel: [], similarName: [], similarLabel: [] };
    const wantedName = trim(name);
    const wantedLabel = fold(label);
    const wantedCompact = compactDataKeyName(name);
    const seen = new Set<string>();

    for (const key of existing) {
        if (!key || (excludeUuid && key.uuid === excludeUuid)) continue;
        const id = key.uuid || key.uniqueKey;
        if (seen.has(id)) continue;

        if (wantedName && trim(key.name) === wantedName) {
            result.sameName.push(key);
        } else if (wantedName && fold(key.name) === wantedName.toLowerCase()) {
            result.sameNameOtherCase.push(key);
        } else if (wantedLabel && fold(key.label) === wantedLabel) {
            result.sameLabel.push(key);
        } else if (wantedCompact && compactDataKeyName(key.name) === wantedCompact) {
            result.similarName.push(key);
        } else if (wantedLabel && labelsAreSimilar(label, key.label)) {
            result.similarLabel.push(key);
        } else {
            continue;
        }
        seen.add(id);
    }

    return result;
}

export type DataKeyDuplicateReport = {
    /** This library. */
    local: DataKeyDuplicateCheck;
    /** The linked editor's library (content sync: DEV <-> LIVE), when one is set up. */
    linked?: { siteName: string; check?: DataKeyDuplicateCheck; error?: string; };
};

export const hasDataKeyDuplicates = (check: DataKeyDuplicateCheck) =>
    !!(check.sameName.length || check.sameNameOtherCase.length || check.sameLabel.length || check.similarName.length || check.similarLabel.length);
