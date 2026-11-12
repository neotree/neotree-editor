import assert from "assert"

import { renameConditionReferences } from "../lib/conditional-expression/rename-references"
import { syncScriptConditionReferences } from "../lib/data-key-condition-sync"

const rename = (input: string, opts: Parameters<typeof renameConditionReferences>[1]) =>
  renameConditionReferences(input, opts).output

// --- renameConditionReferences ---

// Variables: case-insensitive match, other variables untouched.
assert.strictEqual(
  rename("$Weight > 2 and $weight < 5 and $WeightX = 1", { vars: [{ from: "Weight", to: "WeightKg" }] }),
  "$WeightKg > 2 and $WeightKg < 5 and $WeightX = 1",
)

// $self is never renamed, and a name that cannot be a variable is skipped.
assert.strictEqual(rename("$self > 1", { vars: [{ from: "self", to: "Other" }] }), "$self > 1")
assert.strictEqual(rename("$Weight > 1", { vars: [{ from: "Weight", to: "Weight kg" }] }), "$Weight > 1")

// Option values: comparisons on either side, quote style preserved, only the named parent.
const values = [{ from: "Breast", to: "BreastMilk", parents: ["Feeding"] }]
assert.strictEqual(
  rename(`$Feeding = 'Breast' or "breast" != $Feeding or $Other = 'Breast'`, { values }),
  `$Feeding = 'BreastMilk' or "BreastMilk" != $Feeding or $Other = 'Breast'`,
)

// Membership lists.
assert.strictEqual(
  rename(`$Feeding includes ('Breast', 'Formula')\n$Feeding excludes ("BREAST")`, { values }),
  `$Feeding includes ('BreastMilk', 'Formula')\n$Feeding excludes ("BreastMilk")`,
)

// Bare (unquoted) values stay bare.
assert.strictEqual(rename("$Feeding = Breast", { values }), "$Feeding = BreastMilk")

// Incomplete expressions are still handled token by token.
assert.strictEqual(rename("($Weight > 2", { vars: [{ from: "Weight", to: "WeightKg" }] }), "($WeightKg > 2")

// Nothing to do -> unchanged, not flagged.
assert.deepStrictEqual(
  renameConditionReferences("$Height > 1", { vars: [{ from: "Weight", to: "WeightKg" }] }),
  { output: "$Height > 1", changed: false },
)

// --- syncScriptConditionReferences ---

const screens = [
  {
    screenId: "sc-1",
    scriptId: "s1",
    key: "",
    condition: "$Weight > 2",
    skipToCondition: "",
    items: [],
    fields: [
      { key: "WeightKg", condition: "", calculation: "$Weight * 1000", items: [] },
      {
        key: "Feeding",
        condition: "$Feeding = 'Breast'",
        items: [
          { value: "BreastMilk", condition: "$Weight > 1" },
          { value: "Formula", condition: "" },
        ],
      },
    ],
  },
]

const diagnoses = [
  {
    diagnosisId: "dx-1",
    scriptId: "s1",
    key: "LBW",
    expression: "$Weight < 2.5",
    symptoms: [{ key: "sym", expression: "$Feeding includes ('Breast')" }],
  },
]

// Replaced key and replaced option are both evidenced -> every location is rewritten.
{
  const result = syncScriptConditionReferences({
    screens,
    diagnoses,
    renames: [
      { from: "Weight", to: "WeightKg" },
      { from: "Breast", to: "BreastMilk" },
    ],
  })

  assert.strictEqual(result.screens.length, 1)
  const screen = result.screens[0]
  assert.strictEqual(screen.condition, "$WeightKg > 2")
  assert.strictEqual(screen.skipToCondition, undefined)
  assert.strictEqual(screen.fields![0].calculation, "$WeightKg * 1000")
  assert.strictEqual(screen.fields![1].condition, "$Feeding = 'BreastMilk'")
  assert.strictEqual(screen.fields![1].items[0].condition, "$WeightKg > 1")
  assert.strictEqual(screen.items, undefined)

  assert.deepStrictEqual(result.diagnoses, [{
    diagnosisId: "dx-1",
    scriptId: "s1",
    expression: "$WeightKg < 2.5",
    symptoms: [{ key: "sym", expression: "$Feeding includes ('BreastMilk')" }],
  }])
  assert.strictEqual(result.rewritten, 6)
}

// The old name is still a key in the script (legacy duplicate name) -> variable untouched.
{
  const result = syncScriptConditionReferences({
    screens: [
      ...screens,
      { screenId: "sc-2", scriptId: "s1", key: "Weight", condition: "", items: [], fields: [] },
    ],
    renames: [{ from: "Weight", to: "WeightKg" }],
  })
  assert.strictEqual(result.rewritten, 0)
}

// The replacement never landed in the script -> nothing changes.
{
  const result = syncScriptConditionReferences({
    screens: [{ screenId: "sc-3", scriptId: "s2", key: "", condition: "$Weight > 2", items: [], fields: [] }],
    renames: [{ from: "Weight", to: "WeightKg" }],
  })
  assert.strictEqual(result.rewritten, 0)
  assert.deepStrictEqual(result.screens, [])
}

// The parent still offers the old option -> the literal keeps its meaning.
{
  const result = syncScriptConditionReferences({
    screens: [{
      screenId: "sc-4",
      scriptId: "s1",
      key: "",
      condition: "$Feeding = 'Breast'",
      items: [],
      fields: [{ key: "Feeding", items: [{ value: "Breast" }, { value: "BreastMilk" }] }],
    }],
    renames: [{ from: "Breast", to: "BreastMilk" }],
  })
  assert.strictEqual(result.rewritten, 0)
}

console.log("data-key-condition-sync tests passed")
