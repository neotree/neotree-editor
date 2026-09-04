import assert from "assert";

import {
  applyScreenOptionMerges,
  planScreenOptionMerges,
  type OptionMergeField,
} from "../lib/field-key-collisions/merge-option-fields";
import { findScreenFieldKeyCollisions } from "../lib/field-key-collisions";
import { validateCondition } from "../lib/conditional-expression";

const signatureField = (facility: string, names: string[]): OptionMergeField => ({
  fieldId: `f-${facility}`,
  key: "HCWSig",
  label: "Electronic Signature",
  type: "dropdown",
  keyId: "dk-1",
  condition: `$PHC = '${facility}'`,
  items: [
    ...names.map((name) => ({ itemId: `${facility}-${name}`, value: name, label: name })),
    { itemId: `${facility}-OTH`, value: "OTH", label: "Other" },
  ],
});

// ── The signature pattern: ten fields become one ─────────────────────────────

const screen = {
  screenId: "s1",
  title: "SIGNATURE",
  fields: [
    signatureField("Bua", ["GeYo", "GrKh"]),
    signatureField("KWB", ["StMt"]),
    signatureField("SLB", ["RuMt", "LaCh"]),
    { fieldId: "f-cadre", key: "Cadre", label: "Type of Health Care Worker", type: "dropdown", items: [{ itemId: "c1", value: "N", label: "Nurse" }] },
  ],
};

const { plans, blockers } = planScreenOptionMerges(screen);
assert.equal(blockers.length, 0, `expected no blockers, got: ${JSON.stringify(blockers)}`);
assert.equal(plans.length, 1, "one plan for the one duplicated key");

const plan = plans[0];
assert.equal(plan.displayKey, "HCWSig");
assert.equal(plan.sourceFieldCount, 3);
assert.equal(plan.keptIndex, 0);
assert.deepEqual(plan.removedIndexes, [1, 2]);

// Five distinct staff plus the shared OTH.
assert.equal(plan.mergedItems.length, 6, "options are deduped by key");
assert.deepEqual(
  plan.sharedOptions,
  [{ value: "oth", sources: 3 }],
  "OTH is the only option offered by more than one facility",
);

const byValue = new Map(plan.mergedItems.map((item) => [`${item.value}`, `${item.condition || ""}`]));
assert.equal(byValue.get("GeYo"), "$PHC = 'Bua'", "a facility-specific option carries that facility's condition");
assert.equal(byValue.get("RuMt"), "$PHC = 'SLB'");
assert.equal(
  byValue.get("OTH"),
  "($PHC = 'Bua') or ($PHC = 'KWB') or ($PHC = 'SLB')",
  "a shared option is offered whenever any of its sources would offer it",
);

// The surviving field hides when no source condition holds, so the list is
// never shown empty.
assert.equal(plan.mergedCondition, "($PHC = 'Bua') or ($PHC = 'KWB') or ($PHC = 'SLB')");

// Everything generated must parse.
for (const item of plan.mergedItems) {
  const result = validateCondition(`${item.condition || ""}`, { keys: [], skipKeyResolution: true });
  assert.equal(result.hasErrors, false, `generated option condition should parse: ${item.condition}`);
}

// ── Applying the plan removes the collision ──────────────────────────────────

const mergedFields = applyScreenOptionMerges(screen, plans);
assert.equal(mergedFields.length, 2, "three signature fields collapse into one, Cadre untouched");
assert.equal(mergedFields[0].fieldId, "f-Bua", "the surviving field keeps its identity");
assert.equal(mergedFields[1].key, "Cadre");
assert.equal(
  findScreenFieldKeyCollisions({ ...screen, fields: mergedFields as any }).length,
  0,
  "the merged screen has no field-key collision",
);

// ── An unconditional source absorbs the rest ─────────────────────────────────

const withAlwaysOn = planScreenOptionMerges({
  fields: [
    { ...signatureField("Bua", ["GeYo"]), condition: "" },
    signatureField("KWB", ["StMt"]),
  ],
});
assert.equal(withAlwaysOn.plans[0].mergedCondition, "", "an always-shown source makes the merged field always shown");
const alwaysByValue = new Map(withAlwaysOn.plans[0].mergedItems.map((i) => [`${i.value}`, `${i.condition || ""}`]));
assert.equal(alwaysByValue.get("GeYo"), "", "options from an unconditional field stay unconditional");
assert.equal(alwaysByValue.get("OTH"), "", "OTH is unconditional once any source offers it unconditionally");

// ── An existing option condition is ANDed, not replaced ──────────────────────

const nested = planScreenOptionMerges({
  fields: [
    {
      ...signatureField("Bua", []),
      items: [{ itemId: "i1", value: "GeYo", label: "Gerson", condition: "$Cadre = 'N'" }],
    },
    signatureField("KWB", ["StMt"]),
  ],
});
assert.equal(nested.plans[0].mergedItems[0].condition, "$PHC = 'Bua'\n$Cadre = 'N'", "field and option conditions are ANDed by newline");
assert.equal(
  validateCondition(`${nested.plans[0].mergedItems[0].condition}`, { keys: [], skipKeyResolution: true }).hasErrors,
  false,
);

// ── Blockers ─────────────────────────────────────────────────────────────────

const mixedTypes = planScreenOptionMerges({
  fields: [
    { fieldId: "a", key: "X", type: "dropdown", condition: "$P = '1'", items: [{ itemId: "1", value: "a" }] },
    { fieldId: "b", key: "X", type: "text", condition: "$P = '2'" },
  ],
});
assert.equal(mixedTypes.plans.length, 0);
assert.match(mixedTypes.blockers[0].reason, /not all the same type|dropdown and multi-select/);

const differentDataKeys = planScreenOptionMerges({
  fields: [
    { fieldId: "a", key: "X", type: "dropdown", keyId: "dk-1", condition: "$P = '1'", items: [{ itemId: "1", value: "a" }] },
    { fieldId: "b", key: "X", type: "dropdown", keyId: "dk-2", condition: "$P = '2'", items: [{ itemId: "2", value: "b" }] },
  ],
});
assert.equal(differentDataKeys.plans.length, 0);
assert.match(differentDataKeys.blockers[0].reason, /different data keys/);

// includes/excludes evaluate over their whole group, so they are never folded
// into a generated and/or expression.
const membership = planScreenOptionMerges({
  fields: [
    { fieldId: "a", key: "X", type: "dropdown", condition: "[$Diagnoses includes ('sepsis')]", items: [{ itemId: "1", value: "a" }] },
    { fieldId: "b", key: "X", type: "dropdown", condition: "$P = '2'", items: [{ itemId: "2", value: "b" }] },
  ],
});
assert.equal(membership.plans.length, 0);
assert.match(membership.blockers[0].reason, /includes\/excludes/);

const noOptions = planScreenOptionMerges({
  fields: [
    { fieldId: "a", key: "X", type: "dropdown", condition: "$P = '1'", items: [{ itemId: "1", value: "a" }] },
    { fieldId: "b", key: "X", type: "dropdown", condition: "$P = '2'", items: [] },
  ],
});
assert.equal(noOptions.plans.length, 0);
assert.match(noOptions.blockers[0].reason, /no options/);

// A single field with that key is not a merge candidate.
assert.equal(
  planScreenOptionMerges({ fields: [signatureField("Bua", ["GeYo"])] }).plans.length,
  0,
  "nothing to merge when the key appears once",
);

console.log("option field merge tests passed");
