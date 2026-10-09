import assert from "assert"

import {
  buildDataKeyIntegrityPublishDetails,
  isBlockingEntry,
  repairSingleDataKeyIntegrityReference,
  scanDataKeyIntegrity,
  type NuidSearchSource,
} from "../lib/data-key-integrity"
import type { DataKey } from "../databases/queries/data-keys"

const dataKeys = [
  {
    uuid: "uuid-nuid",
    uniqueKey: "dk-patient-nuid",
    name: "patientNUID",
    label: "Search patient's NUID",
    dataType: "text",
    confidential: false,
    options: [],
    metadata: {},
  },
  {
    uuid: "uuid-transfer",
    uniqueKey: "dk-baby-transferred",
    name: "BabyTransfered",
    label: "Has the baby been transferred?",
    dataType: "dropdown",
    confidential: false,
    options: [],
    metadata: {},
  },
] as unknown as DataKey[]

const buildScript = (nuidSearchFields: NuidSearchSource["nuidSearchFields"]): NuidSearchSource => ({
  scriptId: "script-1",
  title: "Admission",
  nuidSearchFields,
})

/** A hand-keyed legacy field has no keyId, but a same-name library key exists. */
const legacyScript = buildScript([
  {
    type: "text",
    key: "patientNUID",
    label: "Search patient's NUID",
  },
] as any)

const legacyReport = scanDataKeyIntegrity({ dataKeys, scripts: [legacyScript] })

assert.equal(legacyReport.entries.length, 1, "a NUID search field should produce one integrity entry")
assert.equal(legacyReport.entries[0].kind, "nuid_search_field", "NUID fields get their own entry kind")
assert.equal(legacyReport.entries[0].scriptId, "script-1")
assert.equal(legacyReport.entries[0].location, "NUID search > Search patient's NUID")
assert.equal(legacyReport.entries[0].status, "legacy_match", "an unlinked field matching a library key is an unlinked match")
assert.equal(isBlockingEntry(legacyReport.entries[0]), true, "unlinked NUID fields block publishing like any other reference")

/** Once linked by uniqueKey the same field is resolved. */
const linkedReport = scanDataKeyIntegrity({
  dataKeys,
  scripts: [buildScript([
    {
      type: "text",
      key: "patientNUID",
      keyId: "dk-patient-nuid",
      label: "Search patient's NUID",
    },
  ] as any)],
})

assert.equal(linkedReport.entries.length, 1)
assert.equal(linkedReport.entries[0].status, "resolved", "a linked NUID field is resolved")
assert.equal(isBlockingEntry(linkedReport.entries[0]), false)

/**
 * A field pointing at a uniqueKey that no longer exists, and whose key text matches
 * nothing in the library either, is missing. (When the key text still matches a library
 * entry the shared scanner reports legacy_match instead, as it does for screen fields.)
 */
const missingReport = scanDataKeyIntegrity({
  dataKeys,
  scripts: [buildScript([
    {
      type: "text",
      key: "retiredKey",
      keyId: "dk-deleted",
      label: "Retired field",
    },
  ] as any)],
})

assert.equal(missingReport.entries[0].status, "missing", "a deleted library key leaves the NUID field missing")
assert.equal(isBlockingEntry(missingReport.entries[0]), true, "missing NUID references block publishing")

/** Same field without a stored keyId is unmanaged rather than missing. */
const unmanagedReport = scanDataKeyIntegrity({
  dataKeys,
  scripts: [buildScript([
    {
      type: "text",
      key: "retiredKey",
      label: "Retired field",
    },
  ] as any)],
})

assert.equal(unmanagedReport.entries[0].status, "unmanaged", "an unlinked field with no library match is unmanaged")

/** Fields with no key at all are skipped rather than reported. */
const emptyReport = scanDataKeyIntegrity({
  dataKeys,
  scripts: [buildScript([{ type: "text", label: "No key yet" }] as any)],
})

assert.equal(emptyReport.entries.length, 0, "fields without any key identity are not scanned")

/** Resolving an entry relinks the field and refreshes its stored text. */
const repairTarget = buildScript([
  {
    type: "dropdown",
    key: "BabyTransfered",
    label: "Stale label",
  },
  {
    type: "text",
    key: "patientNUID",
    keyId: "dk-patient-nuid",
    label: "Search patient's NUID",
  },
] as any)

const repaired = repairSingleDataKeyIntegrityReference({
  entry: {
    status: "legacy_match",
    kind: "nuid_search_field",
    reason: "unlinked",
    scriptId: "script-1",
    location: "NUID search > Stale label",
    expectedDataType: "dropdown",
    currentKey: "BabyTransfered",
  },
  dataKeys,
  scripts: [repairTarget],
})

assert.equal(repaired.scripts.length, 1, "the repaired script is returned")
const repairedFields = repaired.scripts[0].nuidSearchFields as any[]
assert.equal(repairedFields[0].keyId, "dk-baby-transferred", "the targeted field is linked to the library key")
assert.equal(repairedFields[0].label, "Has the baby been transferred?", "stale label text is refreshed from the library")
assert.equal(repairedFields[1].label, "Search patient's NUID", "untargeted fields are left alone")

/** An entry for a different location must not rewrite this script. */
const untouched = repairSingleDataKeyIntegrityReference({
  entry: {
    status: "legacy_match",
    kind: "nuid_search_field",
    reason: "unlinked",
    scriptId: "script-1",
    location: "NUID search > Some other field",
    expectedDataType: "dropdown",
    currentKey: "BabyTransfered",
  },
  dataKeys,
  scripts: [repairTarget],
})

assert.equal(untouched.scripts.length, 0, "a non-matching entry leaves the script unchanged")

/**
 * Type constraint: a NUID search field takes text keys, a Yes/No field dropdown keys.
 * The picker filters on normalizeDataKeyCompatibilityType, so these assertions pin the
 * scanner to the same rule - what can be picked is exactly what scans clean.
 */
const singleSelectKey = {
  uuid: "uuid-single-select",
  uniqueKey: "dk-single-select",
  name: "BabyTwin",
  label: "Does the baby have a twin?",
  dataType: "single_select",
  confidential: false,
  options: [],
  metadata: {},
} as unknown as DataKey

const wrongTypeReport = scanDataKeyIntegrity({
  dataKeys,
  scripts: [buildScript([
    {
      type: "text",
      key: "BabyTransfered",
      keyId: "dk-baby-transferred",
      label: "Wrongly typed",
    },
  ] as any)],
})

assert.equal(
  wrongTypeReport.entries[0].status,
  "conflict",
  "a NUID search (text) field linked to a dropdown key is a conflict",
)

const dropdownWrongTypeReport = scanDataKeyIntegrity({
  dataKeys,
  scripts: [buildScript([
    {
      type: "dropdown",
      key: "patientNUID",
      keyId: "dk-patient-nuid",
      label: "Wrongly typed",
    },
  ] as any)],
})

assert.equal(
  dropdownWrongTypeReport.entries[0].status,
  "conflict",
  "a Yes/No (dropdown) field linked to a text key is a conflict",
)

const singleSelectReport = scanDataKeyIntegrity({
  dataKeys: [...dataKeys, singleSelectKey],
  scripts: [buildScript([
    {
      type: "dropdown",
      key: "BabyTwin",
      keyId: "dk-single-select",
      label: "Does the baby have a twin?",
    },
  ] as any)],
})

assert.equal(
  singleSelectReport.entries[0].status,
  "resolved",
  "dropdown and single_select are the same compatibility type, so both are offered and both scan clean",
)

/** Blocking NUID entries deep link into the config sheet, by fieldId when there is one. */
const deepLinkReport = scanDataKeyIntegrity({
  dataKeys,
  scripts: [buildScript([
    {
      type: "text",
      key: "patientNUID",
      label: "Search patient's NUID",
      fieldId: "field-abc",
    },
  ] as any)],
})

const deepLinkDetails = buildDataKeyIntegrityPublishDetails(deepLinkReport)
assert.ok(deepLinkDetails, "an unlinked NUID field is reported as a publish blocker")
assert.equal(
  deepLinkDetails!.scripts[0].issues[0].usageHref,
  "/script/script-1?nuidSearchField=field-abc",
  "the usage link opens the offending NUID field by fieldId",
)

const indexLinkReport = scanDataKeyIntegrity({
  dataKeys,
  scripts: [buildScript([
    { type: "dropdown", key: "BabyTransfered", label: "Transferred?" },
    { type: "text", key: "patientNUID", label: "Search patient's NUID" },
  ] as any)],
})

const indexLinkDetails = buildDataKeyIntegrityPublishDetails(indexLinkReport)
assert.equal(
  indexLinkDetails!.scripts[0].issues[1].usageHref,
  "/script/script-1?nuidSearchField=1",
  "fields without a fieldId fall back to their position",
)

console.log("nuid search data keys tests passed")
