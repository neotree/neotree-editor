import type { Diagnostic, Node, ProgramNode } from "./ast";

/**
 * Finds conditions that are true no matter what the patient's answers are.
 *
 * The one that matters in practice is `!=` chained with `or` over a single key:
 *
 *   $NeotreeOutcome != 'BID' or $NeotreeOutcome != 'DDA'
 *
 * No value can be both 'BID' and 'DDA', so at least one side always holds and
 * the screen always shows. It is almost always a De Morgan slip — the author
 * wanted "none of these", which is `and`, not `or`. This is what NEOAPP-1514
 * was originally reported as, and 16 live expressions had it.
 *
 * Soundness: this holds for every key shape the runtime supports.
 *   - single-valued key: substitutes to one literal, so one side must differ;
 *   - multi-select: the runtime evaluates the line once per selected value and
 *     ORs the results, and each of those is itself a tautology;
 *   - unanswered: survives substitution as the literal string "$key", which
 *     differs from both values.
 *
 * The mirror case (`=` chained with `and`) is deliberately NOT reported. It is
 * unsatisfiable for a single-valued key but perfectly reachable for a
 * multi-select, and the key's arity is not always known here.
 */

/** Strips Group wrappers so the operator underneath is visible. */
const unwrap = (node: Node): Node => (node.type === "Group" ? unwrap(node.expr) : node);

/**
 * Flattens a nested Logical chain of one operator into its operands, recording
 * every chain node it passed through so the caller reports each chain once.
 */
function flatten(node: Node, op: "and" | "or", seen: Set<Node>): Node[] {
  const inner = unwrap(node);
  if (inner.type === "Logical" && inner.op === op) {
    seen.add(inner);
    return [...flatten(inner.left, op, seen), ...flatten(inner.right, op, seen)];
  }
  return [inner];
}

const varName = (node: Node): string | null => {
  const inner = unwrap(node);
  return inner.type === "Var" ? inner.name.toLowerCase() : null;
};

const literalValue = (node: Node): string | null => {
  const inner = unwrap(node);
  return inner.type === "Literal" ? `${inner.value}`.toLowerCase() : null;
};

function walk(node: Node | null | undefined, fn: (n: Node) => void): void {
  if (!node) return;
  fn(node);
  switch (node.type) {
    case "Program": node.lines.forEach((n) => walk(n, fn)); break;
    case "Logical": walk(node.left, fn); walk(node.right, fn); break;
    case "Group": walk(node.expr, fn); break;
    case "Not": walk(node.expr, fn); break;
    case "Comparison": walk(node.left, fn); walk(node.right, fn); break;
    case "Membership": walk(node.target, fn); node.values.forEach((n) => walk(n, fn)); break;
    case "Array": node.items.forEach((n) => walk(n, fn)); break;
    default: break;
  }
}

/**
 * Only offered when every operand of the chain is `!=` on the same key, so
 * swapping the joiner is unambiguously what the author meant. A mixed chain
 * gets the warning without a quick fix.
 */
function suggestion(operands: Node[], source: string, start: number, end: number): string | undefined {
  let key: string | null = null;
  for (const operand of operands) {
    if (operand.type !== "Comparison" || operand.op !== "!=") return undefined;
    const name = varName(operand.left);
    if (!name) return undefined;
    if (key === null) key = name;
    else if (key !== name) return undefined;
  }
  if (key === null) return undefined;

  // Rewrite only the joiners of this chain, leaving operand text untouched.
  const text = source.slice(start, end);
  return text.replace(/\bor\b/gi, "and");
}

export function findAlwaysTrueDiagnostics(ast: ProgramNode, source: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const consumed = new Set<Node>();

  walk(ast, (node) => {
    if (node.type !== "Logical" || node.op !== "or") return;
    if (consumed.has(node)) return;

    const operands = flatten(node, "or", consumed);
    if (operands.length < 2) return;

    // Group the `!=` operands by key; two different values for one key is enough.
    const valuesByKey = new Map<string, Set<string>>();
    for (const operand of operands) {
      if (operand.type !== "Comparison" || operand.op !== "!=") continue;
      const key = varName(operand.left);
      const value = literalValue(operand.right);
      if (!key || value === null) continue;
      const seen = valuesByKey.get(key) ?? new Set<string>();
      seen.add(value);
      valuesByKey.set(key, seen);
    }

    for (const [key, values] of valuesByKey) {
      if (values.size < 2) continue;
      diagnostics.push({
        severity: "warning",
        code: "ALWAYS_TRUE",
        message:
          `This is always true: $${key} cannot equal two different values, so one side of the "or" always holds. ` +
          `Use "and" to mean "none of these".`,
        start: node.start,
        end: node.end,
        suggestion: suggestion(operands, source, node.start, node.end),
      });
      break; // one report per chain is enough
    }
  });

  return diagnostics;
}
