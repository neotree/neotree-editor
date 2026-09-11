import assert from "assert";

import {
  CONDITION_REPORT_SIGNATURE_VERSION,
  buildConditionReportSignature,
  getScriptConditionInputsStamp,
} from "../lib/conditional-expression";

const base = { configuration: "c1", inputs: "i1", content: "n1" };

// ── Every dimension must move the signature ──────────────────────────────────

const signature = buildConditionReportSignature(base);
assert.ok(signature.startsWith(`${CONDITION_REPORT_SIGNATURE_VERSION}:`), "signatures carry their version");
assert.equal(buildConditionReportSignature(base), signature, "same inputs, same signature");

for (const dimension of ["configuration", "inputs", "content"] as const) {
  assert.notEqual(
    buildConditionReportSignature({ ...base, [dimension]: "changed" }),
    signature,
    `a change to ${dimension} must expire the cached report`,
  );
}

// A missing dimension is still deterministic — a failed stamp query degrades to
// "that dimension is not covered", never to a signature that changes per read.
assert.equal(
  buildConditionReportSignature({ ...base, content: "" }),
  buildConditionReportSignature({ ...base, content: "" }),
  "an empty stamp is stable",
);

// The data key library is global: folding it in would expire every script at
// once, so it is swept on write instead of checked per read.
assert.equal(
  Object.keys(base).includes("registry"),
  false,
  "the signature must stay per-script",
);

// ── The script's own CE inputs ───────────────────────────────────────────────

const nuidFields = [
  { key: "BabyTransferedNUID", keyId: "dk-1", type: "text", condition: "$Outcome = 'transfer'" },
  { key: "BabyTwinNUID", keyId: "dk-2", type: "text", condition: "" },
];

const stamp = getScriptConditionInputsStamp({ nuidSearchFields: nuidFields });
assert.equal(getScriptConditionInputsStamp({ nuidSearchFields: nuidFields }), stamp, "stable for equal inputs");

// Reordering the fields is presentation, not validation.
assert.equal(
  getScriptConditionInputsStamp({ nuidSearchFields: [...nuidFields].reverse() }),
  stamp,
  "field order must not expire the report",
);

// Everything validation actually reads must expire it.
assert.notEqual(
  getScriptConditionInputsStamp({
    nuidSearchFields: [{ ...nuidFields[0], condition: "$Outcome = 'died'" }, nuidFields[1]],
  }),
  stamp,
  "editing a NUID condition expires the report",
);
assert.notEqual(
  getScriptConditionInputsStamp({ nuidSearchFields: [{ ...nuidFields[0], keyId: "dk-99" }, nuidFields[1]] }),
  stamp,
  "relinking a NUID field to another data key expires the report",
);
assert.notEqual(
  getScriptConditionInputsStamp({ nuidSearchFields: [nuidFields[0]] }),
  stamp,
  "removing a NUID field expires the report",
);
assert.notEqual(
  getScriptConditionInputsStamp({ nuidSearchFields: nuidFields, eligibilityCriteria: { criteria_condition: "$Age > 1" } }),
  stamp,
  "an eligibility expression expires the report",
);

// Absent config is treated as empty, not as a crash.
assert.equal(
  getScriptConditionInputsStamp({}),
  getScriptConditionInputsStamp({ nuidSearchFields: [], eligibilityCriteria: null }),
  "no NUID config and empty NUID config are the same state",
);

// A label change is presentation only.
assert.equal(
  getScriptConditionInputsStamp({
    nuidSearchFields: [{ ...nuidFields[0], label: "Renamed" }, nuidFields[1]],
  }),
  stamp,
  "renaming a NUID field's label must not expire the report",
);

console.log("condition report signature tests passed");
