"use client";

import { useEffect, useMemo } from "react";

import { useScriptsContext } from "@/contexts/scripts";
import type { ConditionKey } from "@/lib/conditional-expression";

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

  const conditionKeys = useMemo<ConditionKey[]>(() => {
    return (keys || [])
      .map((key: any) => {
        const name = `${key?.name || ""}`.trim();
        return {
          name,
          label: `${name}${key?.label ? ` - ${key.label}` : ""}`,
          dataType: `${key?.dataType || ""}`.trim(),
        };
      })
      .filter((key) => !!key.name);
  }, [keys]);

  return { conditionKeys, keysLoading };
}
