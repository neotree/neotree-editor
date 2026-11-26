// Calculation ("reference expression") language: parse, validate, compile, evaluate.
//
// Stored (canonical) forms — what the database and the device app see:
//   $key                                   a single key
//   SUM(a, b, ...) MULTIPLY(...)           folds
//   SUBTRACT(a, b, ...) DIVIDE(a, b, ...)  left folds
//   MATH(<arithmetic>)                     + - * / % ( ) and Math.floor/round/ceil/trunc/abs/min/max/pow/sqrt
//   DATE_ADD(<date>, <whole number>, 'days'|'weeks'|'months'|'years')   nestable, for date fields
//   FIRST_OF(a, b, ...)   numeric fallback: the first alternative that has a value
//   DATE_FIRST(a, b, ...) date fallback: the first alternative that has a value
// Plain language: "or" between whole formulas is a fallback; "and" between numbers means "times".
// Powers and roots (compiled to Math.pow / Math.sqrt / Math.cbrt; "^" is never stored, as JS reads it as XOR):
//   "$Weight / ($Height / 100)^2"             "$Weight divided by ($Height / 100) squared"
//   "square root of ($Weight * $Height / 3600)"   "$Age cubed"   "$Base to the power of 3"   "square of $x"
//
// Plain-language input is accepted by `compileCalculation`, which rewrites it to a canonical form:
//   "round down($Age divided by 24) plus 2"   ->  MATH(Math.floor($Age / 24) + 2)
//   "$LMPDate + 280 days"                     ->  DATE_ADD($LMPDate, 280, 'days')
//   "$LNMP + 7 days - 3 months"               ->  DATE_ADD(DATE_ADD($LNMP, 7, 'days'), -3, 'months')
//
// Canonical text is returned byte-for-byte, so compiling is idempotent and saved formulas never change.
// Pure and dependency-free (no eval), so it can be shared with the app runtime.

import type { ConditionKey, Diagnostic, DiagnosticCode, ValidationContext, ValidationResult } from "./ast";
import { suggestClosest } from "./suggest";

export type DateUnit = "days" | "weeks" | "months" | "years";
export const DATE_UNITS: DateUnit[] = ["days", "weeks", "months", "years"];

const UNIT_ALIASES: Record<string, DateUnit> = {
  day: "days", days: "days", week: "weeks", weeks: "weeks",
  month: "months", months: "months", year: "years", years: "years",
};

// canonical Math.* name -> arity [min, max]
const MATH_FUNCTIONS: Record<string, [number, number]> = {
  floor: [1, 1], round: [1, 1], ceil: [1, 1], trunc: [1, 1], abs: [1, 1], sqrt: [1, 1],
  pow: [2, 2], cbrt: [1, 1], min: [1, Infinity], max: [1, Infinity],
};

// Plain-language names -> canonical Math.* name.
const FUNCTION_ALIASES: Record<string, string> = {
  round_down: "floor", rounddown: "floor", whole_part: "floor", whole: "floor",
  round_up: "ceil", roundup: "ceil", ceiling: "ceil",
  round_off: "round", nearest: "round",
  absolute: "abs", smallest: "min", lowest: "min", largest: "max", highest: "max",
  power: "pow", square_root: "sqrt", cube_root: "cbrt", cut: "trunc", truncate: "trunc",
};

const FOLD_FUNCTIONS: Record<string, number> = { SUM: 1, MULTIPLY: 1, SUBTRACT: 2, DIVIDE: 2 };

const NUMERIC_BAD_TYPES = new Set(["date", "datetime", "time", "text", "string", "multi_select", "boolean"]);
const DATE_TYPES = new Set(["date", "datetime"]);

// ---- Tokens -----------------------------------------------------------------

type Tok =
  | { k: "num"; text: string; start: number; end: number }
  | { k: "var"; text: string; start: number; end: number }
  | { k: "word"; text: string; start: number; end: number }
  | { k: "str"; text: string; start: number; end: number }
  | { k: "op"; text: string; start: number; end: number };

const isDigit = (c: string) => c >= "0" && c <= "9";
const isWordStart = (c: string) => /[A-Za-z_]/.test(c);
const isWordChar = (c: string) => /[A-Za-z0-9_]/.test(c);
const isVarChar = (c: string) => /[A-Za-z0-9_]/.test(c);

/**
 * `knownKeys` lets a key containing "-" or "." (legal in the catalogue) win over arithmetic: the longest
 * catalogue name that matches after "$" is taken as the key; otherwise only [A-Za-z0-9_] belong to it.
 */
function tokenize(src: string, diags: Diagnostic[], knownKeys: string[] = []): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    const start = i;
    if (c === "$") {
      i++;
      const special = knownKeys
        .filter((k) => /[-.]/.test(k) && src.startsWith(k, i) && !isVarChar(src[i + k.length] || " "))
        .sort((a, b) => b.length - a.length)[0];
      if (special) i += special.length;
      else while (i < n && isVarChar(src[i])) i++;
      const text = src.slice(start + 1, i);
      if (!text) diags.push({ severity: "error", code: "MISSING_OPERAND", message: 'Expected a key name after "$".', start, end: i });
      out.push({ k: "var", text, start, end: i });
    } else if (isDigit(c) || (c === "." && isDigit(src[i + 1] || ""))) {
      while (i < n && isDigit(src[i])) i++;
      if (src[i] === "." && isDigit(src[i + 1] || "")) { i++; while (i < n && isDigit(src[i])) i++; }
      out.push({ k: "num", text: src.slice(start, i), start, end: i });
    } else if (isWordStart(c)) {
      while (i < n && (isWordChar(src[i]) || (src[i] === "." && isWordStart(src[i + 1] || "")))) i++;
      out.push({ k: "word", text: src.slice(start, i), start, end: i });
    } else if (c === "'" || c === '"') {
      i++;
      const bodyStart = i;
      while (i < n && src[i] !== c) i++;
      const body = src.slice(bodyStart, i);
      if (i >= n) {
        diags.push({ severity: "error", code: "UNTERMINATED_STRING", message: `Unterminated text. Add a closing ${c}.`, start, end: n });
      } else i++;
      out.push({ k: "str", text: body, start, end: i });
    } else if (c === "*" && src[i + 1] === "*") {
      i += 2;
      out.push({ k: "op", text: "^", start, end: i });
    } else if ("+-*/%(),^".includes(c)) {
      i++;
      out.push({ k: "op", text: c, start, end: i });
    } else {
      i++;
      diags.push({ severity: "error", code: "UNEXPECTED_TOKEN", message: `Unexpected character "${c}".`, start, end: i });
    }
  }
  return out;
}

// ---- AST --------------------------------------------------------------------

interface Span { start: number; end: number }
export type CalcNode =
  | (Span & { type: "num"; text: string })
  | (Span & { type: "var"; name: string })
  | (Span & { type: "str"; value: string })
  | (Span & { type: "unary"; op: "-" | "+"; arg: CalcNode })
  | (Span & { type: "bin"; op: "+" | "-" | "*" | "/" | "%"; left: CalcNode; right: CalcNode })
  | (Span & { type: "call"; name: string; args: CalcNode[]; nameEnd: number })
  | (Span & { type: "group"; expr: CalcNode })
  | (Span & { type: "error" });

class Parser {
  pos = 0;
  /** True when power/root shorthand ("^", "squared", "square root of"...) was used, so the text needs compiling. */
  sugar = false;
  constructor(private toks: Tok[], private src: string, public diags: Diagnostic[]) {}

  private err(code: DiagnosticCode, message: string, start: number, end: number, suggestion?: string) {
    this.diags.push({ severity: "error", code, message, start, end, suggestion });
  }
  peek(o = 0): Tok | undefined { return this.toks[this.pos + o]; }
  private isOp(t: Tok | undefined, text: string) { return !!t && t.k === "op" && t.text === text; }
  private isWord(t: Tok | undefined, text: string) { return !!t && t.k === "word" && t.text.toLowerCase() === text; }
  get done() { return this.pos >= this.toks.length; }
  get endPos() { return this.src.length; }

  /** Parses a full expression; stops at ")" or "," or end. */
  expr(): CalcNode {
    let left = this.term();
    for (;;) {
      const t = this.peek();
      let op: "+" | "-" | null = null;
      let len = 1;
      if (t && t.k === "op" && (t.text === "+" || t.text === "-")) op = t.text as "+" | "-";
      else if (this.isWord(t, "plus")) op = "+";
      else if (this.isWord(t, "minus")) op = "-";
      if (!op) return left;
      const opTok = t!;
      this.pos += len;
      const right = this.term(opTok);
      left = { type: "bin", op, left, right, start: left.start, end: right.end };
    }
  }

  private mulOp(): { op: "*" | "/" | "%"; len: number } | null {
    const t = this.peek();
    if (!t) return null;
    if (t.k === "op" && (t.text === "*" || t.text === "/" || t.text === "%")) return { op: t.text as any, len: 1 };
    if (t.k !== "word") return null;
    const w = t.text.toLowerCase();
    if (w === "times" || w === "and") return { op: "*", len: 1 };
    if (w === "mod" || w === "modulo") return { op: "%", len: 1 };
    if (w === "multiplied" && this.isWord(this.peek(1), "by")) return { op: "*", len: 2 };
    if (w === "divided" && this.isWord(this.peek(1), "by")) return { op: "/", len: 2 };
    if (w === "remainder" && this.isWord(this.peek(1), "of") === false && !this.isOp(this.peek(1), "(")) return { op: "%", len: 1 };
    return null;
  }

  term(after?: Tok): CalcNode {
    let left = this.unary(after);
    for (;;) {
      const m = this.mulOp();
      if (!m) return left;
      const opTok = this.peek()!;
      this.pos += m.len;
      const right = this.unary(opTok);
      left = { type: "bin", op: m.op, left, right, start: left.start, end: right.end };
    }
  }

  unary(after?: Tok): CalcNode {
    const t = this.peek();
    if (t && t.k === "op" && (t.text === "-" || t.text === "+")) {
      this.pos++;
      const arg = this.unary(t);
      return { type: "unary", op: t.text as "-" | "+", arg, start: t.start, end: arg.end };
    }
    return this.power(after);
  }

  /** Number of tokens matched by the word sequence at the cursor (case-insensitive), or 0. */
  private words(...seq: string[]): number {
    return seq.every((w, i) => this.isWord(this.peek(i), w)) ? seq.length : 0;
  }

  /** primary, then any number of "^ n" / "squared" / "cubed" / "to the power of n" suffixes (right-associative). */
  private power(after?: Tok): CalcNode {
    let base = this.primary(after);
    for (;;) {
      const t = this.peek();
      if (!t) return base;
      let exp: CalcNode | null = null;
      let last: Tok = t;
      if (this.isOp(t, "^")) {
        this.pos++;
        exp = this.unary(t);
        last = this.toks[this.pos - 1] ?? t;
      } else if (this.isWord(t, "squared") || this.isWord(t, "cubed")) {
        this.pos++;
        exp = { type: "num", text: this.isWord(t, "squared") ? "2" : "3", start: t.start, end: t.end };
      } else {
        const len = this.words("to", "the", "power", "of") || this.words("raised", "to", "the", "power", "of") || this.words("raised", "to");
        if (!len) return base;
        this.pos += len;
        last = this.toks[this.pos - 1];
        exp = this.unary(last);
        last = this.toks[this.pos - 1] ?? last;
      }
      this.sugar = true;
      base = { type: "call", name: "pow", args: [base, exp], start: base.start, end: Math.max(exp.end, last.end), nameEnd: last.end };
    }
  }

  private missing(after?: Tok): CalcNode {
    const at = after ? after.end : this.endPos;
    const next = this.peek();
    const s = after ? after.start : Math.max(0, this.endPos - 1);
    this.err(
      after ? "DANGLING_OPERATOR" : "MISSING_OPERAND",
      after ? `"${after.text}" needs a value after it.` : "Expected a value or key here.",
      s, Math.max(at, s + 1),
    );
    return { type: "error", start: next ? next.start : at, end: next ? next.end : at };
  }

  primary(after?: Tok): CalcNode {
    const t = this.peek();
    if (!t) return this.missing(after);
    if (t.k === "num") { this.pos++; return { type: "num", text: t.text, start: t.start, end: t.end }; }
    if (t.k === "var") { this.pos++; return { type: "var", name: t.text, start: t.start, end: t.end }; }
    if (t.k === "str") { this.pos++; return { type: "str", value: t.text, start: t.start, end: t.end }; }
    if (t.k === "op" && t.text === "(") {
      this.pos++;
      if (this.isOp(this.peek(), ")")) {
        const close = this.peek()!; this.pos++;
        this.err("EMPTY_GROUP", "Empty parentheses. Put a value or key inside.", t.start, close.end);
        return { type: "error", start: t.start, end: close.end };
      }
      const inner = this.expr();
      const close = this.peek();
      if (this.isOp(close, ")")) { this.pos++; return { type: "group", expr: inner, start: t.start, end: close!.end }; }
      this.err("UNBALANCED_PAREN", 'Missing closing ")".', t.start, t.end);
      return { type: "group", expr: inner, start: t.start, end: inner.end };
    }
    if (t.k === "word") {
      // "square root of X", "cube root of X", "square of X", "cube of X"
      const pre: [number, string, number | null][] = [
        [this.words("square", "root", "of"), "sqrt", null], [this.words("cube", "root", "of"), "cbrt", null],
        [this.words("square", "of"), "pow", 2], [this.words("cube", "of"), "pow", 3],
      ];
      const hit = pre.find(([len]) => len > 0);
      if (hit) {
        const [len, fn, exp] = hit;
        this.pos += len;
        const ofTok = this.toks[this.pos - 1];
        const operand = this.primary(ofTok);
        this.sugar = true;
        const args = exp === null ? [operand] : [operand, { type: "num", text: String(exp), start: operand.end, end: operand.end } as CalcNode];
        return { type: "call", name: fn, args, start: t.start, end: operand.end, nameEnd: ofTok.end };
      }
      // Function call; plain-language names may be several words: "round down(...)".
      let j = 0;
      const words: Tok[] = [];
      while (this.peek(j)?.k === "word") { words.push(this.peek(j)!); j++; }
      const paren = this.peek(j);
      if (this.isOp(paren, "(")) {
        // Only the trailing run of words forms the name; earlier words are a stray-word error.
        const nameWords = words.length > 1 && !words.every((w) => !!resolveFunctionWord(words.map((x) => x.text).join("_"))) ? [words[words.length - 1]] : words;
        const skipped = words.length - nameWords.length;
        if (skipped) this.err("MISSING_OPERATOR", `Unexpected "${words[0].text}". Put an operator (+, -, *, /) before the function.`, words[0].start, words[skipped - 1].end);
        this.pos += skipped + nameWords.length;
        const nameStart = nameWords[0].start;
        const nameEnd = nameWords[nameWords.length - 1].end;
        const name = nameWords.map((w) => w.text).join("_");
        this.pos++; // "("
        const args: CalcNode[] = [];
        let closed = false;
        if (this.isOp(this.peek(), ")")) { this.pos++; closed = true; }
        else {
          for (;;) {
            args.push(this.expr());
            const nx = this.peek();
            if (this.isOp(nx, ",")) { this.pos++; continue; }
            if (this.isOp(nx, ")")) { this.pos++; closed = true; }
            break;
          }
        }
        const end = closed ? this.toks[this.pos - 1].end : (args[args.length - 1]?.end ?? paren!.end);
        if (!closed) this.err("UNBALANCED_PAREN", `Missing closing ")" for ${name}(.`, paren!.start, paren!.end);
        return { type: "call", name, args, start: nameStart, end, nameEnd };
      }
      this.pos++;
      this.err(
        "UNEXPECTED_TOKEN",
        `Unexpected "${t.text}". Keys must start with "$" (for example $${t.text}).`,
        t.start, t.end, `$${t.text}`,
      );
      return { type: "error", start: t.start, end: t.end };
    }
    // stray operator
    this.pos++;
    if (t.k === "op" && t.text === ")") this.err("UNBALANCED_PAREN", 'Unexpected ")".', t.start, t.end);
    else if (t.k === "op" && t.text === ",") this.err("UNEXPECTED_TOKEN", 'Unexpected ",".', t.start, t.end);
    else this.err("MISSING_OPERAND", `"${t.text}" needs a value before it.`, t.start, t.end);
    return { type: "error", start: t.start, end: t.end };
  }
}

function resolveFunctionWord(raw: string): string | null {
  const lower = raw.toLowerCase().replace(/^math\./, "");
  const canonical = FUNCTION_ALIASES[lower] || lower;
  return canonical in MATH_FUNCTIONS ? canonical : null;
}

// ---- Parse entry ------------------------------------------------------------

export type CalcKind = "choice" | "empty" | "single" | "fold" | "math" | "date" | "plain" | "plain-date" | "invalid";

export interface ParsedCalculation {
  kind: CalcKind;
  /** Root node (top-level call/expr) or null. */
  root: CalcNode | null;
  /** For plain date formulas: base var + steps. */
  dateSteps?: { base: CalcNode; steps: { amount: number; unit: DateUnit; start: number; end: number }[] };
  diagnostics: Diagnostic[];
  canonical: boolean;
}

function parsePlainDate(toks: Tok[], src: string): ParsedCalculation["dateSteps"] | null {
  // $var ( (+|-|plus|minus) number unit )+
  if (toks.length < 4 || toks[0].k !== "var") return null;
  const steps: { amount: number; unit: DateUnit; start: number; end: number }[] = [];
  let i = 1;
  while (i < toks.length) {
    const s = toks[i];
    const sign = s.k === "op" && (s.text === "+" || s.text === "-") ? s.text : s.k === "word" && s.text.toLowerCase() === "plus" ? "+" : s.k === "word" && s.text.toLowerCase() === "minus" ? "-" : null;
    const num = toks[i + 1];
    const unit = toks[i + 2];
    if (!sign || !num || num.k !== "num" || !unit || unit.k !== "word" || !(unit.text.toLowerCase() in UNIT_ALIASES)) return null;
    steps.push({ amount: (sign === "-" ? -1 : 1) * Number(num.text), unit: UNIT_ALIASES[unit.text.toLowerCase()], start: s.start, end: unit.end });
    if (num.text.includes(".")) steps[steps.length - 1].amount = NaN;
    i += 3;
  }
  void src;
  return { base: { type: "var", name: toks[0].text, start: toks[0].start, end: toks[0].end }, steps };
}

export function parseCalculation(input: string, knownKeys: string[] = []): ParsedCalculation {
  const diags: Diagnostic[] = [];
  const src = input || "";
  if (!src.trim()) return { kind: "empty", root: null, diagnostics: [], canonical: true };
  const toks = tokenize(src, diags, knownKeys);

  const dateSteps = diags.length ? null : parsePlainDate(toks, src);
  if (dateSteps) return { kind: "plain-date", root: null, dateSteps, diagnostics: diags, canonical: false };

  const p = new Parser(toks, src, diags);
  const root = p.expr();
  if (!p.done) {
    const t = p.peek()!;
    const prev = toks[p.pos - 1];
    diags.push({
      severity: "error",
      code: t.k === "op" && t.text === ")" ? "UNBALANCED_PAREN" : "MISSING_OPERATOR",
      message: t.k === "op" && t.text === ")" ? 'Unexpected ")".'
        : t.k === "word" && t.text.toLowerCase() in UNIT_ALIASES && prev?.k === "num"
          ? `"${prev.text} ${t.text}" is a date step: it must follow a date key (e.g. $LMPDate + ${prev.text} ${t.text}) and can't be used in a number calculation. Dates can't be combined with "and"; use "or" to fall back to another date.`
          : `Unexpected "${t.text}"${prev ? ` after "${prev.text}"` : ""}. Add an operator (+, -, *, /) between values.`,
      start: t.start,
      end: t.end,
    });
  }

  let kind: CalcKind = "plain";
  let canonical = false;
  if (root.type === "var" && !diags.length) { kind = "single"; canonical = true; }
  else if (root.type === "call") {
    const up = root.name.toUpperCase();
    if (root.name === up && up === "MATH") { kind = "math"; canonical = true; }
    else if (root.name === up && up in FOLD_FUNCTIONS) { kind = "fold"; canonical = true; }
    else if (root.name === up && up === "DATE_ADD") { kind = "date"; canonical = true; }
    else if (root.name === up && (up === "FIRST_OF" || up === "DATE_FIRST")) { kind = "choice"; canonical = true; }
  }
  // The whole text must be the call (no trailing tokens) to count as canonical.
  if (p.sugar) canonical = false;
  if (canonical && (!p.done || (root as any).end < src.trimEnd().length)) canonical = false;
  return { kind, root, diagnostics: diags, canonical };
}

// ---- Alternatives ("or") ----------------------------------------------------

export interface Alternative { start: number; end: number; text: string }

/** Splits on top-level "or" (outside parentheses). Returns null when there is none. */
export function splitAlternatives(input: string, knownKeys: string[] = []): Alternative[] | null {
  const src = input || "";
  const toks = tokenize(src, [], knownKeys);
  let depth = 0;
  const cuts: Tok[] = [];
  for (const t of toks) {
    if (t.k === "op" && t.text === "(") depth++;
    else if (t.k === "op" && t.text === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0 && t.k === "word" && t.text.toLowerCase() === "or") cuts.push(t);
  }
  if (!cuts.length) return null;
  const out: Alternative[] = [];
  let from = 0;
  for (const c of [...cuts, null]) {
    const to = c ? c.start : src.length;
    out.push({ start: from, end: to, text: src.slice(from, to) });
    from = c ? c.end : src.length;
  }
  return out;
}

type Family = "number" | "date";

function altFamily(text: string, ctx: ValidationContext): Family | "unknown" {
  const parsed = parseCalculation(text, ctx.keys.map((k) => k.name));
  if (parsed.kind === "plain-date" || parsed.kind === "date") return "date";
  if (parsed.root?.type === "call" && parsed.root.name.toUpperCase() === "DATE_FIRST") return "date";
  if (parsed.root?.type === "var") {
    const name = parsed.root.name.toLowerCase();
    const dt = `${ctx.keys.find((k) => k.name.toLowerCase() === name)?.dataType || ""}`.toLowerCase();
    return DATE_TYPES.has(dt) ? "date" : "unknown";
  }
  return parsed.kind === "empty" ? "unknown" : "number";
}

function shift(d: Diagnostic, by: number): Diagnostic {
  return { ...d, start: d.start + by, end: d.end + by, suggestion: d.suggestion };
}

function validateChoice(src: string, alts: Alternative[], ctx: ValidationContext): ValidationResult {
  const diags: Diagnostic[] = [];
  const families: Family[] = [];
  alts.forEach((alt, i) => {
    if (!alt.text.trim()) {
      const at = i === 0 ? alt.end : alt.start;
      diags.push({ severity: "error", code: "MISSING_OPERAND", message: i === 0 ? 'Add a formula before "or".' : 'Add a formula after "or".', start: Math.max(0, at - 1), end: Math.min(src.length, at + 2) });
      return;
    }
    const sub = validateCalculation(alt.text, ctx);
    const lead = alt.text.length - alt.text.trimStart().length;
    // The conversion note is given once, for the whole choice below.
    sub.diagnostics.filter((d) => d.code !== "FORMULA_UNWRAPPED").forEach((d) => diags.push(shift(d, alt.start)));
    void lead;
    const fam = altFamily(alt.text, ctx);
    if (fam !== "unknown") families.push(fam);
  });
  if (new Set(families).size > 1) {
    diags.push({ severity: "error", code: "MIXED_FORMULA", message: "Every option must be the same kind: all dates, or all numbers. A date can't fall back to a number.", start: 0, end: src.length });
  }
  const hasErrors = diags.some((d) => d.severity === "error");
  if (!hasErrors) {
    const formula = buildChoice(alts, ctx);
    if (formula) diags.push({ severity: "warning", code: "FORMULA_UNWRAPPED", message: "This will be converted to the formula shown in the preview when you leave the field.", start: 0, end: src.length, suggestion: formula });
  }
  diags.sort((a, b) => a.start - b.start || (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1));
  return { diagnostics: diags, hasErrors: diags.some((d) => d.severity === "error"), ast: null };
}

function buildChoice(alts: Alternative[], ctx: ValidationContext): string | null {
  const compiled: string[] = [];
  for (const alt of alts) {
    const c = compileCalculation(alt.text.trim(), ctx);
    if (c.hasErrors || !c.formula.trim()) return null;
    compiled.push(c.formula.trim());
  }
  const fams = alts.map((a) => altFamily(a.text, ctx));
  const isDate = fams.includes("date");
  return `${isDate ? "DATE_FIRST" : "FIRST_OF"}(${compiled.join(", ")})`;
}

// ---- Validation -------------------------------------------------------------

export interface CalculationContext {
  keys: ConditionKey[];
  allowSelf?: boolean;
  unavailableKeys?: Record<string, string>;
  skipKeyResolution?: boolean;
  selfDataType?: string;
}

function makeKeyChecker(ctx: ValidationContext, diags: Diagnostic[]) {
  const exact = new Map<string, ConditionKey>();
  const lower = new Map<string, ConditionKey>();
  const names: string[] = [];
  for (const k of ctx.keys) {
    exact.set(k.name, k);
    names.push(k.name);
    if (!lower.has(k.name.toLowerCase())) lower.set(k.name.toLowerCase(), k);
  }
  /** Returns the resolved key (for type checks) or null. */
  return (node: { name: string; start: number; end: number }): ConditionKey | null | undefined => {
    const lname = node.name.toLowerCase();
    if (!lname) return null;
    if (lname === "self") {
      if (!ctx.allowSelf) diags.push({ severity: "warning", code: "SELF_NOT_ALLOWED", message: '"$self" may not be available here — it refers to the current field\'s own value.', start: node.start, end: node.end });
      return ctx.selfDataType ? { name: "self", dataType: ctx.selfDataType } : null;
    }
    if (ctx.skipKeyResolution) return exact.get(node.name) || lower.get(lname) || null;
    const unavailable = Object.entries(ctx.unavailableKeys || {}).find(([k]) => k.toLowerCase() === lname)?.[1];
    if (unavailable) {
      diags.push({ severity: "error", code: "OUTCOME_NOT_AVAILABLE", message: unavailable, start: node.start, end: node.end });
      return null;
    }
    const hit = exact.get(node.name);
    if (hit) return hit;
    const canon = lower.get(lname)?.name;
    if (canon) {
      diags.push({ severity: "error", code: "KEY_CASE", message: `Key "$${node.name}" has the wrong casing — use "$${canon}".`, start: node.start, end: node.end, suggestion: `$${canon}` });
      return lower.get(lname)!;
    }
    const sug = suggestClosest(node.name, names);
    diags.push({ severity: "error", code: "UNKNOWN_KEY", message: `Unknown key "$${node.name}".${sug ? ` Did you mean "$${sug}"?` : ""}`, start: node.start, end: node.end, suggestion: sug ? `$${sug}` : undefined });
    return null;
  };
}

function evalConst(node: CalcNode): number | null {
  switch (node.type) {
    case "num": return Number(node.text);
    case "group": return evalConst(node.expr);
    case "unary": { const v = evalConst(node.arg); return v === null ? null : node.op === "-" ? -v : v; }
    case "bin": {
      const a = evalConst(node.left), b = evalConst(node.right);
      if (a === null || b === null) return null;
      return node.op === "+" ? a + b : node.op === "-" ? a - b : node.op === "*" ? a * b : node.op === "/" ? a / b : a % b;
    }
    default: return null;
  }
}

export function validateCalculation(input: string, ctx: ValidationContext): ValidationResult {
  const src = input || "";
  const alternatives = splitAlternatives(src, ctx.keys.map((k) => k.name));
  if (alternatives) return validateChoice(src, alternatives, ctx);
  const parsed = parseCalculation(src, ctx.keys.map((k) => k.name));
  const diags: Diagnostic[] = [...parsed.diagnostics];
  const checkKey = makeKeyChecker(ctx, diags);
  const add = (severity: "error" | "warning", code: DiagnosticCode, message: string, s: Span, suggestion?: string) =>
    diags.push({ severity, code, message, start: s.start, end: s.end, suggestion });

  const checkNumericVar = (node: CalcNode & { type: "var" }) => {
    const key = checkKey(node);
    const dt = `${key?.dataType || ""}`.toLowerCase();
    if (key && NUMERIC_BAD_TYPES.has(dt)) add("warning", "TYPE_MISMATCH", `"$${node.name}" is a ${dt} key, not a number, so it may not calculate as expected.`, node);
  };

  const visitNumeric = (node: CalcNode, inMath: boolean): void => {
    switch (node.type) {
      case "num": case "error": return;
      case "str": add("error", "UNEXPECTED_TOKEN", "Text is not allowed in a calculation. Use numbers and $keys.", node); return;
      case "var": checkNumericVar(node); return;
      case "group": visitNumeric(node.expr, inMath); return;
      case "unary": visitNumeric(node.arg, inMath); return;
      case "bin": {
        visitNumeric(node.left, inMath); visitNumeric(node.right, inMath);
        if ((node.op === "/" || node.op === "%") && evalConst(node.right) === 0) add("error", "DIVIDE_BY_ZERO", node.op === "/" ? "Division by zero." : "Remainder by zero.", node.right);
        return;
      }
      case "call": {
        const up = node.name.toUpperCase();
        if (up === "DATE_ADD" || up === "MATH" || up in FOLD_FUNCTIONS) {
          add("error", up === "DATE_ADD" ? "MIXED_FORMULA" : "UNKNOWN_FUNCTION",
            up === "DATE_ADD" ? "Date calculations can't be combined with numbers inside a formula."
              : `${up}(...) must be the whole formula; it can't be nested inside another calculation. Use + - * / and rounding functions instead.`,
            { start: node.start, end: node.nameEnd });
          node.args.forEach((a) => visitNumeric(a, inMath));
          return;
        }
        const fn = resolveFunctionWord(node.name);
        if (!fn) {
          const options = [...Object.keys(MATH_FUNCTIONS), ...Object.keys(FUNCTION_ALIASES)];
          const sug = suggestClosest(node.name.toLowerCase().replace(/^math\./, ""), options);
          add("error", "UNKNOWN_FUNCTION", `Unknown function "${node.name}".${sug ? ` Did you mean "${sug}"?` : ""} Allowed: ${Object.keys(MATH_FUNCTIONS).join(", ")}.`, { start: node.start, end: node.nameEnd });
        } else {
          const [min, max] = MATH_FUNCTIONS[fn];
          if (node.args.length < min || node.args.length > max) {
            add("error", "FUNCTION_ARGS", `${node.name}() takes ${min === max ? min : max === Infinity ? `at least ${min}` : `${min} to ${max}`} value${max === 1 ? "" : "s"}, but got ${node.args.length}.`, node);
          }
        }
        node.args.forEach((a) => visitNumeric(a, inMath));
      }
    }
  };

  const visitDate = (node: CalcNode): void => {
    if (node.type === "error") return;
    if (node.type === "var") {
      const key = checkKey(node);
      const dt = `${key?.dataType || ""}`.toLowerCase();
      if (key && dt && !DATE_TYPES.has(dt)) add("warning", "TYPE_MISMATCH", `"$${node.name}" is a ${dt} key, not a date.`, node);
      return;
    }
    if (node.type === "call" && node.name.toUpperCase() === "DATE_ADD") {
      if (node.name !== "DATE_ADD") add("error", "UNKNOWN_FUNCTION", 'Write the function as "DATE_ADD".', { start: node.start, end: node.nameEnd }, "DATE_ADD");
      if (node.args.length !== 3) { add("error", "FUNCTION_ARGS", `DATE_ADD() takes a date, a whole number and a unit, e.g. DATE_ADD($LMPDate, 280, 'days').`, node); node.args.forEach((a, i) => (i === 0 ? visitDate(a) : visitNumeric(a, false))); return; }
      const [base, amount, unit] = node.args;
      visitDate(base);
      const v = evalConst(amount);
      if (amount.type === "var") checkNumericVar(amount);
      else if (v === null) add("error", "DATE_AMOUNT", "The amount must be a whole number or a number key.", amount);
      else if (!Number.isInteger(v)) add("error", "DATE_AMOUNT", "Use a whole number of days, weeks, months or years (no decimals).", amount);
      if (unit.type !== "str" || !DATE_UNITS.includes(unit.value as DateUnit)) add("error", "UNKNOWN_UNIT", `Unit must be one of ${DATE_UNITS.map((u) => `'${u}'`).join(", ")}.`, unit);
      return;
    }
    add("error", "MIXED_FORMULA", "A date calculation starts from a date key, e.g. $LMPDate + 280 days.", node);
  };

  const foldArity = (node: CalcNode & { type: "call" }, min: number) => {
    if (node.args.length < min) add("error", "FUNCTION_ARGS", `${node.name}() needs at least ${min} value${min === 1 ? "" : "s"}.`, node);
  };

  if (parsed.kind === "empty") {
    // fallthrough: valid
  } else if (parsed.kind === "plain-date") {
    const { base, steps } = parsed.dateSteps!;
    visitDate(base);
    steps.forEach((s) => { if (!Number.isFinite(s.amount)) add("error", "DATE_AMOUNT", "Use a whole number of days, weeks, months or years (no decimals).", s); });
    const compiled = compileFromParsed(parsed);
    if (compiled && !diags.some((d) => d.severity === "error")) add("warning", "FORMULA_UNWRAPPED", "This will be saved as the formula shown in the preview.", { start: 0, end: src.length }, compiled);
  } else if (parsed.root) {
    const root = parsed.root;
    const visitRoot = (node: CalcNode, family: Family | null): void => {
      if (node.type === "call" && ["FIRST_OF", "DATE_FIRST"].includes(node.name.toUpperCase())) {
        const dateChoice = node.name.toUpperCase() === "DATE_FIRST";
        if (node.name !== node.name.toUpperCase()) add("error", "UNKNOWN_FUNCTION", `Write the function as "${node.name.toUpperCase()}".`, { start: node.start, end: node.nameEnd }, node.name.toUpperCase());
        if (node.args.length < 2) add("error", "FUNCTION_ARGS", `${node.name}() needs at least 2 options to choose from.`, node);
        node.args.forEach((a) => {
          if (a.type === "call" && ["FIRST_OF", "DATE_FIRST"].includes(a.name.toUpperCase())) { visitRoot(a, dateChoice ? "date" : "number"); return; }
          const isDateArg = a.type === "call" && a.name.toUpperCase() === "DATE_ADD";
          if (dateChoice ? (a.type !== "var" && !isDateArg) : isDateArg) {
            add("error", "MIXED_FORMULA", dateChoice ? "DATE_FIRST() options must be dates: a date key or DATE_ADD(...)." : "FIRST_OF() options must be numbers, not dates. Use DATE_FIRST() for dates.", a);
            return;
          }
          visitRoot(a, dateChoice ? "date" : "number");
        });
        return;
      }
      void family;
      visitSingle(node);
    };
    const visitSingle = (root: CalcNode): void => {
    if (root.type === "call" && root.name.toUpperCase() === "DATE_ADD") {
      visitDate(root);
    } else if (root.type === "call" && root.name.toUpperCase() === "MATH") {
      if (root.name !== "MATH") add("error", "UNKNOWN_FUNCTION", 'Write the function as "MATH".', { start: root.start, end: root.nameEnd }, "MATH");
      if (root.args.length !== 1) add("error", "FUNCTION_ARGS", `MATH() takes one formula, but got ${root.args.length}. Separate nothing with commas; use + - * / instead.`, root);
      root.args.forEach((a) => visitNumeric(a, true));
    } else if (root.type === "call" && root.name.toUpperCase() in FOLD_FUNCTIONS) {
      if (root.name !== root.name.toUpperCase()) add("error", "UNKNOWN_FUNCTION", `Write the function as "${root.name.toUpperCase()}".`, { start: root.start, end: root.nameEnd }, root.name.toUpperCase());
      foldArity(root, FOLD_FUNCTIONS[root.name.toUpperCase()]);
      root.args.forEach((a) => visitNumeric(a, false));
    } else if (root.type === "var") {
      checkNumericVar(root);
    } else {
      visitNumeric(root, false);
    }
    };
    visitRoot(root, null);
    if (!parsed.canonical && !diags.some((d) => d.severity === "error")) {
      const compiled = compileFromParsed(parsed);
      if (compiled) add("warning", "FORMULA_UNWRAPPED", "This will be converted to the formula shown in the preview when you leave the field.", { start: 0, end: src.length }, compiled);
    }
  }

  diags.sort((a, b) => a.start - b.start || (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1));
  return { diagnostics: diags, hasErrors: diags.some((d) => d.severity === "error"), ast: null };
}

// ---- Compile (plain language -> canonical) ----------------------------------

function emit(node: CalcNode): string {
  switch (node.type) {
    case "num": return node.text;
    case "var": return `$${node.name}`;
    case "str": return `'${node.value}'`;
    case "error": return "";
    case "group": return `(${emit(node.expr)})`;
    case "unary": return `${node.op}${emit(node.arg)}`;
    case "bin": return `${emit(node.left)} ${node.op} ${emit(node.right)}`;
    case "call": return `Math.${resolveFunctionWord(node.name) || node.name}(${node.args.map(emit).join(", ")})`;
  }
}

function emitDate(base: string, steps: { amount: number; unit: DateUnit }[]): string {
  return steps.reduce((acc, s) => `DATE_ADD(${acc}, ${s.amount}, '${s.unit}')`, base);
}

function compileFromParsed(parsed: ParsedCalculation): string | null {
  if (parsed.kind === "plain-date" && parsed.dateSteps) {
    const { base, steps } = parsed.dateSteps;
    if (steps.some((s) => !Number.isFinite(s.amount))) return null;
    return emitDate(emit(base), steps);
  }
  const root = parsed.root;
  if (!root) return null;
  if (root.type === "call" && root.name.toUpperCase() === "MATH") {
    return root.args.length === 1 ? `MATH(${emit(root.args[0])})` : null;
  }
  if (root.type === "call" && root.name.toUpperCase() in FOLD_FUNCTIONS) return `${root.name.toUpperCase()}(${root.args.map(emit).join(", ")})`;
  if (root.type === "call" && root.name.toUpperCase() === "DATE_ADD") return null;
  if (root.type === "var") return emit(root);
  return `MATH(${emit(root)})`;
}

export interface CompileResult {
  /** The canonical formula to store. Equals `input` when it was already canonical. */
  formula: string;
  changed: boolean;
  diagnostics: Diagnostic[];
  hasErrors: boolean;
}

/**
 * Turns plain-language or loose input into the canonical stored formula. Never alters canonical
 * input (idempotent), never produces a formula that fails validation: on any error the input is
 * returned unchanged with the diagnostics.
 */
export function compileCalculation(input: string, ctx: ValidationContext): CompileResult {
  const src = input || "";
  const result = validateCalculation(src, ctx);
  if (result.hasErrors) return { formula: src, changed: false, diagnostics: result.diagnostics, hasErrors: true };
  const alternatives = splitAlternatives(src, ctx.keys.map((k) => k.name));
  if (alternatives) {
    const choice = buildChoice(alternatives, ctx);
    const recheck = choice ? validateCalculation(choice, ctx) : null;
    if (!choice || recheck!.hasErrors) return { formula: src, changed: false, diagnostics: result.diagnostics, hasErrors: true };
    return { formula: choice, changed: choice !== src, diagnostics: recheck!.diagnostics, hasErrors: false };
  }
  const parsed = parseCalculation(src, ctx.keys.map((k) => k.name));
  if (parsed.canonical || parsed.kind === "empty") return { formula: src, changed: false, diagnostics: result.diagnostics, hasErrors: false };
  const compiled = compileFromParsed(parsed);
  if (!compiled) return { formula: src, changed: false, diagnostics: result.diagnostics, hasErrors: false };
  // Safety net: the compiled text must itself be canonical and valid.
  const recheck = validateCalculation(compiled, ctx);
  const reparsed = parseCalculation(compiled, ctx.keys.map((k) => k.name));
  if (recheck.hasErrors || !reparsed.canonical) {
    return { formula: src, changed: false, diagnostics: [...result.diagnostics, ...recheck.diagnostics.filter((d) => d.severity === "error")], hasErrors: true };
  }
  return { formula: compiled, changed: compiled !== src, diagnostics: recheck.diagnostics, hasErrors: false };
}

// ---- Evaluate (preview / tests) --------------------------------------------

export type CalcValues = Record<string, number | string | null | undefined>;
export type EvalResult = { ok: true; value: number | string } | { ok: false; error: string };

/** Adds calendar months/years clamping to the last day of the month (31 Jan + 1 month = 28/29 Feb). UTC. */
export function addToDate(date: Date, amount: number, unit: DateUnit): Date {
  const d = new Date(date.getTime());
  if (unit === "days" || unit === "weeks") {
    d.setUTCDate(d.getUTCDate() + amount * (unit === "weeks" ? 7 : 1));
    return d;
  }
  const months = unit === "years" ? amount * 12 : amount;
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

export function evaluateCalculation(input: string, values: CalcValues, ctx: ValidationContext = { keys: [], skipKeyResolution: true }): EvalResult {
  const check = validateCalculation(input, ctx);
  if (check.hasErrors) return { ok: false, error: check.diagnostics.find((d) => d.severity === "error")!.message };
  const compiled = compileCalculation(input, ctx).formula;
  const parsed = parseCalculation(compiled, ctx.keys.map((k) => k.name));
  if (!parsed.root) return { ok: false, error: "Nothing to calculate." };

  const lookup = (name: string): number | string => {
    const hit = Object.keys(values).find((k) => k === name) ?? Object.keys(values).find((k) => k.toLowerCase() === name.toLowerCase());
    const v = hit === undefined ? undefined : values[hit];
    if (v === undefined || v === null || v === "") throw new Error(`Enter a value for $${name}.`);
    return v;
  };
  const num = (node: CalcNode): number => {
    switch (node.type) {
      case "num": return Number(node.text);
      case "var": { const v = Number(lookup(node.name)); if (Number.isNaN(v)) throw new Error(`$${node.name} is not a number.`); return v; }
      case "group": return num(node.expr);
      case "unary": return node.op === "-" ? -num(node.arg) : num(node.arg);
      case "bin": {
        const a = num(node.left), b = num(node.right);
        if ((node.op === "/" || node.op === "%") && b === 0) throw new Error("Division by zero.");
        return node.op === "+" ? a + b : node.op === "-" ? a - b : node.op === "*" ? a * b : node.op === "/" ? a / b : a % b;
      }
      case "call": {
        const fn = resolveFunctionWord(node.name)!;
        const a = node.args.map(num);
        if (fn === "sqrt" && a[0] < 0) throw new Error("Can't take the square root of a negative number.");
        const out = fn === "pow" ? Math.pow(a[0], a[1]) : fn === "min" ? Math.min(...a) : fn === "max" ? Math.max(...a) : (Math as any)[fn](a[0]);
        if (!Number.isFinite(out)) throw new Error("This calculation doesn't give a valid number.");
        return out;
      }
      default: throw new Error("Cannot calculate this.");
    }
  };
  const date = (node: CalcNode): Date => {
    if (node.type === "var") {
      const d = new Date(`${lookup(node.name)}`);
      if (Number.isNaN(d.getTime())) throw new Error(`$${node.name} is not a valid date.`);
      return d;
    }
    if (node.type === "call") return addToDate(date(node.args[0]), num(node.args[1]), (node.args[2] as any).value);
    throw new Error("Cannot calculate this date.");
  };

  const evalRoot = (root: CalcNode, asDate = false): number | string => {
    if (root.type === "call" && (root.name === "FIRST_OF" || root.name === "DATE_FIRST")) {
      let last: unknown = new Error("No option has a value.");
      for (const a of root.args) {
        try { return evalRoot(a, root.name === "DATE_FIRST"); } catch (e) { last = e; }
      }
      throw last;
    }
    if (asDate && root.type === "var") return date(root).toISOString().slice(0, 10);
    const r = evalSingle(root);
    if (!r.ok) throw new Error(r.error);
    return r.value;
  };
  const evalSingle = (root: CalcNode): EvalResult => {
  try {
    if (root.type === "call" && root.name === "DATE_ADD") return { ok: true, value: date(root).toISOString().slice(0, 10) };
    if (root.type === "var") return { ok: true, value: num(root) };
    if (root.type === "call" && root.name === "MATH") return { ok: true, value: num(root.args[0]) };
    if (root.type === "call") {
      const a = root.args.map(num);
      const n = root.name;
      const value = n === "SUM" ? a.reduce((x, y) => x + y, 0) : n === "MULTIPLY" ? a.reduce((x, y) => x * y, 1)
        : n === "SUBTRACT" ? a.slice(1).reduce((x, y) => x - y, a[0]) : a.slice(1).reduce((x, y) => { if (y === 0) throw new Error("Division by zero."); return x / y; }, a[0]);
      return { ok: true, value };
    }
    return { ok: false, error: "Cannot calculate this." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Cannot calculate this." };
  }
  };

  try {
    return { ok: true, value: evalRoot(parsed.root) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Cannot calculate this." };
  }
}

/** Distinct key names a formula references (for building "try it" inputs). */
export function getCalculationKeys(input: string): string[] {
  const out: string[] = [];
  for (const m of (input || "").matchAll(/\$([A-Za-z0-9_]+)/g)) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}
