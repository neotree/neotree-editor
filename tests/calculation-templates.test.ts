import assert from "assert";
import { readFileSync } from "fs";
import { join } from "path";
import {
  DEFAULT_CALCULATION_TEMPLATES, applyTemplate, fillTemplate, getCompatibleKeys, getPlaceholders, slugify, validateTemplate,
  type CalculationTemplateData,
} from "../lib/calculation-templates";
import { evaluateCalculation, type ConditionKey } from "../lib/conditional-expression";

const keys: ConditionKey[] = [
  { name: "Wt", dataType: "number" }, { name: "Ht", dataType: "number" }, { name: "SBP", dataType: "number" }, { name: "DBP", dataType: "number" },
  { name: "LMPDate", dataType: "date" }, { name: "Seen", dataType: "datetime" }, { name: "Name", dataType: "text" },
];
const bySlug = (s: string) => DEFAULT_CALCULATION_TEMPLATES.find((t) => t.slug === s)!;
const run = (slug: string, mapping: Record<string, string>, values: Record<string, number | string>) => {
  const t = bySlug(slug);
  const a = applyTemplate(t, mapping, keys);
  assert.ok(a.ok, `${slug} applies: ${(a as any).error}`);
  return { formula: (a as any).formula as string, result: evaluateCalculation((a as any).formula, values, { keys }) };
};

// Placeholders and filling
assert.deepEqual(getPlaceholders("{a} + {b} * {a}"), ["a", "b"]);
assert.equal(fillTemplate("{a} + {b}", { a: "Wt" }), "$Wt + {b}", "unchosen placeholders stay visible");

// Every default template is valid and gives the textbook answer
for (const t of DEFAULT_CALCULATION_TEMPLATES) assert.deepEqual(validateTemplate(t), [], `default valid: ${t.slug}`);
{
  const r = run("bmi", { weight: "Wt", height: "Ht" }, { Wt: 70, Height: 0, Ht: 175 });
  assert.equal(r.formula, "MATH($Wt / Math.pow(($Ht / 100), 2))");
  assert.ok(r.result.ok && Math.abs((r.result.value as number) - 22.857142857142858) < 1e-9);
}
{
  const r = run("bsa", { height: "Ht", weight: "Wt" }, { Ht: 180, Wt: 80 });
  assert.ok(r.result.ok && Math.abs((r.result.value as number) - 2) < 1e-9, "Mosteller: 180cm 80kg = 2.0 m2");
}
{
  const r = run("map", { systolic: "SBP", diastolic: "DBP" }, { SBP: 120, DBP: 90 });
  assert.ok(r.result.ok && Math.abs((r.result.value as number) - 100) < 1e-9, "MAP 120/90 = 100");
}
{
  const r = run("edd", { lmp: "LMPDate" }, { LMPDate: "2026-01-01" });
  assert.equal(r.formula, "DATE_ADD($LMPDate, 280, 'days')");
  assert.deepEqual(r.result, { ok: true, value: "2026-10-08" });
  assert.ok(applyTemplate(bySlug("edd"), { lmp: "Seen" }, keys).ok, "datetime keys work for dates");
}

// Applying: missing / wrong choices
{
  const a = applyTemplate(bySlug("bmi"), { weight: "Wt" }, keys);
  assert.ok(!a.ok && /Height \(cm\)/.test(a.error), "names the missing input");
  const b = applyTemplate(bySlug("bmi"), { weight: "Wt", height: "Nope" }, keys);
  assert.ok(!b.ok, "unknown key rejected");
}

// Compatible keys
assert.deepEqual(getCompatibleKeys(keys, "number").map((k) => k.name), ["Wt", "Ht", "SBP", "DBP"]);
assert.deepEqual(getCompatibleKeys(keys, "date").map((k) => k.name), ["LMPDate", "Seen"]);

// Validation
const base: CalculationTemplateData = { name: "Ratio", description: "", resultType: "number", formula: "{a} divided by {b}", inputs: [{ id: "a", label: "A", type: "number" }, { id: "b", label: "B", type: "number" }] };
const msgs = (t: Partial<CalculationTemplateData>) => validateTemplate({ ...base, ...t }).map((i) => i.message);
assert.deepEqual(msgs({}), []);
assert.ok(msgs({ name: " " }).some((m) => /name/.test(m)));
assert.ok(msgs({ formula: "{a} divided by {c}" }).some((m) => /\{c\}/.test(m)), "unknown placeholder");
assert.ok(msgs({ formula: "{a} times 2" }).some((m) => /"b" isn't used/.test(m)), "unused input");
assert.ok(msgs({ inputs: [base.inputs[0], { ...base.inputs[0] }] }).some((m) => /twice/.test(m)), "duplicate id");
assert.ok(msgs({ inputs: [{ id: "Bad Id", label: "x", type: "number" }, base.inputs[1]] }).some((m) => /valid input id/.test(m)));
assert.ok(msgs({ formula: "{a} divided by" }).length > 0, "dangling operator uses the editor's message");
assert.ok(msgs({ formula: "{a} divided by 0 plus {b}" }).some((m) => /ivision by zero/.test(m)));
assert.ok(msgs({ formula: "{a} + 280 days or {b} + 1 days", resultType: "date", inputs: [{ id: "a", label: "A", type: "date" }, { id: "b", label: "B", type: "date" }] }).length === 0, "date fallback template");
assert.ok(msgs({ inputs: [] }).some((m) => /at least one input/.test(m)));
assert.ok(msgs({ formula: "{a} + 1 day plus {b}" }).length > 0, "a date step can't be mixed into numbers");

assert.equal(slugify("Body surface area (Mosteller)"), "body-surface-area-mosteller");
assert.equal(slugify("***"), "template");

// The SQL seed must match the defaults exactly (same slugs, formulas and inputs).
{
  const dir = join(__dirname, "..", "manual_migrations");
  const file = require("fs").readdirSync(dir).find((f: string) => /calculation_templates/.test(f));
  assert.ok(file, "migration file exists");
  const sql = readFileSync(join(dir, file), "utf8");
  for (const t of DEFAULT_CALCULATION_TEMPLATES) {
    assert.ok(sql.includes(`'${t.slug}'`), `seed has slug ${t.slug}`);
    assert.ok(sql.includes(t.formula), `seed has the formula of ${t.slug}`);
    assert.ok(sql.includes(JSON.stringify(t.inputs)), `seed has the inputs of ${t.slug}`);
  }
}
console.log("calculation-templates: all assertions passed");
