import { useMemo } from "react";

import { useConditionKeys, toConditionKeys } from "@/components/conditional-expression";
import {
    type ConditionKey,
    mergeConditionKeys,
    validateCondition,
} from "@/lib/conditional-expression";
import { useDataKeysCtx } from "@/contexts/data-keys";
import { validateNuidSearchFields } from "@/lib/nuid-search";

export type NuidFieldIssues = {
    /** Break the field on the app; publishing is blocked until they are fixed. */
    errors: string[];
    /** The field's condition will not evaluate; publishing warns, like every other condition. */
    conditionErrors: string[];
    /** Work on the app but deserve a look; they never block anything. */
    warnings: string[];
};

/**
 * Shared source of truth for NUID Search config health, used by the config
 * sheet, the field form and the script form so they report the same thing.
 *
 * Nothing here blocks saving a draft: errors are what the publish gate refuses
 * (lib/nuid-search validateNuidSearchFields), condition errors are what publish
 * warns about, warnings are advice. Library checks wait for the library to load
 * (`checking`), so they do not appear and disappear while it does.
 */
export function useNuidConfigIssues(
    fields: any[] | undefined,
    enabled: boolean | undefined,
) {
    const { conditionKeys, keysReady: conditionCatalogueReady } = useConditionKeys();
    const { extractDataKeys, loadingDataKeys } = useDataKeysCtx();

    // Each field is its library key, so conditions resolve against those keys.
    const nuidFieldKeys = useMemo<ConditionKey[]>(() => {
        const keyIds = (fields || []).map((f) => f?.keyId).filter(Boolean) as string[];
        return keyIds.length ? toConditionKeys(extractDataKeys(keyIds, { withNested: true })) : [];
    }, [fields, extractDataKeys]);

    const keysReady = conditionCatalogueReady || nuidFieldKeys.length > 0;
    const checking = !!enabled && !!loadingDataKeys;

    const issues = useMemo<NuidFieldIssues[]>(() => {
        if (!enabled) return [];

        const reports = validateNuidSearchFields(fields, {
            getLibraryKey: loadingDataKeys ? undefined : (keyId) => {
                const [dk] = extractDataKeys([keyId]);
                return dk || null;
            },
        });

        const merged = mergeConditionKeys(conditionKeys, nuidFieldKeys);

        return (fields || []).map((f, i) => {
            const conditionErrors: string[] = [];
            const cond = `${f?.condition || ""}`;
            if (cond.trim()) {
                const result = validateCondition(cond, {
                    keys: merged,
                    allowSelf: true,
                    skipKeyResolution: !keysReady,
                });
                result.diagnostics
                    .filter((d) => d.severity === "error")
                    .forEach((d) => conditionErrors.push(`Condition: ${d.message}`));
            }

            return {
                errors: reports[i].errors,
                conditionErrors,
                warnings: reports[i].warnings,
            };
        });
    }, [enabled, loadingDataKeys, fields, conditionKeys, nuidFieldKeys, extractDataKeys, keysReady]);

    const errorCount = issues.reduce((n, i) => n + i.errors.length, 0);
    const conditionErrorCount = issues.reduce((n, i) => n + i.conditionErrors.length, 0);
    const warningCount = issues.reduce((n, i) => n + i.warnings.length, 0);

    return {
        conditionKeys,
        keysReady,
        nuidFieldKeys,
        checking,
        issues,
        errorCount,
        conditionErrorCount,
        warningCount,
        hasErrors: errorCount > 0,
    };
}
