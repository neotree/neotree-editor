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
 * **No duplicates by key + dataType.** A single index (seeded from the library
 * and grown as keys are created) guarantees a given (name, type) is created at
 * most once — reusing an existing library key or one already created earlier in
 * the same batch. So two dropdowns that both need `Y`/`N` share one `Y` and one
 * `N`, and a dropdown/text whose key already exists is never re-created. Options
 * additionally match by value OR label, so an existing `Y` or `Yes` is adopted.
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

  /** Ensure an option child, matching an existing one by value OR label. */
  const ensureOption = (opt: NuidOptionSpec): string => {
    const byValue = index.get(indexKey(opt.value, "option"));
    if (byValue) return byValue;
    const byLabel = opt.label ? index.get(indexKey(opt.label, "option")) : undefined;
    if (byLabel) return byLabel;

    const uniqueKey = ensureKey(opt.value, opt.label || opt.value, "option", { confidential: false });
    if (opt.label) remember(uniqueKey, opt.label, "option");
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
