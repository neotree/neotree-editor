import assert from "assert"

import { buildHumanDiffRows, collectDataKeyReferences } from "../lib/changelog-human-diff"
import { appendChangeReason, dataKeyOperationChangeReason } from "../lib/data-key-operation-change-reason"

const names: Record<string, string> = {
  "f9fe7e29-0000": "0 — None = 0 [f9fe7e29]",
  "ca6fd7dd-0000": "0 [ca6fd7dd]",
}
const describeDataKey = (uniqueKey: string) => names[uniqueKey]
const field = (keyId: string, label: string) => [{ fieldId: "f1", key: "Fits", label: "Fits", keyId: "fits", items: [{ itemId: "i1", value: "0", label, keyId }] }]
const show = (rows: ReturnType<typeof buildHumanDiffRows>) => rows.map((row) => `${row.itemLabel || ""}|${row.detailLabel || ""}|${row.before} -> ${row.after}`)

// A relink to an exact duplicate (same label) used to show nothing: the data key change is now visible, by name.
assert.deepStrictEqual(
  show(buildHumanDiffRows({ field: "fields", before: field("f9fe7e29-0000", "None = 0"), after: field("ca6fd7dd-0000", "None = 0"), describeDataKey })),
  ["None = 0|Data key|0 — None = 0 [f9fe7e29] -> 0 [ca6fd7dd]"],
)

// Without names, short ids stand in.
assert.deepStrictEqual(
  show(buildHumanDiffRows({ field: "fields", before: field("f9fe7e29-0000", "x"), after: field("ca6fd7dd-0000", "x") })),
  ["x|Data key|[f9fe7e29] -> [ca6fd7dd]"],
)

// A data key's option list: added and removed options by name, not positional raw ids.
assert.deepStrictEqual(
  show(buildHumanDiffRows({ field: "options", before: ["a", "f9fe7e29-0000"], after: ["a", "ca6fd7dd-0000"], describeDataKey })),
  ["0 — None = 0 [f9fe7e29]||Offered -> Removed", "0 [ca6fd7dd]||Not offered -> Added"],
)
assert.deepStrictEqual(show(buildHumanDiffRows({ field: "options", before: ["a", "b"], after: ["b", "a"] })), ["Order||Previous order -> Reordered"])
assert.deepStrictEqual(buildHumanDiffRows({ field: "options", before: ["a", "b"], after: ["a", "b"] }), [])

// Unchanged key references stay hidden; other technical fields stay hidden.
assert.deepStrictEqual(buildHumanDiffRows({ field: "fields", before: field("k", "x"), after: field("k", "x") }), [])

// Names are looked up for every key reference and option list in the values.
assert.deepStrictEqual(
  collectDataKeyReferences([field("f9fe7e29-0000", "x"), field("ca6fd7dd-0000", "x")], "fields").sort(),
  ["ca6fd7dd-0000", "f9fe7e29-0000", "fits"],
)
assert.deepStrictEqual(collectDataKeyReferences([["a"], ["b"]], "options").sort(), ["a", "b"])

// --- change reasons ---
assert.strictEqual(dataKeyOperationChangeReason({ kind: "merge", title: "Merge into “0”" }), "Data key merge: Merge into “0”")
assert.strictEqual(dataKeyOperationChangeReason({ kind: "unlink", title: "Unlink 1 option from “HIV_Meds”" }), "Data key unlink: Unlink 1 option from “HIV_Meds”")
assert.strictEqual(dataKeyOperationChangeReason({ survivorName: "Feeding" }), "Data key merge: Merge into “Feeding”")

// The existing reason is kept (the rollback guard reads it); the same reason is added once.
const sync = "Published via data key reference sync"
const tagged = appendChangeReason(sync, "Data key merge: Merge into “0”")
assert.strictEqual(tagged, "Published via data key reference sync · Data key merge: Merge into “0”")
assert.strictEqual(appendChangeReason(tagged, "Data key merge: Merge into “0”"), tagged)
assert.strictEqual(appendChangeReason("", "Data key unlink: x"), "Data key unlink: x")

console.log("data-key-operation-changelog tests passed")
