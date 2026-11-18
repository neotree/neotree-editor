import { normalizeDataKeyCompatibilityType } from "@/lib/data-key-types";
import type { NuidFieldSpec } from "./constants";
import { getNuidFieldTypeForDataKey } from "./fields";

/** Minimal shape of a library data key needed to resolve/match. */
export type NuidLibraryKey = {
  uniqueKey?: string | null;
  uuid?: string | null;
  name?: string | null;
  label?: string | null;
  dataType?: string | null;
  options?: string[] | null;
};

export type ResolvedNuidField = NuidFieldSpec & { keyId: string };

export type NuidConflict = {
  key: string;
  /** The template field's label. */
  label?: string;
  expectedType: string;
  foundType: string;
  /** The label of the existing key that can't be used. */
  foundLabel?: string;
};

export type NuidResolution = {
  linked: ResolvedNuidField[];
  missing: NuidFieldSpec[];
  conflicts: NuidConflict[];
};

const keyIdOf = (k: NuidLibraryKey) => `${k.uniqueKey || k.uuid || ""}`;

export function indexDataKeysById(allDataKeys: NuidLibraryKey[]): Map<string, NuidLibraryKey> {
  const index = new Map<string, NuidLibraryKey>();
  for (const k of allDataKeys || []) {
    if (k?.uniqueKey) index.set(`${k.uniqueKey}`, k);
    if (k?.uuid) index.set(`${k.uuid}`, k);
  }
  return index;
}

/**
 * Resolve the library data keys a NUID search config references, by each field's
 * `keyId`, INCLUDING nested option children (so dropdown value checks work) — the
 * server-side equivalent of the editor's `extractDataKeys(keyIds,{withNested})`.
 *
 * A field with no `keyId` (unlinked) contributes nothing, so a condition that
 * references it resolves to an unknown key and is flagged — the whole point of
 * "only library keys count". Returns raw data keys ready for `toConditionKeys`.
 */
export function resolveNuidLibraryKeys(
  nuidSearchFields: { keyId?: string | null }[] | undefined,
  index: Map<string, NuidLibraryKey>,
): NuidLibraryKey[] {
  const result: NuidLibraryKey[] = [];
  const seen = new Set<string>();

  const add = (id: string | null | undefined) => {
    const k = id ? index.get(`${id}`) : undefined;
    if (!k) return;
    const dedupeId = keyIdOf(k);
    if (seen.has(dedupeId)) return;
    seen.add(dedupeId);
    result.push(k);
    for (const childId of k.options || []) add(childId); // nested option children
  };

  for (const f of nuidSearchFields || []) add(f?.keyId);
  return result;
}

/**
 * Resolve a NUID template against the data-key library, matching by exact key
 * name and kind (a choice needs a dropdown / single select key, a search a text
 * key: the only keys the mobile app shows on its NUID Search page). Never mutates anything — it only classifies each field so the caller
 * can auto-link the resolved ones and prompt for the rest.
 */
export function resolveNuidTemplate(
  template: NuidFieldSpec[],
  allDataKeys: NuidLibraryKey[],
): NuidResolution {
  const linked: ResolvedNuidField[] = [];
  const missing: NuidFieldSpec[] = [];
  const conflicts: NuidConflict[] = [];

  for (const spec of template) {
    const expected = normalizeDataKeyCompatibilityType(spec.type);
    const sameName = (allDataKeys || []).filter((k) => `${k.name || ""}`.trim() === spec.key);

    if (!sameName.length) {
      missing.push(spec);
      continue;
    }

    // A template field keeps its kind: other fields' conditions rely on a choice being a
    // choice (e.g. $BabyTransfered = 'Y'), so only a same-name key of the same kind that the
    // mobile app can show here is linked. Anything else is reported, never silently used.
    const compatible = sameName.find(
      (k) => !!getNuidFieldTypeForDataKey(k) && normalizeDataKeyCompatibilityType(k.dataType) === expected,
    );

    if (compatible) {
      linked.push({ ...spec, type: getNuidFieldTypeForDataKey(compatible) || spec.type, keyId: keyIdOf(compatible) });
    } else {
      conflicts.push({
        key: spec.key,
        label: spec.label,
        expectedType: spec.type === "dropdown" ? "dropdown" : "text",
        foundType: `${sameName[0].dataType || "untyped"}`,
        foundLabel: `${sameName[0].label || ""}`,
      });
    }
  }

  return { linked, missing, conflicts };
}
