import assert from "assert"

import { resolveScriptRemovalExclusions, resolveScriptsOnlyPlan } from "../lib/data-key-script-removals"

const script = (scriptId: string) => ({ scriptId, scriptTitle: scriptId, usages: [] })

const impact = [
  {
    dataKeyId: "child-uuid",
    uniqueKey: "weight",
    options: [],
    scripts: [script("s1"), script("s2"), script("s3")],
  },
  {
    dataKeyId: "parent-uuid",
    uniqueKey: "feeding",
    options: ["breast", "formula"],
    scripts: [script("s1"), script("s2")],
  },
  {
    dataKeyId: "other-uuid",
    uniqueKey: "length",
    options: [],
    scripts: [script("s1"), script("s4")],
  },
]

// Selected scripts only: replace in the selected scripts, exclude everything else.
{
  const plan = resolveScriptsOnlyPlan({
    impact,
    replacements: { "child-uuid": "replacement-uuid" },
    scriptSelections: { "child-uuid": ["s1", "s3"] },
    scriptRemovals: {},
  })

  assert.deepStrictEqual(plan.stripScriptIdsByUniqueKey, { weight: ["s1", "s3"] })
  assert.deepStrictEqual(plan.replaceExclusionsByUniqueKey, { weight: ["s2"] })
  assert.deepStrictEqual(plan.replaceScriptIdsByUniqueKey, { weight: ["s1", "s3"] })
  assert.strictEqual(plan.selectedCount, 2)
}

// A per-script "remove" exception inside the selection is excluded from replacement too.
{
  const plan = resolveScriptsOnlyPlan({
    impact,
    replacements: { "child-uuid": "replacement-uuid" },
    scriptSelections: { "child-uuid": ["s1", "s3"] },
    scriptRemovals: { "child-uuid": ["s3"] },
  })

  assert.deepStrictEqual(plan.replaceExclusionsByUniqueKey, { weight: ["s2", "s3"] })
  assert.deepStrictEqual(plan.replaceScriptIdsByUniqueKey, { weight: ["s1"] })
  assert.deepStrictEqual(plan.stripScriptIdsByUniqueKey, { weight: ["s1", "s3"] })
}

// A key with a replacement but no selected scripts is excluded everywhere and never stripped.
{
  const plan = resolveScriptsOnlyPlan({
    impact,
    replacements: { "child-uuid": "replacement-uuid", "other-uuid": "replacement-2" },
    scriptSelections: { "child-uuid": ["s2"] },
    scriptRemovals: {},
  })

  assert.deepStrictEqual(plan.replaceExclusionsByUniqueKey, {
    weight: ["s1", "s3"],
    length: ["s1", "s4"],
  })
  // nothing selected for "length": the include-list is empty, so it is rewritten nowhere
  assert.deepStrictEqual(plan.replaceScriptIdsByUniqueKey, { weight: ["s2"], length: [] })
  assert.deepStrictEqual(plan.stripScriptIdsByUniqueKey, { weight: ["s2"] })
}

// Parent keys and keys without a replacement are removed in their selected scripts only.
{
  const plan = resolveScriptsOnlyPlan({
    impact,
    replacements: { "parent-uuid": "ignored-uuid" },
    scriptSelections: { "parent-uuid": ["s2"], "other-uuid": ["s4"] },
    scriptRemovals: {},
  })

  assert.deepStrictEqual(plan.replaceExclusionsByUniqueKey, {})
  assert.deepStrictEqual(plan.replaceScriptIdsByUniqueKey, {})
  assert.deepStrictEqual(plan.stripScriptIdsByUniqueKey, { feeding: ["s2"], length: ["s4"] })
  assert.strictEqual(plan.selectedCount, 2)
}

// Unknown or stale script ids are dropped: new usage is left untouched.
{
  const plan = resolveScriptsOnlyPlan({
    impact,
    replacements: {},
    scriptSelections: { "child-uuid": ["deleted-script"] },
    scriptRemovals: {},
  })

  assert.deepStrictEqual(plan.stripScriptIdsByUniqueKey, {})
  assert.strictEqual(plan.selectedCount, 0)
}

// Library delete exclusions are unchanged: only replaced keys with valid exceptions.
{
  const exclusions = resolveScriptRemovalExclusions({
    impact,
    replacements: { "child-uuid": "replacement-uuid" },
    scriptRemovals: { "child-uuid": ["s2", "unknown"], "other-uuid": ["s1"] },
  })

  assert.deepStrictEqual(exclusions, { weight: ["s2"] })
}

console.log("data-key-script-removals tests passed")
