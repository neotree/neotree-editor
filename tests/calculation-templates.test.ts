import assert from "assert";
import { readFileSync } from "fs";
import { join } from "path";
import {
  DEFAULT_CALCULATION_TEMPLATES, TEMPLATE_VOCABULARY, applyTemplate, checkTemplateExample, fillTemplate, friendlyTemplateMessage, getCompatibleKeys,
  getPlaceholders, lintTemplate, slugify, validateTemplate,
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
  assert.equal(r.formula, "DATE_FIRST(DATE_ADD($LMPDate, 280, 'days'), DATE_ADD(DATE_ADD(DATE_ADD($LMPDate, 7, 'days'), -3, 'months'), 1, 'years'))");
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
const base: CalculationTemplateData = { name: "Ratio", description: "", resultType: "number", formula: "{a} divided by {b}", inputs: [{ id: "a", label: "A", type: "number" }, { id: "b", label: "B", type: "number" }], example: { values: { a: "6", b: "3" }, expected: "2" } };
const msgs = (t: Partial<CalculationTemplateData>) => validateTemplate({ ...base, ...t }).map((i) => i.message);
assert.deepEqual(msgs({}), []);
assert.ok(msgs({ name: " " }).some((m) => /name/.test(m)));
assert.ok(msgs({ formula: "{a} divided by {c}" }).some((m) => /\{c\}/.test(m)), "unknown placeholder");
assert.ok(msgs({ formula: "{a} times 2" }).some((m) => /"b" isn't used/.test(m)), "unused input");
assert.ok(msgs({ inputs: [base.inputs[0], { ...base.inputs[0] }] }).some((m) => /twice/.test(m)), "duplicate id");
assert.ok(msgs({ inputs: [{ id: "Bad Id", label: "x", type: "number" }, base.inputs[1]] }).some((m) => /valid input id/.test(m)));
assert.ok(msgs({ formula: "{a} divided by" }).length > 0, "dangling operator uses the editor's message");
assert.ok(msgs({ formula: "{a} divided by 0 plus {b}" }).some((m) => /ivision by zero/.test(m)));
assert.ok(msgs({ formula: "{a} + 280 days or {b} + 1 days", resultType: "date", inputs: [{ id: "a", label: "A", type: "date" }, { id: "b", label: "B", type: "date" }], example: { values: { a: "2026-01-01", b: "2026-02-01" }, expected: "2026-10-08" } }).length === 0, "date fallback template");
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
    // a formula changed after the first release is set by the examples migration instead (checked below)
    assert.ok(sql.includes(t.formula) || t.slug === "edd", `seed has the formula of ${t.slug}`);
    assert.ok(sql.includes(JSON.stringify(t.inputs)), `seed has the inputs of ${t.slug}`);
  }
}

// ---- Worked example: the template must reproduce the answer its author expects ----
{
  const ex = (values: Record<string, string>, expected: string) => ({ example: { values, expected } });
  assert.deepEqual(msgs({ example: undefined }).length, 1, "an example is required");
  assert.ok(/worked example/.test(msgs({ example: null })[0]));
  assert.deepEqual(msgs(ex({ a: "6", b: "3" }, "2")), [], "matches");
  assert.deepEqual(msgs(ex({ a: "7", b: "3" }, "2.3")), [], "rounded to the decimals typed: 2.333 is 2.3");
  assert.deepEqual(msgs(ex({ a: "7", b: "3" }, "2.33")), [], "and to two decimals");
  assert.ok(/gives 2.33333, but you expected 2.4/.test(msgs(ex({ a: "7", b: "3" }, "2.4"))[0]), "wrong answer says what it gives");
  assert.ok(/gives 2, but you expected 3/.test(msgs(ex({ a: "6", b: "3" }, "3"))[0]));
  assert.ok(/A = 6, B = 3/.test(msgs(ex({ a: "6", b: "3" }, "3"))[0]), "the message shows the sample values");
  assert.ok(/example value for B/.test(msgs(ex({ a: "6" }, "2"))[0]), "a missing sample value");
  assert.ok(/must be a number/.test(msgs(ex({ a: "six", b: "3" }, "2"))[0]));
  assert.ok(/answer you expect/.test(msgs(ex({ a: "6", b: "3" }, " "))[0]));
  assert.ok(/must be a number/.test(msgs(ex({ a: "6", b: "3" }, "two"))[0]));
  assert.ok(/can't be worked out.*ivision by zero/.test(msgs(ex({ a: "6", b: "0" }, "2"))[0]), "a sample that divides by zero");

  // The two traps from the review are caught by the example, not just the grammar:
  // "and" means times, so an author who meant plus is told
  assert.ok(/gives 18, but you expected 9/.test(msgs({ formula: "{a} and {b}", ...ex({ a: "6", b: "3" }, "9") })[0]), '"and" meaning plus is caught');
  // "square root of a times b" is root(a) times b, not root(a times b)
  assert.ok(/but you expected 4.24/.test(msgs({ formula: "square root of {a} times {b}", ...ex({ a: "6", b: "3" }, "4.24") })[0]), "root of the next value only");
  assert.deepEqual(msgs({ formula: "square root of ({a} times {b})", ...ex({ a: "6", b: "3" }, "4.24") }), [], "with brackets it is what they meant");

  // dates are compared as the same day
  const dateT = { resultType: "date" as const, formula: "{a} + 280 days", inputs: [{ id: "a", label: "LMP", type: "date" as const }] };
  assert.deepEqual(msgs({ ...dateT, ...ex({ a: "2026-01-01" }, "2026-10-08") }), []);
  assert.ok(/gives 2026-10-08, but you expected 2026-10-09/.test(msgs({ ...dateT, ...ex({ a: "2026-01-01" }, "2026-10-09") })[0]));
  assert.ok(/YYYY-MM-DD/.test(msgs({ ...dateT, ...ex({ a: "1 Jan 2026" }, "2026-10-08") })[0]));
  assert.ok(/YYYY-MM-DD/.test(msgs({ ...dateT, ...ex({ a: "2026-13-45" }, "2026-10-08") })[0]), "an impossible date");

  // the result of the check is also available to the form
  const c = checkTemplateExample({ ...base, ...ex({ a: "7", b: "3" }, "2.4") });
  assert.ok(!c.ok && c.actual === "2.33333");
  const ok = checkTemplateExample({ ...base, ...ex({ a: "6", b: "3" }, "2") });
  assert.ok(ok.ok && ok.actual === "2");
}

// ---- Warnings for wordings that are valid but often misread (they never block saving) ----
{
  assert.deepEqual(lintTemplate("{a} plus {b}"), []);
  assert.deepEqual(lintTemplate("{a} divided by ({b} divided by 100) squared"), []);
  assert.deepEqual(lintTemplate("square root of ({a} times {b})"), [], "brackets are fine");
  assert.deepEqual(lintTemplate("square root of {a}"), [], "a single value is fine");
  assert.ok(lintTemplate("{a} and {b}").some((w) => /means times/.test(w)));
  assert.ok(lintTemplate("{a} AND {b}").length === 1, "any case");
  assert.ok(lintTemplate("square root of {a} times {b}").some((w) => /brackets/.test(w)));
  assert.ok(lintTemplate("cube root of {a} plus 1").some((w) => /brackets/.test(w)));
  assert.ok(lintTemplate("square of {a} + {b}").some((w) => /brackets/.test(w)));
  assert.ok(lintTemplate("square root of {a} times {b} and {c}").length === 2);
  assert.deepEqual(lintTemplate(""), []);
  // warnings don't stop a valid template being saved
  assert.deepEqual(msgs({ formula: "{a} and {b}", example: { values: { a: "6", b: "3" }, expected: "18" } }), []);
}

// ---- Messages are written for a template author ----
{
  const m = (formula: string) => msgs({ formula })[0];
  assert.ok(!/Input_/.test(m("{a} added to {b}")), "the internal stand-in name never shows");
  assert.match(m("{a} added to {b}"), /"added" isn't a word the formula understands \(it comes after \{a\}\)/);
  assert.match(m("{a} added to {b}"), /Words you can use/);
  assert.match(m("sum of {a} and {b}"), /"sum" isn't a word the formula understands/);
  assert.ok(!/Keys must start/.test(m("sum of {a} and {b}")), "no talk of $ keys");
  assert.match(m("{a} \u00f7 {b}"), /The character "\u00f7" can't be used/);
  assert.equal(friendlyTemplateMessage("Division by zero."), "Division by zero.", "other messages are left alone");
  assert.equal(friendlyTemplateMessage("Unknown function \"foo\" after Input_b"), "Unknown function \"foo\" after {b}");
}

// ---- The "Words you can use" list is real: every entry compiles ----
{
  assert.ok(TEMPLATE_VOCABULARY.length >= 15);
  const numIn = [{ id: "a", label: "A", type: "number" as const }, { id: "b", label: "B", type: "number" as const }];
  const dateIn = [{ id: "a", label: "A", type: "date" as const }, { id: "b", label: "B", type: "date" as const }];
  for (const w of TEMPLATE_VOCABULARY) {
    const isDate = w.for === "date";
    const inputs = isDate ? dateIn : numIn;
    const used = inputs.filter((i) => w.example.includes(`{${i.id}}`));
    // a placeholder the example doesn't use would be reported, so test with the inputs it names
    const issues = validateTemplate({ name: "T", description: "", resultType: isDate ? "date" : "number", formula: w.example, inputs: used,
      example: { values: Object.fromEntries(used.map((i) => [i.id, isDate ? "2026-01-01" : "6"])), expected: "0" } })
      .filter((i) => i.field !== "example");
    assert.deepEqual(issues, [], `vocabulary entry compiles: ${w.label} -> ${w.example}`);
    assert.ok(w.insert.length > 0 && w.words.length > 0 && w.label.length > 0);
  }
  assert.ok(!TEMPLATE_VOCABULARY.some((w) => /\band\b/.test(w.words)), '"and" is deliberately not offered');
  assert.deepEqual(new Set(TEMPLATE_VOCABULARY.map((w) => w.label)).size, TEMPLATE_VOCABULARY.length, "no duplicate labels");
}

// The examples migration must match the defaults exactly, and must not overwrite an edited example.
{
  const dir = join(__dirname, "..", "manual_migrations");
  const file = require("fs").readdirSync(dir).find((f: string) => /calculation_template_examples/.test(f));
  assert.ok(file, "examples migration exists");
  const sql = readFileSync(join(dir, file), "utf8");
  assert.ok(/ADD COLUMN IF NOT EXISTS "example" jsonb/.test(sql));
  // The EDD formula is updated for databases that already have the original, and only while it is unchanged.
  const edd = DEFAULT_CALCULATION_TEMPLATES.find((t) => t.slug === "edd")!;
  assert.equal(edd.formula, "{lmp} + 280 days or {lmp} plus 7 days - 3 months + 1 year");
  assert.ok(sql.includes(`SET "formula" = '${edd.formula}' WHERE "slug" = 'edd' AND "formula" = '{lmp} + 280 days';`), "EDD formula update, guarded");
  for (const t of DEFAULT_CALCULATION_TEMPLATES) {
    assert.ok(sql.includes(JSON.stringify(t.example)), `examples seed has the example of ${t.slug}`);
    assert.ok(new RegExp(`WHERE "slug" = '${t.slug}' AND "example" IS NULL`).test(sql), `${t.slug} is only filled in when it has no example`);
  }
}

console.log("calculation-templates: all assertions passed");
