import { computeEntityRevision } from "./entity-revision";

/**
 * Script properties the editor computes (the condition error cache, and the item flags the
 * scripts queries add). They are not content an author edits, so they never belong in a
 * draft and never count as a change: the condition report is recomputed onto the published
 * row after every save, so a copy frozen in a draft always looked like an edit nobody made.
 */
export const SCRIPT_COMPUTED_KEYS = [
    "conditionErrorReport",
    "hasChangedItems",
    "hasDeletedItems",
    "hasDraftedScreens",
    "hasDraftedDiagnoses",
    "hasDraftedProblems",
    "itemsChangedByUserId",
    "hasUnownedChanges",
    "itemsDeletedByUserId",
] as const;

const COMPUTED = new Set<string>(SCRIPT_COMPUTED_KEYS);

export function isScriptComputedKey(key: string) {
    return COMPUTED.has(key);
}

/** The object without the computed script properties (shallow; the input is not changed). */
export function stripScriptComputedProps<T extends Record<string, any>>(data: T): T {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(data || {})) {
        if (!COMPUTED.has(k)) out[k] = v;
    }
    return out as T;
}

/**
 * Whether saving `next` over `published` changes any content, ignoring computed properties,
 * row metadata, the version and empty values (null, undefined). Used so a save that changes
 * nothing doesn't leave an empty draft behind.
 */
export function scriptContentChanged(published: Record<string, any>, next: Record<string, any>) {
    const content = (o: Record<string, any>) => {
        const { version: _version, ...rest } = stripScriptComputedProps(o || {});
        return rest;
    };
    return computeEntityRevision(content(published)) !== computeEntityRevision(content(next));
}
