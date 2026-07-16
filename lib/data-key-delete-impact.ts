import type { DataKey } from "@/databases/queries/data-keys";
import type { _getDiagnoses, _getProblems, _getScreens } from "@/databases/queries/scripts";

export type DataKeyDeleteImpactItem = {
    dataKeyId: string;
    uniqueKey: string;
    name: string;
    label: string;
    dataType: string;
    options: string[];
    scripts: Array<{
        scriptId: string;
        scriptTitle: string;
        usages: Array<{
            label: string;
            href: string;
        }>;
    }>;
};

type ScreenData = Awaited<ReturnType<typeof _getScreens>>["data"][number];
type DiagnosisData = Awaited<ReturnType<typeof _getDiagnoses>>["data"][number];
type ProblemData = Awaited<ReturnType<typeof _getProblems>>["data"][number];

/**
 * Impact of unlinking child keys from a parent data key. Unlike full delete
 * impact, only usages OWNED by the parent count: screen items on screens bound
 * to the parent, and field items on fields bound to the parent. Usages of the
 * child anywhere else are untouched by an unlink, so they are not reported.
 */
export function buildDataKeyOptionUnlinkImpact({
    dataKeys,
    screens,
    parentUniqueKey,
    childUniqueKeys,
}: {
    dataKeys: DataKey[];
    screens: ScreenData[];
    parentUniqueKey: string;
    childUniqueKeys: string[];
}): DataKeyDeleteImpactItem[] {
    const normalizedParent = `${parentUniqueKey || ''}`.trim();
    const requestedChildren = new Set(childUniqueKeys.map((key) => `${key || ''}`.trim()).filter(Boolean));
    const targets = dataKeys.filter((dataKey) => dataKey.uniqueKey && requestedChildren.has(dataKey.uniqueKey));

    if (!normalizedParent || !targets.length) return [];

    // Matching is strictly by uniqueKey/keyId — names and labels are NOT unique
    // across the library and must never be used to identify a data key.
    const isOwnedByParent = (keyId?: string | null) =>
        `${keyId || ''}`.trim() === normalizedParent;

    const scriptsByTarget = new Map<string, Map<string, DataKeyDeleteImpactItem['scripts'][number]>>();
    targets.forEach((target) => scriptsByTarget.set(target.uniqueKey, new Map()));

    const addOwnedUsage = ({
        scriptId,
        scriptTitle,
        keyId,
        label,
        href,
    }: {
        scriptId?: string | null;
        scriptTitle?: string | null;
        keyId?: string | null;
        label: string;
        href: string;
    }) => {
        const normalizedScriptId = `${scriptId || ''}`.trim();
        const normalizedKeyId = `${keyId || ''}`.trim();
        if (!normalizedScriptId || !scriptsByTarget.has(normalizedKeyId)) return;

        const scripts = scriptsByTarget.get(normalizedKeyId)!;
        const existing = scripts.get(normalizedScriptId);
        const usage = { label, href };

        if (existing) {
            const usageKey = `${usage.label}::${usage.href}`;
            if (!existing.usages.some((item) => `${item.label}::${item.href}` === usageKey)) {
                existing.usages.push(usage);
            }
            return;
        }

        scripts.set(normalizedScriptId, {
            scriptId: normalizedScriptId,
            scriptTitle: `${scriptTitle || ''}`.trim() || normalizedScriptId,
            usages: [usage],
        });
    };

    screens.forEach((screen) => {
        const screenHref = `/script/${screen.scriptId}/screen/${screen.screenId}`;
        const screenLabel = screen.title || screen.label || screen.refId || 'screen';

        if (isOwnedByParent(screen.keyId)) {
            (screen.items || []).forEach((item, itemIndex) => {
                addOwnedUsage({
                    scriptId: screen.scriptId,
                    scriptTitle: screen.scriptTitle,
                    keyId: item.keyId,
                    label: `${screenLabel} > ${item.label || item.key || item.id || `item ${itemIndex + 1}`}`,
                    href: `${screenHref}?item=${item.itemId || itemIndex}`,
                });
            });
        }

        (screen.fields || []).forEach((field, fieldIndex) => {
            if (!isOwnedByParent(field.keyId)) return;

            const fieldHref = `${screenHref}?field=${field.fieldId || fieldIndex}`;
            const fieldLabel = `${screenLabel} > ${field.label || field.key || `field ${fieldIndex + 1}`}`;

            (field.items || []).forEach((item, fieldItemIndex) => {
                addOwnedUsage({
                    scriptId: screen.scriptId,
                    scriptTitle: screen.scriptTitle,
                    keyId: item.keyId,
                    label: `${fieldLabel} > ${item.label || item.value || `option ${fieldItemIndex + 1}`}`,
                    href: `${fieldHref}&fieldItem=${item.itemId || fieldItemIndex}`,
                });
            });
        });
    });

    return targets.map((target) => ({
        dataKeyId: target.uuid,
        uniqueKey: target.uniqueKey,
        name: target.name || '',
        label: target.label || '',
        dataType: target.dataType || '',
        options: target.options || [],
        scripts: Array.from(scriptsByTarget.get(target.uniqueKey)?.values() || [])
            .sort((a, b) => a.scriptTitle.localeCompare(b.scriptTitle)),
    }));
}

export function buildDataKeysDeleteImpact({
    dataKeys,
    screens,
    diagnoses,
    problems,
    dataKeysIds = [],
    uniqueKeys = [],
}: {
    dataKeys: DataKey[];
    screens: ScreenData[];
    diagnoses: DiagnosisData[];
    problems: ProblemData[];
    dataKeysIds?: string[];
    uniqueKeys?: string[];
}): DataKeyDeleteImpactItem[] {
    const requestedIds = new Set(dataKeysIds.filter(Boolean));
    const requestedUniqueKeys = new Set(uniqueKeys.filter(Boolean));
    const targets = dataKeys.filter((dataKey) => (
        (dataKey.uuid && requestedIds.has(dataKey.uuid)) ||
        (dataKey.uniqueKey && requestedUniqueKeys.has(dataKey.uniqueKey))
    ));

    if (!targets.length) return [];

    const scriptsByTarget = new Map<string, Map<string, { scriptId: string; scriptTitle: string; usages: Array<{ label: string; href: string }> }>>();
    targets.forEach((target) => {
        scriptsByTarget.set(target.uniqueKey, new Map());
    });

    const addScriptUsage = ({
        scriptId,
        scriptTitle,
        keyId,
        label,
        href,
    }: {
        scriptId?: string | null;
        scriptTitle?: string | null;
        keyId?: string | null;
        label: string;
        href: string;
    }) => {
        const normalizedScriptId = `${scriptId || ''}`.trim();
        const normalizedScriptTitle = `${scriptTitle || ''}`.trim();
        if (!normalizedScriptId || !normalizedScriptTitle) return;

        const normalizedKeyId = `${keyId || ''}`.trim();
        const match = normalizedKeyId && scriptsByTarget.has(normalizedKeyId)
            ? { uniqueKey: normalizedKeyId }
            : null;

        if (!match) return;

        const scripts = scriptsByTarget.get(match.uniqueKey);
        if (!scripts) return;

        const existing = scripts.get(normalizedScriptId);
        const usage = { label, href };

        if (existing) {
            const usageKey = `${usage.label}::${usage.href}`;
            if (!existing.usages.some((item) => `${item.label}::${item.href}` === usageKey)) {
                existing.usages.push(usage);
            }
            return;
        }

        scripts.set(normalizedScriptId, {
            scriptId: normalizedScriptId,
            scriptTitle: normalizedScriptTitle,
            usages: [usage],
        });
    };

    screens.forEach((screen) => {
        const screenHref = `/script/${screen.scriptId}/screen/${screen.screenId}`;
        const screenLabel = screen.title || screen.label || screen.refId || 'screen';

        addScriptUsage({
            scriptId: screen.scriptId,
            scriptTitle: screen.scriptTitle,
            keyId: screen.keyId,
            label: screenLabel,
            href: screenHref,
        });

        // Mirrors _updateDataKeysRefs, which treats refIdDataKey (with refId as
        // legacy fallback) as a rewritable reference — it must count as usage too.
        addScriptUsage({
            scriptId: screen.scriptId,
            scriptTitle: screen.scriptTitle,
            keyId: screen.refIdDataKey || screen.refId,
            label: `${screenLabel} > ref ID data key`,
            href: screenHref,
        });

        (screen.items || []).forEach((item, itemIndex) => {
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: item.keyId,
                label: `${screenLabel} > ${item.label || item.key || item.id || `item ${itemIndex + 1}`}`,
                href: `${screenHref}?item=${item.itemId || itemIndex}`,
            });
        });

        (screen.fields || []).forEach((field, fieldIndex) => {
            const fieldHref = `${screenHref}?field=${field.fieldId || fieldIndex}`;
            const fieldLabel = `${screenLabel} > ${field.label || field.key || `field ${fieldIndex + 1}`}`;

            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.keyId,
                label: fieldLabel,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.refKeyId,
                label: `${fieldLabel} > ref key`,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.minDateKeyId,
                label: `${fieldLabel} > min date`,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.maxDateKeyId,
                label: `${fieldLabel} > max date`,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.minTimeKeyId,
                label: `${fieldLabel} > min time`,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.maxTimeKeyId,
                label: `${fieldLabel} > max time`,
                href: fieldHref,
            });

            (field.items || []).forEach((item, fieldItemIndex) => {
                addScriptUsage({
                    scriptId: screen.scriptId,
                    scriptTitle: screen.scriptTitle,
                    keyId: item.keyId,
                    label: `${fieldLabel} > ${item.label || item.value || `option ${fieldItemIndex + 1}`}`,
                    href: `${fieldHref}&fieldItem=${item.itemId || fieldItemIndex}`,
                });
            });
        });
    });

    diagnoses.forEach((diagnosis) => {
        const diagnosisHref = `/script/${diagnosis.scriptId}/diagnosis/${diagnosis.diagnosisId}`;
        const diagnosisLabel = diagnosis.name || diagnosis.key || 'diagnosis';

        addScriptUsage({
            scriptId: diagnosis.scriptId,
            scriptTitle: diagnosis.scriptTitle,
            keyId: diagnosis.keyId,
            label: diagnosisLabel,
            href: diagnosisHref,
        });

        (diagnosis.symptoms || []).forEach((symptom, symptomIndex) => {
            addScriptUsage({
                scriptId: diagnosis.scriptId,
                scriptTitle: diagnosis.scriptTitle,
                keyId: symptom.keyId,
                label: `${diagnosisLabel} > ${symptom.name || symptom.key || `symptom ${symptomIndex + 1}`}`,
                href: `${diagnosisHref}?symptom=${symptom.symptomId || symptomIndex}`,
            });
        });
    });

    problems.forEach((problem) => {
        addScriptUsage({
            scriptId: problem.scriptId,
            scriptTitle: problem.scriptTitle,
            keyId: problem.keyId,
            label: problem.name || problem.key || 'problem',
            href: `/script/${problem.scriptId}/problem/${problem.problemId}`,
        });
    });

    return targets.map((target) => ({
        dataKeyId: target.uuid,
        uniqueKey: target.uniqueKey,
        name: target.name || '',
        label: target.label || '',
        dataType: target.dataType || '',
        options: target.options || [],
        scripts: Array.from(scriptsByTarget.get(target.uniqueKey)?.values() || [])
            .sort((a, b) => a.scriptTitle.localeCompare(b.scriptTitle)),
    }));
}
