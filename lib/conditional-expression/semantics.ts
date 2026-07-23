import type {
  ComparisonNode,
  ConditionKey,
  Diagnostic,
  MembershipNode,
  Node,
  ProgramNode,
  ValidationContext,
  VarNode,
} from "./ast";
import { suggestClosest } from "./suggest";

// Data-type families (compared case-insensitively).
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

// Types that cannot be meaningfully compared with </>/>=/<=.
const NON_ORDERED_TYPES = new Set(["text", "string", "boolean", "yesno"]);

const ORDERING_OPS = new Set([">", "<", ">=", "<="]);

interface KeyDesc {
  dataType?: string;
  options?: string[];
}

export function analyze(ast: ProgramNode, ctx: ValidationContext): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const keyByName = new Map<string, ConditionKey>();
  for (const key of ctx.keys) keyByName.set(key.name.toLowerCase(), key);

  const describeVar = (node: VarNode): KeyDesc | null => {
    const name = node.name.toLowerCase();
    if (name === "self") return { dataType: ctx.selfDataType, options: ctx.selfOptions };
    const key = keyByName.get(name);
    return key ? { dataType: key.dataType, options: key.options } : null;
  };

  const checkVar = (node: VarNode): void => {
    const name = node.name.toLowerCase();
    if (!name) return; // tokenizer already flagged the empty "$"

    if (name === "self") {
      if (!ctx.allowSelf) {
        diagnostics.push({
          severity: "error",
          code: "SELF_NOT_ALLOWED",
          message: '"$self" is not available here. Reference a script key instead.',
          start: node.start,
          end: node.end,
        });
      }
      return;
    }

    if (ctx.skipKeyResolution) return;

    if (!keyByName.has(name)) {
      const suggestion = suggestClosest(node.name, ctx.keys.map((k) => k.name));
      diagnostics.push({
        severity: "error",
        code: "UNKNOWN_KEY",
        message: `Unknown key "$${node.name}".${suggestion ? ` Did you mean "$${suggestion}"?` : ""}`,
        start: node.start,
        end: node.end,
        suggestion: suggestion ? `$${suggestion}` : undefined,
      });
    }
  };

  const checkComparison = (node: ComparisonNode): void => {
    if (ctx.skipKeyResolution) return;
    if (node.left.type !== "Var") return;
    const desc = describeVar(node.left);
    if (!desc) return; // unknown key already reported
    const dataType = (desc.dataType || "").toLowerCase();

    if (ORDERING_OPS.has(node.op) && dataType && NON_ORDERED_TYPES.has(dataType)) {
      diagnostics.push({
        severity: "warning",
        code: "TYPE_MISMATCH",
        message: `"$${node.left.name}" is ${dataType}; "${node.op}" comparisons expect a numeric or date key.`,
        start: node.start,
        end: node.end,
      });
    }

    const right = node.right;
    if (right.type === "Literal" && right.bare) {
      diagnostics.push({
        severity: "warning",
        code: "UNQUOTED_VALUE",
        message: `Text values should be wrapped in quotes: '${right.value}'.`,
        start: right.start,
        end: right.end,
      });
      return;
    }

    if (
      right.type === "Literal" &&
      right.valueType === "string" &&
      desc.options &&
      desc.options.length
    ) {
      const wanted = String(right.value).toLowerCase();
      const options = desc.options.map((o) => o.toLowerCase());
      if (!options.includes(wanted)) {
        const suggestion = suggestClosest(String(right.value), desc.options);
        diagnostics.push({
          severity: "warning",
          code: "UNKNOWN_OPTION",
          message: `"${right.value}" is not a known option for "$${node.left.name}".${suggestion ? ` Did you mean "${suggestion}"?` : ""}`,
          start: right.start,
          end: right.end,
          suggestion,
        });
      }
    }
  };

  const checkMembership = (node: MembershipNode): void => {
    if (ctx.skipKeyResolution) return;
    if (node.target.type !== "Var") return;
    const desc = describeVar(node.target);
    if (!desc) return;
    const dataType = (desc.dataType || "").toLowerCase();
    if (dataType && !MULTI_VALUE_TYPES.has(dataType)) {
      diagnostics.push({
        severity: "warning",
        code: "MEMBERSHIP_TYPE",
        message: `"${node.op}" works on multi-select keys; "$${node.target.name}" is ${dataType}.`,
        start: node.target.start,
        end: node.target.end,
      });
    }
  };

  const walk = (node: Node): void => {
    switch (node.type) {
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
        checkComparison(node);
        walk(node.left);
        walk(node.right);
        break;
      case "Membership":
        checkMembership(node);
        walk(node.target);
        node.values.forEach(walk);
        break;
      case "Array":
        node.items.forEach(walk);
        break;
      case "Var":
        checkVar(node);
        break;
      default:
        break;
    }
  };

  walk(ast);
  return diagnostics;
}
