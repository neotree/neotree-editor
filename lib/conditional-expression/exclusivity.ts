import type { ComparisonOp, ConditionKey, MembershipOp, Node, ProgramNode, ValidationContext } from "./ast";
import { parse } from "./parser";

/**
 * Decides whether two conditions can ever be true at the same time.
 *
 * Used to tell apart two fields that merely share a key from two fields that
 * share a key AND can be on screen together. The procedure is deliberately
 * one-sided: it only ever reports "exclusive" when it can PROVE the conjunction
 * is unsatisfiable. Anything it cannot decide comes back "overlapping" or
 * "unknown", so a caller can never be told two fields are safe when they are not.
 *
 * Soundness notes (each mirrors the mobile runtime, not the DSL as written):
 *
 * - An unset key survives substitution as a literal string, so `$K = 'a'` is
 *   false when K has no answer while `$K != 'a'` is true. "Unset" is therefore a
 *   value in every key's domain, which is why option exhaustion
 *   (`!= 'a' and != 'b'` over a two-option key) is NOT a refutation.
 * - The runtime lowercases the whole parsed condition, so values compare
 *   case-insensitively: `'M'` and `'m'` are the same value, never an exclusive pair.
 * - Comparison uses `==`, so `'5'` and `5` are the same value.
 * - `excludes` is never used to refute: its negation is commented out in the
 *   runtime (src/contexts/script/index.tsx), where it currently evaluates
 *   exactly like `includes`. Dropping a conjunct can only make a formula easier
 *   to satisfy, so ignoring it keeps the verdict on the safe side.
 */

export type ExclusivityVerdict = "exclusive" | "overlapping" | "unknown";

export interface ConditionComparison {
  verdict: ExclusivityVerdict;
  /** For "overlapping": a concrete assignment that satisfies both conditions. */
  witness?: string;
  /** For "unknown": why the check could not decide. */
  reason?: string;
}

export interface ExclusivityContext {
  /** Key catalogue, used only to tell single-value keys from multi-select ones. */
  keys?: ConditionKey[];
  /** Key that "$self" refers to (both fields share a key, so it is the same variable). */
  selfKey?: string;
}

// Real conditions are 1-4 atoms. The caps only exist so a pathological
// expression can never stall a save or a publish.
const MAX_ATOMS = 16;
const MAX_TERMS = 256;
const MAX_TERM_PAIRS = 4096;

const MULTI_VALUE_TYPES = new Set([
  "multi_select",
  "multiselect",
  "checklist",
  "diagnosis",
  "problem",
  "drug",
  "fluid",
  "list",
]);

function isMultiValueType(dataType: string): boolean {
  const type = `${dataType || ""}`.toLowerCase();
  if (!type) return false;
  if (MULTI_VALUE_TYPES.has(type)) return true;
  return type === "set" || type.startsWith("set<");
}

interface AtomValue {
  /** Trimmed + lowercased, matching how the runtime compares. */
  text: string;
  /** Set when the value would coerce cleanly to a number. */
  num: number | null;
}

type Atom =
  /** `display` keeps the author's spelling of the key, for readable witnesses. */
  | { kind: "cmp"; key: string; display: string; op: ComparisonOp; value: AtomValue }
  | { kind: "member"; key: string; display: string; op: MembershipOp; values: string[] }
  /** Anything the solver cannot reason about (key-to-key comparison, parse gap). */
  | { kind: "opaque" };

/** One conjunctive term: every atom in it must hold. */
type Term = Atom[];

function toAtomValue(raw: unknown): AtomValue {
  const text = `${raw ?? ""}`.trim().toLowerCase();
  const num = text !== "" && /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : null;
  return { text, num };
}

/** Loose equality, matching the runtime's `==`: numeric when both sides coerce. */
function valuesEqual(a: AtomValue, b: AtomValue): boolean {
  if (a.num !== null && b.num !== null) return a.num === b.num;
  return a.text === b.text;
}

function normalizeKeyName(name: string, selfKey?: string): string {
  const key = `${name || ""}`.trim().toLowerCase();
  if (key === "self" && selfKey) return `${selfKey}`.trim().toLowerCase();
  return key;
}

/** The key as the author spelled it, so witnesses read like the script does. */
function displayKeyName(name: string, selfKey?: string): string {
  const raw = `${name || ""}`.trim();
  if (raw.toLowerCase() === "self" && selfKey) return `${selfKey}`.trim();
  return raw;
}

class Budget {
  terms = 0;

  /** Returns false once a conversion has produced more terms than we allow. */
  spend(count: number): boolean {
    this.terms += count;
    return this.terms <= MAX_TERMS;
  }
}

function countAtoms(node: Node): number {
  switch (node.type) {
    case "Program":
      return node.lines.reduce((sum, line) => sum + countAtoms(line), 0);
    case "Logical":
      return countAtoms(node.left) + countAtoms(node.right);
    case "Group":
      return countAtoms(node.expr);
    case "Comparison":
    case "Membership":
      return 1;
    default:
      return 0;
  }
}

function crossProduct(left: Term[], right: Term[], budget: Budget): Term[] | null {
  const out: Term[] = [];
  for (const l of left) {
    for (const r of right) {
      out.push([...l, ...r]);
    }
  }
  return budget.spend(out.length) ? out : null;
}

/** Converts a parsed condition into disjunctive normal form. null = undecidable. */
function toTerms(node: Node, ctx: ExclusivityContext, budget: Budget): Term[] | null {
  switch (node.type) {
    case "Program": {
      // Lines are implicitly ANDed.
      let acc: Term[] = [[]];
      for (const line of node.lines) {
        const next = toTerms(line, ctx, budget);
        if (!next) return null;
        const combined = crossProduct(acc, next, budget);
        if (!combined) return null;
        acc = combined;
      }
      return acc;
    }
    case "Logical": {
      const left = toTerms(node.left, ctx, budget);
      if (!left) return null;
      const right = toTerms(node.right, ctx, budget);
      if (!right) return null;
      if (node.op === "and") return crossProduct(left, right, budget);
      const out = [...left, ...right];
      return budget.spend(out.length) ? out : null;
    }
    case "Group":
      // "[ ]" isolates evaluation at runtime but is still plain grouping for
      // satisfiability purposes.
      return toTerms(node.expr, ctx, budget);
    case "Comparison": {
      if (node.left.type !== "Var" || node.right.type !== "Literal") {
        return [[{ kind: "opaque" }]];
      }
      const key = normalizeKeyName(node.left.name, ctx.selfKey);
      if (!key) return [[{ kind: "opaque" }]];
      const display = displayKeyName(node.left.name, ctx.selfKey);
      return [[{ kind: "cmp", key, display, op: node.op, value: toAtomValue(node.right.value) }]];
    }
    case "Membership": {
      if (node.target.type !== "Var") return [[{ kind: "opaque" }]];
      const key = normalizeKeyName(node.target.name, ctx.selfKey);
      const values: string[] = [];
      for (const value of node.values) {
        if (value.type !== "Literal") return [[{ kind: "opaque" }]];
        values.push(toAtomValue(value.value).text);
      }
      if (!key || !values.length) return [[{ kind: "opaque" }]];
      const display = displayKeyName(node.target.name, ctx.selfKey);
      return [[{ kind: "member", key, display, op: node.op as MembershipOp, values }]];
    }
    case "Error":
      return null;
    default:
      // A bare key or literal is not a valid condition; the parser has already
      // flagged it, so treat it as something we cannot reason about.
      return [[{ kind: "opaque" }]];
  }
}

interface KeyConstraints {
  eq: AtomValue[];
  neq: AtomValue[];
  lo: { value: number; strict: boolean } | null;
  hi: { value: number; strict: boolean } | null;
  includes: string[];
  /** An ordering comparison against a non-numeric value — not reasoned about. */
  hasLooseOrdering: boolean;
}

function emptyConstraints(): KeyConstraints {
  return { eq: [], neq: [], lo: null, hi: null, includes: [], hasLooseOrdering: false };
}

function applyAtom(constraints: KeyConstraints, atom: Atom): void {
  if (atom.kind === "member") {
    // `excludes` is never used to refute — see the soundness notes above.
    if (atom.op === "includes") constraints.includes.push(...atom.values);
    return;
  }
  if (atom.kind !== "cmp") return;

  switch (atom.op) {
    case "=":
    case "==":
      constraints.eq.push(atom.value);
      return;
    case "!=":
      constraints.neq.push(atom.value);
      return;
    case ">":
    case ">=":
    case "<":
    case "<=": {
      if (atom.value.num === null) {
        constraints.hasLooseOrdering = true;
        return;
      }
      const strict = atom.op === ">" || atom.op === "<";
      if (atom.op === ">" || atom.op === ">=") {
        if (!constraints.lo || atom.value.num > constraints.lo.value || (atom.value.num === constraints.lo.value && strict)) {
          constraints.lo = { value: atom.value.num, strict };
        }
      } else if (!constraints.hi || atom.value.num < constraints.hi.value || (atom.value.num === constraints.hi.value && strict)) {
        constraints.hi = { value: atom.value.num, strict };
      }
      return;
    }
    default:
      return;
  }
}

function satisfiesInterval(value: number, constraints: KeyConstraints): boolean {
  if (constraints.lo) {
    if (constraints.lo.strict ? value <= constraints.lo.value : value < constraints.lo.value) return false;
  }
  if (constraints.hi) {
    if (constraints.hi.strict ? value >= constraints.hi.value : value > constraints.hi.value) return false;
  }
  return true;
}

function intervalIsEmpty(constraints: KeyConstraints): boolean {
  const { lo, hi } = constraints;
  if (!lo || !hi) return false;
  if (lo.value > hi.value) return true;
  return lo.value === hi.value && (lo.strict || hi.strict);
}

/**
 * Can one key satisfy all of these atoms at once? Only returns false when a
 * refutation is certain; every unproven case is treated as satisfiable.
 */
function keyIsSatisfiable(atoms: Atom[], dataType: string | undefined): boolean {
  const constraints = emptyConstraints();
  for (const atom of atoms) applyAtom(constraints, atom);

  // Two different required values.
  for (let i = 0; i < constraints.eq.length; i++) {
    for (let j = i + 1; j < constraints.eq.length; j++) {
      if (!valuesEqual(constraints.eq[i], constraints.eq[j])) return false;
    }
  }

  // A required value that is also forbidden.
  for (const eq of constraints.eq) {
    for (const neq of constraints.neq) {
      if (valuesEqual(eq, neq)) return false;
    }
  }

  // A required value outside the range the other side demands.
  for (const eq of constraints.eq) {
    if (eq.num !== null && !satisfiesInterval(eq.num, constraints)) return false;
  }

  if (intervalIsEmpty(constraints)) return false;

  // `includes` on a single-value key can only hold for a value in the list. On a
  // multi-select key `=` is not a value test, so the two say nothing about each
  // other and we leave them alone.
  const singleValued = !!dataType && !isMultiValueType(dataType);
  if (singleValued && constraints.includes.length) {
    for (const eq of constraints.eq) {
      if (!constraints.includes.some((option) => valuesEqual(eq, toAtomValue(option)))) return false;
    }
  }

  return true;
}

function describeKeyWitness(atoms: Atom[]): string | null {
  const constraints = emptyConstraints();
  for (const atom of atoms) applyAtom(constraints, atom);

  const key = atoms.reduce<string>((acc, atom) => acc || (atom.kind === "opaque" ? "" : atom.display), "");
  if (!key) return null;

  if (constraints.eq.length) return `$${key} = '${constraints.eq[0].text}'`;
  if (constraints.includes.length) return `$${key} includes '${constraints.includes[0]}'`;
  if (constraints.lo && constraints.hi) {
    const mid = (constraints.lo.value + constraints.hi.value) / 2;
    return `$${key} = ${mid}`;
  }
  if (constraints.lo) return `$${key} = ${constraints.lo.strict ? constraints.lo.value + 1 : constraints.lo.value}`;
  if (constraints.hi) return `$${key} = ${constraints.hi.strict ? constraints.hi.value - 1 : constraints.hi.value}`;
  if (constraints.neq.length) return `$${key} is anything other than '${constraints.neq[0].text}'`;
  return null;
}

/** Groups a term's atoms by key. Atoms only ever tie one key to a constant. */
function groupByKey(term: Term): { groups: Map<string, Atom[]>; hasOpaque: boolean } {
  const groups = new Map<string, Atom[]>();
  let hasOpaque = false;
  for (const atom of term) {
    if (atom.kind === "opaque") {
      hasOpaque = true;
      continue;
    }
    const existing = groups.get(atom.key);
    if (existing) existing.push(atom);
    else groups.set(atom.key, [atom]);
  }
  return { groups, hasOpaque };
}

function termPairSatisfiable(
  a: Term,
  b: Term,
  dataTypeOf: (key: string) => string | undefined,
): { satisfiable: boolean; witness?: string } {
  const { groups } = groupByKey([...a, ...b]);

  let refuted = false;
  groups.forEach((atoms, key) => {
    if (refuted) return;
    if (!keyIsSatisfiable(atoms, dataTypeOf(key))) refuted = true;
  });
  if (refuted) return { satisfiable: false };

  const parts: string[] = [];
  groups.forEach((atoms) => {
    if (parts.length >= 3) return;
    const part = describeKeyWitness(atoms);
    if (part) parts.push(part);
  });

  return { satisfiable: true, witness: parts.join(" and ") || undefined };
}

function parseCondition(input: string): { ast: ProgramNode; hasErrors: boolean } {
  const { ast, diagnostics } = parse(input);
  return { ast, hasErrors: diagnostics.some((d) => d.severity === "error") };
}

/**
 * Compares two conditions from the same context (e.g. two fields on one screen).
 *
 * An empty condition means "always shown", so it always overlaps.
 */
export function compareConditions(
  conditionA: string | null | undefined,
  conditionB: string | null | undefined,
  ctx: ExclusivityContext = {},
): ConditionComparison {
  const a = `${conditionA ?? ""}`.trim();
  const b = `${conditionB ?? ""}`.trim();

  if (!a || !b) return { verdict: "overlapping", witness: "neither condition restricts both fields" };
  if (a.toLowerCase() === b.toLowerCase()) return { verdict: "overlapping", witness: "both use the same condition" };

  const parsedA = parseCondition(a);
  if (parsedA.hasErrors) return { verdict: "unknown", reason: "the first condition has a syntax error" };
  const parsedB = parseCondition(b);
  if (parsedB.hasErrors) return { verdict: "unknown", reason: "the second condition has a syntax error" };

  if (countAtoms(parsedA.ast) + countAtoms(parsedB.ast) > MAX_ATOMS) {
    return { verdict: "unknown", reason: "the conditions are too large to check automatically" };
  }

  const budget = new Budget();
  const termsA = toTerms(parsedA.ast, ctx, budget);
  const termsB = termsA ? toTerms(parsedB.ast, ctx, budget) : null;
  if (!termsA || !termsB) {
    return { verdict: "unknown", reason: "the conditions are too complex to check automatically" };
  }
  if (termsA.length * termsB.length > MAX_TERM_PAIRS) {
    return { verdict: "unknown", reason: "the conditions are too complex to check automatically" };
  }

  const dataTypeByKey = new Map<string, string>();
  for (const key of ctx.keys || []) {
    const name = `${key?.name || ""}`.trim().toLowerCase();
    if (name && key?.dataType) dataTypeByKey.set(name, `${key.dataType}`);
  }
  const dataTypeOf = (key: string) => dataTypeByKey.get(key);

  for (const termA of termsA) {
    for (const termB of termsB) {
      const result = termPairSatisfiable(termA, termB, dataTypeOf);
      if (result.satisfiable) return { verdict: "overlapping", witness: result.witness };
    }
  }

  return { verdict: "exclusive" };
}

/**
 * Folds a set of conditions that all share one slot into a single verdict.
 * "exclusive" only when every pair is provably exclusive.
 */
export function compareConditionSet(
  conditions: (string | null | undefined)[],
  ctx: ExclusivityContext = {},
): ConditionComparison {
  let unknown: ConditionComparison | null = null;

  for (let i = 0; i < conditions.length; i++) {
    for (let j = i + 1; j < conditions.length; j++) {
      const result = compareConditions(conditions[i], conditions[j], ctx);
      if (result.verdict === "overlapping") return result;
      if (result.verdict === "unknown" && !unknown) unknown = result;
    }
  }

  return unknown || { verdict: "exclusive" };
}

/** Convenience for callers that already hold a ValidationContext. */
export function exclusivityContextFrom(ctx: ValidationContext, selfKey?: string): ExclusivityContext {
  return { keys: ctx.keys, selfKey };
}
