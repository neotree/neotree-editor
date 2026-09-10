import type { Diagnostic, ValidationContext, ValidationResult } from "./ast";
import { parse } from "./parser";
import { analyze } from "./semantics";
import { findLegacyNegationDiagnostics } from "./legacy";

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
  CONDITION_REPORT_SIGNATURE_VERSION,
  buildConditionReportSignature,
  getScriptConditionInputsStamp,
  isConditionCatalogueReady,
  type ConditionReportSignatureParts,
} from "./report-signature";
export { quoteTextValue, quoteValue } from "./quote";
export { buildScriptConditionKeys, type BuildScriptConditionKeysInput } from "./script-keys";
export {
  getConfigurationConditionKeySignature,
  toConfigurationConditionKeys,
  type ConfigurationConditionKeySource,
} from "./configuration-keys";
export {
  OUTCOME_COLLECTIONS,
  collectNewOutcomeKeyCollisions,
  collectOutcomeKeyCollisions,
  getOutcomeCollectionForScreenType,
  getOutcomeProducer,
  getOutcomeProducers,
  getPreScriptUnavailableOutcomeKeys,
  getUnavailableOutcomeKeys,
  isOutcomeCollectionName,
  type OutcomeCollectionName,
  type OutcomeKeyCollision,
  type OutcomeProducers,
} from "./script-outcomes";
export {
  buildScriptOutcomeReferencePatches,
  collectScriptOutcomeReferences,
  rewriteOutcomeValueReferences,
  type OutcomeReferenceFinding,
  type ScriptOutcomeReferencePatches,
} from "./outcome-references";
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
        suggestion: "",
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
  const semantic = analyze(ast, ctx, src);
  const legacy = findLegacyNegationDiagnostics(ast, src);
  const whitespace = findTrailingWhitespace(src);

  const diagnostics: Diagnostic[] = [...syntax, ...legacy, ...semantic, ...whitespace].sort(
    (a, b) => a.start - b.start || (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1),
  );

  return { diagnostics, hasErrors: diagnostics.some((d) => d.severity === "error"), ast };
}
