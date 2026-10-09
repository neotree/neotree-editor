import assert from "assert";

import { validateCondition, type ConditionKey, type ValidationContext } from "../lib/conditional-expression";
import { APPLICABLE_SUGGESTION_CODES, canApplySuggestion } from "../lib/conditional-expression/quick-fix";

/**
 * A diagnostic that carries a `suggestion` but whose code is missing from the
 * allowlist gets a quick fix that silently never renders. That is easy to do
 * and impossible to notice without looking at the UI, so it is asserted here.
 */

const keys: ConditionKey[] = [
  { name: "Diagnoses", dataType: "multi_select", options: ["RDN", "PREMRDS", "LBW"] },
  { name: "Problems", dataType: "multi_select", options: ["Yell"] },
  { name: "Sex", dataType: "text", options: ["M", "F"] },
  { name: "Outcome", dataType: "text", options: ["BID", "DDA", "NND", "STB", "LIV"] },
  { name: "Gestation", dataType: "number" },
  { name: "Name", dataType: "text" },
];

const ctx: ValidationContext = { keys, allowSelf: true };

/** Deliberately broken expressions, one per fixable problem we know about. */
const EXPRESSIONS = [
  "$Outcome != 'BID' or $Outcome != 'DDA'",          // ALWAYS_TRUE
  "$Diagnoses = 'RDN'",                               // COLLECTION_COMPARISON
  "$Diagnoses != 'RDN'",                              // COLLECTION_COMPARISON
  "$Sex = ['M','F']",                                 // ARRAY_COMPARISON
  "$Diagnoses or_includes ('RDN')",                   // LEGACY_MEMBERSHIP_OP
  "!($Outcome = 'BID' or $Outcome = 'DDA')",          // LEGACY_NEGATION
  "$Sex = ''M''",                                     // DOUBLED_QUOTED_VALUE
  "$Name = 'John '",                                  // VALUE_WHITESPACE
  "$sex = 'M'",                                       // KEY_CASE
  "$Sex = M",                                         // UNQUOTED_VALUE
  "$Sex = 'Nope'",                                    // UNKNOWN_OPTION
  "$Diagnoses includes ('RDN') and $Sex = 'M'",       // MEMBERSHIP_BRACKETS
  "$Outcome ! = 'BID'",                               // SPACED_NOT_EQUAL
];

const seen = new Set<string>();
const dead: string[] = [];

for (const expression of EXPRESSIONS) {
  for (const d of validateCondition(expression, ctx).diagnostics) {
    if (d.suggestion === undefined) continue;
    seen.add(d.code);
    if (!canApplySuggestion(d)) {
      dead.push(`${d.code} on ${JSON.stringify(expression)} suggests ${JSON.stringify(d.suggestion)} but is not applicable`);
    }
  }
}

assert.equal(
  dead.length,
  0,
  `these diagnostics carry a quick fix the editor will never offer:\n  ${dead.join("\n  ")}`,
);

assert.ok(seen.size >= 8, `expected the battery to exercise several fixable codes, saw ${seen.size}`);

// The codes added for NEOAPP-1514 specifically must be offerable.
for (const code of ["ALWAYS_TRUE", "COLLECTION_COMPARISON", "ARRAY_COMPARISON", "LEGACY_MEMBERSHIP_OP"] as const) {
  assert.ok(APPLICABLE_SUGGESTION_CODES.includes(code), `${code} must be applicable in the editor`);
  assert.ok(seen.has(code), `${code} was not exercised by the battery — add an expression for it`);
}

// A suggestion must be a drop-in replacement for its own span: applying it has
// to leave an expression that itself validates, otherwise the fix is a trap.
for (const expression of EXPRESSIONS) {
  const d = validateCondition(expression, ctx).diagnostics.find((x) => canApplySuggestion(x));
  if (!d) continue;
  const applied = expression.slice(0, d.start) + d.suggestion + expression.slice(d.end);
  const after = validateCondition(applied, ctx);
  const sameCode = after.diagnostics.filter((x) => x.code === d.code);
  assert.equal(
    sameCode.length,
    0,
    `applying the ${d.code} fix to ${JSON.stringify(expression)} gave ${JSON.stringify(applied)}, which still reports ${d.code}`,
  );
}

console.log(`condition-quick-fix: all assertions passed (${seen.size} fixable codes exercised)`);
