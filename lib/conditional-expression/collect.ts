import type { ConditionKey, Diagnostic } from "./ast";
import { toConditionKeys } from "./keys";
import { mergeConditionKeys } from "./merge-keys";
import { validateCondition } from "./index";
import { validateReferenceExpression } from "./reference-expr";

export interface ScriptWithItems {
  scriptId?: string;
  title?: string;
  name?: string;
  dataKeys?: any[];
  screens?: any[];
  diagnoses?: any[];
  problems?: any[];
  drugsLibrary?: any[];
  nuidSearchFields?: any[];
  nuidDataKeys?: any[];
  eligibilityCriteria?: any;
}

export interface ScriptConditionEntityRef {
  kind: "screen" | "diagnosis" | "problem" | "nuid" | "eligibility" | "drug";
  screenId?: string;
  diagnosisId?: string;
  problemId?: string;
}

export interface ScriptConditionFinding {
  location: string;
  field: string;
  expression: string;
  errors: Diagnostic[];
  entity?: ScriptConditionEntityRef;
}

/**
 * Collects every conditional expression across a script's entities, validates
 * each against that script's keys (the same rules and key resolution the editor
 * and list badges use), and returns the ones with blocking errors.
 *
 * - Drug conditions are checked syntax-only (they resolve against a library-wide
 *   key set at runtime).
 * - NUID search fields aren't scrapped into the script key set, so their linked
 *   data-key names are merged in (matching how they resolve live).
 * - When a context has no keys, key-dependent checks are skipped (syntax still
 *   runs), matching the editor/list "keysReady" behaviour.
 */
export function collectScriptConditionFindings(script: ScriptWithItems): ScriptConditionFinding[] {
  const keys = toConditionKeys(script?.dataKeys || []);
  const scriptCtx = { keys, allowSelf: true, skipKeyResolution: keys.length === 0 };
  const syntaxOnlyCtx = { keys: [] as ConditionKey[], allowSelf: true, skipKeyResolution: true };

  const nuidFields = (script?.nuidSearchFields || []) as any[];
  const nuidKeys = toConditionKeys(script?.nuidDataKeys || []);
  const nuidMergedKeys = nuidKeys.length ? mergeConditionKeys(keys, nuidKeys) : keys;
  const nuidCtx = { keys: nuidMergedKeys, allowSelf: true, skipKeyResolution: nuidMergedKeys.length === 0 };

  const findings: ScriptConditionFinding[] = [];

  const check = (
    expression: unknown,
    field: string,
    location: string,
    opts?: { mode?: "boolean" | "reference"; ctx?: typeof scriptCtx | typeof syntaxOnlyCtx; entity?: ScriptConditionEntityRef },
  ) => {
    const value = `${expression ?? ""}`.trim();
    if (!value) return;
    const ctx = opts?.ctx ?? scriptCtx;
    const result =
      opts?.mode === "reference" ? validateReferenceExpression(value, ctx) : validateCondition(value, ctx);
    const errors = result.diagnostics.filter((d) => d.severity === "error");
    if (errors.length) findings.push({ location, field, expression: value, errors, entity: opts?.entity });
  };

  for (const screen of (script?.screens || []) as any[]) {
    const loc = `Screen "${screen?.title || screen?.key || screen?.screenId || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "screen", screenId: screen?.screenId };
    check(screen?.condition, "condition", loc, { entity });
    check(screen?.skipToCondition, "skipToCondition", loc, { entity });
    for (const field of (screen?.fields || []) as any[]) {
      const fieldLoc = `${loc} > field "${field?.key || field?.label || ""}"`;
      check(field?.condition, "field.condition", fieldLoc, { entity });
      check(field?.calculation, "field.calculation", fieldLoc, { mode: "reference", entity });
    }
  }

  for (const diagnosis of (script?.diagnoses || []) as any[]) {
    check(diagnosis?.expression, "expression", `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}"`, {
      entity: { kind: "diagnosis", diagnosisId: diagnosis?.diagnosisId },
    });
  }

  for (const problem of (script?.problems || []) as any[]) {
    check(problem?.expression, "expression", `Problem "${problem?.name || problem?.key || ""}"`, {
      entity: { kind: "problem", problemId: problem?.problemId },
    });
  }

  for (const item of (script?.drugsLibrary || []) as any[]) {
    const loc = `Drug/Fluid "${item?.drug || item?.fluid || item?.key || ""}"`;
    check(item?.condition, "condition", loc, { ctx: syntaxOnlyCtx, entity: { kind: "drug" } });
    check(item?.calculator_condition, "calculator_condition", loc, { ctx: syntaxOnlyCtx, entity: { kind: "drug" } });
  }

  for (const field of nuidFields) {
    check(field?.condition, "condition", `NUID search field "${field?.key || field?.label || ""}"`, {
      ctx: nuidCtx,
      entity: { kind: "nuid" },
    });
  }

  const eligibility = script?.eligibilityCriteria;
  if (eligibility) {
    check(eligibility?.criteria_condition, "criteria_condition", "Eligibility criteria", { ctx: nuidCtx, entity: { kind: "eligibility" } });
    check(eligibility?.alternative_criteria_condition, "alternative_criteria_condition", "Eligibility criteria (alternative)", { ctx: nuidCtx, entity: { kind: "eligibility" } });
  }

  return findings;
}

/**
 * The number of DISTINCT expressions with a blocking error across a script —
 * drives the script-level badge count.
 */
export function getScriptConditionErrorCount(script: ScriptWithItems): number {
  return collectScriptConditionFindings(script).length;
}
