import { normalizeDataKeyCompatibilityType } from "@/lib/data-key-types";
import type { NuidFieldSpec } from "./constants";

/** Minimal shape of a library data key needed to resolve/match. */
export type NuidLibraryKey = {
  uniqueKey?: string | null;
  uuid?: string | null;
  name?: string | null;
  dataType?: string | null;
  options?: string[] | null;
};

export type ResolvedNuidField = NuidFieldSpec & { keyId: string };

export type NuidConflict = {
  key: string;
  expectedType: string;
  foundType: string;
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
 * name and library type-compatibility (the same normalisation the field picker
 * uses). Never mutates anything — it only classifies each field so the caller
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

    const compatible = sameName.find(
      (k) => normalizeDataKeyCompatibilityType(k.dataType) === expected,
    );

    if (compatible) {
      linked.push({ ...spec, keyId: keyIdOf(compatible) });
    } else {
      conflicts.push({
        key: spec.key,
        expectedType: expected,
        foundType: normalizeDataKeyCompatibilityType(sameName[0].dataType),
      });
    }
  }

  return { linked, missing, conflicts };
}
