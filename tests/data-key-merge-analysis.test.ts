import assert from "assert"

import {
  analyzeMergeOptionUsage,
  applyLegacyItemLinks,
  applyOptionPlacements,
  findLegacyOptionItems,
  findOptionPresence,
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

// ------------------------------------------------- option presence/placement
{
  // After the merge every collection points at the kept parent "feed".
  const placementScreens = [
    {
      screenId: "a1", scriptId: "A", scriptTitle: "Admission", keyId: "", type: "form", items: [],
      fields: [
        { fieldId: "fa", key: "Feeding", type: "dropdown", keyId: "feed", items: [
          { itemId: "1", keyId: "breast", value: "Breast" },
          { itemId: "2", keyId: "formula", value: "Formula", condition: "$Age > 2" },
        ] },
        // a text field bound to the parent does not list options
        { fieldId: "fx", key: "Feeding", type: "text", keyId: "feed", items: [] },
      ],
    },
    {
      screenId: "b1", scriptId: "B", scriptTitle: "Discharge", keyId: "feed", type: "single_select",
      items: [{ itemId: "3", keyId: "breast", id: "Breast", position: 1 }],
      fields: [],
    },
    { screenId: "c1", scriptId: "C", scriptTitle: "Other", keyId: "", type: "form", items: [], fields: [{ key: "x", type: "dropdown", keyId: "other", items: [] }] },
  ]
  const pool = ["breast", "mixed", "formula"]

  const presence = findOptionPresence({ screens: placementScreens, parentUniqueKey: "feed", options: pool })
  assert.deepStrictEqual(presence.scripts, [{ scriptId: "A", scriptTitle: "Admission" }, { scriptId: "B", scriptTitle: "Discharge" }])
  assert.deepStrictEqual(presence.byOption, { breast: ["A", "B"], mixed: [], formula: ["A"] })

  const build = (uniqueKey: string) => ({ itemId: `new-${uniqueKey}`, keyId: uniqueKey, value: uniqueKey })
  const placements = {
    mixed: { scope: "all" as const },
    formula: { scope: "selected" as const, scriptIds: ["B"] },
  }
  const apply = (screen: any) => applyOptionPlacements(screen, {
    parentUniqueKey: "feed",
    poolOrder: pool,
    placements,
    buildFieldItem: build,
    buildScreenItem: (uniqueKey) => ({ ...build(uniqueKey), id: uniqueKey }),
  })

  // Admission: "mixed" goes between breast and formula; formula is removed.
  const a = apply(placementScreens[0])!
  assert.deepStrictEqual(a.fields![0].items.map((item: any) => item.keyId), ["breast", "mixed"])
  assert.strictEqual(a.fields![1], placementScreens[0].fields[1])
  assert.strictEqual(a.items, undefined)

  // Discharge screen items: both added after "breast", positions renumbered.
  const b = apply(placementScreens[1])!
  assert.deepStrictEqual(b.items!.map((item: any) => [item.keyId, item.position]), [["breast", 1], ["mixed", 2], ["formula", 3]])

  // Unrelated screens, or no placements: nothing to save.
  assert.strictEqual(apply(placementScreens[2]), null)
  assert.strictEqual(applyOptionPlacements(placementScreens[0], {
    parentUniqueKey: "feed", poolOrder: pool, placements: {}, buildFieldItem: build, buildScreenItem: build,
  }), null)
}

console.log("data-key-merge-analysis tests passed")

// A removed field is reported as removed — never compared with the field that moved into its place.
{
  const screen = (fields: any[]) => ({ screenId: "s", scriptId: "x", scriptTitle: "X", title: "Exam", keyId: "", items: [], fields })
  const before = [screen([
    { fieldId: "f1", key: "ANC", label: "ANC visits", keyId: "anc", condition: "", items: [] },
    { fieldId: "f2", key: "Weight", label: "Weight", keyId: "w", condition: "$ANC > 2", items: [] },
  ])]
  const after = [screen([
    { fieldId: "f2", key: "Weight", label: "Weight", keyId: "w", condition: "$ANC > 2", items: [] },
  ])]
  const report = buildMergeReport({
    before: { screens: before, diagnoses: [], problems: [] },
    after: { screens: after, diagnoses: [], problems: [] },
    describeKey: (k) => k,
  })
  assert.deepStrictEqual(report.totals, { relinked: 0, renamed: 0, removed: 1, added: 0, condition: 0 })
  assert.deepStrictEqual(report.scripts[0].changes.map((c) => [c.kind, c.location, c.before]), [["removed", "Exam > ANC visits", "ANC"]])

  // Fields without ids, edited in place, still pair by position.
  const strip = (list: any[]) => list.map(({ fieldId, ...rest }) => rest)
  const inPlace = buildMergeReport({
    before: { screens: [screen(strip([before[0].fields[1]]))], diagnoses: [], problems: [] },
    after: { screens: [screen(strip([{ ...before[0].fields[1], key: "WeightKg", keyId: "wk" }]))], diagnoses: [], problems: [] },
    describeKey: (k) => k,
  })
  assert.deepStrictEqual(inPlace.totals, { relinked: 1, renamed: 1, removed: 0, added: 0, condition: 0 })
}
console.log("report pairing tests passed")
