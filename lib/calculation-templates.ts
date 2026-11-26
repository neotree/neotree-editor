// Calculation templates: named, reusable formulas written in plain language with {placeholders}
// for the keys a user picks, e.g. "{weight} divided by ({height} divided by 100) squared".
// Stored in the database (editable by administrators); applying one fills the placeholders with $keys
// and compiles the result with the normal calculation compiler, so a template can never produce a
// formula the editor wouldn't accept.
//
// Pure and dependency-free so it can be shared by the server actions, the admin form and the tests.

import { compileCalculation, evaluateCalculation, type ConditionKey } from "@/lib/conditional-expression";

export type TemplateResultType = "number" | "date";

export interface CalculationTemplateInput {
  /** Placeholder name used in the formula as {id}: lowercase letters, digits and underscores. */
  id: string;
  /** What the user sees, e.g. "Weight (kg)". */
  label: string;
  /** Which keys may be chosen. */
  type: TemplateResultType;
}

/**
 * A worked example the template must reproduce before it can be saved: sample values for the inputs and
 * the answer the author expects. It proves the formula means what its author meant, which the grammar
 * check alone can't.
 */
export interface CalculationTemplateExample {
  /** Sample value for each input id: a number, or a date as YYYY-MM-DD. */
  values: Record<string, string>;
  /** The expected answer: a number (as many decimals as you type are compared) or a date. */
  expected: string;
}

export interface CalculationTemplateData {
  name: string;
  description: string;
  resultType: TemplateResultType;
  /** Plain language with {placeholders}. */
  formula: string;
  inputs: CalculationTemplateInput[];
  /** Required when saving; older templates saved before this existed may not have one. */
  example?: CalculationTemplateExample | null;
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

export interface TemplateIssue { field: "name" | "formula" | "inputs" | "example"; message: string }

/**
 * The formula compiler's messages are written for people editing a field, with `$keys`. A template author
 * writes `{inputs}` and a fixed set of words, so say it that way.
 */
export function friendlyTemplateMessage(message: string): string {
  return message
    .replace(/Unexpected "([^"]+)" after "([^"]+)"\. Add an operator \(\+, -, \*, \/\) between values\./,
      '"$1" isn\'t a word the formula understands (it comes after $2). Join values with plus, minus, times or divided by. See "Words you can use".')
    .replace(/Unexpected "([^"]+)"\. Keys must start with "\$" \(for example \$[^)]*\)\./,
      '"$1" isn\'t a word the formula understands. Put values to choose in {braces}, and use the words under "Words you can use".')
    .replace(/Unexpected character "(.)"\./, 'The character "$1" can\'t be used. Use words such as divided by, or the symbols + - * / %.')
    .replace(/Put an operator \(\+, -, \*, \/\) before the function\./, 'Put plus, minus, times or divided by before the function.')
    .replace(/Input_([a-z][a-z0-9_]*)/g, '{$1}');
}

const decimalsOf = (text: string) => (text.trim().split(".")[1] || "").length;
const trimNumber = (n: number) => `${Number(n.toPrecision(6))}`;

/**
 * Runs the formula on the example's sample values and compares the answer with the one expected. A
 * number matches when it rounds to the expected value at the number of decimals typed (22.857 matches
 * 22.9 and 22.86); a date must be the same day.
 */
export function checkTemplateExample(
  t: Pick<CalculationTemplateData, "formula" | "inputs" | "resultType" | "example">,
): { ok: true; actual: string } | { ok: false; message: string; actual?: string } {
  const ex = t.example;
  if (!ex) return { ok: false, message: "Add a worked example: sample values and the answer you expect." };

  const values: Record<string, number | string> = {};
  for (const i of t.inputs) {
    const raw = `${ex.values?.[i.id] ?? ""}`.trim();
    if (!raw) return { ok: false, message: `Enter an example value for ${i.label || i.id}.` };
    if (i.type === "date") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(new Date(raw).getTime())) return { ok: false, message: `The example value for ${i.label || i.id} must be a date written YYYY-MM-DD.` };
      values[`Input_${i.id}`] = raw;
    } else {
      if (Number.isNaN(Number(raw))) return { ok: false, message: `The example value for ${i.label || i.id} must be a number.` };
      values[`Input_${i.id}`] = Number(raw);
    }
  }
  const expected = `${ex.expected ?? ""}`.trim();
  if (!expected) return { ok: false, message: "Enter the answer you expect for the example." };

  const keys: ConditionKey[] = t.inputs.map((i) => ({ name: `Input_${i.id}`, dataType: i.type }));
  const mapping = Object.fromEntries(t.inputs.map((i) => [i.id, `Input_${i.id}`]));
  const result = evaluateCalculation(fillTemplate(t.formula, mapping), values, { keys });
  if (!result.ok) return { ok: false, message: `The example can't be worked out: ${friendlyTemplateMessage(result.error)}` };

  const given = t.inputs.map((i) => `${i.label || i.id} = ${ex.values[i.id]}`).join(", ");
  if (t.resultType === "date") {
    const actual = `${result.value}`;
    return actual === expected ? { ok: true, actual } : { ok: false, actual, message: `With ${given} the formula gives ${actual}, but you expected ${expected}. Check the formula, or the expected answer.` };
  }
  const expectedNum = Number(expected);
  if (Number.isNaN(expectedNum)) return { ok: false, message: "The expected answer must be a number." };
  const actualNum = Number(result.value);
  const rounded = Number(actualNum.toFixed(Math.min(decimalsOf(expected), 10)));
  if (Math.abs(rounded - expectedNum) < 1e-9) return { ok: true, actual: trimNumber(actualNum) };
  return { ok: false, actual: trimNumber(actualNum), message: `With ${given} the formula gives ${trimNumber(actualNum)}, but you expected ${expected}. Check the formula, or the expected answer.` };
}

/**
 * Wordings that are valid but often mean something other than what the author expects. These don't block
 * saving; the worked example is what proves the formula. Shown as warnings.
 */
export function lintTemplate(formula: string): string[] {
  const text = formula || "";
  const warnings: string[] = [];
  if (/\band\b/i.test(text)) {
    warnings.push('"and" between values means times (6 and 3 gives 18). If you mean add, write "plus".');
  }
  const operand = String.raw`(?:\{[a-z0-9_]+\}|\d+(?:\.\d+)?)`;
  const operator = String.raw`(?:plus|minus|times|divided by|multiplied by|mod|modulo|and|[+\-*\/%])`;
  if (new RegExp(String.raw`\b(?:square|cube)(?: root)? of\s+${operand}\s*${operator}`, "i").test(text)) {
    warnings.push('"square root of", "cube root of" and "square of" take only the next value. To use a whole sum, add brackets: square root of ({a} times {b}).');
  }
  return warnings;
}

/**
 * Checks a template before it is saved. The formula is compiled with stand-in keys of the declared
 * types, so anything the calculation editor would reject (unknown function, dangling operator,
 * a date mixed with numbers...) is rejected here, then it must reproduce its worked example.
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
  if (err) {
    issues.push({ field: "formula", message: friendlyTemplateMessage(err.message) });
    return issues;
  }

  const example = checkTemplateExample({ formula, inputs, resultType: t.resultType as TemplateResultType, example: t.example });
  if (!example.ok) issues.push({ field: "example", message: example.message });
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
    example: { values: { weight: "70", height: "175" }, expected: "22.9" },
  },
  {
    slug: "bsa", sortOrder: 20, resultType: "number", name: "Body surface area (Mosteller)",
    description: "Square root of (height in cm × weight in kg ÷ 3600), in m².",
    formula: "square root of ({height} times {weight} divided by 3600)",
    inputs: [{ id: "height", label: "Height (cm)", type: "number" }, { id: "weight", label: "Weight (kg)", type: "number" }],
    example: { values: { height: "180", weight: "80" }, expected: "2" },
  },
  {
    slug: "map", sortOrder: 30, resultType: "number", name: "Mean arterial pressure (MAP)",
    description: "Diastolic plus one third of the pulse pressure (systolic minus diastolic).",
    formula: "{diastolic} plus ({systolic} minus {diastolic}) divided by 3",
    inputs: [{ id: "systolic", label: "Systolic BP (mmHg)", type: "number" }, { id: "diastolic", label: "Diastolic BP (mmHg)", type: "number" }],
    example: { values: { systolic: "120", diastolic: "90" }, expected: "100" },
  },
  {
    slug: "edd", sortOrder: 40, resultType: "date", name: "Expected date of delivery (EDD)",
    description: "Last menstrual period plus 280 days (Naegele's rule).",
    formula: "{lmp} + 280 days or {lmp} plus 7 days - 3 months + 1 year",
    inputs: [{ id: "lmp", label: "Last menstrual period (date)", type: "date" }],
    example: { values: { lmp: "2026-01-01" }, expected: "2026-10-08" },
  },
];

/**
 * The words a template formula understands, for the "Words you can use" box in the template form. Every
 * `example` is checked by the tests to compile, so this list can't drift from what is accepted. Not
 * listed on purpose: "and" (it means times, which surprises people) and code-style forms such as
 * Math.floor(...), which still work.
 */
export const TEMPLATE_VOCABULARY: { label: string; words: string; insert: string; example: string; for: "number" | "date" | "both" }[] = [
  { label: "Add", words: "plus, +", insert: " plus ", example: "{a} plus {b}", for: "number" },
  { label: "Subtract", words: "minus, -", insert: " minus ", example: "{a} minus {b}", for: "number" },
  { label: "Multiply", words: "times, multiplied by, *", insert: " times ", example: "{a} times {b}", for: "number" },
  { label: "Divide", words: "divided by, /", insert: " divided by ", example: "{a} divided by {b}", for: "number" },
  { label: "Remainder", words: "mod, %", insert: " mod ", example: "{a} mod {b}", for: "number" },
  { label: "Brackets", words: "( )", insert: "()", example: "({a} plus {b}) times 2", for: "both" },
  { label: "Square", words: "squared", insert: " squared", example: "{a} squared", for: "number" },
  { label: "Cube", words: "cubed", insert: " cubed", example: "{a} cubed", for: "number" },
  { label: "Power", words: "to the power of", insert: " to the power of ", example: "{a} to the power of 3", for: "number" },
  { label: "Square root", words: "square root of", insert: "square root of ", example: "square root of ({a} times {b})", for: "number" },
  { label: "Cube root", words: "cube root of", insert: "cube root of ", example: "cube root of {a}", for: "number" },
  { label: "Round down", words: "round down(...)", insert: "round down()", example: "round down({a} divided by {b})", for: "number" },
  { label: "Round up", words: "round up(...)", insert: "round up()", example: "round up({a})", for: "number" },
  { label: "Round to nearest", words: "round(...)", insert: "round()", example: "round({a})", for: "number" },
  { label: "Ignore the sign", words: "absolute(...)", insert: "absolute()", example: "absolute({a} minus {b})", for: "number" },
  { label: "Smallest", words: "smallest(...)", insert: "smallest(, )", example: "smallest({a}, {b})", for: "number" },
  { label: "Largest", words: "largest(...)", insert: "largest(, )", example: "largest({a}, {b})", for: "number" },
  { label: "Add to a date", words: "+ 7 days, + 2 weeks, + 3 months, + 1 year", insert: " + 7 days", example: "{a} + 7 days", for: "date" },
  { label: "Take from a date", words: "- 7 days, - 2 weeks, - 3 months, - 1 year", insert: " - 3 months", example: "{a} - 3 months", for: "date" },
  { label: "Use the first that has a value", words: "or", insert: " or ", example: "{a} + 280 days or {b} + 7 days", for: "date" },
];
