import assert from "assert";

import {
  filterFingerprintsByScriptIds,
  filterReviewDetailsByScriptIds,
  prepareImportSnapshotAcceptance,
  removeAcceptedScriptIds,
} from "../lib/integrity-import-acceptance";
import {
  EMPTY_INTEGRITY_BASELINE,
  mergeAcceptedImportFingerprintsIntoIntegrityBaseline,
  removeAcceptedImportFingerprintsFromIntegrityBaseline,
} from "../lib/integrity-policy";
import type { DataKeyIntegrityPublishDetails } from "../lib/data-key-integrity";

const fingerprints = [
  "script-a::field::screen-1::loc-a",
  "script-b::field::screen-2::loc-b",
  "script-b::field_option_collection::screen-3::loc-c",
];

const filtered = filterFingerprintsByScriptIds(fingerprints, ["script-b"]);
assert.deepEqual(filtered, [
  "script-b::field::screen-2::loc-b",
  "script-b::field_option_collection::screen-3::loc-c",
], "script-scoped fingerprint filtering should keep only the selected scripts");

const reviewDetails: DataKeyIntegrityPublishDetails = {
  totalIssues: 3,
  totalScripts: 2,
  summary: ["3 issues across 2 scripts"],
  scripts: [
    {
      scriptId: "script-a",
      scriptTitle: "Script A",
      totalIssues: 1,
      registryHref: "/script/script-a/data-keys",
      scriptHref: "/script/script-a",
      issues: [
        {
          scriptId: "script-a",
          scriptTitle: "Script A",
          ruleLabel: "unlinked match",
          displayName: "Field A",
          reason: "Legacy reference",
          location: "Loc A",
          usageHref: "/script/script-a/screen/1",
          registryHref: "/script/script-a/data-keys",
          scriptHref: "/script/script-a",
        },
      ],
    },
    {
      scriptId: "script-b",
      scriptTitle: "Script B",
      totalIssues: 2,
      registryHref: "/script/script-b/data-keys",
      scriptHref: "/script/script-b",
      issues: [
        {
          scriptId: "script-b",
          scriptTitle: "Script B",
          ruleLabel: "invalid script option",
          displayName: "Field B",
          reason: "Invalid option",
          location: "Loc B",
          usageHref: "/script/script-b/screen/2",
          registryHref: "/script/script-b/data-keys",
          scriptHref: "/script/script-b",
        },
        {
          scriptId: "script-b",
          scriptTitle: "Script B",
          ruleLabel: "invalid script option",
          displayName: "Field C",
          reason: "Invalid option",
          location: "Loc C",
          usageHref: "/script/script-b/screen/3",
          registryHref: "/script/script-b/data-keys",
          scriptHref: "/script/script-b",
        },
      ],
    },
  ],
};

const filteredReview = filterReviewDetailsByScriptIds(reviewDetails, ["script-b"]);
assert.ok(filteredReview, "filtered review details should exist for matching scripts");
assert.equal(filteredReview?.totalScripts, 1, "filtered review should only include selected scripts");
assert.equal(filteredReview?.totalIssues, 2, "filtered review should recompute issue counts for selected scripts");
assert.deepEqual(filteredReview?.scripts.map((script) => script.scriptId), ["script-b"]);

const acceptance = prepareImportSnapshotAcceptance({
  importedScriptIds: ["script-a", "script-b"],
  existingFingerprints: fingerprints,
  existingMetadata: {
    reviewDetails,
    acceptedScriptIds: ["script-a"],
  },
  requestedScriptIds: ["script-b"],
});

assert.deepEqual(acceptance.selectedScriptIds, ["script-b"], "selective acceptance should preserve only requested imported scripts");
assert.equal(acceptance.selectedFingerprints.length, 2, "selective acceptance should only keep fingerprints for the selected scripts");
assert.deepEqual(acceptance.nextAcceptedScriptIds.sort(), ["script-a", "script-b"], "selective acceptance should accumulate accepted scripts");
assert.equal(acceptance.isFullAcceptance, true, "accepting the final remaining imported script should mark the snapshot as fully accepted");
assert.equal(acceptance.reviewDetails?.totalIssues, 2, "selective acceptance review details should be filtered to the selected scripts");

const nextMetadata = removeAcceptedScriptIds(
  {
    acceptedScriptIds: ["script-a", "script-b", "script-c"],
    untouched: true,
  },
  ["script-b", "script-x"],
);

assert.deepEqual(
  nextMetadata.acceptedScriptIds,
  ["script-a", "script-c"],
  "revoking a selective acceptance should remove only the revoked scripts from parent acceptedScriptIds",
);
assert.equal((nextMetadata as Record<string, any>).untouched, true, "revoke metadata normalization should preserve unrelated metadata");

const mergedBaseline = mergeAcceptedImportFingerprintsIntoIntegrityBaseline(EMPTY_INTEGRITY_BASELINE, fingerprints);
assert.equal(mergedBaseline.totalBlockingIssues, 0, "accepted import fingerprints should not overwrite captured baseline counts");
assert.equal(mergedBaseline.totalScripts, 0, "accepted import fingerprints should not rewrite captured baseline script counts");
assert.deepEqual(mergedBaseline.acceptedImportFingerprints, fingerprints, "accepted import fingerprints should be stored separately from captured baseline fingerprints");

const reducedBaseline = removeAcceptedImportFingerprintsFromIntegrityBaseline(mergedBaseline, [
  "script-b::field_option_collection::screen-3::loc-c",
]);
assert.deepEqual(
  reducedBaseline.acceptedImportFingerprints,
  [
    "script-a::field::screen-1::loc-a",
    "script-b::field::screen-2::loc-b",
  ],
  "revoking accepted import fingerprints should remove only the accepted import allowance, not the captured baseline",
);

console.log("integrity imports tests passed");
