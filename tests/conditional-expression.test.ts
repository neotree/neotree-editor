import assert from "assert";

import {
  mergeConditionKeys,
  validateCondition,
  validateReferenceExpression,
  type ConditionKey,
  type ValidationContext,
} from "../lib/conditional-expression";
import { getValueContextAtCursor, quoteValue } from "../components/conditional-expression/autocomplete";

const keys: ConditionKey[] = [
  { name: "Sex", dataType: "dropdown", options: ["M", "F"] },
  { name: "Gestation", dataType: "number" },
  { name: "Diagnoses", dataType: "multi_select" },
  { name: "Temp", dataType: "number" },
  { name: "Weight", dataType: "number" },
  { name: "Height", dataType: "number" },
  { name: "Name", dataType: "text" },
  { name: "IsPreterm", dataType: "boolean" },
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
assert.ok(codes("$Gestation 'x'").includes("MISSING_OPERATOR"), "missing operator between operands");

// ---- A key on its own (nothing after it) is rejected -----------------------

assert.ok(codes("$Gestation").includes("STANDALONE_EXPRESSION"), "bare key flagged");
assert.equal(validateCondition("$Gestation", ctx).hasErrors, true, "bare key blocks save");
assert.ok(
  validateCondition("$Sex = 'M' and $Gestation", ctx).diagnostics.some(
    (d) => d.code === "STANDALONE_EXPRESSION" && d.severity === "error",
  ),
  "trailing bare key in and-chain errors",
);

// ---- Empty / null values are rejected --------------------------------------

assert.ok(codes("$Sex = ''").includes("EMPTY_VALUE"), "empty string value rejected");
assert.equal(validateCondition("$Sex = ''", ctx).hasErrors, true, "empty value blocks save");
assert.ok(codes("$Sex = null").includes("NULL_VALUE"), "null value rejected");
assert.ok(codes("$Sex = undefined").includes("NULL_VALUE"), "undefined value rejected");
assert.ok(codes("[$Diagnoses includes ('')]").includes("EMPTY_VALUE"), "empty list value rejected");
// Empty/null rejection is structural — fires even before keys load.
assert.ok(
  codes("$AnyKey = ''", { keys: [], allowSelf: true, skipKeyResolution: true }).includes("EMPTY_VALUE"),
  "empty value flagged while keys load",
);

// ---- Semantic: the headline bug (typo'd key) --------------------------------

const typo = errors("$Gestaton > 39");
assert.equal(typo.length, 1, "one error for typo key");
assert.equal(typo[0].code, "UNKNOWN_KEY");
assert.equal(typo[0].suggestion, "$Gestation", "should suggest the closest key");

assert.ok(codes("$NopeKey = 'x'").includes("UNKNOWN_KEY"), "unknown key flagged");

// $self when not permitted -> advisory WARNING, never blocks.
const selfResult = validateCondition("$self = 'Yes'", { keys, allowSelf: false });
assert.ok(selfResult.diagnostics.some((d) => d.code === "SELF_NOT_ALLOWED"), "self flagged");
assert.equal(selfResult.diagnostics.find((d) => d.code === "SELF_NOT_ALLOWED")?.severity, "warning", "self is a warning");
assert.equal(selfResult.hasErrors, false, "self does not block save");
assert.equal(
  validateCondition("$self = 'Yes'", { keys, allowSelf: true }).diagnostics.filter((d) => d.code === "SELF_NOT_ALLOWED").length,
  0,
  "self allowed produces no diagnostic",
);

// ---- Semantic warnings (do not block) ---------------------------------------

assert.ok(warnings("$Name > 5").some((d) => d.code === "TYPE_MISMATCH"), "ordering op on text key");
assert.ok(warnings("$Gestation includes ('a')").some((d) => d.code === "MEMBERSHIP_TYPE"), "membership on scalar");
assert.ok(warnings("$Sex = M").some((d) => d.code === "UNQUOTED_VALUE"), "unquoted value");
assert.equal(validateCondition("$Name > 5", ctx).hasErrors, false, "warnings do not block save");

// ---- Unknown options are now ERRORS -----------------------------------------

assert.ok(errors("$Sex = 'X'").some((d) => d.code === "UNKNOWN_OPTION"), "unknown option is an error");
assert.equal(validateCondition("$Sex = 'X'", ctx).hasErrors, true, "unknown option blocks save");
assert.equal(errors("$Sex = 'M'").length, 0, "valid option is accepted");

// ---- Keys are case-sensitive ------------------------------------------------

const caseCtx: ValidationContext = { keys: [{ name: "ADM", dataType: "text" }] };
const caseResult = validateCondition("$adm = 'x'", caseCtx);
assert.ok(caseResult.diagnostics.some((d) => d.code === "KEY_CASE"), "wrong casing flagged");
assert.equal(caseResult.diagnostics.find((d) => d.code === "KEY_CASE")?.suggestion, "$ADM", "suggests correct casing");
assert.equal(caseResult.hasErrors, true, "wrong casing blocks save");
assert.equal(errors("$ADM = 'x'", caseCtx).length, 0, "exact casing is accepted");

// ---- Free text / missing $ is rejected --------------------------------------

assert.ok(codes("hello").includes("STANDALONE_EXPRESSION"), "lone free-text word rejected");
assert.equal(validateCondition("hello", ctx).hasErrors, true, "free text blocks save");
assert.ok(codes("'just text'").includes("STANDALONE_EXPRESSION"), "lone string literal rejected");
assert.ok(codes("hello = world").includes("MISSING_KEY"), "comparison without $key rejected");
assert.equal(validateCondition("hello = world", ctx).hasErrors, true, "missing-$ comparison blocks save");

// ---- Narrow value-type checks (numeric / boolean) --------------------------

// Numeric key vs non-numeric literal -> warning; coercible numeric string is fine.
assert.ok(warnings("$Gestation = 'abc'").some((d) => d.code === "VALUE_TYPE"), "numeric key vs text warns");
assert.ok(warnings("$Temp > 'high'").some((d) => d.code === "VALUE_TYPE"), "numeric key ordering vs text warns");
assert.equal(warnings("$Gestation = '39'").filter((d) => d.code === "VALUE_TYPE").length, 0, "numeric string is allowed");
assert.equal(warnings("$Gestation = 39").filter((d) => d.code === "VALUE_TYPE").length, 0, "number literal is allowed");
assert.equal(validateCondition("$Gestation = 'abc'", ctx).hasErrors, false, "value-type is advisory, not blocking");

// Boolean key vs non-boolean literal -> warning; true/false (or 'true'/'false') is fine.
assert.ok(warnings("$IsPreterm = 'maybe'").some((d) => d.code === "VALUE_TYPE"), "boolean key vs non-boolean warns");
assert.equal(warnings("$IsPreterm = true").filter((d) => d.code === "VALUE_TYPE").length, 0, "boolean literal allowed");
assert.equal(warnings("$IsPreterm = 'false'").filter((d) => d.code === "VALUE_TYPE").length, 0, "quoted boolean allowed");

// Non-numeric/boolean keys are unaffected.
assert.equal(warnings("$Name = 'abc'").filter((d) => d.code === "VALUE_TYPE").length, 0, "text key: no value-type check");

// ---- Multi-select list references (includes / excludes) --------------------

// Correctly bracketed membership: no bracket diagnostic, no errors.
assert.equal(errors("[$Diagnoses includes ('LBW')]").length, 0, "bracketed membership is valid");
assert.equal(
  codes("[$Diagnoses includes ('LBW')]").filter((c) => c === "MEMBERSHIP_BRACKETS").length,
  0,
  "bracketed membership: no bracket warning",
);
assert.equal(errors("[$Diagnoses includes ('LBW')] and $Sex = 'M'").length, 0, "bracketed + combined is valid");

// Standalone unbracketed membership: advisory warning, does not block.
assert.ok(warnings("$Diagnoses includes ('LBW')").some((d) => d.code === "MEMBERSHIP_BRACKETS"), "standalone unbracketed warns");
assert.equal(validateCondition("$Diagnoses includes ('LBW')", ctx).hasErrors, false, "standalone unbracketed does not block");

// Membership combined with and/or is a blocking ERROR — unbracketed...
const combined = validateCondition("$Diagnoses includes ('LBW') and $Sex = 'M'", ctx);
assert.ok(combined.diagnostics.some((d) => d.code === "MEMBERSHIP_BRACKETS" && d.severity === "error"), "combined unbracketed errors");
assert.equal(combined.hasErrors, true, "combined unbracketed blocks save");
assert.ok(
  validateCondition("$Diagnoses excludes ('LBW') or $Sex = 'F'", ctx).diagnostics.some(
    (d) => d.code === "MEMBERSHIP_BRACKETS" && d.severity === "error",
  ),
  "combined unbracketed excludes errors",
);
// ...and ALSO when combined *inside* the same [ ] (the runtime drops the rest).
assert.equal(
  validateCondition("[$Diagnoses includes ('LBW') and $Sex = 'M']", ctx).hasErrors,
  true,
  "membership combined inside one [ ] is an error",
);
assert.ok(
  validateCondition("[$Diagnoses includes ('LBW') or $Diagnoses includes ('Sepsis')]", ctx).diagnostics.some(
    (d) => d.code === "MEMBERSHIP_BRACKETS" && d.severity === "error",
  ),
  "two memberships in one [ ] is an error",
);
// Correct form: each membership in its own [ ], combined outside — valid.
assert.equal(
  validateCondition("[$Diagnoses includes ('LBW')] and [$Diagnoses includes ('Sepsis')]", ctx).hasErrors,
  false,
  "separate bracketed memberships combined outside are valid",
);

// Empty list and unquoted values.
assert.ok(warnings("[$Diagnoses includes ()]").some((d) => d.code === "MEMBERSHIP_EMPTY"), "empty list warns");
assert.ok(warnings("[$Diagnoses includes (LBW)]").some((d) => d.code === "UNQUOTED_VALUE"), "unquoted list value warns");

// Option-value checking inside lists (typo'd choice codes) + duplicates.
const listCtx: ValidationContext = {
  keys: [{ name: "Diagnoses", dataType: "multi_select", options: ["LBW", "Sepsis", "Jaundice"] }],
};
assert.equal(
  errors("[$Diagnoses includes ('LBW','Sepsis')]", listCtx).filter((d) => d.code === "UNKNOWN_OPTION").length,
  0,
  "valid list options: no error",
);
const badOption = errors("[$Diagnoses includes ('LBWW')]", listCtx).find((d) => d.code === "UNKNOWN_OPTION");
assert.ok(badOption, "typo'd list option errors");
assert.equal(badOption?.suggestion, "LBW", "suggests the closest option");
assert.equal(validateCondition("[$Diagnoses includes ('LBWW')]", listCtx).hasErrors, true, "bad option blocks save");
assert.ok(
  warnings("[$Diagnoses includes ('LBW','LBW')]", listCtx).some((d) => d.code === "DUPLICATE_VALUE"),
  "duplicate list value warns",
);
// Equality option check still works via the shared helper.
assert.ok(errors("$Diagnoses = 'Nope'", listCtx).some((d) => d.code === "UNKNOWN_OPTION"), "equality option error");

// ---- Stray whitespace ------------------------------------------------------

// Leading/trailing spaces inside a value (silent runtime mismatch).
assert.ok(warnings("$Name = 'John '").some((d) => d.code === "VALUE_WHITESPACE"), "trailing space in value warns");
assert.ok(warnings("$Name = ' John'").some((d) => d.code === "VALUE_WHITESPACE"), "leading space in value warns");
assert.equal(warnings("$Name = 'John Doe'").filter((d) => d.code === "VALUE_WHITESPACE").length, 0, "interior space is fine");
assert.ok(warnings("[$Diagnoses includes ('LBW ')]").some((d) => d.code === "VALUE_WHITESPACE"), "trailing space in list value warns");
// Whitespace check is structural — fires even before keys load.
assert.ok(
  warnings("$Any = 'x '", { keys: [], allowSelf: true, skipKeyResolution: true }).some((d) => d.code === "VALUE_WHITESPACE"),
  "value whitespace flagged while keys load",
);

// Trailing spaces on a line.
assert.ok(codes("$Sex = 'M' ").includes("TRAILING_WHITESPACE"), "trailing spaces on the expression flagged");
assert.equal(codes("$Sex = 'M'").filter((c) => c === "TRAILING_WHITESPACE").length, 0, "no trailing whitespace when clean");
// Whitespace flags never block saving.
assert.equal(validateCondition("$Name = 'John '", ctx).hasErrors, false, "whitespace flags do not block");

// ---- skipKeyResolution suppresses key-dependent checks ----------------------

const loadingCtx: ValidationContext = { keys: [], allowSelf: true, skipKeyResolution: true };
assert.equal(errors("$AnyKey = 'x'", loadingCtx).length, 0, "no unknown-key errors while keys load");
assert.ok(codes("$AnyKey = 'x' or", loadingCtx).includes("DANGLING_OPERATOR"), "syntax still checked while loading");

// Guard: a non-empty (local-only) list must NOT make a valid persisted key
// resolve as unknown when the catalogue isn't authoritative.
assert.equal(
  errors("$Persisted = 'x'", { keys: [{ name: "Local" }], allowSelf: true, skipKeyResolution: true }).length,
  0,
  "unavailable catalogue + local key does not false-flag a persisted key",
);
assert.ok(
  codes("$Persisted = 'x'", { keys: [{ name: "Local" }], allowSelf: true }).includes("UNKNOWN_KEY"),
  "with resolution on, an unknown key is still flagged",
);

// ---- Multi-value normalization (set<id> etc.) -------------------------------

const setCtx: ValidationContext = { keys: [{ name: "Sel", dataType: "set<id>" }] };
const multiCtx: ValidationContext = { keys: [{ name: "Sel", dataType: "multi_select" }] };
assert.equal(
  warnings("[$Sel includes ('A')]", setCtx).filter((d) => d.code === "MEMBERSHIP_TYPE").length,
  0,
  "set<id> is treated as a multi-value type",
);
assert.equal(
  warnings("[$Sel includes ('A')]", multiCtx).filter((d) => d.code === "MEMBERSHIP_TYPE").length,
  0,
  "multi_select membership has no type warning",
);

// ---- Reference expression sublanguage ---------------------------------------

const refDiags = (input: string) => validateReferenceExpression(input, ctx).diagnostics;
const refErrors = (input: string) => refDiags(input).filter((d) => d.severity === "error");
const refWarnings = (input: string) => refDiags(input).filter((d) => d.severity === "warning");

assert.equal(refErrors("$Weight").length, 0, "single key ref is valid");
assert.equal(refErrors("SUM($Weight, $Height)").length, 0, "SUM valid");
assert.equal(refErrors("DIVIDE($Weight, $Height)").length, 0, "DIVIDE valid");
assert.equal(refErrors("SUMM($Weight)").length, 0, "unknown function does not block");
assert.ok(refWarnings("SUMM($Weight)").some((d) => d.code === "UNKNOWN_FUNCTION"), "unknown function warns");
assert.equal(refErrors("SUM(5, $Height)").length, 0, "non-key arg does not block");
assert.ok(refWarnings("SUM(5, $Height)").some((d) => d.code === "FUNCTION_ARG"), "non-key arg warns");
assert.ok(refErrors("SUM($Nope)").some((d) => d.code === "UNKNOWN_KEY"), "unknown key in ref");
assert.ok(refErrors("SUM($Weight").some((d) => d.code === "UNBALANCED_PAREN"), "unbalanced ref paren");

// ---- mergeConditionKeys -----------------------------------------------------

const dupExtras = mergeConditionKeys([], [
  { name: "Field1", dataType: "text" },
  { name: "field1", dataType: "number" },
]);
assert.equal(dupExtras.length, 1, "duplicate extras collapse to one");
assert.equal(dupExtras[0].dataType, "number", "later duplicate extra wins");

const collision = mergeConditionKeys(
  [{ name: "Sex", dataType: "dropdown", label: "Sex - persisted" }],
  [{ name: "sex", dataType: "text" }],
);
assert.equal(collision.length, 1, "base/extra case-insensitive collision merges");
assert.equal(collision[0].dataType, "text", "local dataType wins over persisted");

const fallback = mergeConditionKeys(
  [{ name: "A", label: "A - persisted", dataType: "number" }],
  [{ name: "A" }],
);
assert.equal(fallback.length, 1, "fallback merges to one");
assert.equal(fallback[0].label, "A - persisted", "keeps persisted label when local omits it");
assert.equal(fallback[0].dataType, "number", "keeps persisted dataType when local omits it");

assert.equal(mergeConditionKeys([{ name: "" }], [{ name: "  " }]).length, 0, "blank names dropped");

const wsCollision = mergeConditionKeys([{ name: "Sex", dataType: "dropdown" }], [{ name: " sex " }]);
assert.equal(wsCollision.length, 1, "whitespace collision merges to one");
assert.equal(wsCollision[0].name, "sex", "collision stores the trimmed name");
assert.equal(
  validateCondition("$sex = 'M'", { keys: wsCollision }).diagnostics.filter((d) => d.severity === "error").length,
  0,
  "trimmed merged key resolves",
);

const withUnsaved = mergeConditionKeys(keys, [{ name: "NewField" }]);
assert.equal(
  validateCondition("$NewField = 'x'", { keys: withUnsaved }).diagnostics.filter((d) => d.severity === "error").length,
  0,
  "unsaved sibling field resolves once merged",
);

// ---- getValueContextAtCursor (value autocomplete parser) --------------------

const at = (s: string) => getValueContextAtCursor(s, s.length);

// Inside a membership list value -> governing key is the membership target.
const listValueCtx = at("[$Diagnoses includes ('LB");
assert.ok(listValueCtx, "detects value context inside includes list");
assert.equal(listValueCtx?.keyName, "Diagnoses", "governing key resolved from list");
assert.equal(listValueCtx?.partial, "LB", "captures the partial value");

// Comparison RHS (quoted).
const cmpCtx = at("$Sex = 'F");
assert.ok(cmpCtx, "detects value context on comparison RHS");
assert.equal(cmpCtx?.keyName, "Sex", "governing key resolved from comparison");
assert.equal(cmpCtx?.partial, "F", "captures partial comparison value");

// Bare value directly after "=".
const bareCtx = at("$Sex = M");
assert.ok(bareCtx, "detects bare value context");
assert.equal(bareCtx?.keyName, "Sex", "bare value governing key");

// Typing a $key is NOT a value context.
assert.equal(at("$Sex = 'M' or $Gest"), null, "typing a $key is not a value context");
// Nothing to complete before an operator.
assert.equal(at("$Sex "), null, "no value context before an operator");

// ---- quoteValue picks a safe delimiter (no escaping in the DSL) -------------

assert.equal(quoteValue("LBW"), "'LBW'", "plain value uses single quotes");
assert.equal(quoteValue("Mother's"), "\"Mother's\"", "value with ' uses double quotes");
assert.equal(quoteValue('a"b'), "'a\"b'", "value with \" uses single quotes");
assert.equal(quoteValue("Mother's \"x\""), "`Mother's \"x\"`", "value with both uses backticks");

// ---- Legacy flagging (list badge / on-open) --------------------------------
// Validation is pure and edit-state-agnostic, so a legacy erroneous expression
// is flagged the moment it is validated (drives the list badge + on-open flag),
// while the editor still allows saving it unchanged (block-on-change, UI-side).
assert.equal(validateCondition("$Gestaton > 39", ctx).hasErrors, true, "legacy typo flagged without editing");
assert.equal(validateCondition("$adm = 'x'", caseCtx).hasErrors, true, "legacy wrong-casing flagged without editing");
assert.equal(validateCondition("$Sex = 'M'", ctx).hasErrors, false, "valid legacy expression is not flagged");

console.log("conditional-expression: all assertions passed");
