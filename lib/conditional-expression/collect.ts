import type { ConditionKey, Diagnostic, ValidationContext } from "./ast";
import { toConditionKeys } from "./keys";
import { mergeConditionKeys } from "./merge-keys";
import { validateCondition } from "./index";
import { validateReferenceExpression } from "./reference-expr";
import { buildScriptConditionKeys } from "./script-keys";
import { collectOutcomeKeyCollisions, getOutcomeProducer, getPreScriptUnavailableOutcomeKeys, getUnavailableOutcomeKeys } from "./script-outcomes";

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
  const keys = buildScriptConditionKeys({
    dataKeys: script?.dataKeys || [],
    diagnoses: script?.diagnoses || [],
    problems: script?.problems || [],
    screens: script?.screens || [],
  });
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
    opts?: {
      mode?: "boolean" | "reference";
      ctx?: ValidationContext;
      entity?: ScriptConditionEntityRef;
      consumerPosition?: number | null;
    },
  ) => {
    const value = `${expression ?? ""}`.trim();
    if (!value) return;
    const baseCtx = opts?.ctx ?? scriptCtx;
    const ctx = baseCtx === syntaxOnlyCtx ? baseCtx : {
      ...baseCtx,
      unavailableKeys: baseCtx.unavailableKeys ?? getUnavailableOutcomeKeys({
        screens: script?.screens || [],
        consumerPosition: opts?.consumerPosition,
      }),
    };
    const result =
      opts?.mode === "reference" ? validateReferenceExpression(value, ctx) : validateCondition(value, ctx);
    const errors = result.diagnostics.filter((d) => d.severity === "error");
    if (errors.length) findings.push({ location, field, expression: value, errors, entity: opts?.entity });
  };

  for (const screen of (script?.screens || []) as any[]) {
    const loc = `Screen "${screen?.title || screen?.key || screen?.screenId || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "screen", screenId: screen?.screenId };
    check(screen?.condition, "condition", loc, { entity, consumerPosition: screen?.position });
    check(screen?.skipToCondition, "skipToCondition", loc, { entity, consumerPosition: screen?.position });
    for (const field of (screen?.fields || []) as any[]) {
      const fieldLoc = `${loc} > field "${field?.key || field?.label || ""}"`;
      check(field?.condition, "field.condition", fieldLoc, { entity, consumerPosition: screen?.position });
      check(field?.calculation, "field.calculation", fieldLoc, { mode: "reference", entity, consumerPosition: screen?.position });
    }
    for (const item of (screen?.items || []) as any[]) {
      const itemLoc = `${loc} > item "${item?.key || item?.label || ""}"`;
      check(item?.condition, "item.condition", itemLoc, { entity, consumerPosition: screen?.position });
    }
  }

  for (const diagnosis of (script?.diagnoses || []) as any[]) {
    const producer = getOutcomeProducer(script?.screens || [], "Diagnoses");
    const location = `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "diagnosis", diagnosisId: diagnosis?.diagnosisId };
    check(diagnosis?.expression, "expression", `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}"`, {
      entity,
      consumerPosition: Number(producer?.position),
    });
    for (const symptom of (diagnosis?.symptoms || []) as any[]) {
      check(symptom?.expression, "symptom.expression", `${location} > symptom "${symptom?.name || symptom?.key || ""}"`, {
        entity,
        consumerPosition: Number(producer?.position),
      });
    }
  }

  for (const problem of (script?.problems || []) as any[]) {
    const producer = getOutcomeProducer(script?.screens || [], "Problems");
    const location = `Problem "${problem?.name || problem?.key || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "problem", problemId: problem?.problemId };
    check(problem?.expression, "expression", location, {
      entity,
      consumerPosition: Number(producer?.position),
    });
    for (const symptom of (problem?.symptoms || []) as any[]) {
      check(symptom?.expression, "symptom.expression", `${location} > symptom "${symptom?.name || symptom?.key || ""}"`, {
        entity,
        consumerPosition: Number(producer?.position),
      });
    }
  }

  for (const item of (script?.drugsLibrary || []) as any[]) {
    const loc = `Drug/Fluid "${item?.drug || item?.fluid || item?.key || ""}"`;
    check(item?.condition, "condition", loc, { ctx: syntaxOnlyCtx, entity: { kind: "drug" } });
    check(item?.calculator_condition, "calculator_condition", loc, { ctx: syntaxOnlyCtx, entity: { kind: "drug" } });
  }

  for (const field of nuidFields) {
    check(field?.condition, "condition", `NUID search field "${field?.key || field?.label || ""}"`, {
      ctx: { ...nuidCtx, unavailableKeys: getPreScriptUnavailableOutcomeKeys() },
      entity: { kind: "nuid" },
    });
  }

  const eligibility = script?.eligibilityCriteria;
  if (eligibility) {
    check(eligibility?.criteria_condition, "criteria_condition", "Eligibility criteria", { ctx: { ...nuidCtx, unavailableKeys: getPreScriptUnavailableOutcomeKeys() }, entity: { kind: "eligibility" } });
    check(eligibility?.alternative_criteria_condition, "alternative_criteria_condition", "Eligibility criteria (alternative)", { ctx: { ...nuidCtx, unavailableKeys: getPreScriptUnavailableOutcomeKeys() }, entity: { kind: "eligibility" } });
  }

  for (const collision of collectOutcomeKeyCollisions(script)) {
    findings.push({
      location: collision.location,
      field: "key",
      expression: `$${collision.collection}`,
      entity: collision.entity,
      errors: [{
        severity: "error",
        code: "RESERVED_KEY_COLLISION",
        message: collision.message,
        start: 0,
        end: collision.collection.length + 1,
      }],
    });
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
