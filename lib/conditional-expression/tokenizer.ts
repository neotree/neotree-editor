import type { Diagnostic } from "./ast";

export type TokenKind =
  | "var"
  | "number"
  | "string"
  | "bool"
  | "ident"
  | "op"
  | "lparen"
  | "rparen"
  | "lbracket"
  | "rbracket"
  | "comma"
  | "newline"
  | "eof";

export interface Token {
  kind: TokenKind;
  /** Raw source slice. */
  value: string;
  /** Normalized text: unquoted string content, var name without "$", lowercased keyword. */
  text: string;
  start: number;
  end: number;
}

// Longest match first so ">=" wins over ">".
const OPERATORS = [">=", "<=", "!=", "==", "=", ">", "<"];

const isIdentStart = (c: string) => /[A-Za-z_]/.test(c);
const isIdentChar = (c: string) => /[A-Za-z0-9_]/.test(c);
const isVarChar = (c: string) => /[A-Za-z0-9_.\-]/.test(c);
const isDigit = (c: string) => c >= "0" && c <= "9";

export function tokenize(input: string): { tokens: Token[]; diagnostics: Diagnostic[] } {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  const n = input.length;
  let i = 0;

  while (i < n) {
    const c = input[i];

    if (c === "\n") {
      tokens.push({ kind: "newline", value: "\n", text: "\n", start: i, end: i + 1 });
      i++;
      continue;
    }
    if (c === "\r" || c === " " || c === "\t") {
      i++;
      continue;
    }

    // String literal ('...', "...", `...`)
    if (c === "'" || c === '"' || c === "`") {
      const quote = c;
      const start = i;
      i++;
      let content = "";
      let terminated = false;
      while (i < n) {
        if (input[i] === "\n") break;
        if (input[i] === quote) {
          terminated = true;
          i++;
          break;
        }
        content += input[i];
        i++;
      }
      const end = i;
      tokens.push({ kind: "string", value: input.slice(start, end), text: content, start, end });
      if (!terminated) {
        diagnostics.push({
          severity: "error",
          code: "UNTERMINATED_STRING",
          message: `Unterminated text value. Add a closing ${quote}.`,
          start,
          end,
        });
      }
      continue;
    }

    // Variable ($key / $self)
    if (c === "$") {
      const start = i;
      i++;
      let name = "";
      while (i < n && isVarChar(input[i])) {
        name += input[i];
        i++;
      }
      const end = i;
      if (!name) {
        diagnostics.push({
          severity: "error",
          code: "MISSING_OPERAND",
          message: 'Expected a key name after "$".',
          start,
          end,
        });
      }
      tokens.push({ kind: "var", value: input.slice(start, end), text: name, start, end });
      continue;
    }

    // Number (with optional leading minus)
    if (isDigit(c) || (c === "-" && i + 1 < n && isDigit(input[i + 1]))) {
      const start = i;
      if (c === "-") i++;
      while (i < n && isDigit(input[i])) i++;
      if (i < n && input[i] === "." && i + 1 < n && isDigit(input[i + 1])) {
        i++;
        while (i < n && isDigit(input[i])) i++;
      }
      const raw = input.slice(start, i);
      tokens.push({ kind: "number", value: raw, text: raw, start, end: i });
      continue;
    }

    // Comparison operator
    let matchedOp = "";
    for (const op of OPERATORS) {
      if (input.startsWith(op, i)) {
        matchedOp = op;
        break;
      }
    }
    if (matchedOp) {
      tokens.push({ kind: "op", value: matchedOp, text: matchedOp, start: i, end: i + matchedOp.length });
      i += matchedOp.length;
      continue;
    }

    // Punctuation
    const punct: Record<string, TokenKind> = {
      "(": "lparen",
      ")": "rparen",
      "[": "lbracket",
      "]": "rbracket",
      ",": "comma",
    };
    if (punct[c]) {
      tokens.push({ kind: punct[c], value: c, text: c, start: i, end: i + 1 });
      i++;
      continue;
    }

    // Identifier / keyword / bare word
    if (isIdentStart(c)) {
      const start = i;
      while (i < n && isIdentChar(input[i])) i++;
      const raw = input.slice(start, i);
      const lower = raw.toLowerCase();
      if (lower === "true" || lower === "false") {
        tokens.push({ kind: "bool", value: raw, text: lower, start, end: i });
      } else {
        tokens.push({ kind: "ident", value: raw, text: lower, start, end: i });
      }
      continue;
    }

    diagnostics.push({
      severity: "error",
      code: "UNEXPECTED_TOKEN",
      message: `Unexpected character "${c}".`,
      start: i,
      end: i + 1,
    });
    i++;
  }

  tokens.push({ kind: "eof", value: "", text: "", start: n, end: n });
  return { tokens, diagnostics };
}
