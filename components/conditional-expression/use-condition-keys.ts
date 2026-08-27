"use client";

import { useEffect, useMemo } from "react";

import { useScriptsContext } from "@/contexts/scripts";
import { toConditionKeys, type ConditionKey } from "@/lib/conditional-expression";

// Re-exported for existing importers (the shared implementation lives in lib).
export { toConditionKeys };

/**
 * Loads the authoritative condition-key catalogue scoped to the current script,
 * including its virtual Diagnoses and Problems outcome collections. This keeps
 * editor validation aligned with publish validation and runtime values.
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
  const contextConditionKeys = ctx?.conditionKeys;
  const keysLoading = ctx?.keysLoading ?? false;
  const loadKeys = ctx?.loadKeys;
  const enabled = opts?.enabled ?? true;

  useEffect(() => {
    if (enabled && loadKeys) loadKeys();
  }, [enabled, loadKeys]);

  const conditionKeys = useMemo<ConditionKey[]>(
    () => contextConditionKeys || toConditionKeys((keys || []) as any[]),
    [contextConditionKeys, keys],
  );

  return { conditionKeys, keysLoading };
}
