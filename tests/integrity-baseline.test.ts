import assert from "assert";

import { buildIntegrityBaselineFromSnapshotData } from "../lib/integrity-baseline";
import { buildIntegrityImportReviewDetails, buildIntegrityImportSnapshot } from "../lib/integrity-imports";
import { getIntegrityEntryFingerprint, DEFAULT_INTEGRITY_POLICY } from "../lib/integrity-policy";

const policy = {
  ...DEFAULT_INTEGRITY_POLICY,
  enforcementMode: "block_new_issues_only" as const,
};

const parentMedId = "3c29752a-a775-4bd2-a789-4d15b642f8d0";
const scriptId = "6364caaa-7899-47b9-975e-f05151e4e13c";
const screenId = "5467d7aa-a844-4831-a9e2-54c258a634f9";
const fieldId = "c74990a7-c71b-4cdd-849a-5beb98f9241c";

const dataKeys: any[] = [
  {
    uuid: parentMedId,
    uniqueKey: parentMedId,
    name: "MEDSDIS",
    label: "Discharge Medications (Dose/ Duration)",
    dataType: "multi_select",
    options: ["opt-none", "opt-amik", "opt-other"],
    isDraft: false,
    isDeleted: false,
  },
  {
    uuid: "opt-none",
    uniqueKey: "opt-none",
    name: "Norm",
    label: "NONE",
    dataType: "option",
    options: [],
    isDraft: false,
    isDeleted: false,
  },
  {
    uuid: "opt-amik",
    uniqueKey: "opt-amik",
    name: "Amik",
    label: "Amikacin",
    dataType: "option",
    options: [],
    isDraft: false,
    isDeleted: false,
  },
  {
    uuid: "opt-other",
    uniqueKey: "opt-other",
    name: "Oth",
    label: "Other",
    dataType: "option",
    options: [],
    isDraft: false,
    isDeleted: false,
  },
];

const screens: any[] = [
  {
    screenId,
    scriptId,
    scriptTitle: "Bindura Hospital Discharge",
    title: "Discharge Medications (Dose/ Duration)",
    type: "form",
    fields: [
      {
        fieldId,
        key: "MEDSDIS",
        label: "Discharge Medications (Dose/ Duration)",
        type: "multi_select",
        items: [
          { itemId: "i1", keyId: "opt-none", value: "Norm", label: "NONE" },
          { itemId: "i2", keyId: "missing-1", value: "BP", label: "X penicillin" },
          { itemId: "i3", keyId: "missing-2", value: "Gent", label: "Gentamicin" },
          { itemId: "i4", keyId: "opt-amik", value: "Amik", label: "Amikacin" },
          { itemId: "i5", keyId: "opt-other", value: "OTH", label: "Other" },
        ],
      },
    ],
    items: [],
    isDraft: false,
    isDeleted: false,
  },
];

const rawLegacyFieldFingerprint = getIntegrityEntryFingerprint({
  scriptId,
  status: "legacy_match",
  kind: "field",
  screenId,
  fieldId,
  fieldIndex: 0,
  expectedDataType: "multi_select",
});

const repairedOptionCollectionFingerprint = getIntegrityEntryFingerprint({
  scriptId,
  status: "conflict",
  kind: "field_option_collection",
  screenId,
  fieldId,
  fieldIndex: 0,
  expectedDataType: "multi_select",
});

const baseline = buildIntegrityBaselineFromSnapshotData({
  policy,
  userId: "user-1",
  dataKeys,
  screens,
  diagnoses: [],
  problems: [],
});

assert.ok(
  baseline.fingerprints.includes(rawLegacyFieldFingerprint),
  "baseline should capture the raw published legacy-match fingerprint that publish now enforces against",
);
assert.ok(
  !baseline.fingerprints.includes(repairedOptionCollectionFingerprint),
  "baseline should not capture a repaired option-collection fingerprint that is no longer used by publish",
);

const importSnapshot = buildIntegrityImportSnapshot({
  policy,
  dataKeys,
  screens,
  diagnoses: [],
  problems: [],
});

assert.ok(
  importSnapshot.fingerprints.includes(rawLegacyFieldFingerprint),
  "import snapshots should capture raw-state fingerprints so accepted import debt matches publish enforcement",
);
assert.ok(
  !importSnapshot.fingerprints.includes(repairedOptionCollectionFingerprint),
  "import snapshots should not capture repaired-state fingerprints that publish no longer uses",
);

const importReviewDetails = buildIntegrityImportReviewDetails({
  policy,
  dataKeys,
  screens,
  diagnoses: [],
  problems: [],
});

assert.ok(importReviewDetails, "import review details should still be generated");
assert.ok(
  importReviewDetails?.scripts.some((script) =>
    script.issues.some((issue) => issue.displayName === "Discharge Medications (Dose/ Duration)" && issue.ruleLabel === "unlinked match"),
  ),
  "import review details should describe the raw-state issue users will actually hit at publish time",
);

console.log("integrity baseline tests passed");
