import assert from "assert"

import { applyItemEdit } from "../lib/apply-item-edit"

// Stored option without the form's optional fields (as on "Electronic Signature").
const stored = { itemId: "i1", value: "PAKA", label: "Pamela Kawaga", keyId: "k1", exclusive: false, enterValueManually: false, forbidWith: [] }
const formValues = { ...stored, enterValueManuallyLabel: "", exclusiveGroup: "", forbidWith: [], condition: "", label2: "" }

// Saving unchanged: no change, same object, no blank keys added.
{
  const { next, changed } = applyItemEdit(stored, formValues)
  assert.strictEqual(changed, false)
  assert.strictEqual(next, stored)
}

// A real edit is applied; blanks for keys the item lacked are still left out.
{
  const { next, changed } = applyItemEdit(stored, { ...formValues, condition: "$Age > 2" })
  assert.strictEqual(changed, true)
  assert.deepStrictEqual(next, { ...stored, condition: "$Age > 2" })
}

// Clearing a value the item had is a change.
{
  const { next, changed } = applyItemEdit({ ...stored, condition: "$Age > 2" }, formValues)
  assert.strictEqual(changed, true)
  assert.strictEqual(next.condition, "")
}

// Arrays and numbers compare by value.
assert.strictEqual(applyItemEdit({ forbidWith: ["a"], score: 1 }, { forbidWith: ["a"], score: 1 }).changed, false)
assert.strictEqual(applyItemEdit({ forbidWith: ["a"] }, { forbidWith: ["a", "b"] }).changed, true)
assert.strictEqual(applyItemEdit({ score: null }, { score: 0 }).changed, true)

console.log("apply-item-edit tests passed")
