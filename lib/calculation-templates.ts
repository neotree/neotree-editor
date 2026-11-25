// Calculation templates: named, reusable formulas written in plain language with {placeholders}
// for the keys a user picks, e.g. "{weight} divided by ({height} divided by 100) squared".
// Stored in the database (editable by administrators); applying one fills the placeholders with $keys
// and compiles the result with the normal calculation compiler, so a template can never produce a
// formula the editor wouldn't accept.
//
// Pure and dependency-free so it can be shared by the server actions, the admin form and the tests.

import { compileCalculation, type ConditionKey } from "@/lib/conditional-expression";

export type TemplateResultType = "number" | "date";

export interface CalculationTemplateInput {
  /** Placeholder name used in the formula as {id}: lowercase letters, digits and underscores. */
  id: string;
  /** What the user sees, e.g. "Weight (kg)". */
  label: string;
  /** Which keys may be chosen. */
  type: TemplateResultType;
}

export interface CalculationTemplateData {
  name: string;
  description: string;
  resultType: TemplateResultType;
  /** Plain language with {placeholders}. */
  formula: string;
  inputs: CalculationTemplateInput[];
}

export interface CalculationTemplate extends CalculationTemplateData {
  templateId: string;
  slug: string;
  sortOrder: number;
}

export const TEMPLATE_INPUT_ID = /^[a-z][a-z0-9_]{0,31}$/;
const PLACEHOLDER = /\{([^{}]*)\}/g;

const NUMBER_BAD_TYPES = new Set(["date", "datetime", "time", "text", "string", "multi_select", "boolean"]);

/** Whether a key of this data type may be chosen for an input of the given type. Unknown types are allowed. */
export function isKeyCompatible(dataType: string | null | undefined, type: TemplateResultType): boolean {
  const dt = `${dataType || ""}`.toLowerCase();
  if (!dt) return true;
  return type === "date" ? dt === "date" || dt === "datetime" : !NUMBER_BAD_TYPES.has(dt);
}

export function getCompatibleKeys(keys: ConditionKey[], type: TemplateResultType): ConditionKey[] {
  return keys.filter((k) => isKeyCompatible(k.dataType, type));
}

/** Placeholder ids used in a formula, in first-use order, without duplicates. */
export function getPlaceholders(formula: string): string[] {
  const seen: string[] = [];
  for (const m of (formula || "").matchAll(PLACEHOLDER)) if (!seen.includes(m[1])) seen.push(m[1]);
  return seen;
}

/** Replaces {id} with $Key. Placeholders without a chosen key are left as they are. */
export function fillTemplate(formula: string, mapping: Record<string, string | undefined>): string {
  return (formula || "").replace(PLACEHOLDER, (whole, id: string) => (mapping[id] ? `$${mapping[id]}` : whole));
}

export interface TemplateIssue { field: "name" | "formula" | "inputs"; message: string }

/**
 * Checks a template before it is saved. The formula is compiled with stand-in keys of the declared
 * types, so anything the calculation editor would reject (unknown function, dangling operator,
 * a date mixed with numbers...) is rejected here with the editor's own message.
 */
export function validateTemplate(t: Partial<CalculationTemplateData>): TemplateIssue[] {
  const issues: TemplateIssue[] = [];
  const name = (t.name || "").trim();
  const formula = (t.formula || "").trim();
  const inputs = t.inputs || [];

  if (!name) issues.push({ field: "name", message: "Give the template a name." });
  else if (name.length > 80) issues.push({ field: "name", message: "The name must be 80 characters or fewer." });
  if (t.resultType !== "number" && t.resultType !== "date") issues.push({ field: "formula", message: "Choose whether the result is a number or a date." });
  if (!formula) { issues.push({ field: "formula", message: "Write the formula." }); }
  if (!inputs.length) issues.push({ field: "inputs", message: "Add at least one input." });

  const ids = new Set<string>();
  for (const i of inputs) {
    if (!TEMPLATE_INPUT_ID.test(i.id || "")) issues.push({ field: "inputs", message: `"${i.id || ""}" isn't a valid input id. Use lowercase letters, digits and underscores, starting with a letter.` });
    else if (ids.has(i.id)) issues.push({ field: "inputs", message: `The input id "${i.id}" is used twice.` });
    ids.add(i.id);
    if (!(i.label || "").trim()) issues.push({ field: "inputs", message: `Give the input "${i.id}" a label.` });
    if (i.type !== "number" && i.type !== "date") issues.push({ field: "inputs", message: `Choose a type for the input "${i.id}".` });
  }
  if (issues.length) return issues;

  const used = getPlaceholders(formula);
  for (const id of used) if (!ids.has(id)) issues.push({ field: "formula", message: `{${id}} in the formula isn't one of the inputs.` });
  for (const id of ids) if (!used.includes(id)) issues.push({ field: "inputs", message: `The input "${id}" isn't used in the formula. Add {${id}} to it or remove the input.` });
  if (issues.length) return issues;

  const keys: ConditionKey[] = inputs.map((i) => ({ name: `Input_${i.id}`, dataType: i.type }));
  const result = compileCalculation(fillTemplate(formula, Object.fromEntries(inputs.map((i) => [i.id, `Input_${i.id}`]))), { keys });
  const err = result.diagnostics.find((d) => d.severity === "error");
  if (err) issues.push({ field: "formula", message: err.message });
  return issues;
}

/**
 * The formula to put in the editor for a template and the keys the user chose, or the reason it can't
 * be built yet. The caller still validates it with the editor's usual checks.
 */
export function applyTemplate(
  t: Pick<CalculationTemplateData, "formula" | "inputs">,
  mapping: Record<string, string | undefined>,
  keys: ConditionKey[],
): { ok: true; formula: string } | { ok: false; error: string } {
  const missing = t.inputs.filter((i) => !mapping[i.id]);
  if (missing.length) return { ok: false, error: `Choose a key for ${missing.map((m) => m.label).join(", ")}.` };
  const result = compileCalculation(fillTemplate(t.formula, mapping), { keys });
  const err = result.diagnostics.find((d) => d.severity === "error");
  return err ? { ok: false, error: err.message } : { ok: true, formula: result.formula };
}

/** Turns a name into a stable lowercase slug ("Body surface area" -> "body-surface-area"). */
export function slugify(name: string): string {
  return (name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "template";
}

/**
 * The templates created by the migration. Kept here so tests prove each one compiles to the right
 * answer, and that the SQL seed matches. Administrators may edit or delete the stored copies freely.
 */
export const DEFAULT_CALCULATION_TEMPLATES: (CalculationTemplateData & { slug: string; sortOrder: number })[] = [
  {
    slug: "bmi", sortOrder: 10, resultType: "number", name: "BMI",
    description: "Body mass index: weight in kilograms divided by height in metres squared.",
    formula: "{weight} divided by ({height} divided by 100) squared",
    inputs: [{ id: "weight", label: "Weight (kg)", type: "number" }, { id: "height", label: "Height (cm)", type: "number" }],
  },
  {
    slug: "bsa", sortOrder: 20, resultType: "number", name: "Body surface area (Mosteller)",
    description: "Square root of (height in cm × weight in kg ÷ 3600), in m².",
    formula: "square root of ({height} times {weight} divided by 3600)",
    inputs: [{ id: "height", label: "Height (cm)", type: "number" }, { id: "weight", label: "Weight (kg)", type: "number" }],
  },
  {
    slug: "map", sortOrder: 30, resultType: "number", name: "Mean arterial pressure (MAP)",
    description: "Diastolic plus one third of the pulse pressure (systolic minus diastolic).",
    formula: "{diastolic} plus ({systolic} minus {diastolic}) divided by 3",
    inputs: [{ id: "systolic", label: "Systolic BP (mmHg)", type: "number" }, { id: "diastolic", label: "Diastolic BP (mmHg)", type: "number" }],
  },
  {
    slug: "edd", sortOrder: 40, resultType: "date", name: "Expected date of delivery (EDD)",
    description: "Last menstrual period plus 280 days (Naegele's rule).",
    formula: "{lmp} + 280 days",
    inputs: [{ id: "lmp", label: "Last menstrual period (date)", type: "date" }],
  },
];
