import type { Diagnostic } from "./ast";
import { tokenize } from "./tokenizer";

/**
 * What tablets cannot read although the grammar accepts it.
 *
 * The app compiles a condition by text substitution (condition-pipeline.ts in the app):
 * - every line becomes its own `( ... )`, joined with `&&`, so an empty line becomes `()`,
 *   which cannot be evaluated;
 * - `and`, `or` and `=` are rewritten to `&&`, `||` and `==` only with a space on both sides;
 * - an unanswered `$Key` is quoted together with everything up to the next space, so
 *   `$Key>0` becomes the text '$Key>0' (always true) and `$Key='x'` cannot be evaluated.
 *
 * A condition that cannot be evaluated counts as false on the tablet, and is reported.
 */
export function findDeviceFaults(input: string): Diagnostic[] {
  if (!input) return [];
  if (!input.trim()) {
    return [{
      severity: "error",
      code: "BLANK_LINE",
      message: "This condition is only spaces or empty lines: clear it, or tablets treat it as failing.",
      start: 0,
      end: input.length,
      suggestion: "",
    }];
  }

  const diagnostics: Diagnostic[] = [];
  const lines = input.split("\n");
  let offset = 0;
  lines.forEach((line, i) => {
    if (!line.trim()) {
      // The line goes with one of its line breaks: the one after it, or before it at the end.
      const last = i === lines.length - 1;
      diagnostics.push({
        severity: "error",
        code: "BLANK_LINE",
        message: "Remove this empty line: tablets read every line as a condition, and an empty one fails.",
        start: last ? offset - 1 : offset,
        end: last ? offset + line.length : offset + line.length + 1,
        suggestion: "",
      });
    }
    offset += line.length + 1;
  });

  const { tokens } = tokenize(input);
  const strings = tokens.filter((t) => t.kind === "string");
  const inString = (i: number) => strings.some((t) => i >= t.start && i < t.end);
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== "\t" || inString(i)) continue;
    let end = i;
    while (input[end] === "\t") end++;
    diagnostics.push({
      severity: "error",
      code: "TAB_CHARACTER",
      message: "Use a space instead of a tab: tablets do not read tabs.",
      start: i,
      end,
      suggestion: " ",
    });
    i = end - 1;
  }

  // A line break or the end needs no space; a tab is reported above.
  const spaced = (c: string | undefined) => c === undefined || c === " " || c === "\t" || c === "\n" || c === "\r";
  const spacing = (start: number, end: number, before: boolean, after: boolean, message: string) => diagnostics.push({
    severity: "error",
    code: "OPERATOR_SPACING",
    message,
    start,
    end,
    suggestion: `${before ? " " : ""}${input.slice(start, end)}${after ? " " : ""}`,
  });
  tokens.forEach((t, k) => {
    const before = input[t.start - 1];
    const after = input[t.end];
    if (t.kind === "ident" && (t.text === "and" || t.text === "or")) {
      // `or$Key` is fine: the app puts a space before every `$`.
      const needBefore = !spaced(before);
      const needAfter = !spaced(after) && after !== "$";
      if (needBefore || needAfter) {
        spacing(t.start, t.end, needBefore, needAfter, `Put a space on both sides of "${t.value}": tablets only read it with spaces.`);
      }
      return;
    }
    if (t.kind !== "op" || !["=", "==", "!=", ">", "<", ">=", "<="].includes(t.value)) return;
    const prev = tokens[k - 1];
    const keyTouches = prev?.kind === "var" && prev.end === t.start;
    if (t.value === "=") {
      const needBefore = !spaced(before);
      const needAfter = !spaced(after);
      if (needBefore || needAfter) spacing(t.start, t.end, needBefore, needAfter, 'Put a space on both sides of "=": tablets only read it with spaces.');
    } else if (keyTouches) {
      spacing(t.start, t.end, true, false, `Put a space between ${prev.value} and "${t.value}": tablets misread it when ${prev.value} is unanswered.`);
    }
  });

  return diagnostics;
}
