import assert from "assert";

import {
  buildScriptConditionKeys,
  buildScriptOutcomeReferencePatches,
  collectOutcomeKeyCollisions,
  collectScriptOutcomeReferences,
  getUnavailableOutcomeKeys,
  getScriptConditionErrorCount,
  mergeConditionKeys,
  rewriteOutcomeValueReferences,
  validateCondition,
  validateReferenceExpression,
  type ConditionKey,
  type ValidationContext,
} from "../lib/conditional-expression";
import {
  getConditionValueMatches,
  getValueContextAtCursor,
  quoteValue,
} from "../components/conditional-expression/autocomplete";
import { evaluateCondition, parseCondition } from "../app/(ops)/conditional-exp/_eval";

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

// ---- Legacy negation and not-equal authoring guidance ----------------------

const legacyNegation = validateCondition("!($Sex = 'M')", ctx);
const legacyWarning = legacyNegation.diagnostics.find((d) => d.code === "LEGACY_NEGATION");
assert.equal(legacyNegation.hasErrors, false, "legacy !(...) syntax should remain non-blocking");
assert.equal(legacyWarning?.severity, "warning", "legacy !(...) should be a deprecation warning");
assert.equal(legacyWarning?.suggestion, "$Sex != 'M'", "simple legacy negation should suggest !=");

const complexLegacyNegation = validateCondition(
  "!($Sex = 'M' or [$Diagnoses includes ('LBW')])",
  ctx,
);
assert.equal(complexLegacyNegation.hasErrors, false, "valid legacy compound negation should remain non-blocking");
assert.equal(
  complexLegacyNegation.diagnostics.find((d) => d.code === "LEGACY_NEGATION")?.suggestion,
  "($Sex != 'M' and [$Diagnoses excludes ('LBW')])",
  "compound legacy negation should apply De Morgan's law in its suggestion",
);

const screenshotLegacyNegation = validateCondition(
  "!($AdmReason = 'DU' or [$AdmReasonAdd includes ('DU')])",
  { keys: [], skipKeyResolution: true },
);
assert.equal(screenshotLegacyNegation.hasErrors, false, "the reported legacy expression should remain saveable");
assert.equal(
  screenshotLegacyNegation.diagnostics.find((d) => d.code === "LEGACY_NEGATION")?.suggestion,
  "($AdmReason != 'DU' and [$AdmReasonAdd excludes ('DU')])",
  "the reported legacy expression should receive a complete modern rewrite",
);
assert.equal(
  validateCondition(
    "!($AdmReason = 'DU' or [$AdmReasonAdd includes ('DU')])\n$AdmReason != 'BBA'",
    { keys: [], skipKeyResolution: true },
  ).hasErrors,
  false,
  "the reported multiline expression should contain only the legacy warning",
);

const spacedNotEqual = validateCondition("$Sex ! = 'M'", ctx);
const spacedNotEqualError = spacedNotEqual.diagnostics.find((d) => d.code === "SPACED_NOT_EQUAL");
assert.equal(spacedNotEqual.hasErrors, true, "a spaced not-equal operator should block saving");
assert.equal(spacedNotEqualError?.severity, "error", "spaced ! = should have a targeted error");
assert.equal(spacedNotEqualError?.suggestion, "!=", "spaced ! = should suggest the valid operator");
assert.equal(
  spacedNotEqual.diagnostics.some((d) => d.message.includes('Unexpected character "!"')),
  false,
  "spaced ! = should not fall back to a generic unexpected-character error",
);
assert.equal(
  validateCondition("$Sex !   = 'M'", ctx).diagnostics.find((d) => d.code === "SPACED_NOT_EQUAL")?.suggestion,
  "!=",
  "multiple spaces inside the operator should receive the same quick fix",
);
assert.equal(
  validateCondition("$Sex !\t= 'M'", ctx).diagnostics.find((d) => d.code === "SPACED_NOT_EQUAL")?.suggestion,
  "!=",
  "a tab inside the operator should receive the same quick fix",
);
assert.equal(validateCondition("$Sex != 'M'", ctx).hasErrors, false, "the modern != operator should remain valid");

// ---- Script-scoped Diagnoses and Problems collections ----------------------

const scriptOutcomeKeys = buildScriptConditionKeys({
  dataKeys: [
    {
      name: "Diagnoses",
      label: "Clinician diagnoses",
      dataType: "diagnosis",
      uniqueKey: "diagnoses-parent",
      options: ["manual-diagnosis"],
    },
    {
      name: "ManualDiagnosis",
      label: "Clinician-entered diagnosis",
      dataType: "option",
      uniqueKey: "manual-diagnosis",
      options: [],
    },
  ],
  diagnoses: [
    { key: "RDS", name: "Respiratory distress syndrome", position: 2 },
    { key: "Sepsis", name: "Neonatal sepsis", position: 1 },
    { key: "rds", name: "Duplicate RDS", position: 3 },
    { key: "", name: "Missing runtime key", position: 4 },
  ],
  problems: [
    { key: "Airway", name: "Airway problem", position: 2 },
    { key: "Breathing", name: "Breathing problem", position: 1 },
  ],
  screens: [
    { type: "diagnosis" },
    { type: "problems" },
  ],
});

const diagnosesCollection = scriptOutcomeKeys.find((key) => key.name === "Diagnoses");
const problemsCollection = scriptOutcomeKeys.find((key) => key.name === "Problems");
assert.deepEqual(
  diagnosesCollection?.options,
  ["Sepsis", "RDS"],
  "CDS diagnoses should be position-sorted, deduplicated, and isolated from colliding raw collection options",
);
assert.equal(
  diagnosesCollection?.optionLabels?.RDS,
  "Respiratory distress syndrome",
  "diagnosis suggestions should display the name while retaining the machine key",
);
assert.deepEqual(
  problemsCollection?.options,
  ["Breathing", "Airway"],
  "problems should come from the current script in configured order",
);
assert.deepEqual(
  buildScriptConditionKeys({ screens: [{ type: "diagnosis" }], diagnoses: [] })
    .find((key) => key.name === "Diagnoses")?.options,
  [],
  "an empty diagnosis screen should still expose an empty virtual collection for targeted guidance",
);
assert.deepEqual(
  getConditionValueMatches(diagnosesCollection, "resp"),
  [{ value: "RDS", label: "Respiratory distress syndrome" }],
  "value autocomplete should search human-readable outcome names",
);
assert.equal(
  validateCondition("[$Diagnoses includes ('RDS')]", { keys: scriptOutcomeKeys }).hasErrors,
  false,
  "a configured diagnosis should validate as a collection member",
);
assert.ok(
  validateCondition("[$Problems includes ('UnknownProblem')]", { keys: scriptOutcomeKeys }).diagnostics.some(
    (diagnostic) => diagnostic.code === "UNKNOWN_OPTION" && diagnostic.severity === "error",
  ),
  "an unknown problem should be rejected against script-scoped options",
);
assert.ok(
  validateCondition("[$Problem includes ('Airway')]", { keys: scriptOutcomeKeys }).diagnostics.some(
    (diagnostic) => diagnostic.code === "UNKNOWN_KEY" && diagnostic.suggestion === "$Problems",
  ),
  "the singular $Problem spelling should suggest the canonical $Problems key",
);

const outcomeRuntimeEntries = [{
  screen: { type: "diagnosis" },
  values: [
    { key: "Diagnoses", value: [{ key: "RDS" }] },
    { key: "Problems", value: [{ key: "Airway" }] },
  ],
}];
assert.equal(
  evaluateCondition(parseCondition("[$Diagnoses includes ('RDS')]", outcomeRuntimeEntries)),
  true,
  "diagnosis suggestions should insert the key used by the runtime collection",
);
assert.equal(
  evaluateCondition(parseCondition("[$Problems includes ('Airway')]", outcomeRuntimeEntries)),
  true,
  "problem suggestions should insert the key used by the runtime collection",
);

// ---- Runtime availability and reserved-key protection ---------------------

const orderedOutcomeScreens = [
  { screenId: "diagnosis-screen", type: "diagnosis", key: "Diagnoses", title: "Compile diagnoses", position: 2 },
  { screenId: "problem-screen", type: "problems", key: "Problems", title: "Compile problems", position: 4 },
];
assert.deepEqual(
  getUnavailableOutcomeKeys({ screens: orderedOutcomeScreens, consumerPosition: 5 }),
  {},
  "both outcome collections are available after their producer screens",
);
assert.match(
  getUnavailableOutcomeKeys({ screens: orderedOutcomeScreens, consumerPosition: 3 }).Problems,
  /only available after/i,
  "Problems is unavailable before the problems screen",
);
assert.ok(
  validateCondition("[$Problems includes ('Airway')]", {
    keys: scriptOutcomeKeys,
    unavailableKeys: getUnavailableOutcomeKeys({ screens: orderedOutcomeScreens, consumerPosition: 3 }),
  }).diagnostics.some((diagnostic) => diagnostic.code === "OUTCOME_NOT_AVAILABLE"),
  "editor validation explains an outcome reference used before it exists",
);
assert.ok(
  validateCondition("[$Diagnoses includes ('RDS')]", {
    keys: [],
    skipKeyResolution: true,
    unavailableKeys: getUnavailableOutcomeKeys({ screens: [], consumerPosition: 1 }),
  }).diagnostics.some((diagnostic) => diagnostic.code === "OUTCOME_NOT_AVAILABLE"),
  "known virtual collections retain targeted availability errors even when the general key catalogue is empty",
);
assert.match(
  getUnavailableOutcomeKeys({
    screens: [{ type: "diagnosis", key: "ClinicalDx", title: "Compile diagnoses", position: 2 }],
    consumerPosition: 3,
  }).Diagnoses,
  /currently saves to "\$ClinicalDx"/,
  "a producer using a noncanonical runtime key gets a targeted contract error",
);

const reservedCollisions = collectOutcomeKeyCollisions({
  screens: [
    { screenId: "allowed", type: "diagnosis", key: "Diagnoses", title: "Diagnosis" },
    { screenId: "bad", type: "form", key: "Problems", title: "Other form", fields: [{ key: "Diagnoses", label: "Bad field" }] },
  ],
  diagnoses: [{ diagnosisId: "bad-dx", key: "Problems", name: "Bad diagnosis" }],
});
assert.equal(reservedCollisions.length, 3, "only the matching producer screen may own a reserved collection key");
assert.equal(
  collectOutcomeKeyCollisions({
    screens: [{ type: "form", key: "Safe", items: [{ key: "Diagnoses", label: "Bad item" }] }],
    diagnoses: [{ key: "SafeDiagnosis", symptoms: [{ key: "Problems", name: "Bad symptom" }] }],
  }).length,
  2,
  "nested item and symptom keys cannot shadow virtual outcome collections",
);

// ---- Outcome reference impact and safe rename rewriting -------------------

const renameExpression = "[$Diagnoses includes ('RDS', \"Sepsis\")] and $Other = 'RDS'";
const renamed = rewriteOutcomeValueReferences(renameExpression, "Diagnoses", "RDS", "RespiratoryDistress");
assert.equal(renamed.occurrences, 1, "only collection-bound values count as rename references");
assert.equal(
  renamed.expression,
  "[$Diagnoses includes ('RespiratoryDistress', \"Sepsis\")] and $Other = 'RDS'",
  "rename preserves the original delimiter and does not rewrite unrelated literals",
);

const referenceScript = {
  scriptId: "script-1",
  screens: [{
    screenId: "screen-1",
    scriptId: "script-1",
    title: "After diagnoses",
    condition: "[$Diagnoses includes ('RDS')]",
    fields: [{ key: "FieldA", label: "Field A", condition: "$Sex = 'M'" }],
    items: [{ key: "ItemA", label: "Item A", condition: "[$Diagnoses includes ('RDS')]" }],
  }],
  diagnoses: [{
    diagnosisId: "dx-1",
    scriptId: "script-1",
    key: "RDS",
    expression: "$Temp > 37",
    symptoms: [{ key: "Tachypnoea", name: "Tachypnoea", expression: "[$Diagnoses includes ('RDS')]" }],
  }],
  problems: [{
    problemId: "problem-1",
    scriptId: "script-1",
    expression: "[$Diagnoses excludes ('RDS')]",
    symptoms: [{ key: "WorkOfBreathing", name: "Work of breathing", expression: "[$Diagnoses includes ('RDS')]" }],
  }],
};
assert.equal(
  collectScriptOutcomeReferences(referenceScript, "Diagnoses", ["RDS"]).length,
  5,
  "impact preview reports top-level, item, and symptom expressions that reference an outcome value",
);
const referencePatches = buildScriptOutcomeReferencePatches(referenceScript, "Diagnoses", "RDS", "RDS_NEW");
assert.equal(referencePatches.occurrences, 5, "rewrite reports the exact occurrence count");
assert.equal(referencePatches.screens[0].condition, "[$Diagnoses includes ('RDS_NEW')]", "screen condition is patched");
assert.equal(referencePatches.screens[0].items[0].condition, "[$Diagnoses includes ('RDS_NEW')]", "screen item condition is patched");
assert.equal(referencePatches.diagnoses[0].symptoms[0].expression, "[$Diagnoses includes ('RDS_NEW')]", "diagnosis symptom is patched");
assert.equal(referencePatches.problems[0].expression, "[$Diagnoses excludes ('RDS_NEW')]", "problem expression is patched");
assert.equal(referencePatches.problems[0].symptoms[0].expression, "[$Diagnoses includes ('RDS_NEW')]", "problem symptom is patched");

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

// ---- Reference expressions are EXEMPT from validation -----------------------
// Reference/calculation expressions use a free-form MATH/arithmetic grammar the
// checker doesn't model, so they are intentionally never flagged (no errors or
// warnings) regardless of content.

const refDiags = (input: string) => validateReferenceExpression(input, ctx).diagnostics;

assert.equal(refDiags("$Weight").length, 0, "reference expressions are exempt");
assert.equal(refDiags("SUM($Weight, $Height)").length, 0, "SUM ref exempt");
assert.equal(refDiags("SUM($Nope)").length, 0, "unknown key in a reference is not flagged (exempt)");
assert.equal(refDiags("SUMM($Weight)").length, 0, "unknown function is not flagged (exempt)");
assert.equal(refDiags("SUM($Weight").length, 0, "unbalanced paren is not flagged (exempt)");
assert.equal(
  refDiags("MATH(Math.floor($Gestation) + Math.round(($Age / 24) % 7) / 10)").length,
  0,
  "MATH/arithmetic reference expressions are not flagged (exempt)",
);
assert.equal(
  validateReferenceExpression("MATH($A + $B * 2.5)", ctx).hasErrors,
  false,
  "reference expressions never report errors",
);

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
  [{ name: "A", label: "A - persisted", dataType: "number", optionLabels: { x: "Option X" } }],
  [{ name: "A" }],
);
assert.equal(fallback.length, 1, "fallback merges to one");
assert.equal(fallback[0].label, "A - persisted", "keeps persisted label when local omits it");
assert.equal(fallback[0].dataType, "number", "keeps persisted dataType when local omits it");
assert.deepEqual(fallback[0].optionLabels, { x: "Option X" }, "keeps persisted option labels when local omits them");

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

// ---- getScriptConditionErrorCount (script-level badge collector) -----------

const scriptKeys = [
  { name: "Sex", dataType: "dropdown" },
  { name: "Gestation", dataType: "number" },
];

// A fully valid script -> 0.
assert.equal(
  getScriptConditionErrorCount({
    dataKeys: scriptKeys,
    screens: [{ condition: "$Sex = 'M'", fields: [{ condition: "$Gestation > 20" }] }],
    diagnoses: [{ expression: "$Gestation < 30" }],
  }),
  0,
  "clean script has no CE errors",
);

assert.equal(
  getScriptConditionErrorCount({
    dataKeys: scriptKeys,
    screens: [{ condition: "!($Sex = 'M')" }],
  }),
  0,
  "deprecated legacy negation warnings should not count as blocking script errors",
);

assert.equal(
  getScriptConditionErrorCount({
    dataKeys: [],
    diagnoses: [{ key: "RDS", name: "Respiratory distress syndrome", position: 1 }],
    problems: [{ key: "Airway", name: "Airway problem", position: 1 }],
    screens: [
      { type: "diagnosis", key: "Diagnoses", title: "Diagnoses", position: 1 },
      { type: "problems", key: "Problems", title: "Problems", position: 2 },
      { type: "management", key: "Plan", title: "Plan", position: 3, condition: "[$Diagnoses includes ('RDS')] and [$Problems includes ('Airway')]" },
    ],
  }),
  0,
  "publish validation should use the same script-scoped diagnosis and problem options as the editor",
);

assert.equal(
  getScriptConditionErrorCount({
    dataKeys: [],
    diagnoses: [{ key: "RDS", name: "Respiratory distress syndrome", position: 1 }],
    screens: [
      { type: "diagnosis", key: "Diagnoses", title: "Diagnoses", position: 1 },
      { type: "management", key: "Plan", title: "Plan", position: 2, condition: "[$Diagnoses includes ('NotInThisScript')]" },
    ],
  }),
  1,
  "publish validation should reject diagnosis values that are not defined by this script",
);

assert.equal(
  getScriptConditionErrorCount({
    dataKeys: [],
    diagnoses: [{ key: "RDS", name: "Respiratory distress syndrome", position: 1 }],
    screens: [
      { type: "management", key: "Early", title: "Too early", position: 1, condition: "[$Diagnoses includes ('RDS')]" },
      { type: "diagnosis", key: "Diagnoses", title: "Diagnoses", position: 2 },
    ],
  }),
  1,
  "publish validation blocks a runtime outcome reference before its producer screen",
);
assert.equal(
  getScriptConditionErrorCount({
    dataKeys: [{ name: "Problems", label: "Unrelated form value", dataType: "text" }],
    screens: [{ type: "form", key: "Problems", title: "Conflicting form", position: 1 }],
  }),
  1,
  "publish validation blocks real keys that shadow a reserved outcome collection",
);

// Distinct broken expressions counted once each (unknown key + missing operand).
assert.equal(
  getScriptConditionErrorCount({
    dataKeys: scriptKeys,
    screens: [{ condition: "$Gestaton > 20", fields: [{ condition: "$Gestation = " }] }],
  }),
  2,
  "counts each broken expression once",
);
assert.equal(
  getScriptConditionErrorCount({
    dataKeys: scriptKeys,
    screens: [{ title: "Items", items: [{ label: "Bad item", condition: "$MissingItemKey = 'x'" }] }],
    diagnoses: [{ name: "Diagnosis", symptoms: [{ name: "Bad symptom", expression: "$MissingSymptomKey = 'x'" }] }],
  }),
  2,
  "publish validation includes nested screen-item and CDS symptom expressions",
);

// NUID conditions resolve against the NUID fields' LINKED registry keys
// (passed as nuidDataKeys), so a reference to a linked key is valid.
assert.equal(
  getScriptConditionErrorCount({
    dataKeys: scriptKeys,
    nuidSearchFields: [
      { key: "NuidA", type: "text", keyId: "dk-a", condition: "$NuidB = 'x'" },
      { key: "NuidB", type: "text", keyId: "dk-b" },
    ],
    nuidDataKeys: [
      { name: "NuidA", dataType: "text", uniqueKey: "dk-a" },
      { name: "NuidB", dataType: "text", uniqueKey: "dk-b" },
    ],
  }),
  0,
  "a NUID reference to a linked registry key resolves",
);
// A NUID field referencing a key that ISN'T in the registry is flagged, just
// like every other CE surface — even when it names a sibling field.
assert.equal(
  getScriptConditionErrorCount({
    dataKeys: scriptKeys,
    nuidSearchFields: [
      { key: "NuidA", type: "text", keyId: "dk-a", condition: "$NuidB = 'x'" },
      { key: "NuidB", type: "dropdown" }, // unlinked -> not in the registry
    ],
    nuidDataKeys: [{ name: "NuidA", dataType: "text", uniqueKey: "dk-a" }],
  }),
  1,
  "a NUID reference to a key not in the registry is flagged",
);
assert.equal(
  getScriptConditionErrorCount({
    dataKeys: scriptKeys,
    nuidSearchFields: [{ key: "NuidA", type: "text", keyId: "dk-a", condition: "$Nope = 'x'" }],
    nuidDataKeys: [{ name: "NuidA", dataType: "text", uniqueKey: "dk-a" }],
  }),
  1,
  "unknown NUID reference is counted",
);

// No keys at all -> key checks are skipped (only syntax), so no false positives.
assert.equal(
  getScriptConditionErrorCount({ dataKeys: [], screens: [{ condition: "$Anything = 'x'" }] }),
  0,
  "empty key catalogue does not false-flag references",
);
assert.equal(
  getScriptConditionErrorCount({ dataKeys: [], screens: [{ condition: "$Anything = 'x' or" }] }),
  1,
  "syntax errors still counted with empty key catalogue",
);

console.log("conditional-expression: all assertions passed");
