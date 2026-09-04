import assert from "assert";

import {
  compareConditionSet,
  compareConditions,
  type ConditionKey,
} from "../lib/conditional-expression";

const keys: ConditionKey[] = [
  { name: "Sex", dataType: "dropdown", options: ["M", "F"] },
  { name: "Outcome", dataType: "dropdown", options: ["discharged", "died", "referred"] },
  { name: "Gestation", dataType: "number" },
  { name: "Diagnoses", dataType: "multi_select" },
  { name: "Notes", dataType: "text" },
];

const ctx = { keys };
const verdict = (a: string, b: string) => compareConditions(a, b, ctx).verdict;

// ── Provably exclusive ────────────────────────────────────────────────────────

assert.equal(verdict("$Sex = 'M'", "$Sex = 'F'"), "exclusive", "two different required values");
assert.equal(verdict("$Sex = 'M'", "$Sex != 'M'"), "exclusive", "a value that is also forbidden");
assert.equal(verdict("$Gestation > 37", "$Gestation < 30"), "exclusive", "disjoint ranges");
assert.equal(verdict("$Gestation >= 37", "$Gestation < 37"), "exclusive", "ranges meeting at a strict bound");
assert.equal(verdict("$Gestation = 20", "$Gestation > 30"), "exclusive", "a value outside the required range");
assert.equal(
  verdict("$Sex = 'M' and $Outcome = 'died'", "$Sex = 'M' and $Outcome = 'discharged'"),
  "exclusive",
  "conjunctions that agree on one key and conflict on another",
);
assert.equal(
  verdict("$Sex = 'M' or $Sex = 'F'", "$Sex = 'unknown'"),
  "exclusive",
  "every branch of a disjunction must be refuted",
);
assert.equal(
  verdict("$Sex = 'M'\n$Outcome = 'died'", "$Outcome = 'discharged'"),
  "exclusive",
  "newline-separated lines are ANDed",
);
assert.equal(verdict("$Sex = 'M'", "($Sex = 'F')"), "exclusive", "grouping does not change the verdict");

// ── Overlapping ───────────────────────────────────────────────────────────────

assert.equal(verdict("$Sex = 'M'", "$Outcome = 'died'"), "overlapping", "different keys never conflict");
assert.equal(verdict("$Gestation > 30", "$Gestation < 37"), "overlapping", "ranges that meet");
assert.equal(verdict("$Sex != 'M'", "$Sex != 'F'"), "overlapping", "two exclusions leave other values");
assert.equal(verdict("$Sex = 'M'", ""), "overlapping", "an empty condition means always shown");
assert.equal(verdict("", ""), "overlapping", "two empty conditions");
assert.equal(verdict("$Sex = 'M'", "$Sex = 'M'"), "overlapping", "identical conditions");
assert.equal(
  verdict("$Sex = 'M' or $Outcome = 'died'", "$Sex = 'F'"),
  "overlapping",
  "one satisfiable branch is enough",
);

// Runtime lowercases the whole condition, so values compare without case.
assert.equal(verdict("$Sex = 'M'", "$Sex = 'm'"), "overlapping", "values are case-insensitive");
// Comparison is `==`, so a numeric string and a number are the same value.
assert.equal(verdict("$Gestation = '5'", "$Gestation != 5"), "exclusive", "'5' and 5 are the same value");

// ── Deliberately not refuted ──────────────────────────────────────────────────

// Unset is a value in every key's domain: an unanswered key satisfies both
// exclusions, so covering every option proves nothing.
assert.equal(
  verdict("$Sex != 'M'", "$Sex != 'F'"),
  "overlapping",
  "option exhaustion must not be treated as a refutation",
);

// A multi-select can hold both values at once.
assert.equal(
  verdict("[$Diagnoses includes ('sepsis')]", "[$Diagnoses includes ('jaundice')]"),
  "overlapping",
  "two includes on a multi-select can both hold",
);

// `excludes` does not negate in the runtime, so it is never used to refute.
assert.equal(
  verdict("$Sex = 'M'", "[$Sex excludes ('M')]"),
  "overlapping",
  "excludes must not be used as a refutation",
);

// Key-to-key comparisons are opaque to the solver.
assert.equal(verdict("$Sex = 'M'", "$Sex = $Notes"), "overlapping", "an opaque atom cannot be refuted");

// ── Unknown ───────────────────────────────────────────────────────────────────

assert.equal(verdict("$Sex = ", "$Sex = 'F'"), "unknown", "a syntax error is not a verdict");
assert.equal(verdict("$Sex = 'M'", "this is not a condition"), "unknown", "unparseable input");

// ── Witness ───────────────────────────────────────────────────────────────────

const overlap = compareConditions("$Outcome = 'discharged'", "$Outcome != 'died' and $Sex = 'F'", ctx);
assert.equal(overlap.verdict, "overlapping");
assert.ok(overlap.witness, "an overlapping verdict carries a witness");
assert.ok(
  overlap.witness!.includes("$Outcome = 'discharged'") && overlap.witness!.includes("$Sex = 'f'"),
  `witness should name both keys as the author spelled them, got: ${overlap.witness}`,
);

const exclusive = compareConditions("$Sex = 'M'", "$Sex = 'F'", ctx);
assert.equal(exclusive.witness, undefined, "an exclusive verdict has no witness");

// ── $self ─────────────────────────────────────────────────────────────────────

// Two fields sharing a key means both "$self"s are the same variable.
assert.equal(
  compareConditions("$self = 'yes'", "$self = 'no'", { keys, selfKey: "HCWSig" }).verdict,
  "exclusive",
  "$self resolves to the shared key",
);
assert.equal(
  compareConditions("$self = 'yes'", "$HCWSig = 'no'", { keys, selfKey: "HCWSig" }).verdict,
  "exclusive",
  "$self and the shared key are the same variable",
);

// ── Sets ──────────────────────────────────────────────────────────────────────

assert.equal(
  compareConditionSet(["$Sex = 'M'", "$Sex = 'F'", "$Sex = 'unknown'"], ctx).verdict,
  "exclusive",
  "a set is exclusive only when every pair is",
);
assert.equal(
  compareConditionSet(["$Sex = 'M'", "$Sex = 'F'", "$Outcome = 'died'"], ctx).verdict,
  "overlapping",
  "one overlapping pair makes the whole set overlapping",
);
assert.equal(
  compareConditionSet(["$Sex = 'M'", "$Sex = 'F'", "$Sex ="], ctx).verdict,
  "unknown",
  "an undecidable pair falls back to unknown when nothing overlaps",
);
assert.equal(compareConditionSet(["$Sex = 'M'"], ctx).verdict, "exclusive", "a single condition has no pair to overlap");

// ── Guardrails ────────────────────────────────────────────────────────────────

const huge = Array.from({ length: 12 }, (_, i) => `$Gestation = ${i}`).join(" or ");
const hugeToo = Array.from({ length: 12 }, (_, i) => `$Gestation = ${i + 100}`).join(" or ");
assert.equal(verdict(huge, hugeToo), "unknown", "oversized expressions bail out instead of stalling");

console.log("condition exclusivity tests passed");
