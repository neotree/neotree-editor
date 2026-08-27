import assert from "assert"

import {
  getBlockingIntegrityEntries,
  getDataKeyIntegrityStatusLabel,
  getDataKeyIntegrityEntryFingerprint,
  isBlockingEntry,
  type DataKeyIntegrityEntry,
} from "../lib/data-key-integrity"
import { isDataKeyIntegrityPublishDetails } from "../lib/publish-data"

const legacyMatch: DataKeyIntegrityEntry = {
  status: "legacy_match",
  kind: "field_ref",
  reason: "matching datakey exists but is not linked by unique key",
  scriptId: "script-1",
  location: "Screen A > Field A",
  expectedDataType: "text",
  currentKey: "field_a",
  matchedName: "field_a",
}

const duplicateParent: DataKeyIntegrityEntry = {
  status: "conflict",
  kind: "duplicate_parent_data_key",
  reason: "same parent datakey appears twice in this script",
  scriptId: "script-1",
  location: "Script root",
  expectedDataType: "dropdown",
  currentUniqueKey: "dk-1",
}

const resolved: DataKeyIntegrityEntry = {
  status: "resolved",
  kind: "screen",
  reason: "Reference is linked to an existing data key",
  scriptId: "script-1",
  location: "Screen A",
  expectedDataType: "text",
  currentUniqueKey: "dk-2",
}

assert.equal(getDataKeyIntegrityStatusLabel("legacy_match"), "Unlinked match")
assert.equal(getDataKeyIntegrityStatusLabel("unmanaged"), "Unmanaged reference")

assert.equal(isBlockingEntry(legacyMatch), true, "legacy matches should block")
assert.equal(isBlockingEntry(duplicateParent), true, "duplicate parent datakey should block")
assert.equal(isBlockingEntry(resolved), false, "resolved entries must not block")

const blocking = getBlockingIntegrityEntries([legacyMatch, duplicateParent, resolved])
assert.equal(blocking.length, 2, "blocking helper should only return blocking entries")

const fingerprintA = getDataKeyIntegrityEntryFingerprint({
  ...legacyMatch,
  currentLabel: "Field A renamed",
  location: "Changed location text",
  matchedName: "field_a_renamed",
  matchedUniqueKey: "dk-renamed",
})
const fingerprintB = getDataKeyIntegrityEntryFingerprint({
  ...legacyMatch,
  currentLabel: "Another label",
  location: "Another location",
  matchedName: "field_a_latest",
  matchedUniqueKey: "dk-latest",
})

assert.equal(
  fingerprintA,
  fingerprintB,
  "fingerprint should stay stable across presentation-only and library-suggestion changes",
)

const validPublishDetails = {
  totalIssues: 1,
  totalScripts: 1,
  summary: ["One blocking issue"],
  scripts: [{
    scriptId: "script-1",
    scriptTitle: "Example script",
    totalIssues: 1,
    registryHref: "/script/script-1/data-keys",
    scriptHref: "/script/script-1",
    issues: [{
      scriptId: "script-1",
      scriptTitle: "Example script",
      ruleLabel: "missing data key",
      displayName: "Field A",
      reason: "Missing from the registry",
      location: "Screen A > Field A",
      usageHref: "/script/script-1/screen/screen-1",
      registryHref: "/script/script-1/data-keys",
      scriptHref: "/script/script-1",
    }],
  }],
}

assert.equal(
  isDataKeyIntegrityPublishDetails(validPublishDetails),
  true,
  "valid data-key publish details should be accepted",
)
assert.equal(
  isDataKeyIntegrityPublishDetails({ conditionErrors: { scripts: [], totalFindings: 0 } }),
  false,
  "conditional-expression warning details must not be treated as data-key blocking details",
)
assert.equal(
  isDataKeyIntegrityPublishDetails({ ...validPublishDetails, scripts: undefined }),
  false,
  "publish details without a scripts array should be rejected before rendering",
)

console.log("data key integrity tests passed")
