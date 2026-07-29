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

// Types that expect a numeric value.
const NUMERIC_TYPES = new Set(["number", "integer", "decimal", "float", "numeric", "timer"]);

const ORDERING_OPS = new Set([">", "<", ">=", "<="]);

/** True for a string that the runtime would coerce cleanly to a number. */
function isNumericString(value: string): boolean {
  const trimmed = value.trim();
  return trimmed !== "" && /^-?\d+(\.\d+)?$/.test(trimmed);
}


function isMultiValueType(dataType: string): boolean {
  if (!dataType) return false;
  if (MULTI_VALUE_TYPES.has(dataType)) return true;
  return dataType.startsWith("set<") || dataType === "set";
}

interface KeyDesc {
  dataType?: string;
  options?: string[];
}

/** Tracks bracket / logical context while walking, for list-reference checks. */
interface WalkEnv {
  /** How many `[ ]` groups enclose the current node. */
  bracketDepth: number;
  /**
   * True when the current node shares its innermost `[ ]` group (or the line,
   * if unbracketed) with an and/or — i.e. it is being combined. `[ ]` starts a
   * fresh scope; `( )` does not (the runtime only isolates `[ ]`).
   */
  combinedInScope: boolean;
}

export function analyze(ast: ProgramNode, ctx: ValidationContext): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const keyByName = new Map<string, ConditionKey>();
  const exactNames = new Set<string>();
  const canonicalByLower = new Map<string, string>();
  for (const key of ctx.keys) {
    keyByName.set(key.name.toLowerCase(), key);
    exactNames.add(key.name);
    canonicalByLower.set(key.name.toLowerCase(), key.name);
  }

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
          severity: "warning",
          code: "SELF_NOT_ALLOWED",
          message: '"$self" may not be available here — it refers to the current field\'s own value.',
          start: node.start,
          end: node.end,
        });
      }
      return;
    }

    if (ctx.skipKeyResolution) return;

    // Exact (case-sensitive) match is required.
    if (exactNames.has(node.name)) return;

    // The key exists but with different casing — flag the exact spelling.
    const canonical = canonicalByLower.get(name);
    if (canonical) {
      diagnostics.push({
        severity: "error",
        code: "KEY_CASE",
        message: `Key "$${node.name}" has the wrong casing — use "$${canonical}".`,
        start: node.start,
        end: node.end,
        suggestion: `$${canonical}`,
      });
      return;
    }

    const suggestion = suggestClosest(node.name, ctx.keys.map((k) => k.name));
    diagnostics.push({
      severity: "error",
      code: "UNKNOWN_KEY",
      message: `Unknown key "$${node.name}".${suggestion ? ` Did you mean "$${suggestion}"?` : ""}`,
      start: node.start,
      end: node.end,
      suggestion: suggestion ? `$${suggestion}` : undefined,
    });
  };

  // Reject empty / null-like values (structural — runs even before keys load).
  // Returns true if it flagged, so callers can skip further value checks.
  const NULLISH = new Set(["null", "undefined"]);
  const flagBadValue = (value: Node): boolean => {
    if (value.type !== "Literal") return false;
    const raw = String(value.value);
    if (value.bare && NULLISH.has(raw.toLowerCase())) {
      diagnostics.push({
        severity: "error",
        code: "NULL_VALUE",
        message: "A value is required — null/undefined is not allowed.",
        start: value.start,
        end: value.end,
      });
      return true;
    }
    if (!value.bare && value.valueType === "string" && raw.trim() === "") {
      diagnostics.push({
        severity: "error",
        code: "EMPTY_VALUE",
        message: "A value is required — empty text is not allowed.",
        start: value.start,
        end: value.end,
      });
      return true;
    }
    return false;
  };

  // Warn when a quoted value isn't among a key's known options (with a "did you
  // mean" suggestion). Shared by equality comparisons and list members.
  const checkOptionValue = (value: Node, desc: KeyDesc, keyName: string): void => {
    if (value.type !== "Literal" || value.valueType !== "string" || value.bare) return;
    if (String(value.value).trim() === "") return; // empty handled by flagBadValue
    if (!desc.options || !desc.options.length) return;
    const wanted = String(value.value).toLowerCase();
    const options = desc.options.map((o) => o.toLowerCase());
    if (!options.includes(wanted)) {
      const suggestion = suggestClosest(String(value.value), desc.options);
      diagnostics.push({
        severity: "error",
        code: "UNKNOWN_OPTION",
        message: `"${value.value}" is not a valid option for "$${keyName}".${suggestion ? ` Did you mean "${suggestion}"?` : ""}`,
        start: value.start,
        end: value.end,
        suggestion,
      });
    }
  };

  const checkComparison = (node: ComparisonNode): void => {
    const right = node.right;
    // Empty/null value rejection runs regardless of the key catalogue.
    const badValue = flagBadValue(right);

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

    if (badValue) return; // already flagged; skip further value checks

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

    checkOptionValue(right, desc, node.left.name);

    // Narrow value-type sanity (warnings only). Coercible cases pass: a numeric
    // string on a numeric key, or 'true'/'false' on a boolean key.
    if (right.type === "Literal") {
      if (NUMERIC_TYPES.has(dataType)) {
        const numericOk =
          right.valueType === "number" ||
          (right.valueType === "string" && !right.bare && isNumericString(String(right.value)));
        if (!numericOk) {
          diagnostics.push({
            severity: "warning",
            code: "VALUE_TYPE",
            message: `"$${node.left.name}" is ${dataType}; expected a number but got "${right.value}".`,
            start: right.start,
            end: right.end,
          });
        }
      } else if (dataType === "boolean") {
        const booleanOk =
          right.valueType === "boolean" ||
          (right.valueType === "string" && !right.bare && ["true", "false"].includes(String(right.value).toLowerCase()));
        if (!booleanOk) {
          diagnostics.push({
            severity: "warning",
            code: "VALUE_TYPE",
            message: `"$${node.left.name}" is boolean; expected true or false but got "${right.value}".`,
            start: right.start,
            end: right.end,
          });
        }
      }
    }
  };

  const checkMembership = (node: MembershipNode, env: WalkEnv): void => {
    const targetName = node.target.type === "Var" ? node.target.name : "Key";
    const example = `[$${targetName} ${node.op} ('A')]`;

    // The runtime evaluates includes/excludes over its whole enclosing line
    // (or [ ] group), so a membership must stand ALONE — it cannot share a line
    // or a [ ] group with and/or. Each list check needs its own brackets and is
    // combined outside them: [$X includes ('A')] and [$Y includes ('B')].
    if (env.combinedInScope) {
      diagnostics.push({
        severity: "error",
        code: "MEMBERSHIP_BRACKETS",
        message: `"${node.op}" cannot be combined with and/or in the same brackets/line. Put each list check in its own [ ]: e.g. ${example} and [ ... ].`,
        start: node.start,
        end: node.end,
      });
    } else if (env.bracketDepth === 0) {
      // Standalone but unbracketed — works, but should be bracketed for clarity
      // and to stay safe if combined later.
      diagnostics.push({
        severity: "warning",
        code: "MEMBERSHIP_BRACKETS",
        message: `Wrap "${node.op}" in [ ], e.g. ${example}.`,
        start: node.start,
        end: node.end,
      });
    }

    // The list must contain at least one value.
    if (!node.values.length) {
      diagnostics.push({
        severity: "warning",
        code: "MEMBERSHIP_EMPTY",
        message: `"${node.op}" needs at least one value, e.g. ('A', 'B').`,
        start: node.start,
        end: node.end,
      });
    }

    // Reject empty/null list values, then require quoting.
    node.values.forEach((value) => {
      if (flagBadValue(value)) return;
      if (value.type === "Literal" && value.bare) {
        diagnostics.push({
          severity: "warning",
          code: "UNQUOTED_VALUE",
          message: `List values should be quoted, e.g. '${value.value}'.`,
          start: value.start,
          end: value.end,
        });
      }
    });

    // Duplicate values in the list.
    const seen = new Set<string>();
    node.values.forEach((value) => {
      if (value.type !== "Literal") return;
      const id = String(value.value).toLowerCase();
      if (seen.has(id)) {
        diagnostics.push({
          severity: "warning",
          code: "DUPLICATE_VALUE",
          message: `"${value.value}" is listed more than once.`,
          start: value.start,
          end: value.end,
        });
      }
      seen.add(id);
    });

    // Target type + option-value checks need the key catalogue.
    if (ctx.skipKeyResolution) return;
    if (node.target.type !== "Var") return;
    const desc = describeVar(node.target);
    if (!desc) return;
    const dataType = (desc.dataType || "").toLowerCase();
    if (dataType && !isMultiValueType(dataType)) {
      diagnostics.push({
        severity: "warning",
        code: "MEMBERSHIP_TYPE",
        message: `"${node.op}" works on multi-select keys; "$${node.target.name}" is ${dataType}.`,
        start: node.target.start,
        end: node.target.end,
      });
    }

    // Each listed value should be one of the key's known options.
    node.values.forEach((value) => checkOptionValue(value, desc, node.target.type === "Var" ? node.target.name : ""));
  };

  const walk = (node: Node, env: WalkEnv): void => {
    switch (node.type) {
      case "Program":
        node.lines.forEach((line) => walk(line, { bracketDepth: 0, combinedInScope: false }));
        break;
      case "Logical": {
        // Anything under an and/or is being combined within the current scope.
        const childEnv: WalkEnv = { ...env, combinedInScope: true };
        walk(node.left, childEnv);
        walk(node.right, childEnv);
        break;
      }
      case "Group":
        // Only [ ] starts a fresh scope (the runtime isolates it); ( ) does not.
        walk(
          node.expr,
          node.bracket === "bracket"
            ? { bracketDepth: env.bracketDepth + 1, combinedInScope: false }
            : env,
        );
        break;
      case "Comparison":
        checkComparison(node);
        walk(node.left, env);
        walk(node.right, env);
        break;
      case "Membership":
        checkMembership(node, env);
        walk(node.target, env);
        node.values.forEach((value) => walk(value, env));
        break;
      case "Array":
        node.items.forEach((value) => walk(value, env));
        break;
      case "Var":
        checkVar(node);
        break;
      default:
        break;
    }
  };

  walk(ast, { bracketDepth: 0, combinedInScope: false });
  return diagnostics;
}
