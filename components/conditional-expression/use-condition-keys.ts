"use client";

import { useMemo } from "react";

import { toConditionKeys, type ConditionKey } from "@/lib/conditional-expression";
import { useScriptFormCtx } from "@/contexts/script-form";

// Re-exported for existing importers (the shared implementation lives in lib).
export { toConditionKeys };

export function useConditionKeys(_opts?: { enabled?: boolean }): {
  conditionKeys: ConditionKey[];
  keysLoading: boolean;
  keysReady: boolean;
} {
  const { 
    keys, 
    conditionKeys: contextConditionKeys, 
    conditionCatalogueReady,
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
