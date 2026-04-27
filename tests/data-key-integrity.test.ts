import assert from "assert"

import {
  getBlockingIntegrityEntries,
  getDataKeyIntegrityStatusLabel,
  getDataKeyIntegrityEntryFingerprint,
  isBlockingEntry,
  type DataKeyIntegrityEntry,
} from "../lib/data-key-integrity"

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
})
const fingerprintB = getDataKeyIntegrityEntryFingerprint({
  ...legacyMatch,
  currentLabel: "Another label",
  location: "Another location",
})

assert.equal(fingerprintA, fingerprintB, "fingerprint should stay stable across presentation-only changes")

console.log("data key integrity tests passed")
