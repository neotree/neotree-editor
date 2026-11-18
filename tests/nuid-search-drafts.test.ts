import assert from "assert"

import { scriptContentChanged, stripScriptComputedProps, isScriptComputedKey } from "../lib/script-computed-props"
import { mapNewScriptToOld } from "../lib/map-old-and-new"
import { buildHumanDiffRows } from "../lib/changelog-human-diff"
import { getActiveNuidSearchFields } from "../lib/nuid-search"
import { getScriptConditionInputsStamp } from "../lib/conditional-expression/report-signature"

/**
 * Drafts hold only what an author changed, and devices only get NUID Search fields when
 * NUID Search is on.
 */

// ── Computed script props never live in a draft ────────────────────────────────────────────
{
  const report = { count: 2, inputsSignature: "r5:abc", findings: [{ message: "x" }] }
  const stripped = stripScriptComputedProps({ title: "Admission", conditionErrorReport: report, hasChangedItems: true })
  assert.deepEqual(stripped, { title: "Admission" }, "the condition cache and item flags are dropped")
  assert.ok(isScriptComputedKey("conditionErrorReport"))
  assert.ok(!isScriptComputedKey("nuidSearchFields"))
}

// ── A save that changes nothing is detected (so no empty draft is created) ───────────────
{
  const published = {
    scriptId: "s1", title: "Admission", version: 4, nuidSearchEnabled: true,
    nuidSearchFields: [{ key: "BabyTwin", keyId: "k1", type: "dropdown", label: "Twin?", values: "Y,Yes\nN,No" }],
    conditionErrorReport: { inputsSignature: "r5:old", count: 1 },
    createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02"),
  }
  // What a Save with no edits sends: the same content, a new version, a recomputed cache.
  const unchanged = { ...published, version: 5, conditionErrorReport: { inputsSignature: "r5:new", count: 0 }, updatedAt: new Date() }
  assert.equal(scriptContentChanged(published, unchanged), false, "no content change")
  // Empty values count as nothing (null vs missing).
  assert.equal(scriptContentChanged({ ...published, description: null }, { ...published }), false)

  const edited = {
    ...published,
    nuidSearchFields: [{ ...published.nuidSearchFields[0], condition: "$X = 'Y'" }],
  }
  assert.equal(scriptContentChanged(published, edited), true, "a NUID edit is a change")
  assert.equal(scriptContentChanged(published, { ...published, title: "Admission 2" }), true)
}

// ── Devices get NUID Search fields only when NUID Search is on (the app never reads the flag) ─
{
  const base = {
    id: 1, scriptId: "s1", oldScriptId: null, position: 1, title: "Admission", type: "admission",
    reviewConfigurations: [], printSections: [], preferences: null, printConfig: null,
    nuidSearchFields: [{ key: "patientNUID", keyId: "k", type: "text", label: "Search patient's NUID", searchRole: "patient" }],
  } as any
  const on = mapNewScriptToOld({ ...base, nuidSearchEnabled: true }) as any
  const off = mapNewScriptToOld({ ...base, nuidSearchEnabled: false }) as any
  assert.equal(on.data.nuidSearchFields.length, 1, "on: the fields go to the device")
  assert.equal(on.data.nuidSearchFields[0].type, "text")
  assert.deepEqual(off.data.nuidSearchFields, [], "off: no fields, so the app shows no NUID Search questions")
  assert.equal(off.data.nuid_search_enabled, false)
}

// ── The draft review matches NUID fields by fieldId, so a relinked field is one edit ──────────
{
  const before = [{ fieldId: "f1", key: "OldKey", label: "Old twin?", condition: "" }, { fieldId: "f2", key: "Other", label: "Other", condition: "" }]
  const after = [{ fieldId: "f1", key: "BabyTwin", label: "Does the baby have a twin?", condition: "" }, { fieldId: "f2", key: "Other", label: "Other", condition: "" }]
  const rows = buildHumanDiffRows({ field: "nuidSearchFields", before, after } as any)
  assert.equal(rows.length, 1, "one row: the relinked field's label; the untouched field doesn't appear")
  assert.equal(rows[0].detailLabel, "Display label")
  assert.equal(rows[0].before, "Old twin?")
  assert.equal(rows[0].after, "Does the baby have a twin?")
}

// ── Fields kept while NUID Search is off are not live (no script keys, a different report stamp) ─
{
  const fields = [{ key: "BabyTwin", keyId: "k1", type: "dropdown", condition: "" }]
  assert.deepEqual(getActiveNuidSearchFields({ nuidSearchEnabled: true, nuidSearchFields: fields }), fields)
  assert.deepEqual(getActiveNuidSearchFields({ nuidSearchEnabled: false, nuidSearchFields: fields }), [])
  assert.deepEqual(getActiveNuidSearchFields({ nuidSearchFields: fields }), [], "no flag: not live")
  const on = getScriptConditionInputsStamp({ nuidSearchEnabled: true, nuidSearchFields: fields })
  const off = getScriptConditionInputsStamp({ nuidSearchEnabled: false, nuidSearchFields: fields })
  assert.notEqual(on, off, "switching NUID Search changes the report inputs")
  assert.equal(getScriptConditionInputsStamp({ nuidSearchFields: fields }), on, "callers without the flag keep the old stamp")
}

console.log("nuid-search-drafts: all assertions passed")
