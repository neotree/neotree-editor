import type { ConditionKey, Diagnostic, ValidationContext, ValidationResult } from "./ast";
import { suggestClosest } from "./suggest";
import { type Token, tokenize } from "./tokenizer";

const FUNCTIONS = new Set(["sum", "divide", "multiply", "subtract"]);

/**
 * Validates the arithmetic "reference expression" sublanguage used by
 * calculation / calculator_condition fields, e.g.
 *   $key
 *   SUM($key1, $key2)
 *   DIVIDE($weight, $height)
 */
export function validateReferenceExpression(input: string, ctx: ValidationContext): ValidationResult {
  const src = input || "";
  if (!src.trim()) return { diagnostics: [], hasErrors: false, ast: null };

  const { tokens, diagnostics: tokDiags } = tokenize(src);
  const diagnostics: Diagnostic[] = [...tokDiags];
  const real = tokens.filter((t) => t.kind !== "eof" && t.kind !== "newline");

  const keyByName = new Map<string, ConditionKey>();
  for (const key of ctx.keys) keyByName.set(key.name.toLowerCase(), key);

  const checkVarExists = (tok: Token): void => {
    const name = tok.text.toLowerCase();
    if (!name) return;
    if (name === "self") {
      if (!ctx.allowSelf) {
        diagnostics.push({ severity: "error", code: "SELF_NOT_ALLOWED", message: '"$self" is not available here.', start: tok.start, end: tok.end });
      }
      return;
    }
    if (ctx.skipKeyResolution) return;
    if (!keyByName.has(name)) {
      const suggestion = suggestClosest(tok.text, ctx.keys.map((k) => k.name));
      diagnostics.push({
        severity: "error",
        code: "UNKNOWN_KEY",
        message: `Unknown key "$${tok.text}".${suggestion ? ` Did you mean "$${suggestion}"?` : ""}`,
        start: tok.start,
        end: tok.end,
        suggestion: suggestion ? `$${suggestion}` : undefined,
      });
    }
  };

  const first = real[0];

  if (!first) {
    return { diagnostics, hasErrors: diagnostics.some((d) => d.severity === "error"), ast: null };
  }

  if (first.kind === "var" && real.length === 1) {
    checkVarExists(first);
  } else if (first.kind === "ident") {
    if (!FUNCTIONS.has(first.text)) {
      // Function list not fully verified against the mobile runtime — warn, don't block.
      diagnostics.push({
        severity: "warning",
        code: "UNKNOWN_FUNCTION",
        message: `"${first.value}" is not a recognised function. Known functions: SUM, DIVIDE, MULTIPLY, SUBTRACT.`,
        start: first.start,
        end: first.end,
      });
    }
    if (real[1]?.kind !== "lparen") {
      diagnostics.push({ severity: "warning", code: "FUNCTION_ARG", message: `Expected "(" after "${first.value}".`, start: first.start, end: first.end });
    } else {
      let expectVar = true;
      let sawClose = false;
      let argCount = 0;
      for (let j = 2; j < real.length; j++) {
        const tok = real[j];
        if (tok.kind === "rparen") {
          sawClose = true;
          break;
        }
        if (expectVar) {
          if (tok.kind === "var") {
            checkVarExists(tok);
            argCount++;
            expectVar = false;
          } else {
            diagnostics.push({ severity: "warning", code: "FUNCTION_ARG", message: `Arguments are usually keys, e.g. $key. Found "${tok.value}".`, start: tok.start, end: tok.end });
          }
        } else if (tok.kind === "comma") {
          expectVar = true;
        } else {
          diagnostics.push({ severity: "warning", code: "FUNCTION_ARG", message: `Expected "," between arguments. Found "${tok.value}".`, start: tok.start, end: tok.end });
        }
      }
      if (!sawClose) {
        // A missing closing paren is a genuine syntax error.
        diagnostics.push({ severity: "error", code: "UNBALANCED_PAREN", message: 'Missing closing ")".', start: first.start, end: real[real.length - 1].end });
      }
      if (argCount === 0) {
        diagnostics.push({ severity: "warning", code: "FUNCTION_ARG", message: `"${first.value}" usually needs at least one $key argument.`, start: first.start, end: first.end });
      }
    }
  } else {
    diagnostics.push({
      severity: "error",
      code: "UNEXPECTED_TOKEN",
      message: "A reference expression must be a $key or a function like SUM($a, $b).",
      start: first.start,
      end: first.end,
    });
  }

  return { diagnostics, hasErrors: diagnostics.some((d) => d.severity === "error"), ast: null };
}
