import assert from "assert"

import {
  buildDataKeysMergePlan,
  findDuplicateKeyGroups,
  suggestChildMergeActions,
} from "../lib/data-key-merge-plan"

const key = (uuid: string, uniqueKey: string, name: string, label: string, dataType: string, options: string[] = []) =>
  ({ uuid, uniqueKey, name, label, dataType, options, isDeleted: false })

const dataKeys = [
  // Kept parent: Yes / No
  key("p1", "feed_1", "Feeding", "Feeding method", "dropdown", ["yes_1", "no_1"]),
  // Duplicate parent: shares "no_1", has its own "Yes" and an extra "Unknown"
  key("p2", "feed_2", "feeding", "Feeding Method", "dropdown", ["yes_2", "no_1", "unk_2"]),
  // Not a duplicate (different label)
  key("p3", "feed_3", "Feeding", "Feeding at discharge", "dropdown", ["yes_1"]),
  // Different type
  key("p4", "feed_4", "Feeding", "Feeding method", "multi_select", ["yes_1"]),
  // Standalone (no options)
  key("s1", "weight", "Weight", "Weight", "number"),
  key("c1", "yes_1", "Yes", "Yes", "option"),
  key("c2", "no_1", "No", "No", "option"),
  key("c3", "yes_2", "YES", "Yes", "option"),
  key("c4", "unk_2", "Unknown", "Unknown", "option"),
  key("c5", "num_child", "Count", "Count", "number"),
]

// --- duplicate groups: same name + type + label, any kind of key ---
{
  const groups = findDuplicateKeyGroups(dataKeys)
  // the parents Feeding/feeding, and the options Yes/YES
  assert.deepStrictEqual(groups.map((group) => group.map((dataKey) => dataKey.uuid).sort()), [["p1", "p2"], ["c1", "c3"]])
}

// --- suggestions: keep shared, match by name, add the rest ---
{
  const suggestions = suggestChildMergeActions({
    dataKeys,
    survivor: dataKeys[0],
    merged: [dataKeys[1]],
  })
  assert.deepStrictEqual(suggestions, {
    yes_2: { action: "match", to: "yes_1" },
    no_1: { action: "keep" },
    unk_2: { action: "add" },
  })
}

// --- default plan ---
{
  const plan = buildDataKeysMergePlan({ dataKeys, survivorId: "p1", mergedIds: ["p2"] })
  assert.deepStrictEqual(plan.errors, [])
  assert.deepStrictEqual(plan.childReplacements, { yes_2: "yes_1" })
  assert.deepStrictEqual(plan.addedOptions, ["unk_2"])
  assert.deepStrictEqual(plan.nextSurvivorOptions, ["yes_1", "no_1", "unk_2"])
  assert.deepStrictEqual(plan.droppedChildren, [])
  assert.ok(plan.children.every((row) => row.suggested))
}

// --- explicit actions override suggestions ---
{
  const plan = buildDataKeysMergePlan({
    dataKeys,
    survivorId: "p1",
    mergedIds: ["p2"],
    childActions: { yes_2: { action: "add" }, unk_2: { action: "drop" } },
  })
  assert.deepStrictEqual(plan.errors, [])
  assert.deepStrictEqual(plan.childReplacements, {})
  assert.deepStrictEqual(plan.addedOptions, ["yes_2"])
  assert.deepStrictEqual(plan.droppedChildren, ["unk_2"])
  assert.strictEqual(plan.children.find((row) => row.uniqueKey === "unk_2")!.suggested, false)
}

// --- invalid matches are rejected ---
{
  const notOffered = buildDataKeysMergePlan({
    dataKeys,
    survivorId: "p1",
    mergedIds: ["p2"],
    childActions: { yes_2: { action: "match", to: "unk_2" } },
  })
  assert.ok(notOffered.errors.some((error) => error.includes("must be matched to an option")))

  const keepMissing = buildDataKeysMergePlan({
    dataKeys,
    survivorId: "p1",
    mergedIds: ["p2"],
    childActions: { unk_2: { action: "keep" } },
  })
  assert.ok(keepMissing.errors.some((error) => error.includes("does not offer")))
}

// --- type and shape guards ---
{
  assert.ok(buildDataKeysMergePlan({ dataKeys, survivorId: "p1", mergedIds: ["p4"] })
    .errors.some((error) => error.includes("different data type")))

  assert.ok(buildDataKeysMergePlan({ dataKeys, survivorId: "p1", mergedIds: ["s1"] })
    .errors.some((error) => error.includes("different data type")))

  assert.ok(buildDataKeysMergePlan({ dataKeys, survivorId: "p1", mergedIds: ["p1"] })
    .errors.some((error) => error.includes("at least one other")))

  assert.ok(buildDataKeysMergePlan({ dataKeys, survivorId: "missing", mergedIds: ["p2"] })
    .errors.some((error) => error.includes("Choose the data key to keep")))
}

// --- adding a child of another type to a single-typed pool is rejected ---
{
  const mixed = [
    ...dataKeys,
    key("p5", "feed_5", "Feeding", "Feeding method", "dropdown", ["num_child"]),
  ]
  const plan = buildDataKeysMergePlan({ dataKeys: mixed, survivorId: "p1", mergedIds: ["p5"] })
  assert.ok(plan.errors.some((error) => error.includes("data type does not match")), plan.errors.join("; "))
}

// --- keys without options merge too; parents offering a merged option offer the kept key instead ---
{
  const plan = buildDataKeysMergePlan({ dataKeys, survivorId: "c1", mergedIds: ["c3"] })
  assert.deepStrictEqual(plan.errors, [])
  assert.deepStrictEqual(plan.children, [])
  assert.deepStrictEqual(plan.parentOptionRewrites, [
    { parentId: "p2", parentUniqueKey: "feed_2", parentTitle: "feeding", replaced: ["yes_2"], nextOptions: ["yes_1", "no_1", "unk_2"] },
  ])

  // a parent that already offers the kept key just loses the merged one
  const both = [...dataKeys, key("p9", "both", "Both", "Both", "dropdown", ["yes_1", "yes_2", "no_1"])]
  const rewrite = buildDataKeysMergePlan({ dataKeys: both, survivorId: "c1", mergedIds: ["c3"] }).parentOptionRewrites.find((r) => r.parentId === "p9")!
  assert.deepStrictEqual(rewrite.nextOptions, ["yes_1", "no_1"])

  // standalone keys: nothing to rewrite
  const weights = [...dataKeys, key("s2", "weight_2", "Weight", "Weight", "number")]
  const standalone = buildDataKeysMergePlan({ dataKeys: weights, survivorId: "s1", mergedIds: ["s2"] })
  assert.deepStrictEqual([standalone.errors, standalone.parentOptionRewrites], [[], []])

  // a key cannot be merged into its own parent or option
  assert.ok(buildDataKeysMergePlan({ dataKeys, survivorId: "p1", mergedIds: ["c1"] }).errors.length)
}

console.log("data-key-merge-plan tests passed")
