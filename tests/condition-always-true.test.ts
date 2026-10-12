import assert from "assert";

import { validateCondition, type ConditionKey, type ValidationContext } from "../lib/conditional-expression";

const keys: ConditionKey[] = [
  { name: "NeotreeOutcome", dataType: "text", options: ["BID", "DDA", "NND", "STB", "LIV"] },
  { name: "AdmReason", dataType: "text", options: ["DUM", "BBA", "DU"] },
  { name: "BC1R", dataType: "text", options: ["NO", "CO", "YES"] },
  { name: "BC", dataType: "boolean" },
  { name: "DRU", dataType: "boolean" },
  { name: "Sex", dataType: "text", options: ["M", "F"] },
];

const ctx: ValidationContext = { keys, allowSelf: true };

const codes = (input: string) => validateCondition(input, ctx).diagnostics.map((d) => d.code);
const alwaysTrue = (input: string) => codes(input).includes("ALWAYS_TRUE");
const fix = (input: string) =>
  validateCondition(input, ctx).diagnostics.find((d) => d.code === "ALWAYS_TRUE")?.suggestion;

// ---- the reported case ------------------------------------------------------

assert.ok(
  alwaysTrue("$NeotreeOutcome != 'BID' or $NeotreeOutcome != 'DDA'"),
  "two != on one key joined by or is always true",
);
assert.ok(
  alwaysTrue("($NeotreeOutcome != 'BID' or $NeotreeOutcome != 'DDA' or $NeotreeOutcome != 'NND' or $NeotreeOutcome != 'STB') and ($DRU = false)"),
  "flagged even when the tautology is only one conjunct",
);
assert.ok(
  alwaysTrue("($BC = true) and ($BC1R != 'NO' or $BC1R != 'CO')"),
  "flagged inside a nested group",
);

// ---- what must NOT be flagged ----------------------------------------------

assert.ok(
  !alwaysTrue("$NeotreeOutcome != 'BID' and $NeotreeOutcome != 'DDA'"),
  "the correct `and` form is fine",
);
assert.ok(
  !alwaysTrue("$NeotreeOutcome != 'BID' or $AdmReason != 'DUM'"),
  "different keys can both be false, so not a tautology",
);
assert.ok(
  !alwaysTrue("$NeotreeOutcome != 'BID' or $NeotreeOutcome != 'BID'"),
  "the same value twice is redundant, not always true",
);
assert.ok(!alwaysTrue("$Sex = 'M' or $Sex = 'F'"), "= chained with or is not reported");
assert.ok(!alwaysTrue("$Sex = 'M' and $Sex = 'F'"), "= chained with and is deliberately not reported");
assert.ok(!alwaysTrue("$Sex != 'M'"), "a single != is fine");

// ---- one report per chain ---------------------------------------------------

assert.equal(
  codes("$NeotreeOutcome != 'BID' or $NeotreeOutcome != 'DDA' or $NeotreeOutcome != 'NND'")
    .filter((c) => c === "ALWAYS_TRUE").length,
  1,
  "a three-term chain reports once, not once per nesting level",
);

// ---- quick fix --------------------------------------------------------------

assert.equal(
  fix("$NeotreeOutcome != 'BID' or $NeotreeOutcome != 'DDA'"),
  "$NeotreeOutcome != 'BID' and $NeotreeOutcome != 'DDA'",
  "suggests swapping the joiner when every operand is != on one key",
);
assert.equal(
  fix("$NeotreeOutcome != 'BID' or $NeotreeOutcome != 'DDA' or $AdmReason != 'DUM'"),
  undefined,
  "no quick fix for a mixed chain — swapping the joiner would change meaning",
);

// ---- severity ---------------------------------------------------------------

const result = validateCondition("$NeotreeOutcome != 'BID' or $NeotreeOutcome != 'DDA'", ctx);
assert.equal(
  result.diagnostics.find((d) => d.code === "ALWAYS_TRUE")?.severity,
  "warning",
  "a warning, not an error: 16 live expressions have this and must stay publishable",
);
assert.ok(!result.hasErrors, "does not block a save or publish");

console.log("condition-always-true: all assertions passed");
