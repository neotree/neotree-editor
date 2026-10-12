import type { DataKeyDeleteImpactItem } from './data-key-delete-impact';

/**
 * Per-script delete granularity: a deleted key's references are replaced by
 * default (when a replacement is chosen) and removed only in the scripts the
 * user explicitly excepted. This resolves the client's raw choices into the
 * rewrite engine's exclusion map (deleted uniqueKey -> scriptIds to skip).
 *
 * Rules — all fail-safe:
 * - Only keys WITH a replacement produce exclusions; keys without one (and
 *   parent keys) are removed everywhere already, so exceptions are meaningless.
 * - Script ids are validated against the freshly computed impact; unknown ids
 *   (deleted scripts, stale clients) are dropped, so a usage that appears
 *   between dialog and execution gets the DEFAULT action: replace.
 */
export function resolveScriptRemovalExclusions({
    impact,
    replacements,
    scriptRemovals,
}: {
    impact: Pick<DataKeyDeleteImpactItem, 'dataKeyId' | 'uniqueKey' | 'options' | 'scripts'>[];
    /** target uuid -> replacement uuid */
    replacements: Record<string, string>;
    /** target uuid -> scriptIds whose references are removed instead of replaced */
    scriptRemovals: Record<string, string[]>;
}): Record<string, string[]> {
    const exclusionsByUniqueKey: Record<string, string[]> = {};

    for (const item of impact) {
        const targetId = `${item.dataKeyId || ''}`.trim();
        const uniqueKey = `${item.uniqueKey || ''}`.trim();
        if (!targetId || !uniqueKey) continue;

        // Parent keys and keys without a replacement are removed everywhere.
        if ((item.options || []).length) continue;
        if (!`${replacements[targetId] || ''}`.trim()) continue;

        const impactedScriptIds = new Set(item.scripts.map((script) => `${script.scriptId || ''}`.trim()).filter(Boolean));
        const requested = (scriptRemovals[targetId] || [])
            .map((scriptId) => `${scriptId || ''}`.trim())
            .filter((scriptId) => impactedScriptIds.has(scriptId));

        if (requested.length) {
            exclusionsByUniqueKey[uniqueKey] = Array.from(new Set(requested));
        }
    }

    return exclusionsByUniqueKey;
}

export type ScriptsOnlyPlan = {
    /** alias uniqueKey -> scriptIds the replace step must skip */
    replaceExclusionsByUniqueKey: Record<string, string[]>;
    /** deleted uniqueKey -> scriptIds the strip step may touch */
    stripScriptIdsByUniqueKey: Record<string, string[]>;
    /** Number of (key, script) pairs the operation applies to. */
    selectedCount: number;
};

/**
 * "Selected scripts only": the keys stay in the library and only the chosen
 * scripts change. In each selected script a key is replaced (when it has a
 * replacement and the script is not excepted) or removed; every unselected
 * script is left alone.
 *
 * Rules — all fail-safe:
 * - Script ids are validated against the freshly computed impact; unknown ids
 *   are dropped, so a usage that appears between dialog and execution is
 *   left UNTOUCHED (the opposite default to a library delete, where the key
 *   disappears and every usage must be handled).
 * - Parent keys and keys without a replacement are removed in their selected
 *   scripts.
 */
export function resolveScriptsOnlyPlan({
    impact,
    replacements,
    scriptSelections,
    scriptRemovals,
}: {
    impact: Pick<DataKeyDeleteImpactItem, 'dataKeyId' | 'uniqueKey' | 'options' | 'scripts'>[];
    /** target uuid -> replacement uuid */
    replacements: Record<string, string>;
    /** target uuid -> scriptIds the operation applies to */
    scriptSelections: Record<string, string[]>;
    /** target uuid -> selected scriptIds whose references are removed instead of replaced */
    scriptRemovals: Record<string, string[]>;
}): ScriptsOnlyPlan {
    const replaceExclusionsByUniqueKey: Record<string, string[]> = {};
    const stripScriptIdsByUniqueKey: Record<string, string[]> = {};
    let selectedCount = 0;

    for (const item of impact) {
        const targetId = `${item.dataKeyId || ''}`.trim();
        const uniqueKey = `${item.uniqueKey || ''}`.trim();
        if (!targetId || !uniqueKey) continue;

        const impactedScriptIds = Array.from(new Set(item.scripts.map((script) => `${script.scriptId || ''}`.trim()).filter(Boolean)));
        const requested = new Set((scriptSelections[targetId] || []).map((scriptId) => `${scriptId || ''}`.trim()));
        const selected = impactedScriptIds.filter((scriptId) => requested.has(scriptId));

        // A key with a replacement but nothing selected must still be excluded
        // everywhere, otherwise the replace step would rewrite all its usages.
        const replaced = !(item.options || []).length && !!`${replacements[targetId] || ''}`.trim();
        if (replaced) {
            const removed = new Set((scriptRemovals[targetId] || []).map((scriptId) => `${scriptId || ''}`.trim()));
            const excluded = impactedScriptIds.filter((scriptId) => !requested.has(scriptId) || removed.has(scriptId));
            if (excluded.length) replaceExclusionsByUniqueKey[uniqueKey] = excluded;
        }

        if (!selected.length) continue;

        selectedCount += selected.length;
        stripScriptIdsByUniqueKey[uniqueKey] = selected;
    }

    return {
        replaceExclusionsByUniqueKey,
        stripScriptIdsByUniqueKey,
        selectedCount,
    };
}
