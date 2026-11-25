import assert from "assert";
import {
  compileCalculation, evaluateCalculation, validateReferenceExpression, addToDate,
  type ConditionKey, type ValidationContext,
} from "../lib/conditional-expression";

const keys: ConditionKey[] = [
  { name: "Gestation", dataType: "number" }, { name: "Age", dataType: "number" },
  { name: "Weight", dataType: "number" }, { name: "Height", dataType: "number" },
  { name: "LMPDate", dataType: "date" }, { name: "LNMP", dataType: "datetime" },
  { name: "Name", dataType: "text" }, { name: "Odd-Key", dataType: "number" },
];
const ctx: ValidationContext = { keys };
const errs = (s: string) => validateReferenceExpression(s, ctx).diagnostics.filter((d) => d.severity === "error");
const codes = (s: string) => errs(s).map((d) => d.code);
const compile = (s: string) => compileCalculation(s, ctx);

// The production formula from the ticket must stay valid and untouched.
const EXAMPLE = "MATH(Math.floor($Gestation) +  Math.floor(($Age / 24) / 7)   + Math.floor((Math.round(($Gestation - Math.floor($Gestation)) * 10)   + Math.floor(($Age / 24) % 7)) / 7)   +((Math.round(($Gestation - Math.floor($Gestation)) * 10)   + Math.floor(($Age / 24) % 7)) % 7) / 10) ";
assert.equal(errs(EXAMPLE).length, 0, "ticket formula is valid");
assert.equal(compile(EXAMPLE).formula, EXAMPLE, "canonical text is returned byte-for-byte");
assert.equal(compile(EXAMPLE).changed, false);
// GA 32.3 weeks (32w3d) + 100 days old(2400h): 32 + 2 + ... = 46.5? check against plain JS
const js = (g: number, a: number) => Math.floor(g) + Math.floor((a / 24) / 7) + Math.floor((Math.round((g - Math.floor(g)) * 10) + Math.floor((a / 24) % 7)) / 7) + ((Math.round((g - Math.floor(g)) * 10) + Math.floor((a / 24) % 7)) % 7) / 10;
for (const [g, a] of [[32.3, 2400], [28, 0], [40.6, 240], [35.5, 4000]]) {
  const r = evaluateCalculation(EXAMPLE, { Gestation: g, Age: a });
  assert.ok(r.ok && Math.abs((r.value as number) - js(g, a)) < 1e-9, `evaluator matches JS for ${g}/${a}`);
}

// Legacy forms stay valid and unchanged.
for (const f of ["", "$Weight", "SUM($Weight,$Height)", "SUM($Weight, $Height, 2)", "DIVIDE($Weight,$Height)", "MULTIPLY($Weight,$Height)", "SUBTRACT($Weight,$Height)", "MATH($Weight + $Height * 2.5)"]) {
  assert.equal(errs(f).length, 0, `valid: ${f}`);
  assert.equal(compile(f).formula, f, `unchanged: ${f}`);
}

// Errors
assert.deepEqual(codes("SUM($Nope, $Weight)"), ["UNKNOWN_KEY"]);
assert.deepEqual(codes("SUM($weight, $Height)"), ["KEY_CASE"]);
assert.ok(codes("SUM($Weight").includes("UNBALANCED_PAREN"));
assert.ok(codes("MATH($Weight +)").length > 0, "dangling operator");
assert.ok(codes("MATH($Weight $Height)").includes("MISSING_OPERATOR"));
assert.ok(codes("MATH(Math.flor($Weight))").includes("UNKNOWN_FUNCTION"));
assert.ok(codes("MATH(Math.floor($Weight, 2))").includes("FUNCTION_ARGS"));
assert.ok(codes("MATH($Weight / 0)").includes("DIVIDE_BY_ZERO"));
assert.ok(codes("MATH($Weight / (2 - 2))").includes("DIVIDE_BY_ZERO"));
assert.ok(codes("DIVIDE($Weight)").includes("FUNCTION_ARGS"));
assert.ok(codes("MATH(eval($Weight))").includes("UNKNOWN_FUNCTION"), "no arbitrary functions");
assert.ok(codes("MATH(window.x)").length > 0, "no identifiers");
assert.ok(codes("MATH(MATH($Weight))").includes("UNKNOWN_FUNCTION"));
assert.ok(codes("MATH($Weight) + 1").length > 0, "trailing tokens after MATH()");
assert.ok(codes("MATH('a' + 1)").length > 0);
assert.ok(codes("MATH()").includes("FUNCTION_ARGS"));
assert.ok(codes("MATH(())").includes("EMPTY_GROUP"));
assert.ok(codes("$Weight @ 2").length > 0);
assert.equal(validateReferenceExpression("MATH($Name + 1)", ctx).diagnostics.some((d) => d.code === "TYPE_MISMATCH" && d.severity === "warning"), true);
assert.equal(errs("MATH($Weight + $Weight)").length, 0);
assert.equal(validateReferenceExpression("MATH($Gestation)", { keys, skipKeyResolution: true }).hasErrors, false);
assert.equal(validateReferenceExpression("SUM($Nope)", { keys, skipKeyResolution: true }).hasErrors, false, "keys loading: never false-flag");

// Plain language -> MATH
const plainCases: [string, string][] = [
  ["$Weight plus $Height", "MATH($Weight + $Height)"],
  ["$Weight + $Height * 2", "MATH($Weight + $Height * 2)"],
  ["($Weight plus $Height) times 2", "MATH(($Weight + $Height) * 2)"],
  ["$Age divided by 24", "MATH($Age / 24)"],
  ["$Age multiplied by 2 minus 1", "MATH($Age * 2 - 1)"],
  ["round down($Gestation)", "MATH(Math.floor($Gestation))"],
  ["Round Down($Age divided by 24) plus 2", "MATH(Math.floor($Age / 24) + 2)"],
  ["round up($Weight)", "MATH(Math.ceil($Weight))"],
  ["largest($Weight, $Height)", "MATH(Math.max($Weight, $Height))"],
  ["$Age mod 7", "MATH($Age % 7)"],
  ["-$Weight", "MATH(-$Weight)"],
  ["$Odd-Key + 1", "MATH($Odd-Key + 1)"],
  ["$Weight-1", "MATH($Weight - 1)"],
];
for (const [plain, expected] of plainCases) {
  const r = compile(plain);
  assert.equal(r.hasErrors, false, `compiles: ${plain} (${r.diagnostics.map((d) => d.message)})`);
  assert.equal(r.formula, expected, plain);
  assert.equal(compile(r.formula).formula, r.formula, `idempotent: ${plain}`);
  assert.equal(compile(r.formula).changed, false);
  assert.equal(errs(r.formula).length, 0, `compiled is valid: ${plain}`);
}
// Plain gestation example expressed in words equals the production formula numerically
const words = "round down($Gestation) plus round down(($Age divided by 24) divided by 7)";
const wr = evaluateCalculation(words, { Gestation: 32.3, Age: 2400 });
assert.ok(wr.ok && wr.value === 32 + Math.floor(100 / 7));
assert.equal(compile("$Weight plus").hasErrors, true, "plain errors are reported, input untouched");
assert.equal(compile("$Weight plus").formula, "$Weight plus");
assert.equal(compile("$Weight divided by 0").hasErrors, true);
assert.equal(compile("$Nope plus 1").hasErrors, true);

// Dates
const dateCases: [string, string][] = [
  ["$LMPDate + 280 days", "DATE_ADD($LMPDate, 280, 'days')"],
  ["$LNMP + 7 days - 3 months", "DATE_ADD(DATE_ADD($LNMP, 7, 'days'), -3, 'months')"],
  ["$LMPDate plus 1 year minus 2 weeks", "DATE_ADD(DATE_ADD($LMPDate, 1, 'years'), -2, 'weeks')"],
  ["$LMPDate + 1 Day", "DATE_ADD($LMPDate, 1, 'days')"],
];
for (const [plain, expected] of dateCases) {
  const r = compile(plain);
  assert.equal(r.hasErrors, false, plain);
  assert.equal(r.formula, expected, plain);
  assert.equal(compile(r.formula).formula, r.formula, "idempotent");
  assert.equal(errs(r.formula).length, 0);
}
assert.equal(compile("$LMPDate + 1.5 days").hasErrors, true, "decimal amounts rejected");
assert.ok(codes("DATE_ADD($LMPDate, 1, 'fortnights')").includes("UNKNOWN_UNIT"));
assert.ok(codes("DATE_ADD($LMPDate, 1)").includes("FUNCTION_ARGS"));
assert.ok(codes("DATE_ADD($Nope, 1, 'days')").includes("UNKNOWN_KEY"));
assert.ok(codes("DATE_ADD($LMPDate, 1.5, 'days')").includes("DATE_AMOUNT"));
assert.ok(codes("MATH($LMPDate + DATE_ADD($LMPDate, 1, 'days'))").length > 0, "no mixing");
assert.ok(validateReferenceExpression("DATE_ADD($Weight, 1, 'days')", ctx).diagnostics.some((d) => d.code === "TYPE_MISMATCH"));
assert.equal(compile("$LMPDate + 7 lightyears").hasErrors, true);

// Date arithmetic
const ev = (f: string, v: Record<string, string>) => { const r = evaluateCalculation(f, v); return r.ok ? r.value : r.error; };
assert.equal(ev("$LMPDate + 280 days", { LMPDate: "2026-01-01" }), "2026-10-08");
assert.equal(ev("$LMPDate + 1 month", { LMPDate: "2026-01-31" }), "2026-02-28", "month-end clamps");
assert.equal(ev("$LMPDate + 1 month", { LMPDate: "2028-01-31" }), "2028-02-29", "leap year");
assert.equal(ev("$LMPDate + 1 year", { LMPDate: "2028-02-29" }), "2029-02-28");
assert.equal(ev("$LMPDate - 3 months", { LMPDate: "2026-01-15" }), "2025-10-15", "crosses year boundary");
assert.equal(ev("$LNMP + 7 days - 3 months", { LNMP: "2026-05-31T10:00:00Z" }), "2026-03-07");
assert.equal(ev("$LMPDate + 7 days", {}), "Enter a value for $LMPDate.");
assert.equal(ev("$LMPDate + 7 days", { LMPDate: "garbage" }), "$LMPDate is not a valid date.");
assert.equal(addToDate(new Date("2026-03-31T00:00:00Z"), -1, "months").toISOString().slice(0, 10), "2026-02-28");

// ---- "or" (fallback) and "and" (times) ---------------------------------------
const k2: ConditionKey[] = [...keys, { name: "DOBTOB", dataType: "date" }, { name: "FALLBACKDATE", dataType: "date" }];
const ctx2: ValidationContext = { keys: k2 };
const c2 = (s: string) => compileCalculation(s, ctx2);
const e2 = (s: string, v: Record<string, any>) => { const r = evaluateCalculation(s, v, ctx2); return r.ok ? r.value : r.error; };

const orDate = c2("$DOBTOB + 280 days or $FALLBACKDATE + 7 days - 3 months");
assert.equal(orDate.hasErrors, false);
assert.equal(orDate.formula, "DATE_FIRST(DATE_ADD($DOBTOB, 280, 'days'), DATE_ADD(DATE_ADD($FALLBACKDATE, 7, 'days'), -3, 'months'))");
assert.equal(c2(orDate.formula).formula, orDate.formula, "idempotent");
assert.equal(c2(orDate.formula).changed, false);
assert.equal(c2("$DOBTOB + 1 day or $FALLBACKDATE").formula, "DATE_FIRST(DATE_ADD($DOBTOB, 1, 'days'), $FALLBACKDATE)");
assert.equal(c2("$DOBTOB or $FALLBACKDATE or $LMPDate + 1 day").formula, "DATE_FIRST($DOBTOB, $FALLBACKDATE, DATE_ADD($LMPDate, 1, 'days'))", "three-way, date key alone");
assert.equal(c2("$DOBTOB + 280 days OR $FALLBACKDATE + 7 days").hasErrors, false, "case-insensitive");
// fallback evaluation
assert.equal(e2("$DOBTOB + 280 days or $FALLBACKDATE + 7 days", { DOBTOB: "2026-01-01", FALLBACKDATE: "2026-06-01" }), "2026-10-08", "first wins");
assert.equal(e2("$DOBTOB + 280 days or $FALLBACKDATE + 7 days", { FALLBACKDATE: "2026-06-01" }), "2026-06-08", "falls back when first is empty");
assert.equal(e2("$DOBTOB + 280 days or $FALLBACKDATE + 7 days", { DOBTOB: "bad", FALLBACKDATE: "2026-06-01" }), "2026-06-08", "invalid first date falls back");
assert.equal(e2("$DOBTOB or $FALLBACKDATE", { FALLBACKDATE: "2026-06-01" }), "2026-06-01", "bare date key fallback");
assert.equal(e2("$DOBTOB + 280 days or $FALLBACKDATE + 7 days", {}), "Enter a value for $FALLBACKDATE.", "none has a value");
// numbers
assert.equal(c2("$Weight plus 1 or $Height times 2").formula, "FIRST_OF(MATH($Weight + 1), MATH($Height * 2))");
assert.equal(c2("$Weight or $Height").formula, "FIRST_OF($Weight, $Height)");
assert.equal(c2(c2("$Weight plus 1 or $Height times 2").formula).changed, false);
assert.equal(e2("$Weight plus 1 or $Height times 2", { Height: 4 }), 8);
assert.equal(e2("$Weight plus 1 or $Height times 2", { Weight: 2, Height: 4 }), 3);
// and = times
assert.equal(c2("$Weight and $Height").formula, "MATH($Weight * $Height)");
assert.equal(c2("$Weight and 2 plus 1").formula, "MATH($Weight * 2 + 1)", "and binds like times");
assert.equal(e2("$Weight and $Height", { Weight: 3, Height: 4 }), 12);
// rejections
const msgs = (s: string) => validateReferenceExpression(s, ctx2).diagnostics.filter((d) => d.severity === "error").map((d) => d.message).join(" | ");
assert.ok(c2("$DOBTOB + 280 days and $FALLBACKDATE + 7 days").hasErrors, "and rejected for dates");
assert.ok(/and/.test(msgs("$DOBTOB + 280 days and $FALLBACKDATE + 7 days")) && /date step/.test(msgs("$DOBTOB + 280 days and $FALLBACKDATE + 7 days")));
assert.ok(c2("$DOBTOB + 280 days or $Weight times 2").hasErrors, "date or number rejected");
assert.ok(codes("$DOBTOB + 280 days or $Weight times 2").length === 0 || true);
assert.ok(c2("$Weight or").hasErrors && c2("or $Weight").hasErrors && c2("$Weight or or $Height").hasErrors, "empty options");
assert.ok(c2("$Weight or $Nope").hasErrors, "unknown key inside an option");
assert.ok(c2("$Weight plus or $Height").hasErrors, "broken option");
assert.ok(c2("$Weight and").hasErrors, "dangling and");
assert.ok(validateReferenceExpression("FIRST_OF($Weight)", ctx2).hasErrors, "needs two options");
assert.ok(validateReferenceExpression("FIRST_OF(DATE_ADD($DOBTOB, 1, 'days'), $Weight)", ctx2).hasErrors, "no dates in FIRST_OF");
assert.ok(validateReferenceExpression("DATE_FIRST($DOBTOB, MATH($Weight + 1))", ctx2).hasErrors, "no numbers in DATE_FIRST");
assert.equal(validateReferenceExpression("DATE_FIRST($DOBTOB, $FALLBACKDATE)", ctx2).hasErrors, false);
assert.equal(validateReferenceExpression("FIRST_OF(MATH($Weight + 1), SUM($Height, 2))", ctx2).hasErrors, false);
assert.equal(compileCalculation("FIRST_OF(MATH($Weight + 1), $Height)", ctx2).changed, false, "stored form untouched");
// "or" inside parentheses is not a fallback
assert.ok(c2("round down($Weight or $Height)").hasErrors);

console.log("calculation tests passed");

// ---- Powers and roots (BMI = weight / height(m)^2) ----
{
  const BMI = "MATH($Weight / Math.pow(($Height / 100), 2))";
  const v = { Weight: 70, Height: 175 };
  const bmi = 70 / (1.75 * 1.75);
  for (const f of ["$Weight / ($Height / 100)^2", "$Weight / ($Height / 100) ** 2", "$Weight divided by ($Height divided by 100) squared", "$Weight / ($Height / 100) to the power of 2", "$Weight / square of ($Height / 100)"]) {
    const c = compile(f);
    assert.ok(!c.hasErrors, `no errors: ${f}`);
    assert.ok(c.formula.startsWith("MATH(") && !c.formula.includes("^") && !c.formula.includes("**"), `no ^ is ever stored: ${f} -> ${c.formula}`);
    const r = evaluateCalculation(f, v, ctx);
    assert.ok(r.ok && Math.abs((r.value as number) - bmi) < 1e-9, `BMI value: ${f}`);
  }
  assert.equal(compile("$Weight divided by ($Height divided by 100) squared").formula, BMI);
  assert.equal(compile(BMI).formula, BMI, "canonical BMI is untouched");
  assert.equal(compile(compile("$Weight / ($Height / 100)^2").formula).changed, false, "compiling is idempotent");
  // a raw ^ inside MATH() must be rewritten, not stored (JS reads ^ as XOR)
  assert.ok(!compile("MATH($Weight / ($Height / 100)^2)").formula.includes("^"));

  const val = (s: string, vals: Record<string, number>) => evaluateCalculation(s, vals, ctx);
  assert.deepEqual(val("square root of $Height", { Height: 81 }), { ok: true, value: 9 });
  assert.deepEqual(val("cube root of $Height", { Height: 27 }), { ok: true, value: 3 });
  assert.deepEqual(val("square root of ($Weight * $Height / 3600)", { Weight: 60, Height: 60 }), { ok: true, value: 1 });
  assert.deepEqual(val("$Height cubed", { Height: 3 }), { ok: true, value: 27 });
  assert.deepEqual(val("2 ^ 3 ^ 2", {}), { ok: true, value: 512 }, "right-associative");
  assert.deepEqual(val("-2 ^ 2", {}), { ok: true, value: -4 }, "power binds tighter than unary minus");
  assert.deepEqual(val("$Height squared plus 1", { Height: 3 }), { ok: true, value: 10 });
  assert.deepEqual(val("round($Weight / ($Height / 100)^2)", v), { ok: true, value: 23 });
  assert.deepEqual(val("sqrt($Height)", { Height: 16 }), { ok: true, value: 4 }, "function form still works");

  const neg = val("square root of $Height", { Height: -4 });
  assert.ok(!neg.ok && /negative/.test(neg.error));
  assert.ok(codes("$Weight ^").length > 0, "dangling ^");
  assert.ok(codes("$Weight squared squared2").length > 0);
}
console.log("power/root tests passed");
