import assert from "assert";

import {
  resolveNuidTemplate,
  buildNuidProvisionPayload,
  isNuidManagedDataKey,
  lockManagedDataKeyPatch,
  NUID_MANAGED,
  type NuidFieldSpec,
  type NuidLibraryKey,
} from "../lib/nuid-search";

const template: NuidFieldSpec[] = [
  {
    key: "BabyTransfered",
    type: "dropdown",
    label: "Has the baby been transferred?",
    options: [
      { value: "Y", label: "Yes" },
      { value: "N", label: "No" },
    ],
  },
  { key: "patientNUID", type: "text", label: "Search patient's NUID", condition: "$BabyTransfered = 'Y'" },
];

// ---- resolveNuidTemplate -------------------------------------------------

// Nothing in the library -> everything missing.
{
  const res = resolveNuidTemplate(template, []);
  assert.equal(res.linked.length, 0, "empty library links nothing");
  assert.equal(res.missing.length, 2, "both template fields are missing");
  assert.equal(res.conflicts.length, 0, "no conflicts against an empty library");
}

// Both present and compatible -> both linked with a keyId.
{
  const lib: NuidLibraryKey[] = [
    { uniqueKey: "dk-transfer", name: "BabyTransfered", dataType: "dropdown" },
    { uniqueKey: "dk-nuid", name: "patientNUID", dataType: "text" },
  ];
  const res = resolveNuidTemplate(template, lib);
  assert.equal(res.linked.length, 2, "both fields resolve");
  assert.equal(res.missing.length, 0);
  const transfer = res.linked.find((f) => f.key === "BabyTransfered");
  assert.equal(transfer?.keyId, "dk-transfer", "linked field carries the library keyId");
}

// Same name but wrong type -> conflict, not a silent link.
{
  const lib: NuidLibraryKey[] = [
    { uniqueKey: "dk-transfer-text", name: "BabyTransfered", dataType: "text" }, // should be dropdown
  ];
  const res = resolveNuidTemplate(template, lib);
  assert.equal(res.conflicts.length, 1, "a wrong-type same-name key is a conflict");
  assert.equal(res.conflicts[0].key, "BabyTransfered");
  assert.equal(res.conflicts[0].expectedType, "single_select");
  assert.equal(res.missing.length, 1, "patientNUID is still missing");
  assert.equal(res.linked.length, 0, "the wrong-type key is not linked");
}

// dropdown and single_select are compatible -> resolves.
{
  const lib: NuidLibraryKey[] = [
    { uniqueKey: "dk-transfer-ss", name: "BabyTransfered", dataType: "single_select" },
  ];
  const res = resolveNuidTemplate(template, lib);
  assert.equal(res.linked.find((f) => f.key === "BabyTransfered")?.keyId, "dk-transfer-ss");
}

// ---- buildNuidProvisionPayload ------------------------------------------

let counter = 0;
const genId = () => `gen-${++counter}`;

// From an empty library: creates the two option children, then the dropdown, then the text key.
{
  counter = 0;
  const payload = buildNuidProvisionPayload(template, [], genId);

  const yes = payload.find((k) => k.name === "Y");
  const no = payload.find((k) => k.name === "N");
  const dropdown = payload.find((k) => k.name === "BabyTransfered");
  const text = payload.find((k) => k.name === "patientNUID");

  assert.ok(yes && no && dropdown && text, "creates Y, N, dropdown and text keys");
  assert.equal(yes!.dataType, "option");
  assert.equal(yes!.label, "Yes", "option label comes from the spec");
  assert.equal(dropdown!.dataType, "dropdown");
  assert.equal(text!.dataType, "text");

  // Parent references exactly its two freshly created children.
  assert.deepEqual(
    [...(dropdown!.options || [])].sort(),
    [yes!.uniqueKey, no!.uniqueKey].sort(),
    "dropdown options reference the created option uniqueKeys",
  );

  // Everything is stamped managed.
  assert.ok(payload.every((k) => k.metadata?.managed === NUID_MANAGED), "all provisioned keys are managed");
}

// No duplicates by key+dataType: two dropdowns needing Y/N share ONE Y and ONE N.
{
  counter = 0;
  const twoDropdowns: NuidFieldSpec[] = [
    {
      key: "BabyTransfered",
      type: "dropdown",
      label: "Transferred?",
      options: [
        { value: "Y", label: "Yes" },
        { value: "N", label: "No" },
      ],
    },
    {
      key: "BabyTwin",
      type: "dropdown",
      label: "Twin?",
      options: [
        { value: "Y", label: "Yes" },
        { value: "N", label: "No" },
      ],
    },
  ];
  const payload = buildNuidProvisionPayload(twoDropdowns, [], genId);

  const options = payload.filter((k) => k.dataType === "option");
  const dropdowns = payload.filter((k) => k.dataType === "dropdown");
  assert.equal(options.length, 2, "only one Y and one N option are created, not four");
  assert.equal(dropdowns.length, 2, "both dropdowns are created");

  // Both dropdowns reference the exact same shared option uniqueKeys.
  assert.deepEqual(
    [...(dropdowns[0].options || [])].sort(),
    [...(dropdowns[1].options || [])].sort(),
    "both dropdowns share the same Y/N option children",
  );
  const optIds = new Set(options.map((o) => o.uniqueKey));
  assert.ok((dropdowns[0].options || []).every((o) => optIds.has(o)), "dropdown references only created options");
}

// No duplicate parent: a text key that already exists (by name+type) is not re-created.
{
  counter = 0;
  const lib: NuidLibraryKey[] = [{ uniqueKey: "dk-nuid", name: "patientNUID", dataType: "text" }];
  const textOnly: NuidFieldSpec[] = [
    { key: "patientNUID", type: "text", label: "Search patient's NUID" },
  ];
  const payload = buildNuidProvisionPayload(textOnly, lib, genId);
  assert.equal(payload.length, 0, "an existing text key is not duplicated");
}

// Reuses an existing option key named after the LABEL (Yes) when its label is
// exactly "Yes" — falling back from the preferred value name (Y).
{
  counter = 0;
  const lib: NuidLibraryKey[] = [
    { uniqueKey: "opt-yes", name: "Yes", label: "Yes", dataType: "option" }, // key "Yes", label "Yes"
  ];
  const dropdownOnly: NuidFieldSpec[] = [template[0]];
  const payload = buildNuidProvisionPayload(dropdownOnly, lib, genId);

  const createdYes = payload.find((k) => k.dataType === "option" && (k.name === "Y" || k.name === "Yes"));
  assert.equal(createdYes, undefined, "the existing Yes option is reused, not recreated");

  const createdNo = payload.find((k) => k.name === "N");
  assert.ok(createdNo, "the missing No option is still created (key N, label No)");
  assert.equal(createdNo!.label, "No");

  const dropdown = payload.find((k) => k.name === "BabyTransfered");
  assert.ok(dropdown!.options!.includes("opt-yes"), "dropdown references the reused option's uniqueKey");
  assert.ok(dropdown!.options!.includes(createdNo!.uniqueKey), "dropdown references the created No option");
}

// Prefers the value-named key (Y) over the label-named key (Yes) when both exist
// with label "Yes".
{
  counter = 0;
  const lib: NuidLibraryKey[] = [
    { uniqueKey: "opt-y", name: "Y", label: "Yes", dataType: "option" },
    { uniqueKey: "opt-yes", name: "Yes", label: "Yes", dataType: "option" },
    { uniqueKey: "opt-n", name: "N", label: "No", dataType: "option" },
  ];
  const payload = buildNuidProvisionPayload([template[0]], lib, genId);
  const dropdown = payload.find((k) => k.name === "BabyTransfered");
  assert.ok(dropdown!.options!.includes("opt-y"), "prefers the Y-named key over the Yes-named key");
  assert.ok(!dropdown!.options!.includes("opt-yes"), "does not use the Yes-named key when Y exists");
  assert.ok(dropdown!.options!.includes("opt-n"), "reuses the N option");
  assert.equal(payload.filter((k) => k.dataType === "option").length, 0, "no new option keys created");
}

// Does NOT reuse an option whose label isn't exactly Yes/No — a new one is made.
{
  counter = 0;
  const lib: NuidLibraryKey[] = [
    { uniqueKey: "opt-y-wrong", name: "Y", label: "Positive", dataType: "option" }, // wrong label
  ];
  const payload = buildNuidProvisionPayload([template[0]], lib, genId);
  const createdYes = payload.find((k) => k.dataType === "option" && k.name === "Y");
  assert.ok(createdYes, "a new Y/Yes option is created because the existing one's label isn't 'Yes'");
  assert.equal(createdYes!.label, "Yes");
  const dropdown = payload.find((k) => k.name === "BabyTransfered");
  assert.ok(!dropdown!.options!.includes("opt-y-wrong"), "the wrong-label option is not reused");
}

// ---- managed lock --------------------------------------------------------

{
  const managedKey = { name: "BabyTransfered", dataType: "dropdown", metadata: { managed: NUID_MANAGED } };
  assert.equal(isNuidManagedDataKey(managedKey), true);
  assert.equal(isNuidManagedDataKey({ metadata: {} }), false);
  assert.equal(isNuidManagedDataKey(null), false);

  // Attempted key/type change is forced back; label change passes through; flag preserved.
  const patched = lockManagedDataKeyPatch(
    { name: "Renamed", dataType: "text", label: "New label", metadata: {} },
    managedKey,
  );
  assert.equal(patched.name, "BabyTransfered", "name is immutable");
  assert.equal(patched.dataType, "dropdown", "dataType is immutable");
  assert.equal(patched.label, "New label", "label still changes");
  assert.equal((patched.metadata as any).managed, NUID_MANAGED, "managed flag is preserved");

  // Unmanaged existing key -> patch passes through untouched.
  const unmanaged = lockManagedDataKeyPatch(
    { name: "Renamed", dataType: "text" },
    { name: "Old", dataType: "number", metadata: {} },
  );
  assert.equal(unmanaged.name, "Renamed", "unmanaged keys are not locked");
  assert.equal(unmanaged.dataType, "text");
}

console.log("nuid search provision tests passed");
