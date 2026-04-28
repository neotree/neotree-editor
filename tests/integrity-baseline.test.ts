import assert from "assert";

import { buildIntegrityBaselineFromSnapshotData } from "../lib/integrity-baseline";
import { DEFAULT_INTEGRITY_POLICY } from "../lib/integrity-policy";

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

const baseline = buildIntegrityBaselineFromSnapshotData({
  policy,
  userId: "user-1",
  dataKeys,
  screens,
  diagnoses: [],
  problems: [],
});

const repairedOptionCollectionFingerprint = [
  scriptId,
  "field_option_collection",
  screenId,
  "",
  "",
  fieldId,
  "0",
  "",
  "",
  "",
  "",
  "",
  "",
  "multi_select",
  parentMedId,
  "MEDSDIS",
  parentMedId,
  "MEDSDIS",
].join("::");

assert.ok(
  baseline.fingerprints.includes(repairedOptionCollectionFingerprint),
  "baseline should include the repaired published option collection fingerprint for legacy MEDSDIS fields",
);

console.log("integrity baseline tests passed");
