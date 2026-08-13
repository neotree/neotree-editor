"use client";

import { useEffect, useMemo } from "react";

import { useScriptsContext } from "@/contexts/scripts";
import { toConditionKeys, type ConditionKey } from "@/lib/conditional-expression";

// Re-exported for existing importers (the shared implementation lives in lib).
export { toConditionKeys };

/**
 * Loads the data keys scoped to the current script and adapts them into the
 * shape <ConditionEditor> expects. This is the authoritative set of keys a
 * conditional expression is allowed to reference, so validation matches what
 * the mobile app will actually resolve at runtime.
 *
 * Safe to call outside a ScriptsContextProvider — it degrades to an empty key
 * list (which suppresses key-dependent checks) instead of throwing.
 */
export function useConditionKeys(opts?: { enabled?: boolean }): {
  conditionKeys: ConditionKey[];
  keysLoading: boolean;
} {
  const ctx = useScriptsContext();
  const keys = ctx?.keys;
  const keysLoading = ctx?.keysLoading ?? false;
  const loadKeys = ctx?.loadKeys;
  const enabled = opts?.enabled ?? true;

  useEffect(() => {
    if (enabled && loadKeys) loadKeys();
  }, [enabled, loadKeys]);

  const conditionKeys = useMemo<ConditionKey[]>(() => toConditionKeys((keys || []) as any[]), [keys]);

  return { conditionKeys, keysLoading };
}
