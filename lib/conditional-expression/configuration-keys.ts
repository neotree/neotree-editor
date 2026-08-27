import type { ConditionKey } from "./ast";

export type ConfigurationConditionKeySource = {
  key?: unknown;
  label?: unknown;
  position?: unknown;
};

const CONFIGURATION_SIGNATURE_VERSION = "configuration-keys:v1";

/**
 * Adapts the existing global Configuration catalogue to the CE key shape.
 *
 * Configuration values are booleans at runtime. This adapter deliberately
 * stays outside the parser and data-key registry: Configuration remains the
 * authoritative source and no records or expressions need to be migrated.
 */
export function toConfigurationConditionKeys(
  configurations: ConfigurationConditionKeySource[] = [],
): ConditionKey[] {
  const positioned = configurations.map((configuration, index) => {
    const position = Number(configuration?.position);
    return {
      configuration,
      index,
      position: Number.isFinite(position) ? position : Number.MAX_SAFE_INTEGER,
    };
  });
  positioned.sort((a, b) => a.position - b.position || a.index - b.index);

  const seen = new Set<string>();
  const keys: ConditionKey[] = [];
  for (const { configuration } of positioned) {
    const name = `${configuration?.key ?? ""}`.trim();
    if (!name) continue;

    const id = name.toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);

    const label = `${configuration?.label ?? ""}`.trim();
    keys.push({
      name,
      label: `${name} — legacy configuration${label ? ` · ${label}` : ""}`,
      dataType: "boolean",
      options: ["true", "false"],
    });
  }
  return keys;
}

/**
 * Stable cache signature based only on the exact runtime key names. Labels and
 * ordering affect presentation, not validation, and therefore do not expire
 * every script's cached CE report.
 */
export function getConfigurationConditionKeySignature(
  configurations: ConfigurationConditionKeySource[] = [],
): string {
  const names = toConfigurationConditionKeys(configurations)
    .map((key) => key.name)
    .sort((a, b) => a.localeCompare(b));

  // FNV-1a provides a small deterministic signature without a Node/runtime
  // dependency. The version prefix lets adapter semantics evolve safely.
  let hash = 0x811c9dc5;
  for (const char of names.join("\u0000")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${CONFIGURATION_SIGNATURE_VERSION}:${names.length}:${(hash >>> 0).toString(36)}`;
}
