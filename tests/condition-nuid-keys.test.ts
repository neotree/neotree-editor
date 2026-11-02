import assert from "assert";

import { scrapDataKeys } from "../lib/data-keys";
import { collectScriptConditionFindings } from "../lib/conditional-expression";

/**
 * The scripts table builds a script's keys the way the script editor does: its screens, fields
 * and its NUID search fields. A screen or field condition on a NUID search key is not an unknown key.
 */

const nuidSearchFields = [{ fieldId: "n1", key: "NuidMotherName", label: "Mother's name", keyId: "k1" }];
const screens = [{
  screenId: "s1",
  key: "Admission",
  title: "Admission",
  type: "form",
  condition: "$NuidMotherName = 'x'",
  fields: [{ fieldId: "f1", key: "Weight", label: "Weight", type: "number", condition: "$NuidMotherName != 'y'" }],
}];

(async () => {
  const unknownKeys = async (scripts?: any[]) => {
    const dataKeys = await scrapDataKeys({ scripts, screens: screens as any, dataKeys: [] });
    return collectScriptConditionFindings({ screens, dataKeys, nuidSearchFields })
      .flatMap((f) => f.errors.filter((e) => e.code === "UNKNOWN_KEY").map(() => f.location));
  };

  assert.deepEqual(
    await unknownKeys(),
    ['Screen "Admission"', 'Screen "Admission" > field "Weight"'],
    "without the NUID search fields their keys are unknown (the old behaviour)",
  );
  assert.deepEqual(await unknownKeys([{ nuidSearchFields }]), [], "with them, screens and fields may use NUID search keys");
  assert.deepEqual(await unknownKeys([{}]), await unknownKeys(), "a script without NUID search fields adds no keys and does not fail");

  console.log("condition-nuid-keys: all assertions passed");
})().catch((e) => { console.error(e); process.exit(1); });
