import type { DataKey } from "@/databases/queries/data-keys";
import type { _getDiagnoses, _getProblems, _getScreens } from "@/databases/queries/scripts";

export type DataKeyDeleteImpactItem = {
    dataKeyId: string;
    uniqueKey: string;
    name: string;
    label: string;
    dataType: string;
    hasLegacyUsages: boolean;
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

    const uniqueTargetNames = new Map<string, string>();
    const dataKeyNameCounts = new Map<string, number>();

    dataKeys.forEach((dataKey) => {
        const name = `${dataKey.name || ''}`.trim();
        if (!name) return;
        dataKeyNameCounts.set(name, (dataKeyNameCounts.get(name) || 0) + 1);
    });

    targets.forEach((dataKey) => {
        const name = `${dataKey.name || ''}`.trim();
        if (!name) return;
        if (dataKeyNameCounts.get(name) === 1) {
            uniqueTargetNames.set(name, dataKey.uniqueKey);
        }
    });

    const scriptsByTarget = new Map<string, Map<string, { scriptId: string; scriptTitle: string; usages: Array<{ label: string; href: string }> }>>();
    const targetsWithLegacyUsages = new Set<string>();
    targets.forEach((target) => {
        scriptsByTarget.set(target.uniqueKey, new Map());
    });

    const addScriptUsage = ({
        scriptId,
        scriptTitle,
        keyId,
        keyName,
        label,
        href,
    }: {
        scriptId?: string | null;
        scriptTitle?: string | null;
        keyId?: string | null;
        keyName?: string | null;
        label: string;
        href: string;
    }) => {
        const normalizedScriptId = `${scriptId || ''}`.trim();
        const normalizedScriptTitle = `${scriptTitle || ''}`.trim();
        if (!normalizedScriptId || !normalizedScriptTitle) return;

        const match = (() => {
            const normalizedKeyId = `${keyId || ''}`.trim();
            if (normalizedKeyId && scriptsByTarget.has(normalizedKeyId)) {
                return { uniqueKey: normalizedKeyId, source: 'uniqueKey' as const };
            }

            const normalizedKeyName = `${keyName || ''}`.trim();
            if (!normalizedKeyName) return null;
            const matchedUniqueKey = uniqueTargetNames.get(normalizedKeyName) || '';
            return matchedUniqueKey ? { uniqueKey: matchedUniqueKey, source: 'legacyName' as const } : null;
        })();

        if (!match) return;
        if (match.source === 'legacyName') targetsWithLegacyUsages.add(match.uniqueKey);

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
            keyName: screen.key,
            label: screenLabel,
            href: screenHref,
        });

        (screen.items || []).forEach((item, itemIndex) => {
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: item.keyId,
                keyName: item.key || item.id,
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
                keyName: field.key,
                label: fieldLabel,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.refKeyId,
                keyName: field.refKey,
                label: `${fieldLabel} > ref key`,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.minDateKeyId,
                keyName: field.minDateKey,
                label: `${fieldLabel} > min date`,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.maxDateKeyId,
                keyName: field.maxDateKey,
                label: `${fieldLabel} > max date`,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.minTimeKeyId,
                keyName: field.minTimeKey,
                label: `${fieldLabel} > min time`,
                href: fieldHref,
            });
            addScriptUsage({
                scriptId: screen.scriptId,
                scriptTitle: screen.scriptTitle,
                keyId: field.maxTimeKeyId,
                keyName: field.maxTimeKey,
                label: `${fieldLabel} > max time`,
                href: fieldHref,
            });

            (field.items || []).forEach((item, fieldItemIndex) => {
                addScriptUsage({
                    scriptId: screen.scriptId,
                    scriptTitle: screen.scriptTitle,
                    keyId: item.keyId,
                    keyName: `${item.value || ''}` || `${item.label || ''}`,
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
            keyName: diagnosis.key || diagnosis.name,
            label: diagnosisLabel,
            href: diagnosisHref,
        });

        (diagnosis.symptoms || []).forEach((symptom, symptomIndex) => {
            addScriptUsage({
                scriptId: diagnosis.scriptId,
                scriptTitle: diagnosis.scriptTitle,
                keyId: symptom.keyId,
                keyName: symptom.key || symptom.name,
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
            keyName: problem.key || problem.name,
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
        hasLegacyUsages: targetsWithLegacyUsages.has(target.uniqueKey),
        scripts: Array.from(scriptsByTarget.get(target.uniqueKey)?.values() || [])
            .sort((a, b) => a.scriptTitle.localeCompare(b.scriptTitle)),
    }));
}
