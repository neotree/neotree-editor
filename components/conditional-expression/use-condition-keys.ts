"use client";

import { useEffect, useMemo } from "react";

import { useScriptsContext } from "@/contexts/scripts";
import { toConditionKeys, type ConditionKey } from "@/lib/conditional-expression";
import { useScriptFormCtx } from "@/contexts/script-form";

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
  /** True after the authoritative script catalogue has loaded, even if empty. */
  keysReady: boolean;
} {
  const ctx = useScriptsContext();
  const conditionCatalogueReady = ctx?.conditionCatalogueReady ?? false;
  const enabled = opts?.enabled ?? true;

  const { 
    keys, 
    conditionKeys: contextConditionKeys, 
  } = useScriptFormCtx();

  const conditionKeys = useMemo<ConditionKey[]>(
    () => contextConditionKeys?.length
      ? contextConditionKeys
      : toConditionKeys((keys || []) as any[]),
    [contextConditionKeys, keys],
  );

  return {
    conditionKeys,
    keysLoading: false,
    keysReady: conditionCatalogueReady || conditionKeys.length > 0,
  };
}
