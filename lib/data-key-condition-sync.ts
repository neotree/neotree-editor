import {
  renameConditionReferences,
  type ConditionNameRename,
  type ConditionValueRename,
} from "./conditional-expression/rename-references";

type AnyRecord = Record<string, any>;

export type ConditionSyncScreenPatch = {
  screenId: string;
  scriptId: string;
  condition?: string;
  skipToCondition?: string;
  fields?: AnyRecord[];
  items?: AnyRecord[];
};

export type ConditionSyncDiagnosisPatch = {
  diagnosisId: string;
  scriptId: string;
  expression?: string;
  symptoms?: AnyRecord[];
};

export type ConditionSyncProblemPatch = {
  problemId: string;
  scriptId: string;
  expression?: string;
  symptoms?: AnyRecord[];
};

export type ScriptConditionSyncResult = {
  screens: ConditionSyncScreenPatch[];
  diagnoses: ConditionSyncDiagnosisPatch[];
  problems: ConditionSyncProblemPatch[];
  /** Number of individual expressions rewritten. */
  rewritten: number;
};

const lower = (value: unknown) => `${value ?? ""}`.trim().toLowerCase();

/**
 * After a data key replacement has rewritten one script's references
 * (keyId/key/value -> the replacement), brings that script's conditional
 * expressions along: `$Old` -> `$New`, and option literals compared against a
 * parent (`$Parent = 'Old'`, `$Parent includes ['Old']`) -> `'New'`.
 *
 * Every rename must be evidenced by the script's CURRENT state, so text that
 * still has a meaning is never touched:
 * - a variable is renamed only when no entity in the script still uses the old
 *   name as a key and some entity now uses the new one;
 * - an option literal is renamed only for parents that no longer offer the old
 *   value and now offer the new one.
 *
 * Pass only the entities of ONE script, loaded after the replacement.
 */
export function syncScriptConditionReferences({
  screens = [],
  diagnoses = [],
  problems = [],
  renames,
}: {
  screens?: AnyRecord[];
  diagnoses?: AnyRecord[];
  problems?: AnyRecord[];
  /** Old data key name -> replacement data key name. */
  renames: ConditionNameRename[];
}): ScriptConditionSyncResult {
  const result: ScriptConditionSyncResult = { screens: [], diagnoses: [], problems: [], rewritten: 0 };
  if (!renames.length) return result;

  const keyNames = new Set<string>();
  const optionsByParent = new Map<string, Set<string>>();
  const addOptions = (parent: unknown, values: unknown[]) => {
    const parentName = lower(parent);
    if (!parentName) return;
    const set = optionsByParent.get(parentName) || new Set<string>();
    values.map(lower).filter(Boolean).forEach((value) => set.add(value));
    optionsByParent.set(parentName, set);
  };

  for (const screen of screens) {
    keyNames.add(lower(screen?.key));
    for (const item of (screen?.items || []) as AnyRecord[]) {
      keyNames.add(lower(item?.key));
      keyNames.add(lower(item?.id));
    }
    addOptions(screen?.key, ((screen?.items || []) as AnyRecord[]).map((item) => item?.id || item?.key));
    for (const field of (screen?.fields || []) as AnyRecord[]) {
      keyNames.add(lower(field?.key));
      addOptions(field?.key, ((field?.items || []) as AnyRecord[]).map((item) => item?.value));
    }
  }
  for (const entity of [...diagnoses, ...problems]) {
    keyNames.add(lower(entity?.key));
    for (const symptom of (entity?.symptoms || []) as AnyRecord[]) keyNames.add(lower(symptom?.key));
  }
  keyNames.delete("");

  const vars: ConditionNameRename[] = renames.filter((rename) => (
    !keyNames.has(lower(rename.from)) && keyNames.has(lower(rename.to))
  ));

  const values: ConditionValueRename[] = renames
    .map((rename) => ({
      ...rename,
      parents: Array.from(optionsByParent.entries())
        .filter(([, options]) => !options.has(lower(rename.from)) && options.has(lower(rename.to)))
        .map(([parent]) => parent),
    }))
    .filter((rename) => rename.parents.length);

  if (!vars.length && !values.length) return result;

  const rewrite = (expression: unknown): string | null => {
    const input = `${expression ?? ""}`;
    if (!input.trim()) return null;
    const { output, changed } = renameConditionReferences(input, { vars, values });
    if (!changed) return null;
    result.rewritten++;
    return output;
  };

  // Rewrites `key` on each element of `list`; returns the new list only when something changed.
  const rewriteList = (list: unknown, key: string): AnyRecord[] | null => {
    if (!Array.isArray(list)) return null;
    let changed = false;
    const next = list.map((element: AnyRecord) => {
      const value = rewrite(element?.[key]);
      if (value === null) return element;
      changed = true;
      return { ...element, [key]: value };
    });
    return changed ? next : null;
  };

  for (const screen of screens) {
    if (!screen?.screenId) continue;
    const patch: ConditionSyncScreenPatch = { screenId: screen.screenId, scriptId: screen.scriptId };
    let changed = false;

    for (const key of ["condition", "skipToCondition"] as const) {
      const value = rewrite(screen?.[key]);
      if (value !== null) {
        patch[key] = value;
        changed = true;
      }
    }

    const items = rewriteList(screen?.items, "condition");
    if (items) {
      patch.items = items;
      changed = true;
    }

    let fieldsChanged = false;
    const fields = ((screen?.fields || []) as AnyRecord[]).map((field) => {
      let next = field;
      for (const key of ["condition", "calculation"] as const) {
        const value = rewrite(next?.[key]);
        if (value !== null) next = { ...next, [key]: value };
      }
      const fieldItems = rewriteList(next?.items, "condition");
      if (fieldItems) next = { ...next, items: fieldItems };
      if (next !== field) fieldsChanged = true;
      return next;
    });
    if (fieldsChanged) {
      patch.fields = fields;
      changed = true;
    }

    if (changed) result.screens.push(patch);
  }

  const syncOutcomes = <T extends ConditionSyncDiagnosisPatch | ConditionSyncProblemPatch>(
    entity: AnyRecord,
    base: T,
  ): T | null => {
    let changed = false;
    const expression = rewrite(entity?.expression);
    if (expression !== null) {
      base.expression = expression;
      changed = true;
    }
    const symptoms = rewriteList(entity?.symptoms, "expression");
    if (symptoms) {
      base.symptoms = symptoms;
      changed = true;
    }
    return changed ? base : null;
  };

  for (const diagnosis of diagnoses) {
    if (!diagnosis?.diagnosisId) continue;
    const patch = syncOutcomes(diagnosis, { diagnosisId: diagnosis.diagnosisId, scriptId: diagnosis.scriptId });
    if (patch) result.diagnoses.push(patch);
  }

  for (const problem of problems) {
    if (!problem?.problemId) continue;
    const patch = syncOutcomes(problem, { problemId: problem.problemId, scriptId: problem.scriptId });
    if (patch) result.problems.push(patch);
  }

  return result;
}
