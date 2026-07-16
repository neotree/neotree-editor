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
