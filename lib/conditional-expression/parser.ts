import type {
  ComparisonOp,
  Diagnostic,
  DiagnosticCode,
  MembershipOp,
  Node,
  ProgramNode,
} from "./ast";
import { type Token, tokenize } from "./tokenizer";

const KEYWORDS = new Set(["and", "or", "includes", "excludes"]);

/**
 * Recursive-descent parser for the boolean condition DSL.
 *
 * Grammar (case-insensitive):
 *   Program    := Line (NEWLINE Line)*        // newline = implicit AND
 *   Line       := Or
 *   Or         := And ("or" And)*
 *   And        := Primary ("and" Primary)*
 *   Primary    := "(" Or ")" | "[" Or "]" | ComparisonOrMembership
 *   Comparison := Operand CmpOp Operand
 *   Membership := $Var ("includes"|"excludes") "(" ValueList ")"
 *   Operand    := $Var | STRING | NUMBER | BOOL | Array | bareword
 *   Array      := "[" ValueList "]"
 */
class Parser {
  private tokens: Token[];
  private pos = 0;
  diagnostics: Diagnostic[];

  constructor(tokens: Token[], diagnostics: Diagnostic[]) {
    this.tokens = tokens;
    this.diagnostics = diagnostics;
  }

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)];
  }

  private next(): Token {
    const tok = this.tokens[this.pos];
    if (this.pos < this.tokens.length - 1) this.pos++;
    return tok;
  }

  private isKeyword(tok: Token, kw: string): boolean {
    return tok.kind === "ident" && tok.text === kw;
  }

  private error(code: DiagnosticCode, message: string, start: number, end: number): void {
    this.diagnostics.push({ severity: "error", code, message, start, end });
  }

  private warn(code: DiagnosticCode, message: string, start: number, end: number): void {
    this.diagnostics.push({ severity: "warning", code, message, start, end });
  }

  private atExprEnd(): boolean {
    const k = this.peek().kind;
    return k === "newline" || k === "eof" || k === "rparen" || k === "rbracket";
  }

  /** True at the end of a primary expression — an expr boundary or an and/or keyword. */
  private atPrimaryEnd(): boolean {
    if (this.atExprEnd()) return true;
    const tok = this.peek();
    return tok.kind === "ident" && (tok.text === "and" || tok.text === "or");
  }

  private atOperandEnd(): boolean {
    const tok = this.peek();
    const k = tok.kind;
    if (k === "newline" || k === "eof" || k === "rparen" || k === "rbracket" || k === "comma" || k === "op") {
      return true;
    }
    return tok.kind === "ident" && KEYWORDS.has(tok.text);
  }

  parseProgram(): ProgramNode {
    const lines: Node[] = [];
    const startOffset = this.peek().start;

    while (this.peek().kind !== "eof") {
      while (this.peek().kind === "newline") this.next();
      if (this.peek().kind === "eof") break;

      lines.push(this.parseOr());

      if (this.peek().kind !== "newline" && this.peek().kind !== "eof") {
        const tok = this.peek();
        this.error("UNEXPECTED_TOKEN", `Unexpected "${tok.value}".`, tok.start, tok.end);
        // Recover: discard the rest of this line.
        while (this.peek().kind !== "newline" && this.peek().kind !== "eof") this.next();
      }
    }

    return { type: "Program", lines, start: startOffset, end: this.peek().end };
  }

  private parseOr(): Node {
    let left = this.parseAnd();
    while (this.isKeyword(this.peek(), "or")) {
      const opTok = this.next();
      if (this.atExprEnd()) {
        this.error("DANGLING_OPERATOR", 'Expected an expression after "or".', opTok.start, opTok.end);
        break;
      }
      const right = this.parseAnd();
      left = { type: "Logical", op: "or", left, right, start: left.start, end: right.end };
    }
    return left;
  }

  private parseAnd(): Node {
    let left = this.parsePrimary();
    while (this.isKeyword(this.peek(), "and")) {
      const opTok = this.next();
      if (this.atExprEnd()) {
        this.error("DANGLING_OPERATOR", 'Expected an expression after "and".', opTok.start, opTok.end);
        break;
      }
      const right = this.parsePrimary();
      left = { type: "Logical", op: "and", left, right, start: left.start, end: right.end };
    }
    return left;
  }

  private parsePrimary(): Node {
    const tok = this.peek();

    if (tok.kind === "lparen") {
      this.next();
      const inner = this.parseOr();
      const end = this.consumeClose("rparen", ")", tok.start);
      return { type: "Group", bracket: "paren", expr: inner, start: tok.start, end };
    }

    if (tok.kind === "lbracket") {
      this.next();
      if (this.peek().kind === "rbracket") {
        const close = this.next();
        this.error("EMPTY_GROUP", 'Empty "[ ]" group.', tok.start, close.end);
        return { type: "Group", bracket: "bracket", expr: { type: "Error", start: tok.start, end: close.end }, start: tok.start, end: close.end };
      }
      const inner = this.parseOr();
      const end = this.consumeClose("rbracket", "]", tok.start);
      return { type: "Group", bracket: "bracket", expr: inner, start: tok.start, end };
    }

    return this.parseComparisonOrMembership();
  }

  private consumeClose(kind: "rparen" | "rbracket", ch: string, openStart: number): number {
    if (this.peek().kind === kind) return this.next().end;
    const at = this.peek();
    this.error(
      kind === "rparen" ? "UNBALANCED_PAREN" : "UNBALANCED_BRACKET",
      `Missing closing "${ch}".`,
      openStart,
      at.end,
    );
    return at.start;
  }

  private parseComparisonOrMembership(): Node {
    const startTok = this.peek();
    const left = this.parseOperand();
    const tok = this.peek();

    // Membership: $key includes/excludes (...)
    if (tok.kind === "ident" && (tok.text === "includes" || tok.text === "excludes")) {
      const opTok = this.next();
      if (left.type !== "Var") {
        this.error("MEMBERSHIP_SYNTAX", `"${opTok.value}" must follow a $key.`, startTok.start, opTok.end);
      }
      const values: Node[] = [];
      let end = opTok.end;
      if (this.peek().kind === "lparen") {
        this.next();
        values.push(...this.parseValueList("rparen"));
        end = this.consumeClose("rparen", ")", opTok.start);
      } else {
        this.error("MEMBERSHIP_SYNTAX", `Expected "(" with a list of values after "${opTok.value}".`, opTok.start, opTok.end);
      }
      return { type: "Membership", op: opTok.text as MembershipOp, target: left, values, start: startTok.start, end };
    }

    // Comparison: operand OP operand
    if (tok.kind === "op") {
      const opTok = this.next();
      if (this.atOperandEnd()) {
        this.error("MISSING_OPERAND", `Expected a value after "${opTok.value}".`, opTok.start, opTok.end);
        return { type: "Comparison", op: opTok.value as ComparisonOp, left, right: { type: "Error", start: opTok.end, end: opTok.end }, start: startTok.start, end: opTok.end };
      }
      const right = this.parseOperand();
      return { type: "Comparison", op: opTok.value as ComparisonOp, left, right, start: startTok.start, end: right.end };
    }

    // Operand with no following operator.
    if (left.type !== "Error") {
      if (this.atPrimaryEnd()) {
        // A standalone operand, e.g. "$key" used as a truthiness check. The
        // mobile runtime tolerates this, so warn instead of blocking.
        if (left.type === "Var") {
          this.warn(
            "STANDALONE_EXPRESSION",
            `"$${(left as { name: string }).name}" is used on its own — it is treated as "has any value". Add a comparison (e.g. = 'Yes') to be explicit.`,
            left.start,
            left.end,
          );
        }
      } else {
        this.error(
          "MISSING_OPERATOR",
          "Expected a comparison (=, !=, >, <, >=, <=) or includes/excludes.",
          left.start,
          left.end,
        );
      }
    }
    return left;
  }

  private parseOperand(): Node {
    const tok = this.peek();

    if (tok.kind === "var") {
      this.next();
      return { type: "Var", name: tok.text, start: tok.start, end: tok.end };
    }
    if (tok.kind === "number") {
      this.next();
      return { type: "Literal", valueType: "number", value: Number(tok.text), start: tok.start, end: tok.end };
    }
    if (tok.kind === "string") {
      this.next();
      return { type: "Literal", valueType: "string", value: tok.text, start: tok.start, end: tok.end };
    }
    if (tok.kind === "bool") {
      this.next();
      return { type: "Literal", valueType: "boolean", value: tok.text === "true", start: tok.start, end: tok.end };
    }
    if (tok.kind === "lbracket") {
      return this.parseArray();
    }
    if (tok.kind === "ident") {
      if (KEYWORDS.has(tok.text)) {
        this.error("MISSING_OPERAND", `Expected a value but found "${tok.value}".`, tok.start, tok.end);
        return { type: "Error", start: tok.start, end: tok.end };
      }
      // A bare word where a value is expected — almost always an unquoted text value.
      this.next();
      return { type: "Literal", valueType: "string", value: tok.value, bare: true, start: tok.start, end: tok.end };
    }

    this.error("MISSING_OPERAND", "Expected a value.", tok.start, tok.end);
    return { type: "Error", start: tok.start, end: tok.end };
  }

  private parseArray(): Node {
    const open = this.next(); // "["
    const items = this.parseValueList("rbracket");
    const end = this.consumeClose("rbracket", "]", open.start);
    return { type: "Array", items, start: open.start, end };
  }

  private parseValueList(closeKind: "rparen" | "rbracket"): Node[] {
    const items: Node[] = [];
    if (this.peek().kind === closeKind || this.peek().kind === "eof") return items;

    items.push(this.parseOperand());
    while (this.peek().kind === "comma") {
      this.next();
      if (this.peek().kind === closeKind || this.peek().kind === "eof") break; // tolerate trailing comma
      items.push(this.parseOperand());
    }
    return items;
  }
}

export function parse(input: string): { ast: ProgramNode; diagnostics: Diagnostic[] } {
  const { tokens, diagnostics } = tokenize(input);
  const parser = new Parser(tokens, [...diagnostics]);
  const ast = parser.parseProgram();
  return { ast, diagnostics: parser.diagnostics };
}
