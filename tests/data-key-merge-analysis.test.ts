import assert from "assert"

import {
  analyzeMergeOptionUsage,
  applyLegacyItemLinks,
  findLegacyOptionItems,
} from "../lib/data-key-merge-analysis"
import { buildMergeReport } from "../lib/data-key-merge-report"
import {
  buildDataKeysMergePlan,
  findPossibleDuplicateGroups,
  getDuplicateGroupKey,
  suggestChildMergeActionsWithReasons,
} from "../lib/data-key-merge-plan"

const key = (uuid: string, uniqueKey: string, name: string, label: string, dataType: string, options: string[] = []) =>
  ({ uuid, uniqueKey, name, label, dataType, options, isDeleted: false });

// ---------------------------------------------------------------- plan extras
{
  const dataKeys = [
    key("p1", "head_1", "HeadShape", "Head shape", "dropdown", ["norm_1", "hydro_1"]),
    key("p2", "head_2", "HeadShape", "Head shape", "dropdown", ["norm_2", "hydro_2", "moul_2"]),
    key("c1", "norm_1", "Norm", "Normal", "option"),
    key("c2", "hydro_1", "Hydro", "Hydrocephalus", "option"),
    key("c3", "norm_2", "Normal", "Normal", "option"),
    key("c4", "hydro_2", "hydro-cephalus", "Hydro cephalus", "option"),
    key("c5", "moul_2", "Moul", "Moulding", "option"),
  ]

  const suggestions = suggestChildMergeActionsWithReasons({ dataKeys, survivor: dataKeys[0], merged: [dataKeys[1]] })
  assert.deepStrictEqual(suggestions.norm_2, { action: { action: "match", to: "norm_1" }, reason: "label" })
  assert.deepStrictEqual(suggestions.hydro_2, { action: { action: "match", to: "hydro_1" }, reason: "similar" })
  assert.deepStrictEqual(suggestions.moul_2, { action: { action: "add" }, reason: null })

  // "similar" ignores case, spacing and punctuation
  const similar = suggestChildMergeActionsWithReasons({
    dataKeys: [...dataKeys, key("c6", "hydro_3", "HydroCephalus", "x", "option")],
    survivor: { ...dataKeys[0], options: ["norm_1", "hydro_3"] },
    merged: [dataKeys[1]],
  })
  assert.deepStrictEqual(similar.hydro_2, { action: { action: "match", to: "hydro_3" }, reason: "similar" })

  // reorder + label
  const plan = buildDataKeysMergePlan({
    dataKeys,
    survivorId: "p1",
    mergedIds: ["p2"],
    survivorOptionOrder: ["moul_2", "hydro_1", "norm_1"],
    survivorLabel: " Head shape (all sites) ",
  })
  assert.deepStrictEqual(plan.errors, [])
  assert.deepStrictEqual(plan.nextSurvivorOptions, ["moul_2", "hydro_1", "norm_1"])
  assert.strictEqual(plan.survivorLabel, "Head shape (all sites)")
  assert.strictEqual(plan.children.find((row) => row.uniqueKey === "norm_2")!.suggestionReason, "label")

  // a stale order keeps what still applies and appends the rest
  const stale = buildDataKeysMergePlan({ dataKeys, survivorId: "p1", mergedIds: ["p2"], survivorOptionOrder: ["moul_2", "gone"] })
  assert.deepStrictEqual(stale.nextSurvivorOptions, ["moul_2", "norm_1", "hydro_1"])

  // an empty label is an error; an unchanged one is not a change
  assert.ok(buildDataKeysMergePlan({ dataKeys, survivorId: "p1", mergedIds: ["p2"], survivorLabel: "  " }).errors.length)
  assert.strictEqual(buildDataKeysMergePlan({ dataKeys, survivorId: "p1", mergedIds: ["p2"], survivorLabel: "Head shape" }).survivorLabel, null)
}

// ------------------------------------------------------- possible duplicates
{
  const dataKeys = [
    // exact duplicates: never repeated as "possible"
    key("a1", "a1", "Sex", "Sex", "dropdown", ["m", "f"]),
    key("a2", "a2", "Sex", "Sex", "dropdown", ["m", "f"]),
    // same name, different label
    key("b1", "b1", "Feeding", "Feeding method", "dropdown", ["breast"]),
    key("b2", "b2", "Feeding", "Feeding at discharge", "dropdown", ["formula"]),
    // different names, mostly the same options
    key("c1", "c1", "AdmFrom", "Admitted from", "dropdown", ["lw", "th", "home", "ref"]),
    key("c2", "c2", "AdmittedFrom", "Admitted from where", "dropdown", ["lw", "th", "home"]),
    // different type: never grouped
    key("d1", "d1", "Feeding", "Feeding method", "multi_select", ["breast"]),
    key("m", "m", "M", "Male", "option"), key("f", "f", "F", "Female", "option"),
    key("breast", "breast", "Breast", "Breast", "option"), key("formula", "formula", "Formula", "Formula", "option"),
    key("lw", "lw", "LW", "Labour ward", "option"), key("th", "th", "TH", "Theatre", "option"),
    key("home", "home", "Home", "Home", "option"), key("ref", "ref", "Ref", "Referred", "option"),
  ]
  const groups = findPossibleDuplicateGroups(dataKeys)
  assert.deepStrictEqual(
    groups.map((group) => [group.keys.map((k) => k.uuid).sort().join(","), group.reason, group.overlap]),
    [["c1,c2", "shared_options", 0.75], ["b1,b2", "same_name", 0]],
  )
  assert.strictEqual(getDuplicateGroupKey([{ uniqueKey: "b2" }, { uniqueKey: "b1" }]), "b1|b2")
}

// --------------------------------------------------- legacy items + linking
const screens = [
  {
    screenId: "s1", scriptId: "script-1", scriptTitle: "Admission", title: "Exam",
    keyId: "", items: [],
    fields: [
      {
        fieldId: "f1", key: "HeadShape", label: "Head shape", keyId: "head_2",
        condition: "",
        items: [
          { itemId: "i1", value: "Normal", label: "Normal", keyId: "norm_2" },
          { itemId: "i2", value: "Swell", label: "Swelling", keyId: "" },
          { itemId: "i3", value: "Moul", label: "Moulding" },
        ],
      },
      { fieldId: "f2", key: "Other", label: "Other", keyId: "other", items: [{ itemId: "x", value: "Moul" }] },
    ],
    condition: "$HeadShape = 'Normal' or $HeadShape includes ('Moul')",
    skipToCondition: "",
  },
]
const parents = [{ uniqueKey: "head_2", name: "HeadShape", options: ["norm_2", "moul_2"] }]
const children = [
  { uniqueKey: "norm_2", name: "Normal", label: "Normal" },
  { uniqueKey: "moul_2", name: "Moul", label: "Moulding" },
]

{
  const legacy = findLegacyOptionItems({ screens, parents, children })
  assert.deepStrictEqual(legacy.map((item) => [item.itemId, item.value, item.suggestedUniqueKey, item.fieldIndex]), [
    ["i2", "Swell", null, 0],
    ["i3", "Moul", "moul_2", 0],
  ])
  assert.strictEqual(legacy[0].location, "Exam > Head shape")

  const parentOptions = new Map([["head_2", new Set(["norm_2", "moul_2"])]])
  const patch = applyLegacyItemLinks(screens[0], [
    { screenId: "s1", fieldIndex: 0, fieldId: "f1", itemIndex: 2, itemId: "i3", uniqueKey: "moul_2" },
    // not an option of the owning parent: ignored
    { screenId: "s1", fieldIndex: 0, fieldId: "f1", itemIndex: 1, itemId: "i2", uniqueKey: "other_key" },
  ], parentOptions)!
  assert.deepStrictEqual(patch.fields![0].items.map((item: any) => item.keyId), ["norm_2", "", "moul_2"])
  assert.strictEqual(patch.items, undefined)

  assert.strictEqual(applyLegacyItemLinks(screens[0], [], parentOptions), null)
}

{
  const usage = analyzeMergeOptionUsage({ screens, parents, children })
  assert.deepStrictEqual(usage.norm_2, { scripts: 1, conditions: 1 })
  // "Moul" has no keyId in the script, so it is not counted as linked usage
  assert.deepStrictEqual(usage.moul_2, { scripts: 0, conditions: 0 })
}

// ------------------------------------------------------------------- report
{
  const after = [{
    ...screens[0],
    condition: "$HeadShape = 'Norm' or $HeadShape includes ('Moul')",
    fields: [
      {
        ...screens[0].fields[0],
        keyId: "head_1",
        items: [
          { itemId: "i1", value: "Norm", label: "Normal", keyId: "norm_1" },
          { itemId: "i3", value: "Moul", label: "Moulding" },
        ],
      },
      screens[0].fields[1],
    ],
  }]
  const report = buildMergeReport({
    before: { screens, diagnoses: [], problems: [] },
    after: { screens: after, diagnoses: [], problems: [] },
    describeKey: (uniqueKey) => `K:${uniqueKey}`,
  })
  assert.strictEqual(report.scripts.length, 1)
  assert.deepStrictEqual(report.totals, { relinked: 2, renamed: 1, removed: 1, added: 0, condition: 1 })
  assert.deepStrictEqual(
    report.scripts[0].changes.map((change) => [change.kind, change.location, change.before, change.after]),
    [
      ["condition", "Exam (condition)", "$HeadShape = 'Normal' or $HeadShape includes ('Moul')", "$HeadShape = 'Norm' or $HeadShape includes ('Moul')"],
      ["relinked", "Exam > Head shape", "K:head_2", "K:head_1"],
      ["relinked", "Exam > Head shape > Normal", "K:norm_2", "K:norm_1"],
      ["renamed", "Exam > Head shape > Normal", "Normal", "Norm"],
      ["removed", "Exam > Head shape > Swelling", "Swell", ""],
    ],
  )
}

console.log("data-key-merge-analysis tests passed")
