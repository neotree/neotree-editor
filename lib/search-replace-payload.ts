import type { ScriptsSearchResultsItem } from "@/lib/scripts-search";

/**
 * Turning search matches into a partial-save payload.
 *
 * Kept out of the modal so it can be tested: every past bug here was silent —
 * a malformed payload still returned `success: true`, so the UI reported
 * "Changes saved successfully!" over a change that never landed.
 */

export type ReplaceItemType = 'script' | 'screen' | 'diagnosis' | 'problem';

export type ReplaceMatch = ScriptsSearchResultsItem['matches'][0] & {
    newValue: string;
    exclude: boolean;
};

export type ReplaceItem = {
    type: ReplaceItemType;
    id: string;
    title: string;
    parent?: {
        id: string;
        title: string;
        type: 'script';
    };
    matches: ReplaceMatch[];
};

/** A partial update aimed at one entry of a JSON list column, by position. */
export type IndexedPatch = { index: number; data: Record<string, any> };

/**
 * Apply index-addressed patches onto a JSON list column — the server half of
 * the contract the builders above produce.
 *
 * Returns a new array rather than writing through the fetched row, and skips an
 * index that no longer exists: the list may have been edited between the client
 * building the payload and this running.
 */
export function applyIndexedPatches<T>(list: T[] = [], patches: IndexedPatch[] = []): T[] {
    if (!patches.length) return list;

    const next = [...list];
    for (const patch of patches) {
        if (next[patch.index]) next[patch.index] = { ...next[patch.index], ...patch.data };
    }
    return next;
}

/**
 * Fields that identify a record rather than describe it. Renaming one silently
 * breaks every conditional expression and data-key link that points at it, so
 * they are never offered for replacement.
 */
export const EXCLUDED_MATCH_FIELDS = [
    'key', 'id',
    'field_key', 'field_id',
    'item_id', 'item_key',
    'field_item_key', 'field_item_id',
    'diagnosis_symptom_key', 'problem_symptom_key',
];

/** Prefixes that say which list a match came from, longest first. */
const MATCH_FIELD_PREFIXES = [
    'diagnosis_symptom_',
    'problem_symptom_',
    'field_item_',
    'field_',
    'item_',
];

/**
 * The column a match names, without its list prefix — `diagnosis_symptom_name`
 * addresses `name` on a symptom. Sending the prefixed name wrote a property the
 * row does not have.
 */
export function unprefixMatchField(field: string): string {
    for (const prefix of MATCH_FIELD_PREFIXES) {
        if (field.startsWith(prefix)) return field.substring(prefix.length);
    }
    return field;
}

/**
 * Record a replacement aimed at one entry of a list column, merging into the
 * patch already collected for that index.
 *
 * The previous version spread the whole `{ index, data }` wrapper instead of
 * its `data`, so a second match on the same entry nested the first one inside
 * itself and neither reached the column.
 */
export function collectPatch(
    patches: IndexedPatch[],
    index: number,
    field: string,
    value: string,
): void {
    const existing = patches.find(patch => patch.index === index);
    if (existing) {
        existing.data[field] = value;
        return;
    }
    patches.push({ index, data: { [field]: value } });
}

/** Every replaceable item in a set of search results, in script order. */
export function getReplaceItems(
    scriptsSearchResults: ScriptsSearchResultsItem[] = [],
): ReplaceItem[] {
    const items: ReplaceItem[] = [];

    const toMatches = (matches: ScriptsSearchResultsItem['matches']): ReplaceMatch[] =>
        matches.map(m => ({ ...m, newValue: '', exclude: false }));

    [...scriptsSearchResults]
        .sort((a, b) => a.position - b.position)
        .forEach(script => {
            const parent = { id: script.scriptId, title: script.title, type: 'script' as const };

            items.push({
                type: 'script',
                title: script.title,
                id: script.scriptId,
                matches: toMatches(script.matches),
            });

            script.diagnoses.forEach(diagnosis => items.push({
                type: 'diagnosis',
                title: diagnosis.title,
                parent,
                id: diagnosis.diagnosisId,
                matches: toMatches(diagnosis.matches),
            }));

            script.problems.forEach(problem => items.push({
                type: 'problem',
                title: problem.title,
                parent,
                id: problem.problemId,
                matches: toMatches(problem.matches),
            }));

            script.screens.forEach(screen => items.push({
                type: 'screen',
                title: screen.title,
                parent,
                id: screen.screenId,
                matches: toMatches(screen.matches),
            }));
        });

    return items
        .map(item => ({
            ...item,
            matches: item.matches.filter(match => !EXCLUDED_MATCH_FIELDS.includes(match.field)),
        }))
        .filter(item => !!item.matches.length);
}

/**
 * Payload for a diagnosis or problem: plain columns alongside `_symptoms`, the
 * index-addressed patches for its symptom list. Both records have the same
 * shape, so they build it the same way.
 */
export function toOutcomeData(matches: ReplaceMatch[]): Record<string, any> & { _symptoms: IndexedPatch[] } {
    const data: Record<string, any> = {};
    const _symptoms: IndexedPatch[] = [];

    for (const m of matches) {
        if (m.fieldIndex === undefined) {
            data[m.field] = m.newValue;
        } else {
            collectPatch(_symptoms, m.fieldIndex, unprefixMatchField(m.field), m.newValue);
        }
    }

    return { ...data, _symptoms };
}

/** Payload for a screen: plain columns plus patches for its fields and items. */
export function toScreenData(
    matches: ReplaceMatch[],
): Record<string, any> & { _fields: IndexedPatch[]; _items: IndexedPatch[] } {
    const data: Record<string, any> = {};
    const _fields: IndexedPatch[] = [];
    const _items: IndexedPatch[] = [];

    for (const m of matches) {
        if (m.fieldIndex === undefined) {
            data[m.field] = m.newValue;
        } else if (m.field.startsWith('field_')) {
            collectPatch(_fields, m.fieldIndex, unprefixMatchField(m.field), m.newValue);
        } else {
            collectPatch(_items, m.fieldIndex, unprefixMatchField(m.field), m.newValue);
        }
    }

    return { ...data, _fields, _items };
}

/**
 * The complete /api/save body for a set of replace items, with excluded matches
 * already dropped by the caller.
 */
export function buildSavePayload(items: ReplaceItem[]) {
    return {
        scripts: items
            .filter(s => s.type === 'script')
            .map(s => ({
                scriptId: s.id,
                data: s.matches.reduce((acc, m) => ({ ...acc, [m.field]: m.newValue }), {} as Record<string, any>),
            })),

        screens: items
            .filter(s => s.type === 'screen')
            .map(s => ({ screenId: s.id, data: toScreenData(s.matches) })),

        diagnoses: items
            .filter(s => s.type === 'diagnosis')
            .map(s => ({ diagnosisId: s.id, data: toOutcomeData(s.matches) })),

        problems: items
            .filter(s => s.type === 'problem')
            .map(s => ({ problemId: s.id, data: toOutcomeData(s.matches) })),
    };
}
