import type { Node } from "./ast";
import { parse } from "./parser";
import type { ScriptConditionEntityRef, ScriptWithItems } from "./collect";
import type { OutcomeCollectionName } from "./script-outcomes";

export type OutcomeReferenceFinding = {
  location: string;
  field: string;
  expression: string;
  occurrences: number;
  entity?: ScriptConditionEntityRef;
};

export type OutcomeReferenceRewrite = {
  expression: string;
  occurrences: number;
};

type LiteralSpan = { start: number; end: number; value: string };

function quoteOutcomeValue(value: string): string {
  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;
  if (!value.includes("`")) return `\`${value}\``;
  throw new Error("Cannot safely rewrite an outcome key containing single quotes, double quotes, and backticks.");
}

function outcomeLiteralSpans(expression: string, collection: OutcomeCollectionName): LiteralSpan[] {
  const { ast } = parse(expression || "");
  const spans: LiteralSpan[] = [];

  const addLiteral = (node: Node) => {
    if (node.type !== "Literal" || node.valueType !== "string" || node.bare) return;
    spans.push({ start: node.start, end: node.end, value: `${node.value}` });
  };

  const addValueNode = (node: Node) => {
    if (node.type === "Array") node.items.forEach(addLiteral);
    else addLiteral(node);
  };

  const walk = (node: Node): void => {
    switch (node.type) {
      case "Program":
        node.lines.forEach(walk);
        break;
      case "Logical":
        walk(node.left);
        walk(node.right);
        break;
      case "Group":
      case "Not":
        walk(node.expr);
        break;
      case "Membership":
        if (node.target.type === "Var" && node.target.name.toLowerCase() === collection.toLowerCase()) {
          node.values.forEach(addLiteral);
        }
        break;
      case "Comparison":
        if (node.left.type === "Var" && node.left.name.toLowerCase() === collection.toLowerCase()) {
          addValueNode(node.right);
        }
        break;
      default:
        break;
    }
  };

  walk(ast);
  const unique = new Map(spans.map((span) => [`${span.start}:${span.end}`, span]));
  return Array.from(unique.values()).sort((a, b) => a.start - b.start);
}

function replacementFor(source: string, span: LiteralSpan, value: string): string {
  const delimiter = source[span.start];
  if (["'", '"', "`"].includes(delimiter) && !value.includes(delimiter)) {
    return `${delimiter}${value}${delimiter}`;
  }
  return quoteOutcomeValue(value);
}

/** Rewrites only values bound to the requested virtual collection. */
export function rewriteOutcomeValueReferences(
  expression: string,
  collection: OutcomeCollectionName,
  oldValue: string,
  newValue: string,
): OutcomeReferenceRewrite {
  const matches = outcomeLiteralSpans(expression, collection)
    .filter((span) => span.value.toLowerCase() === oldValue.toLowerCase());
  if (!matches.length) return { expression, occurrences: 0 };

  let next = expression;
  [...matches].reverse().forEach((span) => {
    next = `${next.slice(0, span.start)}${replacementFor(expression, span, newValue)}${next.slice(span.end)}`;
  });
  return { expression: next, occurrences: matches.length };
}

function referenceCount(expression: unknown, collection: OutcomeCollectionName, values: Set<string>): number {
  const source = `${expression ?? ""}`;
  if (!source.trim()) return 0;
  return outcomeLiteralSpans(source, collection)
    .filter((span) => !values.size || values.has(span.value.toLowerCase()))
    .length;
}

export function collectScriptOutcomeReferences(
  script: ScriptWithItems,
  collection: OutcomeCollectionName,
  values: string[] = [],
  exclude?: { diagnosisIds?: string[]; problemIds?: string[] },
): OutcomeReferenceFinding[] {
  const wanted = new Set(values.map((value) => `${value}`.toLowerCase()));
  const excludedDiagnoses = new Set(exclude?.diagnosisIds || []);
  const excludedProblems = new Set(exclude?.problemIds || []);
  const findings: OutcomeReferenceFinding[] = [];

  const check = (expression: unknown, field: string, location: string, entity?: ScriptConditionEntityRef) => {
    const source = `${expression ?? ""}`;
    const occurrences = referenceCount(source, collection, wanted);
    if (occurrences) findings.push({ location, field, expression: source, occurrences, entity });
  };

  (script?.screens || []).forEach((screen: any) => {
    const location = `Screen "${screen?.title || screen?.key || screen?.screenId || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "screen", screenId: screen?.screenId };
    check(screen?.condition, "condition", location, entity);
    check(screen?.skipToCondition, "skipToCondition", location, entity);
    (screen?.fields || []).forEach((field: any) => {
      check(field?.condition, "field.condition", `${location} > field "${field?.label || field?.key || ""}"`, entity);
    });
    (screen?.items || []).forEach((item: any) => {
      check(item?.condition, "item.condition", `${location} > item "${item?.label || item?.key || ""}"`, entity);
    });
  });
  (script?.diagnoses || []).forEach((diagnosis: any) => {
    if (excludedDiagnoses.has(`${diagnosis?.diagnosisId || ""}`)) return;
    const location = `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}"`;
    const entity: ScriptConditionEntityRef = {
      kind: "diagnosis",
      diagnosisId: diagnosis?.diagnosisId,
    };
    check(diagnosis?.expression, "expression", location, entity);
    (diagnosis?.symptoms || []).forEach((symptom: any) => {
      check(symptom?.expression, "symptom.expression", `${location} > symptom "${symptom?.name || symptom?.key || ""}"`, entity);
    });
  });
  (script?.problems || []).forEach((problem: any) => {
    if (excludedProblems.has(`${problem?.problemId || ""}`)) return;
    const location = `Problem "${problem?.name || problem?.key || ""}"`;
    const entity: ScriptConditionEntityRef = {
      kind: "problem",
      problemId: problem?.problemId,
    };
    check(problem?.expression, "expression", location, entity);
    (problem?.symptoms || []).forEach((symptom: any) => {
      check(symptom?.expression, "symptom.expression", `${location} > symptom "${symptom?.name || symptom?.key || ""}"`, entity);
    });
  });
  (script?.nuidSearchFields || []).forEach((field: any) => {
    check(field?.condition, "condition", `NUID search field "${field?.label || field?.key || ""}"`, { kind: "nuid" });
  });
  const eligibility: any = script?.eligibilityCriteria;
  check(eligibility?.criteria_condition, "criteria_condition", "Eligibility criteria", { kind: "eligibility" });
  check(eligibility?.alternative_criteria_condition, "alternative_criteria_condition", "Eligibility criteria (alternative)", { kind: "eligibility" });

  return findings;
}

export type ScriptOutcomeReferencePatches = {
  screens: any[];
  diagnoses: any[];
  problems: any[];
  script?: any;
  findings: OutcomeReferenceFinding[];
  occurrences: number;
};

/** Builds minimal draft patches for a semantics-preserving outcome-key rename. */
export function buildScriptOutcomeReferencePatches(
  script: ScriptWithItems,
  collection: OutcomeCollectionName,
  oldValue: string,
  newValue: string,
): ScriptOutcomeReferencePatches {
  const findings = collectScriptOutcomeReferences(script, collection, [oldValue]);
  const rewrite = (value: unknown) => rewriteOutcomeValueReferences(`${value ?? ""}`, collection, oldValue, newValue);
  const screenPatches: any[] = [];
  const diagnosisPatches: any[] = [];
  const problemPatches: any[] = [];

  (script?.screens || []).forEach((screen: any) => {
    const condition = rewrite(screen?.condition);
    const skip = rewrite(screen?.skipToCondition);
    let fieldsChanged = false;
    const fields = (screen?.fields || []).map((field: any) => {
      const result = rewrite(field?.condition);
      if (!result.occurrences) return field;
      fieldsChanged = true;
      return { ...field, condition: result.expression };
    });
    let itemsChanged = false;
    const items = (screen?.items || []).map((item: any) => {
      const result = rewrite(item?.condition);
      if (!result.occurrences) return item;
      itemsChanged = true;
      return { ...item, condition: result.expression };
    });
    if (condition.occurrences || skip.occurrences || fieldsChanged || itemsChanged) {
      screenPatches.push({
        screenId: screen?.screenId,
        scriptId: screen?.scriptId || script?.scriptId,
        ...(condition.occurrences ? { condition: condition.expression } : {}),
        ...(skip.occurrences ? { skipToCondition: skip.expression } : {}),
        ...(fieldsChanged ? { fields } : {}),
        ...(itemsChanged ? { items } : {}),
      });
    }
  });

  (script?.diagnoses || []).forEach((diagnosis: any) => {
    const result = rewrite(diagnosis?.expression);
    let symptomsChanged = false;
    const symptoms = (diagnosis?.symptoms || []).map((symptom: any) => {
      const symptomResult = rewrite(symptom?.expression);
      if (!symptomResult.occurrences) return symptom;
      symptomsChanged = true;
      return { ...symptom, expression: symptomResult.expression };
    });
    if (result.occurrences || symptomsChanged) diagnosisPatches.push({
      diagnosisId: diagnosis?.diagnosisId,
      scriptId: diagnosis?.scriptId || script?.scriptId,
      ...(result.occurrences ? { expression: result.expression } : {}),
      ...(symptomsChanged ? { symptoms } : {}),
    });
  });
  (script?.problems || []).forEach((problem: any) => {
    const result = rewrite(problem?.expression);
    let symptomsChanged = false;
    const symptoms = (problem?.symptoms || []).map((symptom: any) => {
      const symptomResult = rewrite(symptom?.expression);
      if (!symptomResult.occurrences) return symptom;
      symptomsChanged = true;
      return { ...symptom, expression: symptomResult.expression };
    });
    if (result.occurrences || symptomsChanged) problemPatches.push({
      problemId: problem?.problemId,
      scriptId: problem?.scriptId || script?.scriptId,
      ...(result.occurrences ? { expression: result.expression } : {}),
      ...(symptomsChanged ? { symptoms } : {}),
    });
  });

  let scriptPatch: any;
  let scriptChanged = false;
  const nuidSearchFields = (script?.nuidSearchFields || []).map((field: any) => {
    const result = rewrite(field?.condition);
    if (!result.occurrences) return field;
    scriptChanged = true;
    return { ...field, condition: result.expression };
  });
  const eligibility: any = script?.eligibilityCriteria;
  const criteria = rewrite(eligibility?.criteria_condition);
  const alternative = rewrite(eligibility?.alternative_criteria_condition);
  if (criteria.occurrences || alternative.occurrences) scriptChanged = true;
  if (scriptChanged) {
    scriptPatch = {
      scriptId: script?.scriptId,
      nuidSearchFields,
      eligibilityCriteria: eligibility ? {
        ...eligibility,
        ...(criteria.occurrences ? { criteria_condition: criteria.expression } : {}),
        ...(alternative.occurrences ? { alternative_criteria_condition: alternative.expression } : {}),
      } : eligibility,
    };
  }

  return {
    screens: screenPatches,
    diagnoses: diagnosisPatches,
    problems: problemPatches,
    script: scriptPatch,
    findings,
    occurrences: findings.reduce((sum, finding) => sum + finding.occurrences, 0),
  };
}
