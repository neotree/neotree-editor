"use client";

import { useEffect, useMemo } from "react";

import { useScriptsContext } from "@/contexts/scripts";
import type { ConditionKey } from "@/lib/conditional-expression";

/**
 * Adapts registry/scrapped data keys into the ConditionKey shape, resolving each
 * key's `options` (stored as child uniqueKeys/uuids) into the value-names — and
 * labels — authors actually type. Shared so every surface (script keys, NUID
 * search keys, etc.) resolves parent -> child options the same way.
 */
export function toConditionKeys(rawKeys: any[]): ConditionKey[] {
  const list = rawKeys || [];

  const idToMeta = new Map<string, { name: string; label?: string }>();
  for (const key of list) {
    const name = `${key?.name || ""}`.trim();
    if (!name) continue;
    const meta = { name, label: `${key?.label || ""}`.trim() || undefined };
    if (key?.uniqueKey) idToMeta.set(`${key.uniqueKey}`, meta);
    if (key?.uuid) idToMeta.set(`${key.uuid}`, meta);
  }

  return list
    .map((key: any) => {
      const name = `${key?.name || ""}`.trim();

      const rawOptions: string[] = Array.isArray(key?.options) ? key.options : [];
      const resolved = rawOptions.map((id) => idToMeta.get(`${id}`));
      // Only expose options when every one resolved — a partial list would
      // cause false "unknown option" warnings on valid values.
      const complete = !!resolved.length && resolved.every((o): o is { name: string; label?: string } => !!o);

      let options: string[] | undefined;
      let optionLabels: Record<string, string> | undefined;
      if (complete) {
        const seen = new Set<string>();
        options = [];
        optionLabels = {};
        for (const meta of resolved as { name: string; label?: string }[]) {
          if (seen.has(meta.name)) continue;
          seen.add(meta.name);
          options.push(meta.name);
          if (meta.label) optionLabels[meta.name] = meta.label;
        }
        if (!Object.keys(optionLabels).length) optionLabels = undefined;
      }

      return {
        name,
        label: `${name}${key?.label ? ` - ${key.label}` : ""}`,
        dataType: `${key?.dataType || ""}`.trim(),
        options,
        optionLabels,
      };
    })
    .filter((key) => !!key.name);
}

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
