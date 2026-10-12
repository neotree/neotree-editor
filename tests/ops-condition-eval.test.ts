import assert from "assert";
import { readFileSync } from "node:fs";
import path from "node:path";

import { parseCondition, evaluateCondition, type ScreenEntry } from "../app/(ops)/conditional-exp/_eval";
import { resolveMemberships } from "../lib/conditional-expression/membership-runtime";
import { buildOutcomeEntries } from "../lib/conditional-expression/outcome-collections-runtime";

/**
 * The ops "test a conditional expression" page runs its own copy of the mobile
 * runtime. Its whole value is answering what a device would answer, so these
 * assert the behaviours that differ between the old and fixed runtimes.
 */

const run = (expression: string, entries: ScreenEntry[]) =>
  !!evaluateCondition(parseCondition(expression, entries));

const form = (...values: any[]): ScreenEntry =>
  ({ screen: { type: "form" }, values } as ScreenEntry);

const dxScreen = (...dx: { key: string; how_agree?: string }[]) =>
  ({
    screen: { type: "diagnosis" },
    values: dx.map((d) => ({
      key: d.key,
      value: d.key,
      type: "diagnosis",
      diagnosis: { how_agree: d.how_agree ?? null },
    })),
  } as unknown as ScreenEntry);

// ---- membership -------------------------------------------------------------

assert.equal(
  run("$NeotreeOutcome excludes ('BID','DDA','NND','STB')", [form({ key: "NeotreeOutcome", value: "LIV" })]),
  true,
  "multi-value excludes is true when nothing matches",
);
assert.equal(
  run("$NeotreeOutcome excludes ('BID','DDA','NND','STB')", [form({ key: "NeotreeOutcome", value: "NND" })]),
  false,
  "multi-value excludes is false when one matches",
);
assert.equal(
  run("$NeotreeOutcome includes ('BID','NND')", [form({ key: "NeotreeOutcome", value: "NND" })]),
  true,
  "includes means any of",
);
assert.equal(
  run("$NeotreeOutcome excludes ('BID') and $DRU = false", [
    form({ key: "NeotreeOutcome", value: "LIV" }, { key: "DRU", value: false, dataType: "boolean" }),
  ]),
  true,
  "a membership composes with another term on the same line",
);

// includes/excludes must stay exact inverses, as legacy.ts assumes
for (const answer of ["LIV", "BID", "NND"]) {
  const entries = [form({ key: "O", value: answer })];
  assert.notEqual(
    run("$O includes ('BID','NND')", entries),
    run("$O excludes ('BID','NND')", entries),
    `includes/excludes must be inverses for ${answer}`,
  );
}

// ---- outcome collections ----------------------------------------------------

assert.equal(run("$Diagnoses = 'RDN'", [dxScreen({ key: "RDN" })]), true, "$Diagnoses resolves");
assert.equal(run("$Diagnoses = 'RDN'", [dxScreen({ key: "SEPSIS" })]), false, "$Diagnoses is specific");
assert.equal(
  run("$Diagnoses = 'RDN'", [dxScreen({ key: "RDN", how_agree: "No" })]),
  false,
  "a rejected diagnosis does not count",
);
assert.equal(run("$Diagnoses = 'RDN'", []), false, "no diagnosis screen yet");

// ---- ordinary comparisons still work ----------------------------------------

assert.equal(run("$Sex = 'M'", [form({ key: "Sex", value: "M" })]), true);
assert.equal(run("$RR > 60", [form({ key: "RR", value: 70 })]), true);
assert.equal(
  run("$O != 'BID' and $O != 'DDA'", [form({ key: "O", value: "LIV" })]),
  true,
  "the correct De Morgan form",
);

// ---- the shared runtime really is shared ------------------------------------
// The editor copies are a banner followed by the mobile file verbatim, so the
// comparison covers the documentation too — an out-of-date comment about what
// the operators mean is exactly the kind of drift that caused this ticket.

const here = path.dirname(new URL(import.meta.url).pathname);
const mobileDir = path.resolve(here, "../../neotree-react-native-app/src/utils");

/** Everything after the AUTO-SYNCED banner. */
const afterBanner = (text: string) => text.slice(text.indexOf("*/") + 2).trimStart();

for (const [editorFile, mobileFile] of [
  ["../lib/conditional-expression/membership-runtime.ts", "membership.ts"],
  ["../lib/conditional-expression/outcome-collections-runtime.ts", "outcome-collections.ts"],
] as const) {
  const mobilePath = path.join(mobileDir, mobileFile);
  let mobileSource: string;
  try {
    mobileSource = readFileSync(mobilePath, "utf8");
  } catch {
    // The mobile checkout may be absent (this repo can build alone); the check
    // is here to catch drift for anyone who has both.
    console.log(`ops-condition-eval: skipped drift check for ${mobileFile} (mobile repo not present)`);
    continue;
  }

  assert.equal(
    afterBanner(readFileSync(path.resolve(here, editorFile), "utf8")),
    mobileSource.trimStart(),
    `${editorFile} has drifted from the mobile app's ${mobileFile} — copy the mobile file over, keeping only the banner`,
  );
}

console.log("ops-condition-eval: all assertions passed");
