import type { ConditionKey } from "./ast";

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

  return list
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
}
