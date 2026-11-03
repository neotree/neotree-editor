import assert from "assert"

import { defaultNuidSearchFields } from "../constants/fields"
import {
  applyLibraryKeyToNuidField,
  getCompatibleNuidSearchRoles,
  collectNuidSearchPublishErrors,
  getNuidSearchRole,
  validateNuidSearchFields,
} from "../lib/nuid-search/fields"
import { isDataKeyIntegrityRuleBlocking } from "../lib/data-key-integrity-rules"
import { syncNuidSearchFieldReference } from "../databases/mutations/data-keys/_update_data_keys_refs.helpers"

/**
 * Every NUID Search field is a Data Key library key. The key, label, options and
 * confidentiality come from the library and are edited there; the NUID Search
 * page only sets how the key is used (condition, required, search role).
 */

const library: Record<string, any> = {
  "dk-twin": { uniqueKey: "dk-twin", name: "BabyTwin", label: "Does the baby have a twin?", dataType: "dropdown", options: ["dk-y", "dk-n"], confidential: false },
  "dk-y": { uniqueKey: "dk-y", name: "Y", label: "Yes", dataType: "option" },
  "dk-n": { uniqueKey: "dk-n", name: "N", label: "No", dataType: "option" },
  "dk-twin-nuid": { uniqueKey: "dk-twin-nuid", name: "BabyTwinNUID", label: "Search twin's NUID", dataType: "text", confidential: true },
  "dk-empty": { uniqueKey: "dk-empty", name: "Empty", label: "Empty", dataType: "dropdown", options: [] },
}
const getLibraryKey = (id: string) => library[id] || null

const twin = { key: "BabyTwin", keyId: "dk-twin", label: "Does the baby have a twin?", type: "dropdown", values: "Y,Yes\nN,No" }
const twinSearch = { key: "BabyTwinNUID", keyId: "dk-twin-nuid", label: "Search twin's NUID", type: "text", searchRole: "twin", condition: "$BabyTwin = 'Y'", confidential: true }
const issues = (f: any) => validateNuidSearchFields([f], { getLibraryKey })[0]

// Linked, library-backed fields are clean.
assert.deepEqual(validateNuidSearchFields([twin, twinSearch], { getLibraryKey }).flatMap((r) => [...r.errors, ...r.warnings]), [])

// Not linked is an error, with or without the library to hand.
assert.ok(validateNuidSearchFields([{ ...twin, keyId: undefined }])[0].errors.some((e) => /not linked/.test(e)))
assert.ok(validateNuidSearchFields([{ type: "text", searchRole: "patient" }])[0].errors.includes("Choose a Data Key library key."))

// The library must still have the key, of the right type, with options for a choice.
assert.ok(issues({ ...twin, keyId: "dk-gone" }).errors.some((e) => /no longer exists/.test(e)))
assert.ok(issues({ ...twin, keyId: "dk-twin-nuid" }).errors.some((e) => /is a text key/.test(e)))
assert.ok(issues({ ...twin, keyId: "dk-empty", key: "Empty" }).errors.some((e) => /has no options/.test(e)))
assert.ok(issues({ ...twin, values: "" }).errors.some((e) => /has no options/.test(e)))
assert.ok(issues({ ...twin, label: "" }).errors.some((e) => /has no label/.test(e)))

// Two fields on one key collide (case-insensitively: the app lowercases conditions).
assert.ok(validateNuidSearchFields([twin, { ...twin, key: "babytwin" }], { getLibraryKey }).every((r) => r.errors.some((e) => /more than one field/.test(e))))

// Search roles: explicit wins, unset is inferred the way the app does and reported as a warning.
assert.deepEqual(getNuidSearchRole(twinSearch), { role: "twin", inferred: false })
assert.deepEqual(getNuidSearchRole({ key: "BabyTwinNUID", type: "text" }), { role: "twin", inferred: true })
assert.deepEqual(getNuidSearchRole({ key: "patientNUID", label: "Search patient's NUID", type: "text" }), { role: "patient", inferred: true })
assert.deepEqual(getNuidSearchRole({ key: "BabyTransferedNUID", type: "text" }), { role: "transfer", inferred: true })
assert.ok(issues({ ...twinSearch, searchRole: undefined }).warnings.some((w) => /No search role/.test(w)))
assert.ok(issues({ ...twinSearch, searchRole: "sibling" }).errors.some((e) => /Unknown search role/.test(e)))

// Backward compatibility: released apps ignore the role and go by key and label,
// so a role is only allowed where it means exactly that.
assert.deepEqual(getCompatibleNuidSearchRoles({ key: "patientNUID", label: "Search patient's NUID", type: "text" }), ["patient"])
assert.deepEqual(getCompatibleNuidSearchRoles({ key: "BabyTwinNUID", label: "Search twin's NUID", type: "text" }), ["twin"])
assert.deepEqual(getCompatibleNuidSearchRoles({ key: "BabyTransferedNUID", label: "Transfer", type: "text" }), ["transfer"])
assert.deepEqual(getCompatibleNuidSearchRoles({ key: "TwinNUID", label: "Search twin", type: "text" }), [], "a twin key old apps don't recognise fits no role")
{
  const mismatch = (f: any) => issues(f).errors.find((e) => /released app versions/.test(e))
  assert.ok(mismatch({ ...twinSearch, searchRole: "patient" }), "a role old apps would not follow is an error")
  assert.ok(mismatch({ ...twinSearch, searchRole: "lookup" }))
  assert.equal(mismatch(twinSearch), undefined, "the matching role is fine")
  assert.ok(/leave the role unset/i.test(mismatch({ ...twinSearch, key: "TwinNUID", searchRole: "twin" }) || ""), "no role fits: leave it unset")
  assert.deepEqual(validateNuidSearchFields([{ key: "TwinNUID", keyId: "x", label: "Search twin", type: "text" }]), [{ errors: [], warnings: [] }], "unset is fine when nothing fits")
}
assert.ok(collectNuidSearchPublishErrors([{ title: "A", nuidSearchEnabled: true, nuidSearchFields: [{ ...twinSearch, searchRole: "patient" }] }])
  .some((e) => /released app versions/.test(e)), "the publish gate refuses a mismatched role")

// The starter template only needs linking: nothing else is wrong with it.
for (const template of [defaultNuidSearchFields.admission, defaultNuidSearchFields.other]) {
  const reports = validateNuidSearchFields(template as any[])
  assert.ok(reports.every((r) => r.errors.length === 1 && /not linked/.test(r.errors[0]) && !r.warnings.length), "template fields only lack their library link")
}

// The library owns key, label, options and confidentiality; the page keeps condition, required and role.
{
  const stale = { ...twin, key: "OldName", label: "Old wording", values: "Y,Yes", confidential: true, optional: true, condition: "$x = 1" }
  const synced = applyLibraryKeyToNuidField(stale, library["dk-twin"], getLibraryKey)
  assert.equal(synced.key, "BabyTwin")
  assert.equal(synced.label, "Does the baby have a twin?")
  assert.equal(synced.values, "Y,Yes\nN,No")
  assert.equal(synced.confidential, false)
  assert.equal(synced.optional, true, "required is the page's")
  assert.equal(synced.condition, "$x = 1", "the condition is the page's")

  const search = applyLibraryKeyToNuidField({ ...twinSearch, values: "untouched", confidential: false }, library["dk-twin-nuid"], getLibraryKey)
  assert.equal(search.values, "untouched", "a search field has no options to sync")
  assert.equal(search.confidential, true)
  assert.equal(search.searchRole, "twin", "the role is the page's")
}

// Publish gate: errors only, only for scripts with NUID Search on, checked against the library.
assert.deepEqual(collectNuidSearchPublishErrors([{ title: "Off", nuidSearchEnabled: false, nuidSearchFields: [{ ...twin, keyId: undefined }] }]), [])
assert.deepEqual(collectNuidSearchPublishErrors([{ title: "Fine", nuidSearchEnabled: true, nuidSearchFields: [twin, twinSearch] }], { getLibraryKey }), [])
assert.deepEqual(
  collectNuidSearchPublishErrors([{ title: "Admission", nuidSearchEnabled: true, nuidSearchFields: [{ ...twin, keyId: "dk-gone" }] }], { getLibraryKey }),
  ['Admission: Does the baby have a twin?: The data key for "BabyTwin" no longer exists in the library. Link another key.'],
)

// Nothing stale reaches the app: anything the library owns that differs from it is an error.
assert.ok(issues({ ...twin, label: "Old wording" }).errors.some((e) => /out of date.*label/.test(e)), "a stale label")
assert.ok(issues({ ...twin, values: "Y,Yes\nN,Nope" }).errors.some((e) => /out of date.*values/.test(e)), "a stale option label")
assert.ok(issues({ ...twin, values: "Y,Yes" }).errors.some((e) => /out of date.*values/.test(e)), "a missing option")
assert.ok(issues({ ...twinSearch, confidential: false }).errors.some((e) => /out of date.*confidentiality/.test(e)), "stale confidentiality")
assert.ok(issues({ ...twin, key: "OldName" }).errors.some((e) => /out of date.*key/.test(e)), "a stale key name")
assert.deepEqual(issues({ ...twinSearch, confidential: true }).errors, [], "a field matching its key is not stale")

// Library syncs: the label follows the library; only the page's required flag is kept.
{
  const dataKey = { uniqueKey: "dk-twin", name: "BabyTwin", label: "Twin?", confidential: true, confidentialLabelOnly: false, metadata: {} } as any
  const field = { ...twin, fieldId: "f1", optional: true } as any

  const synced = syncNuidSearchFieldReference(field, dataKey)
  assert.equal(synced.value.label, "Twin?", "the label follows the library")
  assert.equal(synced.value.confidential, true, "confidentiality follows the library")
  assert.equal(synced.value.optional, true, "the page's required flag is kept")
  assert.deepEqual(syncNuidSearchFieldReference(field, undefined), { value: field, changed: false })
}

// Integrity: an unlinked NUID field is still a blocker.
assert.equal(isDataKeyIntegrityRuleBlocking({ kind: "nuid_search_field", status: "unmanaged" }), true)

console.log("nuid-search-fields: all assertions passed")
