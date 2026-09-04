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
export { toConditionKeys } from "./keys";
export {
  compareConditions,
  compareConditionSet,
  exclusivityContextFrom,
  type ConditionComparison,
  type ExclusivityContext,
  type ExclusivityVerdict,
} from "./exclusivity";
export {
  collectScriptConditionFindings,
  getScriptConditionErrorCount,
  type ScriptWithItems,
  type ScriptConditionFinding,
  type ScriptConditionEntityRef,
} from "./collect";

/** Flags trailing whitespace on each non-empty line of the expression. */
function findTrailingWhitespace(input: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  let offset = 0;
  for (const line of input.split("\n")) {
    const withoutTrailing = line.replace(/[ \t]+$/, "");
    if (withoutTrailing.length && withoutTrailing.length !== line.length) {
      diagnostics.push({
        severity: "warning",
        code: "TRAILING_WHITESPACE",
        message: "Remove trailing spaces.",
        start: offset + withoutTrailing.length,
        end: offset + line.length,
      });
    }
    offset += line.length + 1; // account for the newline
  }
  return diagnostics;
}

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
  const whitespace = findTrailingWhitespace(src);

  const diagnostics: Diagnostic[] = [...syntax, ...semantic, ...whitespace].sort(
    (a, b) => a.start - b.start || (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1),
  );

  return { diagnostics, hasErrors: diagnostics.some((d) => d.severity === "error"), ast };
}
