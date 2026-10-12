import type { Diagnostic, DiagnosticCode } from "./ast";

/**
 * Codes whose `suggestion` is a drop-in replacement for the diagnostic's own
 * span, so the editor can offer "Apply suggestion".
 *
 * This lives here rather than in the editor component so it can be tested: a
 * new diagnostic that carries a suggestion but is missing from this list gets
 * a quick fix that silently never appears. See tests/condition-quick-fix.test.ts.
 */
export const APPLICABLE_SUGGESTION_CODES: readonly DiagnosticCode[] = [
  "LEGACY_NEGATION",
  "LEGACY_REVERSED_COMPARISON",
  "SPACED_NOT_EQUAL",
  "MISMATCHED_QUOTED_VALUE",
  "DOUBLED_QUOTED_VALUE",
  "KEY_CASE",
  "UNKNOWN_KEY",
  "UNKNOWN_OPTION",
  "UNQUOTED_VALUE",
  "VALUE_WHITESPACE",
  "TRAILING_WHITESPACE",
  "DUPLICATE_VALUE",
  "MEMBERSHIP_BRACKETS",
  "ALWAYS_TRUE",
  "COLLECTION_COMPARISON",
  "ARRAY_COMPARISON",
  "LEGACY_MEMBERSHIP_OP",
];

/**
 * A code may still omit the suggestion case by case (no close option match, a
 * membership that needs restructuring, ordering on a list), hence the presence
 * check as well as the code check.
 */
export function canApplySuggestion(diagnostic: Diagnostic): boolean {
  return diagnostic.suggestion !== undefined
    && APPLICABLE_SUGGESTION_CODES.includes(diagnostic.code);
}
