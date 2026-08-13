import type { ValidationContext, ValidationResult } from "./ast";

export function validateReferenceExpression(_input: string, _ctx: ValidationContext): ValidationResult {
  return { diagnostics: [], hasErrors: false, ast: null };
}
