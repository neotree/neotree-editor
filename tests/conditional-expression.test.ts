import assert from "assert";

import {
  validateCondition,
  validateReferenceExpression,
  type ConditionKey,
  type ValidationContext,
} from "../lib/conditional-expression";

const keys: ConditionKey[] = [
  { name: "Sex", dataType: "dropdown", options: ["M", "F"] },
  { name: "Gestation", dataType: "number" },
  { name: "Diagnoses", dataType: "multi_select" },
  { name: "Temp", dataType: "number" },
  { name: "Weight", dataType: "number" },
  { name: "Height", dataType: "number" },
  { name: "Name", dataType: "text" },
];

const ctx: ValidationContext = { keys, allowSelf: true };

const errors = (input: string, c: ValidationContext = ctx) =>
  validateCondition(input, c).diagnostics.filter((d) => d.severity === "error");
const warnings = (input: string, c: ValidationContext = ctx) =>
  validateCondition(input, c).diagnostics.filter((d) => d.severity === "warning");
const codes = (input: string, c: ValidationContext = ctx) =>
  validateCondition(input, c).diagnostics.map((d) => d.code);

// ---- Valid expressions produce no errors ------------------------------------

const validExpressions = [
  "",
  "$Sex = 'M'",
  "$Gestation = 39",
  "$Sex = 'F' or $Gestation >= 39",
  "$Sex = 'M' or $Gestation > 39\n[$Diagnoses includes ('LBW','Sepsis')]",
  "[$Diagnoses includes ('LBW')]",
  "[$Diagnoses excludes ('LBW','Sepsis')]",
  "$Diagnoses = ['Sepsis', 'Jaundice', 'Premature']",
  "($Sex = 'M' and $Gestation < 20) or $Temp > 37",
  "$self = 'Yes' or $Gestation > 78",
];

for (const expr of validExpressions) {
  assert.equal(errors(expr).length, 0, `expected no errors for: ${JSON.stringify(expr)} -> ${JSON.stringify(errors(expr))}`);
}

// ---- Syntax errors ----------------------------------------------------------

assert.ok(codes("$Sex = 'M' or").includes("DANGLING_OPERATOR"), "dangling or");
assert.ok(codes("$Sex = 'M").includes("UNTERMINATED_STRING"), "unterminated string");
assert.ok(codes("[$Diagnoses includes ('LBW'").includes("UNBALANCED_PAREN"), "unbalanced paren");
assert.ok(codes("($Sex = 'M'").includes("UNBALANCED_PAREN"), "unbalanced group paren");
assert.ok(codes("$Sex = 'M' and ($Gestation > 39").includes("UNBALANCED_PAREN"), "unbalanced nested");
assert.ok(codes("$Gestation >").includes("MISSING_OPERAND"), "missing operand");
assert.ok(codes("$Diagnoses includes 'LBW'").includes("MEMBERSHIP_SYNTAX"), "membership without parens");
assert.ok(codes("[]").includes("EMPTY_GROUP"), "empty group");
// Two operands with no operator between them IS a hard error.
assert.ok(codes("$Gestation 'x'").includes("MISSING_OPERATOR"), "missing operator between operands");

// ---- Standalone key (truthiness) is a WARNING, not a blocking error --------

assert.equal(errors("$Gestation").length, 0, "bare key does not error");
assert.ok(codes("$Gestation").includes("STANDALONE_EXPRESSION"), "bare key warns");
assert.equal(validateCondition("$Gestation", ctx).hasErrors, false, "bare key does not block save");
assert.equal(errors("$Sex = 'M' and $Gestation").length, 0, "trailing bare key in and-chain does not error");
assert.ok(warnings("$Sex = 'M' and $Gestation").some((d) => d.code === "STANDALONE_EXPRESSION"), "trailing bare key warns");

// ---- Semantic: the headline bug (typo'd key) --------------------------------

const typo = errors("$Gestaton > 39");
assert.equal(typo.length, 1, "one error for typo key");
assert.equal(typo[0].code, "UNKNOWN_KEY");
assert.equal(typo[0].suggestion, "$Gestation", "should suggest the closest key");

assert.ok(codes("$NopeKey = 'x'").includes("UNKNOWN_KEY"), "unknown key flagged");

// $self disallowed when not permitted
assert.ok(
  validateCondition("$self = 'Yes'", { keys, allowSelf: false }).diagnostics.some((d) => d.code === "SELF_NOT_ALLOWED"),
  "self not allowed",
);

// ---- Semantic warnings (do not block) ---------------------------------------

assert.ok(warnings("$Name > 5").some((d) => d.code === "TYPE_MISMATCH"), "ordering op on text key");
assert.ok(warnings("$Sex = 'X'").some((d) => d.code === "UNKNOWN_OPTION"), "unknown option");
assert.ok(warnings("$Gestation includes ('a')").some((d) => d.code === "MEMBERSHIP_TYPE"), "membership on scalar");
assert.ok(warnings("$Sex = M").some((d) => d.code === "UNQUOTED_VALUE"), "unquoted value");
// warnings must never set hasErrors
assert.equal(validateCondition("$Sex = 'X'", ctx).hasErrors, false, "warnings do not block save");

// ---- skipKeyResolution suppresses key-dependent checks ----------------------

const loadingCtx: ValidationContext = { keys: [], allowSelf: true, skipKeyResolution: true };
assert.equal(errors("$AnyKey = 'x'", loadingCtx).length, 0, "no unknown-key errors while keys load");
assert.ok(codes("$AnyKey = 'x' or", loadingCtx).includes("DANGLING_OPERATOR"), "syntax still checked while loading");

// ---- Reference expression sublanguage ---------------------------------------

const refDiags = (input: string) => validateReferenceExpression(input, ctx).diagnostics;
const refErrors = (input: string) => refDiags(input).filter((d) => d.severity === "error");
const refWarnings = (input: string) => refDiags(input).filter((d) => d.severity === "warning");

assert.equal(refErrors("$Weight").length, 0, "single key ref is valid");
assert.equal(refErrors("SUM($Weight, $Height)").length, 0, "SUM valid");
assert.equal(refErrors("DIVIDE($Weight, $Height)").length, 0, "DIVIDE valid");
// Function-shape issues are warnings now (function list not verified vs mobile) — never block.
assert.equal(refErrors("SUMM($Weight)").length, 0, "unknown function does not block");
assert.ok(refWarnings("SUMM($Weight)").some((d) => d.code === "UNKNOWN_FUNCTION"), "unknown function warns");
assert.equal(refErrors("SUM(5, $Height)").length, 0, "non-key arg does not block");
assert.ok(refWarnings("SUM(5, $Height)").some((d) => d.code === "FUNCTION_ARG"), "non-key arg warns");
// Unknown key and unbalanced parens remain hard errors.
assert.ok(refErrors("SUM($Nope)").some((d) => d.code === "UNKNOWN_KEY"), "unknown key in ref");
assert.ok(refErrors("SUM($Weight").some((d) => d.code === "UNBALANCED_PAREN"), "unbalanced ref paren");

console.log("conditional-expression: all assertions passed");
