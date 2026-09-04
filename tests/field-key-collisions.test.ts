import assert from "assert";

import {
  findScreenFieldKeyCollisions,
  findScriptFieldKeyCollisions,
  getBlockingFieldKeyCollisions,
  getScriptFieldKeyCollisionCount,
  normalizeFieldKey,
  type CollisionScreen,
} from "../lib/field-key-collisions";
import type { ConditionKey } from "../lib/conditional-expression";

const keys: ConditionKey[] = [
  { name: "Outcome", dataType: "dropdown", options: ["discharged", "died"] },
  { name: "Sex", dataType: "dropdown", options: ["M", "F"] },
];

const field = (over: Partial<{ key: string; label: string; condition: string; type: string }> = {}) => ({
  fieldId: `${over.key || "f"}-${over.label || "l"}`,
  type: over.type || "text",
  key: over.key ?? "HCWSig",
  label: over.label ?? "Signature",
  condition: over.condition ?? "",
});

// ── Key normalization matches the runtime ─────────────────────────────────────

assert.equal(normalizeFieldKey(" HCWSig "), "hcwsig");
assert.equal(normalizeFieldKey(null), "");

const caseScreen: CollisionScreen = {
  screenId: "s1",
  title: "Discharge",
  fields: [field({ key: "HCWSig", label: "Signature" }), field({ key: "hcwsig", label: "Signature (nurse)" })],
};
assert.equal(
  findScreenFieldKeyCollisions(caseScreen, { keys }).length,
  1,
  "keys collide without case, like every runtime lookup",
);

// ── Same screen, overlapping conditions ───────────────────────────────────────

const overlapping = findScreenFieldKeyCollisions(
  {
    screenId: "s1",
    title: "Discharge",
    fields: [
      field({ label: "Signature", condition: "$Outcome = 'discharged'" }),
      field({ label: "Signature (nurse)", condition: "$Outcome != 'died' and $Sex = 'F'" }),
    ],
  },
  { keys },
);
assert.equal(overlapping.length, 1);
assert.equal(overlapping[0].kind, "duplicate_key_same_screen");
assert.equal(overlapping[0].severity, "blocking");
assert.equal(overlapping[0].verdict, "overlapping");
assert.equal(overlapping[0].key, "hcwsig");
assert.equal(overlapping[0].displayKey, "HCWSig", "the message keeps the author's spelling");
assert.ok(
  overlapping[0].message.includes("$Outcome = 'discharged'"),
  `overlapping message should carry the witness, got: ${overlapping[0].message}`,
);
assert.equal(overlapping[0].members.length, 2);

// ── Same screen, provably exclusive conditions: still blocking ────────────────

const exclusive = findScreenFieldKeyCollisions(
  {
    screenId: "s1",
    title: "Discharge",
    fields: [
      field({ label: "Signature (male)", condition: "$Sex = 'M'" }),
      field({ label: "Signature (female)", condition: "$Sex = 'F'" }),
    ],
  },
  { keys },
);
assert.equal(exclusive.length, 1);
assert.equal(exclusive[0].verdict, "exclusive");
assert.equal(
  exclusive[0].severity,
  "blocking",
  "a normal screen keys the field before it checks the condition, so exclusivity does not save it",
);
assert.ok(
  exclusive[0].message.includes("before it evaluates conditions"),
  "the exclusive message must explain why it still breaks",
);

// ── Repeatable screen: exclusivity downgrades to a warning ───────────────────

const repeatableExclusive = findScreenFieldKeyCollisions(
  {
    screenId: "s2",
    title: "Admissions",
    repeatable: true,
    fields: [
      field({ label: "Signature (male)", condition: "$Sex = 'M'" }),
      field({ label: "Signature (female)", condition: "$Sex = 'F'" }),
    ],
  },
  { keys },
);
assert.equal(repeatableExclusive.length, 1);
assert.equal(repeatableExclusive[0].kind, "duplicate_key_repeatable");
assert.equal(repeatableExclusive[0].severity, "warning");

const repeatableOverlapping = findScreenFieldKeyCollisions(
  {
    screenId: "s2",
    title: "Admissions",
    repeatable: true,
    fields: [field({ label: "A" }), field({ label: "B" })],
  },
  { keys },
);
assert.equal(repeatableOverlapping[0].severity, "blocking", "an overlapping collection collision still blocks");

// ── An unproven verdict is treated as unsafe ─────────────────────────────────

const unknown = findScreenFieldKeyCollisions(
  {
    screenId: "s1",
    title: "Discharge",
    fields: [field({ label: "A", condition: "$Sex =" }), field({ label: "B", condition: "$Sex = 'F'" })],
  },
  { keys },
);
assert.equal(unknown[0].verdict, "unknown");
assert.equal(unknown[0].severity, "blocking", "what cannot be proven exclusive is treated as overlapping");

// ── Distinct keys are left alone ─────────────────────────────────────────────

assert.equal(
  findScreenFieldKeyCollisions(
    { screenId: "s1", title: "Discharge", fields: [field({ key: "HCWSig" }), field({ key: "HCWSig2" })] },
    { keys },
  ).length,
  0,
  "distinct keys are not a collision",
);
assert.equal(
  findScreenFieldKeyCollisions({ screenId: "s1", title: "Discharge", fields: [field({ key: "" }), field({ key: "" })] }).length,
  0,
  "blank keys are ignored — that is a different check",
);

// ── Three fields on one key report once ──────────────────────────────────────

const three = findScreenFieldKeyCollisions(
  {
    screenId: "s1",
    title: "Discharge",
    fields: [field({ label: "A" }), field({ label: "B" }), field({ label: "C" })],
  },
  { keys },
);
assert.equal(three.length, 1, "one finding per key, not one per pair");
assert.equal(three[0].members.length, 3);

// ── Key types are derived from the screen's own fields ───────────────────────

// No registry passed: the screen still knows $Sex is a single-value dropdown,
// so `includes` and `=` on it cannot both hold.
const derivedTypes = findScreenFieldKeyCollisions({
  screenId: "s1",
  title: "Discharge",
  fields: [
    field({ key: "Sex", label: "Sex", type: "dropdown" }),
    field({ label: "Signature (a)", condition: "[$Sex includes ('M')]" }),
    field({ label: "Signature (b)", condition: "$Sex = 'F'" }),
  ],
});
assert.equal(derivedTypes.length, 1);
assert.equal(derivedTypes[0].verdict, "exclusive", "field types stand in for the registry");

// ── Scoped to one screen ────────────────────────────────────────────────────

// A key reused on another screen is deliberately not reported: only fields
// sharing a screen collapse into one another.
assert.equal(
  findScriptFieldKeyCollisions({
    scriptId: "script-1",
    dataKeys: keys,
    screens: [
      { screenId: "s1", title: "Admission", fields: [field({ label: "Signature" })] },
      { screenId: "s2", title: "Discharge", fields: [field({ label: "Signature" })] },
    ],
  }).length,
  0,
  "the same key on two screens is not a collision",
);

const sameScreenOnly = findScriptFieldKeyCollisions({
  scriptId: "script-1",
  dataKeys: keys,
  screens: [
    { screenId: "s1", title: "Discharge", fields: [field({ label: "A" }), field({ label: "B" })] },
    { screenId: "s2", title: "Admission", fields: [field({ label: "C" })] },
  ],
});
assert.equal(sameScreenOnly.length, 1, "only the screen with two same-keyed fields reports");
assert.equal(sameScreenOnly[0].kind, "duplicate_key_same_screen");
assert.equal(sameScreenOnly[0].screenId, "s1");

// ── Roll-ups ─────────────────────────────────────────────────────────────────

const mixed = findScriptFieldKeyCollisions({
  scriptId: "script-1",
  dataKeys: keys,
  screens: [
    { screenId: "s1", title: "Admission", fields: [field({ label: "A" }), field({ label: "B" })] },
    {
      screenId: "s2",
      title: "Rounds",
      repeatable: true,
      fields: [
        field({ label: "C", condition: "$Sex = 'M'" }),
        field({ label: "D", condition: "$Sex = 'F'" }),
      ],
    },
  ],
});
assert.equal(mixed.length, 2);
assert.equal(mixed[0].severity, "blocking", "blocking findings sort first");
assert.equal(mixed[1].severity, "warning");
assert.equal(getBlockingFieldKeyCollisions(mixed).length, 1);
assert.equal(
  getScriptFieldKeyCollisionCount({ scriptId: "script-1", dataKeys: keys, screens: [] }),
  0,
  "a script with no screens has nothing to report",
);

console.log("field key collision tests passed");
