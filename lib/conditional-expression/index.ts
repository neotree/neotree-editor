import type { Diagnostic, ValidationContext, ValidationResult } from "./ast";
import { parse } from "./parser";
import { analyze } from "./semantics";

export type {
  ConditionKey,
  Diagnostic,
  DiagnosticCode,
  Severity,
  ValidationContext,
  ValidationResult,
} from "./ast";
export { validateReferenceExpression } from "./reference-expr";
export { mergeConditionKeys } from "./merge-keys";

/**
 * Validate a boolean conditional expression against the script's key context.
 * Returns syntax + semantic diagnostics sorted by position.
 *
 * An empty expression is valid (it means "always true"/no condition).
 */
export function validateCondition(input: string, ctx: ValidationContext): ValidationResult {
  const src = input || "";
  if (!src.trim()) return { diagnostics: [], hasErrors: false, ast: null };

  const { ast, diagnostics: syntax } = parse(src);
  const semantic = analyze(ast, ctx);

  const diagnostics: Diagnostic[] = [...syntax, ...semantic].sort(
    (a, b) => a.start - b.start || (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1),
  );

  return { diagnostics, hasErrors: diagnostics.some((d) => d.severity === "error"), ast };
}
