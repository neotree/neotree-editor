import type { ConditionKey } from "./ast";

/**
 * Merge condition-key lists, de-duplicating case-insensitively by name.
 *
 * `extra` (keys from the current, not-yet-saved form) takes precedence: where
 * it provides a label/dataType/options those win over possibly-stale persisted
 * metadata, while fields it omits fall back to the persisted entry. This keeps
 * a single entry per key (no duplicate React keys / autocomplete rows) even
 * when a key appears in both the persisted set and the local form.
 */
export function mergeConditionKeys(
  base: ConditionKey[],
  extra: ConditionKey[] = [],
): ConditionKey[] {
  const byName = new Map<string, ConditionKey>();

  const upsert = (key: ConditionKey, preferIncoming: boolean) => {
    const name = `${key?.name || ""}`.trim();
    if (!name) return;

    const id = name.toLowerCase();
    const existing = byName.get(id);

    if (!existing) {
      byName.set(id, { ...key, name });
      return;
    }

    const primary = preferIncoming ? key : existing;
    const secondary = preferIncoming ? existing : key;

    byName.set(id, {
      // Always store the trimmed canonical name, never the raw incoming one.
      name: `${primary.name || secondary.name || ""}`.trim() || name,
      label: primary.label ?? secondary.label,
      dataType: primary.dataType ?? secondary.dataType,
      options: primary.options ?? secondary.options,
    });
  };

  base.forEach((key) => upsert(key, false));
  extra.forEach((key) => upsert(key, true));

  return Array.from(byName.values());
}
