import assert from "assert";

import {
  FIELD_KEY_COLLISION_RULES,
  describeFieldKeyCollisionCounts,
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

// Keys differing only by case on different screens are different keys — two
// fields, two stored values, two export columns — and are not a collision.
assert.equal(
  findScriptFieldKeyCollisions({
    scriptId: "script-1",
    dataKeys: keys,
    screens: [
      { screenId: "s1", title: "Birth", fields: [field({ key: "RESUS", label: "At birth" })] },
      { screenId: "s2", title: "Admission", fields: [field({ key: "Resus", label: "On admission" })] },
    ],
  }).length,
  0,
  "RESUS and Resus on different screens are two keys, not a collision",
);

// On ONE screen they still collide: the mobile form keys its field maps without
// case, so one of the two is dropped before any condition is evaluated.
const sameScreenVariant = findScriptFieldKeyCollisions({
  scriptId: "script-1",
  dataKeys: keys,
  screens: [
    {
      screenId: "s1",
      title: "Birth",
      fields: [field({ key: "RESUS", label: "A" }), field({ key: "Resus", label: "B" })],
    },
  ],
});
assert.equal(sameScreenVariant.length, 1, "a case variant within one screen still collides");
assert.equal(sameScreenVariant[0].kind, "duplicate_key_same_screen");
assert.equal(sameScreenVariant[0].severity, "blocking");

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

// ── Publish summary wording ──────────────────────────────────────────────────

// Every rule needs both forms: no suffix rule turns "field key spelled two
// ways" into its plural, so a missing one would silently print the singular.
for (const rule of FIELD_KEY_COLLISION_RULES) {
  assert.ok(rule.publishLabel, `${rule.id} has a publish label`);
  assert.ok(rule.publishLabelPlural, `${rule.id} has a plural publish label`);
  assert.notEqual(rule.publishLabel, rule.publishLabelPlural, `${rule.id} distinguishes one from many`);
}

assert.deepEqual(describeFieldKeyCollisionCounts({}), [], "nothing found says nothing");
assert.deepEqual(describeFieldKeyCollisionCounts(undefined), [], "an absent tally is not a crash");
assert.deepEqual(
  describeFieldKeyCollisionCounts({ duplicate_key_same_screen: 1 }),
  ["1 duplicate field key"],
  "one duplicate reads as singular",
);
assert.deepEqual(
  describeFieldKeyCollisionCounts({ duplicate_key_repeatable: 2, duplicate_key_same_screen: 1 }),
  ["1 duplicate field key", "2 shared field keys in a collection"],
  "each kind is counted separately, worst first",
);
assert.deepEqual(
  describeFieldKeyCollisionCounts({ duplicate_key_repeatable: 3 }),
  ["3 shared field keys in a collection"],
  "the collection rule keeps its own wording",
);

// The tally the publish gate reads must match the collisions it was built from.
const tallied = findScriptFieldKeyCollisions({
  scriptId: "script-1",
  dataKeys: keys,
  screens: [
    { screenId: "s1", title: "Outcome", fields: [field({ label: "C" }), field({ label: "D" })] },
    {
      screenId: "s2",
      title: "Rounds",
      repeatable: true,
      fields: [field({ label: "E", condition: "$Sex = 'M'" }), field({ label: "F", condition: "$Sex = 'F'" })],
    },
  ],
});
const byKind: Record<string, number> = {};
for (const collision of tallied) byKind[collision.kind] = (byKind[collision.kind] || 0) + 1;
assert.deepEqual(
  describeFieldKeyCollisionCounts(byKind),
  ["1 duplicate field key", "1 shared field key in a collection"],
  "both kinds reach the publish summary",
);

// ---- Duplicate option values -----------------------------------------------
// The app stores an option's value, not its label, so two options with the same
// value are one answer in the data however different they look on screen.

const optionsOf = (screen: CollisionScreen) =>
  findScreenFieldKeyCollisions(screen).filter((c) => c.kind === "duplicate_option_value");

// A single/multi select screen keeps its options on the screen and may have no
// fields at all, so this must be found despite the two-fields shortcut.
const screenLevel = optionsOf({
  screenId: "s1",
  title: "NEURO EXAM",
  type: "single_select",
  key: "SuckReflex",
  items: [
    { id: "Strong", label: "Present and strong" },
    { id: "Weak", label: "Present but weak" },
    { id: "Absent", label: "Absent +/- bites" },
    { id: "Absent", label: "Absent" },
  ],
});
assert.equal(screenLevel.length, 1, "a screen option list is checked even with no fields");
assert.equal(screenLevel[0].displayKey, "Absent");
assert.equal(screenLevel[0].severity, "warning", "the screen still renders, so this is not blocking");
assert.deepEqual(
  screenLevel[0].members.map((m) => m.label),
  ["Absent +/- bites", "Absent"],
  "both labels are named so the author can tell which two collided",
);

const fieldLevel = optionsOf({
  screenId: "s2",
  title: "PATIENT INFORMATION",
  fields: [{ key: "AdmReason", label: "Presenting complaint", items: [
    { value: "DU", label: "Dummy" },
    { value: "OMPH", label: "Omphalitis" },
    { value: "OMPH", label: "Omphalitis (severe)" },
  ] }],
});
assert.equal(fieldLevel.length, 1, "a field option list is checked on a one-field screen");
assert.ok(fieldLevel[0].location.includes('field "Presenting complaint"'), "the field is named in the location");

// Values differing only by case are a DIFFERENT fault and must not be called
// duplicates: "Pain" and "Pneumonia" are stored and exported separately. What
// breaks is conditions, because the runtime lowercases before evaluating.
const caseVariantScreen: CollisionScreen = {
  screenId: "s3",
  title: "Current Problems",
  fields: [{ key: "CurProb", label: "Current Problem", items: [
    { value: "Pn", label: "Pain" },
    { value: "PN", label: "Pneumonia/bronchiolitis" },
  ] }],
};
assert.equal(optionsOf(caseVariantScreen).length, 0, "distinct spellings are not duplicates");

const caseVariants = findScreenFieldKeyCollisions(caseVariantScreen)
  .filter((c) => c.kind === "option_value_case_variant");
assert.equal(caseVariants.length, 1, "but they are reported as a case clash");
assert.ok(
  caseVariants[0].message.includes("stay separate in the saved data"),
  "and described accurately — they are not one answer",
);
assert.deepEqual(
  caseVariants[0].members.map((m) => m.label).sort(),
  ["Pain", "Pneumonia/bronchiolitis"],
  "both options are named",
);

// Deliberately distinct codes must not be reported as duplicates either.
assert.equal(
  optionsOf({ screenId: "s3b", title: "MATERNAL DETAILS", type: "single_select", items: [
    { id: "Ch", label: "Chewa" },
    { id: "CH", label: "Chinyanja" },
  ] }).length,
  0,
  "Chewa and Chinyanja are different languages, not a duplicate",
);

assert.equal(
  optionsOf({ screenId: "s4", title: "Fine", fields: [{ key: "Sex", items: [
    { value: "M", label: "Male" }, { value: "F", label: "Female" },
  ] }], items: [{ id: "A" }, { id: "B" }] }).length,
  0,
  "distinct values are not flagged",
);

assert.equal(
  optionsOf({ screenId: "s5", title: "Blanks", fields: [{ key: "K", items: [
    { value: "", label: "one" }, { value: "", label: "two" }, { value: null, label: "three" },
  ] }] }).length,
  0,
  "options with no value at all are someone else's problem, not a duplicate",
);

// It must not disturb the kinds that already existed.
assert.equal(
  findScreenFieldKeyCollisions({
    screenId: "s6",
    title: "Two fields one key",
    fields: [
      { key: "Dup", label: "A", items: [{ value: "X" }] },
      { key: "Dup", label: "B", items: [{ value: "X" }] },
    ],
  }).filter((c) => c.kind === "duplicate_key_same_screen").length,
  1,
  "duplicate field keys are still reported alongside option duplicates",
);

// An option collision must point at the FIELD that owns the options, not at
// whatever field happens to sit at the option's position. The screen editor
// highlights rows by member.fieldIndex, so getting this wrong puts the warning
// on an unrelated field — which is exactly what it did.
const ownerScreen: CollisionScreen = {
  screenId: "s8",
  title: "Test form",
  fields: [
    { key: "TestDate", label: "Test date", items: [] },
    { key: "DateTime", label: "Test datetime", items: [] },
    { key: "TestTime", label: "Test time", items: [] },
    { key: "BabySurname", label: "Baby's Surname", items: [] },
    { key: "CauseBID", label: "Cause of BID", items: [
      { value: "Ape", label: "Appendix1" },
      { value: "APE", label: "Appendix2" },
    ] },
  ],
};

const ownerCollisions = findScreenFieldKeyCollisions(ownerScreen)
  .filter((c) => c.kind === "option_value_case_variant");
assert.equal(ownerCollisions.length, 1);
assert.deepEqual(
  [...new Set(ownerCollisions[0].members.map((m) => m.fieldIndex))],
  [4],
  "every member points at the owning field's row (CauseBID is index 4), not at option rows 0 and 1",
);
assert.deepEqual(
  ownerCollisions[0].members.map((m) => m.optionIndex),
  [0, 1],
  "the option's own position is kept separately",
);
assert.equal(
  ownerCollisions[0].key,
  "causebid",
  "keyed by the owning field, so the field editor finds it and no other field does",
);

// The owning field's key must not be confusable with an option value: a field
// keyed "Ape" elsewhere must not inherit this warning.
assert.notEqual(ownerCollisions[0].key, "ape", "never keyed by the option value");

// A screen's own option list must point at the option rows, with fieldIndex -1
// marking "this is the screen's list, not a field's" — that is how the Items
// table tells its rows apart from the Fields table's.
const neuroExam = findScreenFieldKeyCollisions({
  screenId: "s9",
  title: "NEURO EXAM",
  type: "single_select",
  key: "SuckReflex",
  items: [
    { id: "Strong", label: "Present and strong" },
    { id: "Weak", label: "Present but weak" },
    { id: "Absent", label: "Absent +/- bites" },
    { id: "Absent", label: "Absent" },
  ],
}).filter((c) => c.kind === "duplicate_option_value");

assert.equal(neuroExam.length, 1);
assert.deepEqual(
  neuroExam[0].members.map((m) => m.optionIndex),
  [2, 3],
  "the two duplicate options are rows 2 and 3, not 0 and 1",
);
assert.deepEqual(
  [...new Set(neuroExam[0].members.map((m) => m.fieldIndex))],
  [-1],
  "fieldIndex -1 marks a screen-level option list, so no field row is highlighted",
);

assert.ok(
  FIELD_KEY_COLLISION_RULES.some((r) => r.id === "duplicate_option_value"),
  "the new kind is in the shared catalogue, so badges, the scan and the publish gate all describe it the same way",
);
assert.deepEqual(
  describeFieldKeyCollisionCounts({ duplicate_option_value: 2 }),
  ["2 duplicate option values"],
  "it reaches the publish summary",
);
assert.ok(
  FIELD_KEY_COLLISION_RULES.some((r) => r.id === "option_value_case_variant"),
  "the case-clash kind is in the catalogue too",
);
assert.deepEqual(
  describeFieldKeyCollisionCounts({ option_value_case_variant: 1 }),
  ["1 pair of option values differing only by case"],
  "and is phrased for the publish summary",
);

// An exact duplicate that ALSO has a case variant reports both, once each.
const both = findScreenFieldKeyCollisions({
  screenId: "s7", title: "Both", fields: [{ key: "K", items: [
    { value: "PN", label: "one" }, { value: "PN", label: "two" }, { value: "Pn", label: "three" },
  ] }],
});
assert.equal(both.filter((c) => c.kind === "duplicate_option_value").length, 1);
assert.equal(both.filter((c) => c.kind === "option_value_case_variant").length, 1);

console.log("field key collision tests passed");
