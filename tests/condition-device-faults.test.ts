import assert from "assert";

import { validateCondition, type DiagnosticCode } from "../lib/conditional-expression";
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

console.log(`condition-device-faults: all assertions passed (${flagged.length} faults, ${fine.length} working forms)`);
