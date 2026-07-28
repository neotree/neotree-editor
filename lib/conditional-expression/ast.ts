// AST + diagnostic types for the conditional-expression language.
// This module is intentionally dependency-free and framework-agnostic so it can
// later be ported/shared verbatim with the mobile app runtime.

export type Severity = "error" | "warning";

export type DiagnosticCode =
  // Syntactic (from the parser/tokenizer)
  | "UNEXPECTED_TOKEN"
  | "UNBALANCED_PAREN"
  | "UNBALANCED_BRACKET"
  | "UNTERMINATED_STRING"
  | "MISSING_OPERATOR"
  | "MISSING_OPERAND"
  | "DANGLING_OPERATOR"
  | "EMPTY_GROUP"
  | "MEMBERSHIP_SYNTAX"
  | "STANDALONE_EXPRESSION"
  // Semantic (needs the script key context)
  | "UNKNOWN_KEY"
  | "SELF_NOT_ALLOWED"
  | "TYPE_MISMATCH"
  | "MEMBERSHIP_TYPE"
  | "UNKNOWN_OPTION"
  | "UNQUOTED_VALUE"
  // Reference-expression sublanguage
  | "UNKNOWN_FUNCTION"
  | "FUNCTION_ARG";

export interface Diagnostic {
  severity: Severity;
  code: DiagnosticCode;
  message: string;
  /** Inclusive start offset into the source string. */
  start: number;
  /** Exclusive end offset into the source string. */
  end: number;
  /** Optional quick-fix replacement text for the offending span. */
  suggestion?: string;
}

export type ComparisonOp = "==" | "=" | "!=" | ">=" | "<=" | ">" | "<";
export type MembershipOp = "includes" | "excludes";
export type LiteralType = "string" | "number" | "boolean";

export interface Span {
  start: number;
  end: number;
}

export interface ProgramNode extends Span {
  type: "Program";
  /** Each line is implicitly ANDed with the others. */
  lines: Node[];
}

export interface LogicalNode extends Span {
  type: "Logical";
  op: "and" | "or";
  left: Node;
  right: Node;
}

export interface GroupNode extends Span {
  type: "Group";
  bracket: "paren" | "bracket";
  expr: Node;
}

export interface ComparisonNode extends Span {
  type: "Comparison";
  op: ComparisonOp;
  left: Node;
  right: Node;
}

export interface MembershipNode extends Span {
  type: "Membership";
  op: MembershipOp;
  target: Node;
  values: Node[];
}

export interface VarNode extends Span {
  type: "Var";
  /** Key name without the leading "$" (original case preserved). */
  name: string;
}

export interface LiteralNode extends Span {
  type: "Literal";
  valueType: LiteralType;
  value: string | number | boolean;
  /** true when a text value was written without quotes (likely a mistake). */
  bare?: boolean;
}

export interface ArrayNode extends Span {
  type: "Array";
  items: Node[];
}

export interface ErrorNode extends Span {
  type: "Error";
}

export type Node =
  | ProgramNode
  | LogicalNode
  | GroupNode
  | ComparisonNode
  | MembershipNode
  | VarNode
  | LiteralNode
  | ArrayNode
  | ErrorNode;

export interface ConditionKey {
  /** Key name as referenced after "$" in expressions. */
  name: string;
  label?: string;
  dataType?: string;
  /** Known option values (for dropdown/select keys). */
  options?: string[];
}

export interface ValidationContext {
  keys: ConditionKey[];
  /** Allow the special "$self" token (the current field's own value). */
  allowSelf?: boolean;
  selfDataType?: string;
  selfOptions?: string[];
  /**
   * Skip key-dependent semantic checks (unknown key, type, options).
   * Set while keys are still loading so we never false-flag every key.
   */
  skipKeyResolution?: boolean;
}

export interface ValidationResult {
  diagnostics: Diagnostic[];
  hasErrors: boolean;
  ast: ProgramNode | null;
}
