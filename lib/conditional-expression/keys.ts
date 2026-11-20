import type { ConditionKey } from "./ast";
import { getFractionLabels, getFractionStorageKeys, isFractionDataType } from "../fraction-data-keys";

/**
 * Adapts registry/scrapped data keys into the ConditionKey shape, resolving each
 * key's `options` (stored as child uniqueKeys/uuids) into the value-names — and
 * labels — authors actually type. Single source of truth so every surface
 * (the editor, list badges, the NUID config, the CLI scan, and the script-level
 * badge) resolves parent -> child options identically.
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

  const dataKeys: ConditionKey[] = list
    .map((key: any) => {
      const name = `${key?.name || ""}`.trim();

      const rawOptions: string[] = Array.isArray(key?.options) ? key.options : [];
      const resolved = rawOptions.map((id) => idToMeta.get(`${id}`));
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

  return [...dataKeys, ...fractionStorageConditionKeys(list)];
}

/**
 * A fraction key (e.g. BP) is captured as two numbers stored under keys of their own
 * (BP_numerator, BP_denominator). Conditions compare those, so they are offered as number keys.
 * A real data key with the same name wins (the data-key save refuses such clashes).
 */
function fractionStorageConditionKeys(rawKeys: any[]): ConditionKey[] {
  const taken = new Set(rawKeys.map((key) => `${key?.name || ""}`.trim().toLowerCase()).filter(Boolean));
  const keys: ConditionKey[] = [];
  for (const key of rawKeys) {
    const name = `${key?.name || ""}`.trim();
    if (!name || !isFractionDataType(key?.dataType)) continue;
    const label = `${key?.label || ""}`.trim() || name;
    const { numeratorLabel, denominatorLabel } = getFractionLabels(key?.metadata);
    const { numeratorKey, denominatorKey } = getFractionStorageKeys(name);
    const parts: [string, string][] = [
      [numeratorKey, numeratorLabel || "numerator"],
      [denominatorKey, denominatorLabel || "denominator"],
    ];
    for (const [storageKey, part] of parts) {
      if (taken.has(storageKey.toLowerCase())) continue;
      taken.add(storageKey.toLowerCase());
      keys.push({ name: storageKey, label: `${storageKey} - ${label} (${part})`, dataType: "number" });
    }
  }
  return keys;
}
