import assert from "assert"

import { buildDataKeysDeleteImpact } from "../lib/data-key-delete-impact"

const dataKeys = [
  {
    uuid: "dk-uuid-1",
    uniqueKey: "weight_kg",
    name: "WeightKg",
    label: "Weight (kg)",
    dataType: "number",
    options: [],
  },
  {
    uuid: "dk-uuid-2",
    uniqueKey: "ref_key",
    name: "RefKey",
    label: "Ref key",
    dataType: "text",
    options: [],
  },
  {
    uuid: "dk-uuid-3",
    uniqueKey: "unused_key",
    name: "UnusedKey",
    label: "Unused key",
    dataType: "text",
    options: [],
  },
] as any[]

const screens = [
  {
    scriptId: "script-1",
    scriptTitle: "Script One",
    screenId: "screen-1",
    title: "Screen One",
    keyId: "weight_kg",
    refIdDataKey: "",
    items: [],
    fields: [],
  },
  {
    scriptId: "script-2",
    scriptTitle: "Script Two",
    screenId: "screen-2",
    title: "Screen Two",
    keyId: "",
    // Used ONLY as the screen's ref ID data key — must still count as usage.
    refIdDataKey: "ref_key",
    items: [],
    fields: [],
  },
  {
    scriptId: "script-3",
    scriptTitle: "Script Three",
    screenId: "screen-3",
    title: "Screen Three",
    keyId: "",
    refIdDataKey: "",
    // Legacy screens can carry the data key in refId instead of refIdDataKey.
    refId: "ref_key",
    items: [],
    fields: [
      {
        fieldId: "field-1",
        label: "Weight field",
        keyId: "weight_kg",
        items: [],
      },
    ],
  },
] as any[]

const impact = buildDataKeysDeleteImpact({
  dataKeys,
  screens,
  diagnoses: [],
  problems: [],
  dataKeysIds: ["dk-uuid-1", "dk-uuid-2", "dk-uuid-3"],
})

const byUniqueKey = new Map(impact.map((item) => [item.uniqueKey, item]))

const weight = byUniqueKey.get("weight_kg")
assert.ok(weight, "weight_kg should be in the impact result")
assert.equal(weight.scripts.length, 2, "weight_kg is used in two scripts (screen keyId + field keyId)")
assert.deepEqual(
  weight.scripts.map((s) => s.scriptId).sort(),
  ["script-1", "script-3"],
)

const refKey = byUniqueKey.get("ref_key")
assert.ok(refKey, "ref_key should be in the impact result")
assert.deepEqual(
  refKey.scripts.map((s) => s.scriptId).sort(),
  ["script-2", "script-3"],
  "ref_key usage via refIdDataKey and via legacy refId fallback must both be detected",
)
assert.ok(
  refKey.scripts
    .flatMap((s) => s.usages)
    .some((u) => u.label.includes("ref ID data key")),
  "refIdDataKey usage should be labelled so the user can locate it",
)

const unused = byUniqueKey.get("unused_key")
assert.ok(unused, "unused_key should be in the impact result")
assert.equal(unused.scripts.length, 0, "unused_key has no script usage")

console.log("data key delete impact tests passed")
