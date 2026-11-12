type AnyRecord = Record<string, any>;

const norm = (value: unknown) => `${value ?? ''}`.trim();

export type MergeChangeKind = 'relinked' | 'renamed' | 'removed' | 'added' | 'condition';

export type MergeChange = {
    kind: MergeChangeKind;
    /** "Screen > Field > Option" */
    location: string;
    before: string;
    after: string;
    href: string;
};

export type MergeScriptReport = {
    scriptId: string;
    scriptTitle: string;
    changes: MergeChange[];
};

export type MergeReport = {
    scripts: MergeScriptReport[];
    totals: Record<MergeChangeKind, number>;
};

type Entities = {
    screens: AnyRecord[];
    diagnoses: AnyRecord[];
    problems: AnyRecord[];
};

/**
 * Describes what a merge changed in each script by comparing the scripts'
 * effective state (draft over published) before and after. Key ids are shown
 * by name via `describeKey`.
 */
export function buildMergeReport({
    before,
    after,
    describeKey,
}: {
    before: Entities;
    after: Entities;
    describeKey: (uniqueKey: string) => string;
}): MergeReport {
    const byScript = new Map<string, MergeScriptReport>();
    const totals: MergeReport['totals'] = { relinked: 0, renamed: 0, removed: 0, added: 0, condition: 0 };

    const push = (entity: AnyRecord, change: MergeChange) => {
        const scriptId = norm(entity.scriptId);
        const report = byScript.get(scriptId) || {
            scriptId,
            scriptTitle: norm(entity.scriptTitle) || scriptId,
            changes: [],
        };
        report.changes.push(change);
        byScript.set(scriptId, report);
        totals[change.kind]++;
    };

    const keyText = (keyId: unknown) => (norm(keyId) ? describeKey(norm(keyId)) : 'no data key');

    const compareKey = (entity: AnyRecord, location: string, href: string, prev: AnyRecord, next: AnyRecord) => {
        if (norm(prev?.keyId) !== norm(next?.keyId)) {
            push(entity, { kind: 'relinked', location, before: keyText(prev?.keyId), after: keyText(next?.keyId), href });
        }
    };

    const compareText = (entity: AnyRecord, kind: MergeChangeKind, location: string, href: string, prev: unknown, next: unknown) => {
        if (norm(prev) !== norm(next)) push(entity, { kind, location, before: norm(prev), after: norm(next), href });
    };

    // Items are matched by itemId, then by keyId, then by position.
    const compareItems = (
        entity: AnyRecord,
        location: string,
        href: string,
        prevItems: AnyRecord[] = [],
        nextItems: AnyRecord[] = [],
        valueKey: 'value' | 'id',
    ) => {
        const used = new Set<number>();
        const findNext = (item: AnyRecord, index: number) => {
            const candidates = [
                nextItems.findIndex((other, i) => !used.has(i) && !!norm(item.itemId) && norm(other.itemId) === norm(item.itemId)),
                nextItems.findIndex((other, i) => !used.has(i) && !!norm(item.keyId) && norm(other.keyId) === norm(item.keyId)),
                !used.has(index) && index < nextItems.length && !norm(nextItems[index]?.itemId) ? index : -1,
            ];
            return candidates.find((candidate) => candidate >= 0) ?? -1;
        };

        prevItems.forEach((item, index) => {
            const title = norm(item?.label) || norm(item?.[valueKey]) || `option ${index + 1}`;
            const itemLocation = `${location} > ${title}`;
            const nextIndex = findNext(item, index);
            if (nextIndex < 0) {
                push(entity, { kind: 'removed', location: itemLocation, before: norm(item?.[valueKey]) || title, after: '', href });
                return;
            }
            used.add(nextIndex);
            const next = nextItems[nextIndex];
            compareKey(entity, itemLocation, href, item, next);
            compareText(entity, 'renamed', itemLocation, href, item?.[valueKey], next?.[valueKey]);
            compareText(entity, 'condition', `${itemLocation} (condition)`, href, item?.condition, next?.condition);
        });

        nextItems.forEach((item, index) => {
            if (used.has(index)) return;
            const title = norm(item?.label) || norm(item?.[valueKey]) || `option ${index + 1}`;
            push(entity, { kind: 'added', location: `${location} > ${title}`, before: '', after: norm(item?.[valueKey]) || title, href });
        });
    };

    /**
     * Pairs entries (fields, symptoms) before and after: by id, then by key,
     * then — only when nothing was added or removed — by position. Pairing by
     * position after a removal would compare unrelated entries, so leftovers
     * are reported as removed or added instead.
     */
    const pairUp = (prevList: AnyRecord[] = [], nextList: AnyRecord[] = [], idKey: string) => {
        const pairs: Array<[AnyRecord, AnyRecord | null, number]> = [];
        const usedNext = new Set<number>();
        const unpaired: number[] = [];

        prevList.forEach((entry, index) => {
            const id = norm(entry?.[idKey]);
            const byId = id ? nextList.findIndex((other, i) => !usedNext.has(i) && norm(other?.[idKey]) === id) : -1;
            const byKey = byId < 0 && norm(entry?.key)
                ? nextList.findIndex((other, i) => !usedNext.has(i) && norm(other?.key) === norm(entry?.key) && (!id || !norm(other?.[idKey])))
                : -1;
            const match = byId >= 0 ? byId : byKey;
            if (match >= 0) {
                usedNext.add(match);
                pairs.push([entry, nextList[match], index]);
            } else {
                unpaired.push(index);
            }
        });

        const leftoverNext = nextList.map((_, i) => i).filter((i) => !usedNext.has(i));
        if (unpaired.length && unpaired.length === leftoverNext.length) {
            unpaired.forEach((index, n) => {
                usedNext.add(leftoverNext[n]);
                pairs.push([prevList[index], nextList[leftoverNext[n]], index]);
            });
        } else {
            unpaired.forEach((index) => pairs.push([prevList[index], null, index]));
        }

        return {
            pairs: pairs.sort((a, b) => a[2] - b[2]),
            added: nextList.filter((_, i) => !usedNext.has(i)),
        };
    };

    const screensAfter = new Map(after.screens.map((screen) => [norm(screen.screenId), screen]));
    for (const prev of before.screens) {
        const next = screensAfter.get(norm(prev.screenId));
        if (!next) continue;
        const title = norm(prev.title) || norm(prev.label) || norm(prev.refId) || 'Screen';
        const href = `/script/${prev.scriptId}/screen/${prev.screenId}`;

        compareKey(prev, title, href, prev, next);
        compareText(prev, 'condition', `${title} (condition)`, href, prev.condition, next.condition);
        compareText(prev, 'condition', `${title} (skip to condition)`, href, prev.skipToCondition, next.skipToCondition);
        compareItems(prev, title, href, prev.items, next.items, 'id');

        const fields = pairUp(prev.fields, next.fields, 'fieldId');
        fields.pairs.forEach(([field, nextField, fieldIndex]) => {
            const fieldTitle = `${title} > ${norm(field.label) || norm(field.key) || `field ${fieldIndex + 1}`}`;
            const fieldHref = `${href}?field=${field.fieldId || fieldIndex}`;
            if (!nextField) {
                push(prev, { kind: 'removed', location: fieldTitle, before: norm(field.key) || norm(field.label), after: '', href: fieldHref });
                return;
            }
            compareKey(prev, fieldTitle, fieldHref, field, nextField);
            compareText(prev, 'renamed', `${fieldTitle} (key)`, fieldHref, field.key, nextField.key);
            compareText(prev, 'condition', `${fieldTitle} (condition)`, fieldHref, field.condition, nextField.condition);
            compareText(prev, 'condition', `${fieldTitle} (calculation)`, fieldHref, field.calculation, nextField.calculation);
            compareItems(prev, fieldTitle, fieldHref, field.items, nextField.items, 'value');
        });
        fields.added.forEach((field) => push(prev, {
            kind: 'added',
            location: `${title} > ${norm(field.label) || norm(field.key) || 'field'}`,
            before: '',
            after: norm(field.key) || norm(field.label),
            href: `${href}?field=${field.fieldId || ''}`,
        }));
    }

    const compareOutcomes = (prevList: AnyRecord[], nextList: AnyRecord[], idKey: 'diagnosisId' | 'problemId', path: string, noun: string) => {
        const nextById = new Map(nextList.map((entity) => [norm(entity[idKey]), entity]));
        for (const prev of prevList) {
            const next = nextById.get(norm(prev[idKey]));
            if (!next) continue;
            const title = `${noun} "${norm(prev.name) || norm(prev.key)}"`;
            const href = `/script/${prev.scriptId}/${path}/${prev[idKey]}`;
            compareKey(prev, title, href, prev, next);
            compareText(prev, 'condition', `${title} (expression)`, href, prev.expression, next.expression);
            const symptoms = pairUp(prev.symptoms, next.symptoms, 'symptomId');
            symptoms.added.forEach((symptom) => push(prev, {
                kind: 'added', location: `${title} > ${norm(symptom.name) || norm(symptom.key) || 'symptom'}`, before: '', after: norm(symptom.key), href,
            }));
            symptoms.pairs.forEach(([symptom, other, index]) => {
                const symptomTitle = `${title} > ${norm(symptom.name) || norm(symptom.key) || `symptom ${index + 1}`}`;
                if (!other) {
                    push(prev, { kind: 'removed', location: symptomTitle, before: norm(symptom.key) || norm(symptom.name), after: '', href });
                    return;
                }
                compareKey(prev, symptomTitle, href, symptom, other);
                compareText(prev, 'condition', `${symptomTitle} (expression)`, href, symptom.expression, other.expression);
            });
        }
    };
    compareOutcomes(before.diagnoses, after.diagnoses, 'diagnosisId', 'diagnosis', 'Diagnosis');
    compareOutcomes(before.problems, after.problems, 'problemId', 'problem', 'Problem');

    return {
        scripts: Array.from(byScript.values()).sort((a, b) => a.scriptTitle.localeCompare(b.scriptTitle)),
        totals,
    };
}
