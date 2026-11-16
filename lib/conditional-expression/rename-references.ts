import type { Node } from "./ast";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";

export type ConditionNameRename = {
  from: string;
  to: string;
};

export type ConditionValueRename = ConditionNameRename & {
  /** Variables (without "$") whose option values are being renamed. */
  parents: string[];
};

const VAR_NAME = /^[A-Za-z0-9_.\-]+$/;
const BARE_VALUE = /^[A-Za-z0-9_.\-]+$/;

const lower = (value: string) => `${value || ""}`.trim().toLowerCase();

type Edit = { start: number; end: number; text: string };

/**
 * Rewrites data key references inside one conditional expression:
 * - `vars`: `$from` -> `$to` (matched case-insensitively, like key resolution).
 * - `values`: option literals compared against one of `parents`, in
 *   `$parent = 'from'` / `$parent != 'from'` and `$parent includes [... 'from' ...]`.
 *
 * Only exact token/literal spans change; everything else (spacing, quotes,
 * comments in other literals) is preserved. A rename whose new name cannot be
 * written in the same form (e.g. a variable name with spaces) is skipped.
 */
export function renameConditionReferences(
  input: string,
  {
    vars = [],
    values = [],
  }: {
    vars?: ConditionNameRename[];
    values?: ConditionValueRename[];
  },
): { output: string; changed: boolean } {
  const source = `${input ?? ""}`;
  if (!source.trim() || (!vars.length && !values.length)) return { output: source, changed: false };

  const varMap = new Map<string, string>();
  for (const rename of vars) {
    const from = lower(rename.from);
    const to = `${rename.to || ""}`.trim();
    if (!from || from === "self" || !to || from === lower(to) || !VAR_NAME.test(to)) continue;
    if (!varMap.has(from)) varMap.set(from, to);
  }

  const valueRenames = values
    .map((rename) => ({
      from: lower(rename.from),
      to: `${rename.to || ""}`.trim(),
      parents: new Set(rename.parents.map(lower).filter(Boolean)),
    }))
    .filter((rename) => rename.from && rename.to && rename.from !== lower(rename.to) && rename.parents.size);

  const edits: Edit[] = [];

  if (varMap.size) {
    const { tokens } = tokenize(source);
    for (const token of tokens) {
      if (token.kind !== "var") continue;
      const to = varMap.get(lower(token.text));
      if (to) edits.push({ start: token.start, end: token.end, text: `$${to}` });
    }
  }

  if (valueRenames.length) {
    const { ast } = parse(source);

    const findValueRename = (parentVar: Node, literal: Node) => {
      if (parentVar.type !== "Var" || literal.type !== "Literal" || literal.valueType !== "string") return null;
      const parent = lower(parentVar.name);
      const value = lower(`${literal.value}`);
      return valueRenames.find((rename) => rename.parents.has(parent) && rename.from === value) || null;
    };

    const rewriteLiteral = (literal: Node, to: string) => {
      const raw = source.slice(literal.start, literal.end);
      const quote = raw[0];
      if ((quote === "'" || quote === '"' || quote === "`") && raw.endsWith(quote) && raw.length >= 2) {
        if (to.includes(quote)) return;
        edits.push({ start: literal.start, end: literal.end, text: `${quote}${to}${quote}` });
        return;
      }
      if (BARE_VALUE.test(to)) edits.push({ start: literal.start, end: literal.end, text: to });
    };

    const collectLiterals = (node: Node, out: Node[]) => {
      if (node.type === "Literal") out.push(node);
      else if (node.type === "Array") node.items.forEach((item) => collectLiterals(item, out));
      else if (node.type === "Group") collectLiterals(node.expr, out);
    };

    const visit = (node: Node) => {
      switch (node.type) {
        case "Program":
          node.lines.forEach(visit);
          return;
        case "Logical":
          visit(node.left);
          visit(node.right);
          return;
        case "Group":
        case "Not":
          visit(node.expr);
          return;
        case "Comparison": {
          const rename = findValueRename(node.left, node.right) || findValueRename(node.right, node.left);
          if (!rename) return;
          rewriteLiteral(node.left.type === "Literal" ? node.left : node.right, rename.to);
          return;
        }
        case "Membership": {
          if (node.target.type !== "Var") return;
          const literals: Node[] = [];
          node.values.forEach((value) => collectLiterals(value, literals));
          for (const literal of literals) {
            const rename = findValueRename(node.target, literal);
            if (rename) rewriteLiteral(literal, rename.to);
          }
          return;
        }
        default:
          return;
      }
    };

    visit(ast);
  }

  if (!edits.length) return { output: source, changed: false };

  // Apply right-to-left so earlier spans stay valid; drop overlaps defensively.
  edits.sort((a, b) => b.start - a.start);
  let output = source;
  let lastStart = Number.POSITIVE_INFINITY;
  for (const edit of edits) {
    if (edit.end > lastStart) continue;
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
    lastStart = edit.start;
  }

  return { output, changed: output !== source };
}
