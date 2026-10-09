import { v4 as uuidv4 } from "uuid";

import { normalizeDataKeyCompatibilityType } from "@/lib/data-key-types";
import { NUID_MANAGED, type NuidFieldSpec, type NuidOptionSpec } from "./constants";
import type { NuidLibraryKey } from "./resolve";

/** A data key to create via `saveDataKeys` (shape accepted by `_saveDataKeys`). */
export type NuidProvisionKey = {
  uniqueKey: string;
  name: string;
  label: string;
  dataType: string;
  options?: string[];
  metadata: Record<string, any>;
  confidential: boolean;
};

const keyIdOf = (k: NuidLibraryKey) => `${k.uniqueKey || k.uuid || ""}`;

/**
 * Dedup index key: compatibility type + exact (trimmed) name. Names are matched
 * case-sensitively — the same rule `resolveNuidTemplate` uses and the CE engine
 * enforces (`$Key` casing is significant), so the builder and resolver never
 * disagree about whether a key already exists.
 */
const indexKey = (name: string | null | undefined, dataType: string | null | undefined) =>
  `${normalizeDataKeyCompatibilityType(dataType)}::${`${name || ""}`.trim()}`;

/**
 * Build the batched `saveDataKeys` payload that provisions the missing NUID keys:
 *
 * - Each missing dropdown → the parent key plus its option children (Y/Yes, N/No).
 * - Each missing text field → a plain text key.
 *
 * **No duplicates by key + dataType.** Parent/text keys are deduped by (name,
 * type) via an index (seeded from the library and grown as keys are created), so
 * a dropdown/text whose key already exists is never re-created.
 *
 * **Option (Y/N) matching** is stricter and label-aware. For a Yes option
 * (`value: 'Y'`, `label: 'Yes'`) an existing `option` key is reused only when its
 * label is exactly `Yes`, preferring one keyed `Y` and falling back to one keyed
 * `Yes`. Same for No (`N`/`No`, label `No`). When none matches, a new option is
 * created keyed by the value (`Y`/`N`) with the `Yes`/`No` label. So two dropdowns
 * that both need `Y`/`N` still share one `Y` and one `N`.
 *
 * Every created key is stamped `metadata.managed = 'nuid'`. New keys get a
 * client-generated `uniqueKey` so parents can reference freshly created children
 * in the same batch (`_saveDataKeys` honours a provided `uniqueKey`).
 *
 * Pure and deterministic given `genId` — the default is a real uuid generator.
 */
export function buildNuidProvisionPayload(
  missing: NuidFieldSpec[],
  allDataKeys: NuidLibraryKey[],
  genId: () => string = uuidv4,
): NuidProvisionKey[] {
  const payload: NuidProvisionKey[] = [];
  const managed = () => ({ managed: NUID_MANAGED });

  const index = new Map<string, string>();
  for (const k of allDataKeys || []) {
    const id = keyIdOf(k);
    if (id && `${k.name || ""}`.trim()) index.set(indexKey(k.name, k.dataType), id);
  }

  const remember = (uniqueKey: string, name: string, dataType: string) => {
    index.set(indexKey(name, dataType), uniqueKey);
  };

  /** Ensure a single key of (name, dataType) exists; returns its uniqueKey. */
  const ensureKey = (
    name: string,
    label: string,
    dataType: string,
    extra?: { options?: string[]; confidential?: boolean },
  ): string => {
    const existing = index.get(indexKey(name, dataType));
    if (existing) return existing;

    const uniqueKey = genId();
    payload.push({
      uniqueKey,
      name,
      label: label || name,
      dataType,
      options: extra?.options,
      metadata: managed(),
      confidential: extra?.confidential ?? false,
    });
    remember(uniqueKey, name, dataType);
    return uniqueKey;
  };

  type OptionEntry = { name: string; label: string; uniqueKey: string };
  const optionEntries: OptionEntry[] = (allDataKeys || [])
    .filter((k) => normalizeDataKeyCompatibilityType(k.dataType) === "option")
    .map((k) => ({ name: `${k.name || ""}`.trim(), label: `${k.label || ""}`.trim(), uniqueKey: keyIdOf(k) }))
    .filter((o) => !!o.uniqueKey);

  const findOption = (name: string, label: string): string | undefined =>
    optionEntries.find((o) => o.name === name && o.label === label)?.uniqueKey;

  /**
   * Match/create a Yes-or-No option child. Requires the existing key's label to
   * be exactly the spec label (`Yes`/`No`), preferring a key named after the
   * value (`Y`/`N`) and falling back to one named after the label (`Yes`/`No`).
   */
  const ensureOption = (opt: NuidOptionSpec): string => {
    const value = `${opt.value || ""}`.trim(); // 'Y' | 'N'
    const label = `${opt.label || ""}`.trim(); // 'Yes' | 'No'

    // Priority 1: key === value (Y/N) with the exact label.
    const byValue = findOption(value, label);
    if (byValue) return byValue;
    // Priority 2: key === label (Yes/No) with the exact label.
    if (label && label !== value) {
      const byLabel = findOption(label, label);
      if (byLabel) return byLabel;
    }

    // Create: key = value (Y/N), label = Yes/No.
    const uniqueKey = genId();
    payload.push({ uniqueKey, name: value, label, dataType: "option", metadata: managed(), confidential: false });
    optionEntries.push({ name: value, label, uniqueKey });
    return uniqueKey;
  };

  for (const spec of missing) {
    if (spec.options?.length) {
      const childUniqueKeys = spec.options.map((opt) => ensureOption(opt));
      ensureKey(spec.key, spec.label || spec.key, "dropdown", {
        options: childUniqueKeys,
        confidential: false,
      });
    } else {
      ensureKey(spec.key, spec.label || spec.key, spec.type || "text", { confidential: true });
    }
  }

  return payload;
}
