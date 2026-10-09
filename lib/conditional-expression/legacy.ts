import type { Diagnostic, Node, ProgramNode } from "./ast";

type RenderedExpression = {
  text: string;
  precedence: number;
};

const COMPARISON_INVERSE: Record<string, string> = {
  "=": "!=",
  "==": "!=",
  "!=": "=",
  ">": "<=",
  "<": ">=",
  ">=": "<",
  "<=": ">",
};

const sourceText = (source: string, node: Node) => source.slice(node.start, node.end).trim();

function wrapForParent(expression: RenderedExpression, parentPrecedence: number): string {
  return expression.precedence < parentPrecedence ? `(${expression.text})` : expression.text;
}

function invertExpression(node: Node, source: string): RenderedExpression | null {
  switch (node.type) {
    case "Comparison": {
      const inverse = COMPARISON_INVERSE[node.op];
      if (!inverse) return null;
      return {
        text: `${sourceText(source, node.left)} ${inverse} ${sourceText(source, node.right)}`,
        precedence: 3,
      };
    }
    case "Membership": {
      const inverse = node.op === "includes" ? "excludes" : "includes";
      const values = node.values.map((value) => sourceText(source, value)).join(", ");
      return {
        text: `${sourceText(source, node.target)} ${inverse} (${values})`,
        precedence: 3,
      };
    }
    case "Logical": {
      const left = invertExpression(node.left, source);
      const right = invertExpression(node.right, source);
      if (!left || !right) return null;

      const op = node.op === "and" ? "or" : "and";
      const precedence = op === "and" ? 2 : 1;
      return {
        text: `${wrapForParent(left, precedence)} ${op} ${wrapForParent(right, precedence)}`,
        precedence,
      };
    }
    case "Group": {
      const inner = invertExpression(node.expr, source);
      if (!inner) return null;
      return {
        text: node.bracket === "bracket" ? `[${inner.text}]` : inner.text,
        precedence: node.bracket === "bracket" ? 3 : inner.precedence,
      };
    }
    case "Not":
      return { text: sourceText(source, node.expr), precedence: 3 };
    default:
      return null;
  }
}

function legacySuggestion(node: Extract<Node, { type: "Not" }>, source: string): string | undefined {
  const inverted = invertExpression(node.expr, source);
  if (!inverted) return undefined;

  if (node.expr.type === "Group" && node.expr.bracket === "paren" && node.expr.expr.type === "Logical") {
    return `(${inverted.text})`;
  }
  return inverted.text;
}

/** Finds accepted legacy ! expressions and offers an equivalent modern rewrite. */
export function findLegacyNegationDiagnostics(ast: ProgramNode, source: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  const walk = (node: Node): void => {
    switch (node.type) {
      case "Not":
        diagnostics.push({
          severity: "warning",
          code: "LEGACY_NEGATION",
          message: 'Legacy "!" negation syntax is deprecated. Use explicit inverse operators such as "!=" or "excludes".',
          start: node.start,
          end: node.end,
          suggestion: legacySuggestion(node, source),
        });
        walk(node.expr);
        break;
      case "Program":
        node.lines.forEach(walk);
        break;
      case "Logical":
        walk(node.left);
        walk(node.right);
        break;
      case "Group":
        walk(node.expr);
        break;
      case "Comparison":
        walk(node.left);
        walk(node.right);
        break;
      case "Membership":
        walk(node.target);
        node.values.forEach(walk);
        break;
      case "Array":
        node.items.forEach(walk);
        break;
      default:
        break;
    }
  };

  walk(ast);
  return diagnostics;
}
