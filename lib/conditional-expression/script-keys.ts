import type { ConditionKey } from "./ast";
import { toConditionKeys } from "./keys";
import { mergeConditionKeys } from "./merge-keys";

type ScriptOutcome = {
  key?: unknown;
  name?: unknown;
  position?: unknown;
};

type ScriptScreen = {
  type?: unknown;
};

export interface BuildScriptConditionKeysInput {
  /** Raw scrapped data keys, before conversion to the editor shape. */
  dataKeys?: any[];
  diagnoses?: ScriptOutcome[];
  problems?: ScriptOutcome[];
  screens?: ScriptScreen[];
}

type OutcomeOption = {
  value: string;
  label?: string;
};

function toOutcomeOptions(items: ScriptOutcome[]): OutcomeOption[] {
  const positioned = items.map((item, index) => {
    const position = Number(item?.position);
    return {
      item,
      index,
      position: Number.isFinite(position) ? position : Number.MAX_SAFE_INTEGER,
    };
  });

  positioned.sort((a, b) => a.position - b.position || a.index - b.index);

  const seen = new Set<string>();
  const options: OutcomeOption[] = [];
  for (const { item } of positioned) {
    // The condition runtime compares selected outcomes by their machine key.
    // A display name is deliberately never used as a fallback value.
    const value = `${item?.key ?? ""}`.trim();
    if (!value) continue;

    const id = value.toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);

    const label = `${item?.name ?? ""}`.trim() || undefined;
    options.push({ value, label });
  }
  return options;
}

function withOutcomeCollection(
  keys: ConditionKey[],
  config: {
    name: "Diagnoses" | "Problems";
    label: string;
    dataType: "set<diagnosis>" | "set<problem>";
    outcomes: ScriptOutcome[];
  },
): ConditionKey[] {
  const index = keys.findIndex((key) => key.name.toLowerCase() === config.name.toLowerCase());
  const derived = toOutcomeOptions(config.outcomes);

  const options: string[] = [];
  const optionLabels: Record<string, string> = {};
  const seen = new Set<string>();
  const addOption = (value: string, label?: string) => {
    const trimmed = `${value || ""}`.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase();
    if (seen.has(id)) {
      if (label) {
        const canonical = options.find((option) => option.toLowerCase() === id);
        if (canonical) optionLabels[canonical] = label;
      }
      return;
    }
    seen.add(id);
    options.push(trimmed);
    if (label) optionLabels[trimmed] = label;
  };

  // CDS definitions are authoritative and retain their configured order. Raw
  // keys with a reserved name are deliberately not merged into this virtual
  // collection; publish validation reports those as collisions instead.
  derived.forEach((option) => addOption(option.value, option.label));

  const collection: ConditionKey = {
    name: config.name,
    label: config.label,
    dataType: config.dataType,
    options,
    optionLabels: Object.keys(optionLabels).length ? optionLabels : undefined,
  };

  if (index < 0) return [...keys, collection];
  return keys.map((key, keyIndex) => (keyIndex === index ? collection : key));
}

/**
 * Builds the authoritative conditional-expression key catalogue for one script.
 * Diagnoses and Problems are virtual, script-scoped collections and are never
 * persisted to the global data-key registry.
 */
export function buildScriptConditionKeys({
  dataKeys = [],
  diagnoses = [],
  problems = [],
  screens = [],
}: BuildScriptConditionKeysInput): ConditionKey[] {
  let keys = mergeConditionKeys([], toConditionKeys(dataKeys));
  if (diagnoses.length || screens.some((screen) => `${screen?.type || ""}` === "diagnosis")) {
    keys = withOutcomeCollection(keys, {
      name: "Diagnoses",
      label: "Diagnoses — script CDS diagnoses",
      dataType: "set<diagnosis>",
      outcomes: diagnoses,
    });
  }
  if (problems.length || screens.some((screen) => `${screen?.type || ""}` === "problems")) {
    keys = withOutcomeCollection(keys, {
      name: "Problems",
      label: "Problems — script CDS problems",
      dataType: "set<problem>",
      outcomes: problems,
    });
  }
  return keys;
}
