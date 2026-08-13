import { useMemo } from "react";

import { useConditionKeys, toConditionKeys } from "@/components/conditional-expression";
import {
    type ConditionKey,
    mergeConditionKeys,
    validateCondition,
} from "@/lib/conditional-expression";
import { useDataKeysCtx } from "@/contexts/data-keys";
import { normalizeDataKeyCompatibilityType } from "@/lib/data-key-types";

const DROPDOWN_TYPES = ["dropdown", "multi_select"];

export type NuidFieldIssue = {
    /** Not linked to a compatible library key (unlinked, missing, wrong type, or a dropdown with no options). */
    dataKey: boolean;
    /** The field's condition has a blocking conditional-expression error. */
    ce: boolean;
};

/**
 * Shared source of truth for NUID Search config health, used by both the config
 * sheet and the script form so they agree on when to block saving.
 *
 * A field is problematic when it isn't backed by a compatible library data key
 * (the feature only works with library keys) or its condition has a CE error.
 * While the data-key library is still loading nothing is flagged, so Save isn't
 * spuriously disabled mid-load.
 */
export function useNuidConfigIssues(
    fields: any[] | undefined,
    enabled: boolean | undefined,
) {
    const { conditionKeys } = useConditionKeys();
    const { extractDataKeys, loadingDataKeys } = useDataKeysCtx();

    const nuidFieldKeys = useMemo<ConditionKey[]>(() => {
        const keyIds = (fields || []).map((f) => f?.keyId).filter(Boolean) as string[];
        return keyIds.length ? toConditionKeys(extractDataKeys(keyIds, { withNested: true })) : [];
    }, [fields, extractDataKeys]);

    const keysReady = conditionKeys.length > 0 || nuidFieldKeys.length > 0;

    const { hasIssues, issues } = useMemo(() => {
        if (!enabled || loadingDataKeys) return { hasIssues: false, issues: [] as NuidFieldIssue[] };

        const merged = mergeConditionKeys(conditionKeys, nuidFieldKeys);

        const issues: NuidFieldIssue[] = (fields || []).map((f) => {
            const type = `${f?.type || ""}`.trim();
            const expected = normalizeDataKeyCompatibilityType(type);

            // Data-key health: must be linked to a compatible library key.
            let dataKey = false;
            const [dk] = f?.keyId ? extractDataKeys([f.keyId]) : [];
            if (!dk) {
                dataKey = true; // unlinked, or the key no longer exists in the library
            } else if (normalizeDataKeyCompatibilityType(dk.dataType) !== expected) {
                dataKey = true; // linked to the wrong type
            } else if (DROPDOWN_TYPES.includes(type)) {
                const opts = dk.options?.length ? extractDataKeys(dk.options) : [];
                if (!opts.length) dataKey = true; // dropdown with no options is unanswerable
            }

            // Condition health.
            let ce = false;
            const cond = `${f?.condition || ""}`.trim();
            if (cond) {
                ce = validateCondition(cond, {
                    keys: merged,
                    allowSelf: true,
                    skipKeyResolution: !keysReady,
                }).hasErrors;
            }

            return { dataKey, ce };
        });

        return { hasIssues: issues.some((i) => i.dataKey || i.ce), issues };
    }, [enabled, loadingDataKeys, fields, conditionKeys, nuidFieldKeys, extractDataKeys, keysReady]);

    return { conditionKeys, keysReady, nuidFieldKeys, hasIssues, issues };
}
