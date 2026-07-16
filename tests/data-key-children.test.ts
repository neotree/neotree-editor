import assert from "assert"

import {
  buildDataKeyParentIndex,
  getBlockedChildDeletions,
  validateDataKeyOptionsAddition,
  wouldCreateDataKeyCycle,
} from "../lib/data-key-children"
import { buildDataKeyOptionUnlinkImpact } from "../lib/data-key-delete-impact"

const parentA = {
  uuid: "parent-a",
  uniqueKey: "parent_a",
  name: "ParentA",
  label: "Parent A",
  dataType: "dropdown",
  options: ["child_1", "child_2"],
}
const parentB = {
  uuid: "parent-b",
  uniqueKey: "parent_b",
  name: "ParentB",
  label: "Parent B",
  dataType: "dropdown",
  options: ["child_2", "parent_b"], // self-reference must be ignored
}
const child1 = {
  uuid: "child-1",
  uniqueKey: "child_1",
  name: "Child1",
  label: "Child 1",
  dataType: "id",
  options: [],
}
const child2 = {
  uuid: "child-2",
  uniqueKey: "child_2",
  name: "Child2",
  label: "Child 2",
  dataType: "id",
  options: [],
}
const standalone = {
  uuid: "standalone",
  uniqueKey: "standalone_key",
  name: "Standalone",
  label: "Standalone",
  dataType: "text",
  options: [],
}

const allKeys = [parentA, parentB, child1, child2, standalone]

// ---- parent index ----
const index = buildDataKeyParentIndex(allKeys)
assert.deepEqual(
  (index.get("child_1") || []).map((p) => p.uniqueKey),
  ["parent_a"],
  "child_1 is a child of parent_a only",
)
assert.deepEqual(
  (index.get("child_2") || []).map((p) => p.uniqueKey).sort(),
  ["parent_a", "parent_b"],
  "child_2 is a child of both parents",
)
assert.equal(index.get("parent_b"), undefined, "self-referencing option must not make a key its own child")
assert.equal(index.get("standalone_key"), undefined, "keys not referenced in options are not children")

// ---- blocked deletions ----
const blockedSolo = getBlockedChildDeletions({ dataKeys: allKeys, targets: [child2] })
assert.equal(blockedSolo.length, 1, "deleting a child with surviving parents is blocked")
assert.deepEqual(
  blockedSolo[0].parents.map((p) => p.uniqueKey).sort(),
  ["parent_a", "parent_b"],
)

const blockedPartial = getBlockedChildDeletions({ dataKeys: allKeys, targets: [child2, parentA] })
assert.equal(blockedPartial.length, 1, "still blocked while one parent survives")
assert.deepEqual(blockedPartial[0].parents.map((p) => p.uniqueKey), ["parent_b"])

const blockedNone = getBlockedChildDeletions({ dataKeys: allKeys, targets: [child2, parentA, parentB] })
assert.equal(blockedNone.length, 0, "deleting a child together with all its parents is allowed")

const blockedStandalone = getBlockedChildDeletions({ dataKeys: allKeys, targets: [standalone] })
assert.equal(blockedStandalone.length, 0, "non-child keys are never blocked")

// ---- scoped unlink impact ----
const screens = [
  {
    scriptId: "script-1",
    scriptTitle: "Script One",
    screenId: "screen-owned",
    title: "Owned screen",
    // screen bound to parent_a: its items are owned options
    keyId: "parent_a",
    items: [
      { itemId: "i1", keyId: "child_1", label: "Child 1" },
      { itemId: "i2", keyId: "child_2", label: "Child 2" },
    ],
    fields: [],
  },
  {
    scriptId: "script-2",
    scriptTitle: "Script Two",
    screenId: "screen-field-owned",
    title: "Field screen",
    keyId: "",
    items: [],
    fields: [
      {
        fieldId: "f1",
        label: "Owned field",
        // field bound to parent_a: its items are owned options
        keyId: "parent_a",
        items: [{ itemId: "fi1", keyId: "child_1", value: "Child1" }],
      },
      {
        fieldId: "f2",
        label: "Other field",
        // bound to a DIFFERENT parent — not in scope
        keyId: "parent_b",
        items: [{ itemId: "fi2", keyId: "child_1", value: "Child1" }],
      },
      {
        fieldId: "f3",
        label: "Standalone usage",
        // the child used directly as a field key — not option usage
        keyId: "child_1",
        items: [],
      },
    ],
  },
] as any[]

const unlinkImpact = buildDataKeyOptionUnlinkImpact({
  dataKeys: allKeys as any[],
  screens,
  parentUniqueKey: "parent_a",
  childUniqueKeys: ["child_1"],
})

assert.equal(unlinkImpact.length, 1)
const child1Impact = unlinkImpact[0]
assert.equal(child1Impact.uniqueKey, "child_1")
assert.deepEqual(
  child1Impact.scripts.map((s) => s.scriptId).sort(),
  ["script-1", "script-2"],
  "owned screen items and owned field items count as unlink usage",
)

const script2Usages = child1Impact.scripts.find((s) => s.scriptId === "script-2")!.usages
assert.equal(
  script2Usages.length,
  1,
  "usage under another parent's field and direct field-key usage must NOT count",
)
assert.ok(script2Usages[0].label.includes("Owned field"))

const noScopeImpact = buildDataKeyOptionUnlinkImpact({
  dataKeys: allKeys as any[],
  screens,
  parentUniqueKey: "parent_b",
  childUniqueKeys: ["child_1"],
})
assert.equal(
  noScopeImpact[0].scripts.length,
  1,
  "scoping to parent_b only reports the field owned by parent_b",
)
assert.deepEqual(noScopeImpact[0].scripts.map((s) => s.scriptId), ["script-2"])

// ---- matching is strictly by uniqueKey/keyId — NEVER by name or label ----
// Names and labels are not unique across the library, so a screen/item that
// only carries matching text (no keyId) must NOT be treated as bound.
const textOnlyScreens = [
  {
    scriptId: "script-text",
    scriptTitle: "Text Script",
    screenId: "screen-text",
    title: "Text screen",
    keyId: "", // no keyId — name text alone must not bind it to parent_a
    key: "ParentA",
    items: [{ itemId: "ti1", id: "Child1", key: "Child1", label: "Child 1", keyId: "" }],
    fields: [],
  },
  {
    scriptId: "script-text-2",
    scriptTitle: "Text Script Two",
    screenId: "screen-text-2",
    title: "Bound screen, text-only item",
    keyId: "parent_a", // properly bound screen...
    items: [
      // ...but this item has no keyId — its matching text must NOT count
      { itemId: "ti2", id: "Child1", key: "Child1", label: "Child 1", keyId: "" },
    ],
    fields: [],
  },
] as any[]

const textOnlyImpact = buildDataKeyOptionUnlinkImpact({
  dataKeys: allKeys as any[],
  screens: textOnlyScreens,
  parentUniqueKey: "parent_a",
  childUniqueKeys: ["child_1"],
})
assert.equal(
  textOnlyImpact[0].scripts.length,
  0,
  "name/label text must never bind a screen or item to a data key",
)

// ---- cycles ----
assert.ok(
  wouldCreateDataKeyCycle({ dataKeys: allKeys, parentUniqueKey: "parent_a", childUniqueKey: "parent_a" }),
  "self-link is a cycle",
)
assert.ok(
  wouldCreateDataKeyCycle({ dataKeys: allKeys, parentUniqueKey: "child_1", childUniqueKey: "parent_a" }),
  "linking parent_a under its own child creates a cycle",
)
assert.ok(
  !wouldCreateDataKeyCycle({ dataKeys: allKeys, parentUniqueKey: "parent_a", childUniqueKey: "standalone_key" }),
  "linking an unrelated key is not a cycle",
)

// ---- options addition validation ----
assert.equal(
  validateDataKeyOptionsAddition({
    dataKeys: allKeys,
    parentUniqueKey: "parent_a",
    previousOptions: ["child_1"],
    nextOptions: ["child_1", "child_2"],
  }),
  null,
  "adding a same-type sibling is allowed",
)
assert.ok(
  validateDataKeyOptionsAddition({
    dataKeys: allKeys,
    parentUniqueKey: "parent_a",
    previousOptions: ["child_1"],
    nextOptions: ["child_1", "standalone_key"],
  }),
  "adding a different-type option to a typed pool is rejected",
)
assert.ok(
  validateDataKeyOptionsAddition({
    dataKeys: allKeys,
    parentUniqueKey: "parent_a",
    previousOptions: [],
    nextOptions: ["child_1", "standalone_key"],
  }),
  "starting a pool with mixed types is rejected",
)
assert.ok(
  validateDataKeyOptionsAddition({
    dataKeys: allKeys,
    parentUniqueKey: "parent_a",
    previousOptions: [],
    nextOptions: ["parent_a"],
  }),
  "self-linking is rejected",
)
assert.ok(
  validateDataKeyOptionsAddition({
    dataKeys: allKeys,
    parentUniqueKey: "child_1",
    previousOptions: [],
    nextOptions: ["parent_a"],
  }),
  "cycle-creating additions are rejected",
)
assert.ok(
  validateDataKeyOptionsAddition({
    dataKeys: allKeys,
    parentUniqueKey: "parent_a",
    previousOptions: [],
    nextOptions: ["ghost_key"],
  }),
  "options that do not exist in the library are rejected",
)
assert.equal(
  validateDataKeyOptionsAddition({
    dataKeys: allKeys,
    parentUniqueKey: "parent_a",
    previousOptions: ["child_1", "standalone_key"], // legacy mixed pool
    nextOptions: ["child_1", "standalone_key"],
  }),
  null,
  "pre-existing options are never re-validated",
)

console.log("data key children tests passed")
