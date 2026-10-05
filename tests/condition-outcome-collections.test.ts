import assert from "assert";

import { validateCondition, type ConditionKey, type ValidationContext } from "../lib/conditional-expression";

/**
 * $Diagnoses / $Problems are lists, so they must be queried with membership.
 * `=` reads as though the patient had exactly one outcome, and `!=` is true
 * whenever they have any other outcome — or none at all.
 */

const keys: ConditionKey[] = [
  { name: "Diagnoses", dataType: "text", options: ["RDN", "PREMRDS", "LBW"] },
  { name: "Problems", dataType: "text", options: ["Yell", "Cold"] },
  { name: "DangerSigns", dataType: "text", options: ["Grun", "None"] },
  { name: "RR", dataType: "number" },
  { name: "SatsO2", dataType: "number" },
  { name: "WOB", dataType: "text", options: ["Mod", "Sev", "None"] },
  { name: "NobCPAP", dataType: "boolean" },
  { name: "Sex", dataType: "text", options: ["M", "F"] },
];

const ctx: ValidationContext = { keys, allowSelf: true };

const diag = (input: string) => validateCondition(input, ctx).diagnostics;
const codes = (input: string) => diag(input).map((d) => d.code);
const flagged = (input: string) => codes(input).includes("COLLECTION_COMPARISON");
const fix = (input: string) => diag(input).find((d) => d.code === "COLLECTION_COMPARISON")?.suggestion;

// ---- the restriction --------------------------------------------------------

assert.ok(flagged("$Diagnoses = 'RDN'"), "= on $Diagnoses is rejected");
assert.ok(flagged("$Diagnoses != 'RDN'"), "!= on $Diagnoses is rejected");
assert.ok(flagged("$Problems = 'Yell'"), "= on $Problems is rejected");
assert.ok(flagged("$diagnoses = 'RDN'"), "matched regardless of case");
assert.ok(flagged("$Diagnoses > 'RDN'"), "ordering on a list is rejected too");
assert.ok(
  flagged("($DangerSigns = 'Grun' or $Diagnoses = 'RDN') and $NobCPAP = false"),
  "flagged inside a larger expression",
);

assert.equal(
  validateCondition("$Diagnoses = 'RDN'", ctx).hasErrors,
  true,
  "it is an error, so it is recorded as a CE issue rather than a hint",
);

// ---- what must NOT be flagged ----------------------------------------------

assert.ok(!flagged("[$Diagnoses includes ('RDN')]"), "membership is the accepted form");
assert.ok(!flagged("[$Diagnoses excludes ('RDN','PREMRDS')]"), "excludes is accepted");
assert.ok(!flagged("$Sex = 'M'"), "ordinary keys are untouched");
assert.ok(!flagged("$DiagnosesOther = 'x'"), "a key that merely starts with the name is untouched");

// ---- the quick fix ----------------------------------------------------------

assert.equal(fix("$Diagnoses = 'RDN'"), "[$Diagnoses includes ('RDN')]", "= becomes includes");
assert.equal(fix("$Diagnoses != 'RDN'"), "[$Diagnoses excludes ('RDN')]", "!= becomes excludes");
assert.equal(fix("$Problems = 'Yell'"), "[$Problems includes ('Yell')]", "works for $Problems");
assert.equal(fix("$Diagnoses > 'RDN'"), undefined, "no quick fix for ordering — there is no right answer");

// ---- the array rewrite stays evaluable on every app build -------------------
// Membership is not understood by app builds still in service at sites that
// have not been updated, so this fix is written out in "=" / "or" instead.
const arrayFix = (input: string) =>
  diag(input).find((d) => d.code === "ARRAY_COMPARISON")?.suggestion;

assert.equal(
  arrayFix("$Sex = ['M','F']"),
  "($Sex = 'M' or $Sex = 'F')",
  "a list comparison is rewritten into primitives every build understands, not into membership",
);
assert.ok(
  !`${arrayFix("$Sex = ['M','F']")}`.includes("includes"),
  "the fix must never introduce membership on an ordinary key",
);
assert.equal(
  arrayFix("$Sex != ['M','F']"),
  undefined,
  "no automatic fix for !=: the and-chain is wrong for multi-selects and excludes needs a current app",
);

// ---- the fix must not trip the OTHER membership rule ------------------------
// The editor also forbids a membership sharing a line with and/or unless it is
// bracketed. A suggestion that immediately produced a new error would be worse
// than the problem, so verify the real expression end to end.

const CPAP_BEFORE =
  "($DangerSigns = 'Grun' or $RR > 60 or $SatsO2 < 90 or $WOB = 'Mod' or $WOB = 'Sev' or $Diagnoses = 'RDN' or $Diagnoses = 'PREMRDS') and $NobCPAP = false";
const CPAP_AFTER =
  "($DangerSigns = 'Grun' or $RR > 60 or $SatsO2 < 90 or $WOB = 'Mod' or $WOB = 'Sev' or [$Diagnoses includes ('RDN')] or [$Diagnoses includes ('PREMRDS')]) and $NobCPAP = false";

assert.ok(flagged(CPAP_BEFORE), "the real CPAP condition is flagged today");

const after = validateCondition(CPAP_AFTER, ctx);
assert.equal(after.hasErrors, false, `the rewritten CPAP condition must be clean, got: ${after.diagnostics.map((d) => `${d.code}: ${d.message}`).join(" | ")}`);
assert.ok(
  !after.diagnostics.some((d) => d.code === "MEMBERSHIP_BRACKETS"),
  "bracketed membership does not trip the bracket rule even inside an or-chain",
);

// A single collapsed membership is equally acceptable and shorter.
const collapsed = validateCondition(
  "($DangerSigns = 'Grun' or [$Diagnoses includes ('RDN','PREMRDS')]) and $NobCPAP = false",
  ctx,
);
assert.equal(collapsed.hasErrors, false, "several values in one membership is also clean");

console.log("condition-outcome-collections: all assertions passed");
