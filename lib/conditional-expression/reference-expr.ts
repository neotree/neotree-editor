import type { ValidationContext, ValidationResult } from "./ast";

// The reference-expression sublanguage (field calculations) is not validated
// yet — this stub accepts everything so calculations are never false-flagged.
// When it lands it will need its own diagnostic codes (e.g. UNKNOWN_FUNCTION,
// FUNCTION_ARG) added back to DiagnosticCode in ./ast.

export function validateReferenceExpression(_input: string, _ctx: ValidationContext): ValidationResult {
  return { diagnostics: [], hasErrors: false, ast: null };
}
