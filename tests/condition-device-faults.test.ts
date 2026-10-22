import assert from "assert";

import { tidyCondition, validateCondition, type DiagnosticCode } from "../lib/conditional-expression";
import { canApplySuggestion } from "../lib/conditional-expression/quick-fix";

/**
 * Conditions the grammar accepts but tablets cannot read (lib/conditional-expression/device.ts).
 * Each case was checked against the app's own compile code (condition-pipeline.ts): the flagged
 * ones fail or give the wrong answer on a tablet, the others work.
 */

const ctx = { keys: [], allowSelf: true, skipKeyResolution: true };
const DEVICE_CODES: DiagnosticCode[] = ["BLANK_LINE", "OPERATOR_SPACING", "TAB_CHARACTER"];
const deviceCodes = (c: string) => validateCondition(c, ctx).diagnostics.filter((d) => DEVICE_CODES.includes(d.code)).map((d) => d.code);

const flagged: Array<[string, DiagnosticCode]> = [
  ["$A = 1\n\n$B = 'x'", "BLANK_LINE"],
  ["$A = 1\n   \n$B = 'x'", "BLANK_LINE"],
  ["$A = 1\n", "BLANK_LINE"],
  ["$A = 1\r\n", "BLANK_LINE"],
  ["\n$A = 1", "BLANK_LINE"],
  ["   ", "BLANK_LINE"],
  ["\n\n", "BLANK_LINE"],
  ["$A = 1 and($B = 'x')", "OPERATOR_SPACING"],
  ["($A = 1)and $B = 'x'", "OPERATOR_SPACING"],
  ["$B = 'x'or $A = 1", "OPERATOR_SPACING"],
  ["$B='x'", "OPERATOR_SPACING"],
  ["$B ='x'", "OPERATOR_SPACING"],
  ["$B= 'x'", "OPERATOR_SPACING"],
  ["$A>0", "OPERATOR_SPACING"],
  ["$A>=1", "OPERATOR_SPACING"],
  ["$B!='y'", "OPERATOR_SPACING"],
  ["$B\t=\t'x'", "TAB_CHARACTER"],
];
for (const [condition, code] of flagged) {
  const result = validateCondition(condition, ctx);
  assert.ok(result.hasErrors, `${JSON.stringify(condition)} must be an error`);
  assert.ok(deviceCodes(condition).includes(code), `${JSON.stringify(condition)} must report ${code}, got ${deviceCodes(condition)}`);
}

const fine = [
  "",
  "$A = 1 and $B = 'x'",
  "$A = 1 AND $B = 'x'",
  "$A = 1\n$B = 'x'",
  "$A > 0",
  "$A >0",
  "$B !='y'",
  "$B == 'x'",
  "$B =='x'",
  "$A = 1 or$B = 'x'",
  "$A = 1 and  $B = 'x'",
  "$B = 'x=y'",
  "$B = 'a and(b)'",
  "$B = 'x\ty'",
];
for (const condition of fine) assert.deepEqual(deviceCodes(condition), [], `${JSON.stringify(condition)} works on tablets`);

// Every fix is applicable and, applied until none is left, leaves a condition tablets can read.
for (const [condition] of flagged) {
  let text = condition;
  for (let i = 0; i < 10; i++) {
    const d = validateCondition(text, ctx).diagnostics.find((x) => DEVICE_CODES.includes(x.code));
    if (!d) break;
    assert.ok(canApplySuggestion(d), `${d.code} on ${JSON.stringify(text)} must offer its fix`);
    text = text.slice(0, d.start) + d.suggestion + text.slice(d.end);
  }
  assert.deepEqual(deviceCodes(text), [], `fixing ${JSON.stringify(condition)} gave ${JSON.stringify(text)}`);
}
assert.equal(validateCondition("$A = 1\n\n$B = 'x'", ctx).diagnostics.find((d) => d.code === "BLANK_LINE")!.message,
  "Remove this empty line: tablets read every line as a condition, and an empty one fails.");

// What the condition editor saves: no spaces at line ends, no empty lines; everything else as written.
const tidy: Array<[string, string]> = [
  ["$A = 1 ", "$A = 1"],
  ["$A = 1\t\r\n", "$A = 1"],
  ["\n\n$A = 1\n   \n$B = 'x'  \n\n", "$A = 1\n$B = 'x'"],
  ["  $A = 1\n  $B = 'x'", "  $A = 1\n  $B = 'x'"],
  ["$B = 'x y'", "$B = 'x y'"],
  ["   \n\n", ""],
  ["", ""],
];
for (const [input, saved] of tidy) {
  assert.equal(tidyCondition(input), saved, JSON.stringify(input));
  const codes = validateCondition(tidyCondition(input), ctx).diagnostics.map((d) => d.code);
  assert.ok(!codes.includes("BLANK_LINE") && !codes.includes("TRAILING_WHITESPACE"), `${JSON.stringify(input)} still ${codes}`);
}
// Linear on long runs of spaces (no regex to backtrack).
const started = Date.now();
tidyCondition(`$A = 1${" ".repeat(200000)}x\n`.repeat(5));
assert.ok(Date.now() - started < 200, "tidying long whitespace must stay fast");

console.log(`condition-device-faults: all assertions passed (${flagged.length} faults, ${fine.length} working forms)`);
