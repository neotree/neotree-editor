import type { Diagnostic, ValidationContext } from "./ast";
import { toConditionKeys } from "./keys";
import { mergeConditionKeys } from "./merge-keys";
import { validateCondition } from "./index";
import { validateReferenceExpression } from "./reference-expr";
import { buildScriptConditionKeys } from "./script-keys";
import { collectOutcomeKeyCollisions, getOutcomeProducers, getPreScriptUnavailableOutcomeKeys, getUnavailableOutcomeKeys } from "./script-outcomes";

export interface ScriptWithItems {
  scriptId?: string;
  hospitalId?: string | null;
  title?: string;
  name?: string;
  dataKeys?: any[];
  configurationKeys?: any[];
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

export interface ScriptConditionVisit {
  expression: unknown;
  field: string;
  location: string;
  entity: ScriptConditionEntityRef;
  /** Which key set the expression resolves against. */
  scope: "script" | "nuid" | "syntax";
  mode?: "boolean" | "reference";
  consumerPosition?: number | null;
  /** For a diagnosis or problem expression: how many symptoms it has. */
  symptoms?: number;
}

export function hrefForConditionEntity(scriptId: string, entity?: ScriptConditionEntityRef): string {
  if (!entity) return `/script/${scriptId}`;
  switch (entity.kind) {
    case "screen":
      return entity.screenId ? `/script/${scriptId}/screen/${entity.screenId}` : `/script/${scriptId}?section=screens`;
    case "diagnosis":
      return entity.diagnosisId ? `/script/${scriptId}/diagnosis/${entity.diagnosisId}` : `/script/${scriptId}?section=diagnoses`;
    case "problem":
      return entity.problemId ? `/script/${scriptId}/problem/${entity.problemId}` : `/script/${scriptId}?section=diagnoses`;
    default:
      return `/script/${scriptId}`;
  }
}

/**
 * Visits every conditional expression in a script, raw (unvalidated and untrimmed).
 * Shared by the static evaluator below and the runtime-failure locator (locate.ts),
 * so both agree on where expressions live.
 */
export function walkScriptConditions(script: ScriptWithItems, visit: (v: ScriptConditionVisit) => void): void {
  for (const screen of (script?.screens || []) as any[]) {
    const loc = `Screen "${screen?.title || screen?.key || screen?.screenId || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "screen", screenId: screen?.screenId };
    const consumerPosition = screen?.position;
    visit({ expression: screen?.condition, field: "condition", location: loc, entity, scope: "script", consumerPosition });
    visit({ expression: screen?.skipToCondition, field: "skipToCondition", location: loc, entity, scope: "script", consumerPosition });
    for (const field of (screen?.fields || []) as any[]) {
      const fieldLoc = `${loc} > field "${field?.key || field?.label || ""}"`;
      visit({ expression: field?.condition, field: "field.condition", location: fieldLoc, entity, scope: "script", consumerPosition });
      visit({ expression: field?.calculation, field: "field.calculation", location: fieldLoc, entity, scope: "script", mode: "reference", consumerPosition });
      for (const item of (field?.items || []) as any[]) {
        if (!`${item?.condition ?? ""}`.trim()) continue;
        visit({
          expression: item.condition,
          field: "item.condition",
          location: `${fieldLoc} > option "${item?.value || item?.label || ""}"`,
          entity,
          scope: "script",
          consumerPosition,
        });
      }
    }
    for (const item of (screen?.items || []) as any[]) {
      const itemLoc = `${loc} > item "${item?.key || item?.label || ""}"`;
      visit({ expression: item?.condition, field: "item.condition", location: itemLoc, entity, scope: "script", consumerPosition });
    }
  }

  const outcomeProducers = getOutcomeProducers(script?.screens || []);
  const producerPosition = (collection: "Diagnoses" | "Problems") => {
    const position = outcomeProducers[collection]?.position;
    return position === null || position === undefined || !Number.isFinite(Number(position)) ? null : Number(position);
  };

  const diagnosisPosition = producerPosition("Diagnoses");
  for (const diagnosis of (script?.diagnoses || []) as any[]) {
    const location = `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "diagnosis", diagnosisId: diagnosis?.diagnosisId };
    visit({ expression: diagnosis?.expression, field: "expression", location, entity, scope: "script", consumerPosition: diagnosisPosition, symptoms: (diagnosis?.symptoms || []).length });
    for (const symptom of (diagnosis?.symptoms || []) as any[]) {
      visit({
        expression: symptom?.expression,
        field: "symptom.expression",
        location: `${location} > symptom "${symptom?.name || symptom?.key || ""}"`,
        entity,
        scope: "script",
        consumerPosition: diagnosisPosition,
      });
    }
  }

  const problemPosition = producerPosition("Problems");
  for (const problem of (script?.problems || []) as any[]) {
    const location = `Problem "${problem?.name || problem?.key || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "problem", problemId: problem?.problemId };
    visit({ expression: problem?.expression, field: "expression", location, entity, scope: "script", consumerPosition: problemPosition, symptoms: (problem?.symptoms || []).length });
    for (const symptom of (problem?.symptoms || []) as any[]) {
      visit({
        expression: symptom?.expression,
        field: "symptom.expression",
        location: `${location} > symptom "${symptom?.name || symptom?.key || ""}"`,
        entity,
        scope: "script",
        consumerPosition: problemPosition,
      });
    }
  }

  for (const item of (script?.drugsLibrary || []) as any[]) {
    const location = `Drug/Fluid "${item?.drug || item?.fluid || item?.key || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "drug" };
    visit({ expression: item?.condition, field: "condition", location, entity, scope: "syntax" });
    visit({ expression: item?.calculator_condition, field: "calculator_condition", location, entity, scope: "syntax" });
  }

  for (const field of (script?.nuidSearchFields || []) as any[]) {
    visit({
      expression: field?.condition,
      field: "condition",
      location: `NUID search field "${field?.key || field?.label || ""}"`,
      entity: { kind: "nuid" },
      scope: "nuid",
    });
  }

  const eligibility = script?.eligibilityCriteria;
  if (eligibility) {
    const entity: ScriptConditionEntityRef = { kind: "eligibility" };
    visit({ expression: eligibility?.criteria_condition, field: "criteria_condition", location: "Eligibility criteria", entity, scope: "nuid" });
    visit({ expression: eligibility?.alternative_criteria_condition, field: "alternative_criteria_condition", location: "Eligibility criteria (alternative)", entity, scope: "nuid" });
  }
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
 * - Callers provide an authoritative, fully loaded script catalogue, so an
 *   empty key set is still validated and unknown/availability errors apply.
 *   Drug conditions remain intentionally syntax-only.
 */
export function collectScriptConditionFindings(script: ScriptWithItems): ScriptConditionFinding[] {
  const keys = buildScriptConditionKeys({
    dataKeys: script?.dataKeys || [],
    configurationKeys: script?.configurationKeys || [],
    diagnoses: script?.diagnoses || [],
    problems: script?.problems || [],
    screens: script?.screens || [],
  });
  const scriptCtx: ValidationContext = { keys, allowSelf: true, skipKeyResolution: false };
  const syntaxOnlyCtx: ValidationContext = { keys: [], allowSelf: true, skipKeyResolution: true };

  const nuidKeys = toConditionKeys(script?.nuidDataKeys || []);
  const nuidMergedKeys = nuidKeys.length ? mergeConditionKeys(keys, nuidKeys) : keys;
  const nuidCtx: ValidationContext = {
    keys: nuidMergedKeys,
    allowSelf: true,
    skipKeyResolution: false,
  };
  const outcomeProducers = getOutcomeProducers(script?.screens || []);
  const unavailableByPosition = new Map<string, Record<string, string>>();
  const unavailableAt = (consumerPosition?: number | null) => {
    const position = consumerPosition === null || consumerPosition === undefined
      ? Number.NaN
      : Number(consumerPosition);
    if (!Number.isFinite(position)) return {};
    const cacheKey = `${position}`;
    const cached = unavailableByPosition.get(cacheKey);
    if (cached) return cached;
    const unavailable = getUnavailableOutcomeKeys({
      screens: script?.screens || [],
      consumerPosition: position,
      producers: outcomeProducers,
    });
    unavailableByPosition.set(cacheKey, unavailable);
    return unavailable;
  };

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
    // As written: an empty line at the start or end, or a condition of only spaces, fails on tablets.
    const value = `${expression ?? ""}`;
    if (!value) return;
    const baseCtx = opts?.ctx ?? scriptCtx;
    const ctx = baseCtx === syntaxOnlyCtx ? baseCtx : {
      ...baseCtx,
      unavailableKeys: baseCtx.unavailableKeys ?? unavailableAt(opts?.consumerPosition),
    };
    const result =
      opts?.mode === "reference" ? validateReferenceExpression(value, ctx) : validateCondition(value, ctx);
    const errors = result.diagnostics.filter((d) => d.severity === "error");
    if (errors.length) findings.push({ location, field, expression: value, errors, entity: opts?.entity });
  };

  const nuidScopeCtx = (): ValidationContext => ({ ...nuidCtx, unavailableKeys: getPreScriptUnavailableOutcomeKeys() });
  walkScriptConditions(script, (v) => {
    if (v.symptoms && !v.expression) {
      findings.push({
        location: v.location,
        field: v.field,
        expression: "",
        entity: v.entity,
        errors: [{
          severity: "error",
          code: "EMPTY_OUTCOME_EXPRESSION",
          message: "Add an expression, or remove the symptoms: with symptoms and no expression, tablets never suggest it.",
          start: 0,
          end: 0,
        }],
      });
      return;
    }
    check(v.expression, v.field, v.location, {
      mode: v.mode,
      ctx: v.scope === "syntax" ? syntaxOnlyCtx : v.scope === "nuid" ? nuidScopeCtx() : undefined,
      entity: v.entity,
      consumerPosition: v.consumerPosition,
    });
  });

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
