import assert from "assert"

import { checkDataKeyDuplicates } from "../lib/data-key-duplicate-check"

const key = (uuid: string, name: string, label: string, dataType = "number") => ({ uuid, uniqueKey: `uk-${uuid}`, name, label, dataType })
const existing = [
  key("a", "Weight", "Birth weight"),
  key("b", "weight", "Weight today"),
  key("c", "BW", "Birth Weight "),
  key("d", "Height", "Length"),
]
const names = (list: { uuid: string }[]) => list.map((k) => k.uuid)

// The very same key (casing included) blocks; another casing warns; the same label (any case/spacing) warns.
{
  const check = checkDataKeyDuplicates({ name: "Weight", label: "birth weight", existing })
  assert.deepStrictEqual(names(check.sameName), ["a"])
  assert.deepStrictEqual(names(check.sameNameOtherCase), ["b"])
  assert.deepStrictEqual(names(check.sameLabel), ["c"])
}

// Surrounding spaces don't make a different key.
assert.deepStrictEqual(names(checkDataKeyDuplicates({ name: "  Weight ", label: "", existing }).sameName), ["a"])

// A key never conflicts with itself (editing it).
assert.deepStrictEqual(names(checkDataKeyDuplicates({ name: "Weight", label: "Birth weight", existing, excludeUuid: "a" }).sameLabel), ["c"])

// Nothing matches -> nothing reported; an empty name or label matches nothing.
{
  const check = checkDataKeyDuplicates({ name: "Temperature", label: "Temp", existing })
  assert.deepStrictEqual([check.sameName, check.sameNameOtherCase, check.sameLabel, check.similarName, check.similarLabel], [[], [], [], [], []])
  assert.deepStrictEqual(checkDataKeyDuplicates({ name: "", label: "", existing }).sameLabel, [])
}

// A key listed in both libraries' results is reported once.
assert.deepStrictEqual(names(checkDataKeyDuplicates({ name: "Height", label: "", existing: [...existing, existing[3]] }).sameName), ["d"])

// --- similar names and labels (warn) ---
{
  const library = [
    key("s1", "Birth_Weight", "Weight at birth (grams)"),
    key("s2", "BW2", "Birth weight in kg"),
    key("s3", "Yes1", "Yes"),
    key("s4", "Temp", "Temperature on admission"),
  ]
  const check = checkDataKeyDuplicates({ name: "birth weight", label: "Birth weight (g)", existing: library })
  assert.deepStrictEqual(names(check.similarName), ["s1"], "separators and casing aside, the same name")
  assert.deepStrictEqual(names(check.similarLabel), ["s2"], "two meaningful words covering the shorter label")
  // one shared word is not enough, so one-word labels don't match everything
  assert.deepStrictEqual(names(checkDataKeyDuplicates({ name: "X", label: "Yes", existing: library }).sameLabel), ["s3"])
  assert.deepStrictEqual(names(checkDataKeyDuplicates({ name: "X", label: "Yes please", existing: library }).similarLabel), [])
  assert.deepStrictEqual(names(checkDataKeyDuplicates({ name: "X", label: "Weight on admission", existing: library }).similarLabel), [])
  // exact matches are reported as such, not as similar
  const exact = checkDataKeyDuplicates({ name: "Birth_Weight", label: "", existing: library })
  assert.deepStrictEqual([names(exact.sameName), names(exact.similarName)], [["s1"], []])
}

console.log("data-key-duplicate-check tests passed")
