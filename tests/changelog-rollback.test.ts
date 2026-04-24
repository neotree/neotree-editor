import assert from "node:assert/strict"

import {
  DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY,
  RELEASE_ROLLBACK_MAX_RECENT_DEPTH,
  applySoftDeleteRollbackSideEffects,
  getRollbackTargetVersion,
  coerceRollbackSnapshotValues,
  computeRollbackSnapshotHash,
  getPublishedEntityVersion,
  getRollbackSourceVersion,
  getReleaseRollbackDepth,
  getNextRollbackDataVersion,
  getRollbackAppliedEntityVersion,
  getRollbackParentVersion,
  isChangeAlreadyAlignedToRollbackTarget,
  isReleaseRollbackWithinRecentWindow,
  normalizePublishedRollbackVersion,
  wasCreatedInCurrentDataVersion,
} from "../lib/changelog-rollback"
import { CHANGELOG_ENTITY_BINDINGS, buildRollbackSnapshotPayload } from "../databases/mutations/changelogs/_rollback-shared"
import { buildDeleteChangeSnapshots, getRollbackButtonTargetVersion } from "../lib/changelog-publish"
import {
  buildDataKeyDependentRollbackSnapshot,
  buildDataKeyReferenceCandidates,
  buildDataKeyRollbackDependencies,
  findDataKeyReferencePaths,
} from "../lib/changelog-dependencies"
import { buildHumanDiffRows } from "../lib/changelog-human-diff"
import {
  getProtectedDependentRollbackMessage,
  isProtectedDependentRollbackChange,
} from "../lib/changelog-rollback-guards"

assert.equal(
  getPublishedEntityVersion({ currentVersion: 4, isCreate: false }),
  5,
  "publishing an update or delete should advance the entity version exactly once",
)

assert.equal(
  getPublishedEntityVersion({ currentVersion: 1, isCreate: true }),
  2,
  "publishing a newly created entity should advance to the persisted post-publish version",
)

assert.equal(
  getRollbackParentVersion(5),
  5,
  "rollback chain should point to the immediately previous changelog version so history remains chronological",
)

assert.equal(
  getRollbackTargetVersion({
    action: "rollback",
    parentVersion: 5,
    mergedFromVersion: 3,
  }),
  5,
  "rollback target selection must prefer parentVersion so a rollback of a rollback undoes the latest rollback first",
)

assert.equal(
  getRollbackButtonTargetVersion({
    action: "update",
    parentVersion: 4,
    mergedFromVersion: 2,
  }),
  4,
  "non-rollback changelog entries should keep using parentVersion as the rollback target",
)

assert.equal(
  getRollbackButtonTargetVersion({
    action: "rollback",
    parentVersion: 5,
    mergedFromVersion: 3,
  }),
  5,
  "rollback changelog entries should default to the immediately previous changelog version",
)

assert.equal(
  getRollbackTargetVersion({
    action: "rollback",
    parentVersion: null,
    mergedFromVersion: 3,
  }),
  3,
  "rollback target selection should still fall back to mergedFromVersion when no parentVersion is available",
)

assert.equal(
  getRollbackAppliedEntityVersion(6),
  6,
  "applied entity row version should match the newly created rollback changelog version",
)

assert.equal(
  getNextRollbackDataVersion({ editorDataVersion: 10, currentDataVersion: 9 }),
  11,
  "single-entity rollback should advance from the locked editor data version",
)

assert.equal(
  getNextRollbackDataVersion({ currentDataVersion: 3 }),
  4,
  "single-entity rollback should still advance from the current changelog data version when editor info is unavailable",
)

assert.equal(
  isChangeAlreadyAlignedToRollbackTarget({ currentDataVersion: 4, targetDataVersion: 6 }),
  true,
  "child changes already published on or before the target release should not be rolled back again",
)

assert.equal(
  isChangeAlreadyAlignedToRollbackTarget({ currentDataVersion: 7, targetDataVersion: 6 }),
  false,
  "child changes newer than the target release still need rollback selection",
)

assert.equal(
  computeRollbackSnapshotHash({ foo: "bar" }),
  computeRollbackSnapshotHash({ foo: "bar" }),
  "snapshot hash should be deterministic for identical payloads",
)

assert.equal(
  computeRollbackSnapshotHash({
    nested: { b: 2, a: 1 },
    arr: [{ z: true, a: false }, 3],
  }),
  computeRollbackSnapshotHash({
    arr: [{ a: false, z: true }, 3],
    nested: { a: 1, b: 2 },
  }),
  "snapshot hash should be stable for logically identical jsonb payloads regardless of object key order",
)

const deleteSnapshots = buildDeleteChangeSnapshots({
  previousEntity: {
    diagnosisId: "diag-1",
    key: "pneumonia",
    deletedAt: null,
  },
  deletedFields: {
    deletedAt: "2026-04-12T08:00:00.000Z",
  },
})

assert.deepEqual(
  deleteSnapshots.previousSnapshot,
  {
    diagnosisId: "diag-1",
    key: "pneumonia",
    deletedAt: null,
  },
  "delete snapshot builder should preserve the pre-delete entity state for rollback baselines",
)

assert.deepEqual(
  deleteSnapshots.fullSnapshot,
  {
    diagnosisId: "diag-1",
    key: "pneumonia",
    deletedAt: "2026-04-12T08:00:00.000Z",
  },
  "delete snapshot builder should record the post-delete state as the active changelog snapshot",
)

const softDeletedDataKeySnapshot = applySoftDeleteRollbackSideEffects({
  entityType: "data_key",
  entityId: "uuid-1",
  snapshot: {
    uuid: "uuid-1",
    uniqueKey: "patient_age",
    deletedAt: null,
  },
})

assert.equal(
  softDeletedDataKeySnapshot.uniqueKey,
  "patient_age_uuid-1",
  "soft-delete rollback side effects should preserve data-key unique-key release semantics",
)

const coercedPayload = coerceRollbackSnapshotValues(
  {
    publishDate: "2026-04-08T10:00:00.000Z",
    createdAt: "2026-04-01T10:00:00.000Z",
    dosage: "3.5",
    deletedAt: "not-a-date",
    untouched: "value",
  },
  {
    numericKeys: ["dosage"],
    timestampKeys: ["publishDate", "createdAt", "deletedAt"],
  },
)

assert.equal(coercedPayload.publishDate instanceof Date, true, "timestamp-like fields should coerce to Date")
assert.equal(coercedPayload.createdAt instanceof Date, true, "explicit timestamp keys should coerce to Date")
assert.equal(coercedPayload.dosage, 3.5, "numeric fields should coerce to numbers")
assert.equal(coercedPayload.deletedAt, null, "invalid timestamp values should coerce to null")
assert.equal(coercedPayload.untouched, "value", "non-coerced fields should remain unchanged")

const configKeyBinding = CHANGELOG_ENTITY_BINDINGS.config_key!
const dataKeyBinding = CHANGELOG_ENTITY_BINDINGS.data_key!
const screenBinding = CHANGELOG_ENTITY_BINDINGS.screen!
const rollbackPayload = buildRollbackSnapshotPayload({
  binding: configKeyBinding,
  entityId: "11111111-1111-1111-1111-111111111111",
  newVersion: 3,
  now: new Date("2026-04-22T12:00:00.000Z"),
  snapshot: {
    configKeyId: "11111111-1111-1111-1111-111111111111",
    position: 2,
    version: 2,
    key: "config_key",
    label: "Config Key",
    summary: "Rollback snapshot",
    preferences: {},
    createdAt: "2026-04-01T10:00:00.000Z",
  },
})

assert.equal(rollbackPayload.oldConfigKeyId, null, "nullable fields missing from the snapshot must be cleared during rollback")
assert.equal(rollbackPayload.deletedAt, null, "rollback should null out deletedAt when restoring a live historical snapshot")
assert.equal(rollbackPayload.createdAt instanceof Date, true, "rollback payload should preserve timestamp fields from snapshots")

const legacyScreenRollbackPayload = buildRollbackSnapshotPayload({
  binding: screenBinding,
  entityId: "22222222-2222-2222-2222-222222222222",
  newVersion: 6,
  snapshot: {
    screenId: "22222222-2222-2222-2222-222222222222",
    scriptId: "33333333-3333-3333-3333-333333333333",
    version: 5,
    type: "message",
    position: 4,
    sectionTitle: "Triage",
    title: "Observe",
    createdAt: "2026-04-01T10:00:00.000Z",
  },
})

assert.equal(
  legacyScreenRollbackPayload.hcwProblemsInstructions,
  "",
  "rollback should hydrate newer non-null text fields from schema defaults when legacy snapshots predate them",
)
assert.equal(
  legacyScreenRollbackPayload.suggestedProblemsInstructions,
  "",
  "rollback should preserve compatibility with schema-evolved snapshots by filling missing defaulted text fields",
)
assert.equal(
  legacyScreenRollbackPayload.confidential,
  false,
  "rollback should use boolean column defaults instead of failing on missing legacy fields",
)
assert.equal(
  legacyScreenRollbackPayload.printDisplayColumns,
  2,
  "rollback should use numeric defaults for non-null fields added after the snapshot was created",
)
assert.equal(
  legacyScreenRollbackPayload.version,
  6,
  "rollback changelog snapshots should use the applied live-row version, not the historical target snapshot version",
)
assert.equal(
  legacyScreenRollbackPayload.publishDate instanceof Date,
  true,
  "rollback changelog snapshots should include the applied live-row publish timestamp",
)

const legacyDataKeyRollbackPayload = buildRollbackSnapshotPayload({
  binding: dataKeyBinding,
  entityId: "44444444-4444-4444-4444-444444444444",
  newVersion: 8,
  snapshot: {
    uuid: "44444444-4444-4444-4444-444444444444",
    uniqueKey: "patient_age",
    name: "patient_age",
    label: "Patient age",
    dataType: "number",
    version: 7,
    createdAt: "2026-04-01T10:00:00.000Z",
  },
})

assert.equal(
  legacyDataKeyRollbackPayload.confidential,
  true,
  "rollback should restore older data-key snapshots even when later schema versions introduced required booleans",
)
assert.deepEqual(
  legacyDataKeyRollbackPayload.options,
  [],
  "rollback should parse JSON defaults for array fields that were added after legacy snapshots were recorded",
)
assert.deepEqual(
  legacyDataKeyRollbackPayload.metadata,
  {},
  "rollback should parse JSON defaults for object fields when historical snapshots do not include them",
)

assert.throws(
  () =>
    buildRollbackSnapshotPayload({
      binding: configKeyBinding,
      entityId: "11111111-1111-1111-1111-111111111111",
      newVersion: 3,
      snapshot: {
        configKeyId: "11111111-1111-1111-1111-111111111111",
        position: 2,
        version: 2,
        key: "config_key",
        label: "Config Key",
        preferences: {},
        createdAt: "2026-04-01T10:00:00.000Z",
      },
    }),
  /missing required fields: summary/i,
  "rollback should fail closed when a stored snapshot is incomplete for required fields",
)

assert.notEqual(
  computeRollbackSnapshotHash({ entityType: "script", entityId: "a" }),
  computeRollbackSnapshotHash({ entityType: "screen", entityId: "a" }),
  "distinct payloads should produce distinct hashes, preserving typed chain separation",
)

assert.equal(
  wasCreatedInCurrentDataVersion({
    currentVersion: 7,
    directPreviousPublishedVersion: null,
    fallbackPreviousVersion: 7,
  }),
  true,
  "entity with no prior history should be treated as created in the current release",
)

assert.equal(
  DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY,
  "soft_delete",
  "release rollback should default to removing entities created in the rolled-back release",
)

assert.equal(
  RELEASE_ROLLBACK_MAX_RECENT_DEPTH,
  5,
  "recent release rollback window should default to the last five prior versions",
)

assert.equal(
  getReleaseRollbackDepth({ currentDataVersion: 20, targetDataVersion: 15 }),
  5,
  "rollback depth should be measured as the distance between current and target data versions",
)

assert.equal(
  isReleaseRollbackWithinRecentWindow({ currentDataVersion: 20, targetDataVersion: 15 }),
  true,
  "rollback to the fifth prior version should remain inside the recent rollback window",
)

assert.equal(
  isReleaseRollbackWithinRecentWindow({ currentDataVersion: 20, targetDataVersion: 14 }),
  false,
  "rollback deeper than the configured recent window should require explicit override",
)

assert.equal(
  normalizePublishedRollbackVersion(0),
  null,
  "baseline changelog version 0 must not be treated as a real previously published version",
)

assert.equal(
  getRollbackSourceVersion([
    {
      toDataVersion: 7,
      toVersion: 3,
    },
  ]),
  7,
  "release rollback summaries should prefer the restored data version over the entity version",
)

assert.equal(
  getRollbackSourceVersion([
    {
      toVersion: 5,
    },
  ]),
  5,
  "entity rollback summaries should still fall back to the restored entity version",
)

assert.equal(
  wasCreatedInCurrentDataVersion({
    currentVersion: 7,
    directPreviousPublishedVersion: null,
    fallbackPreviousVersion: 5,
  }),
  false,
  "entity with older history but no immediately previous release change must not be soft-deleted as newly created",
)

assert.equal(
  wasCreatedInCurrentDataVersion({
    currentVersion: 7,
    directPreviousPublishedVersion: 6,
    fallbackPreviousVersion: 6,
  }),
  false,
  "entity with a prior published snapshot is not newly created in the current release",
)

const importedScriptLooksNewInRolledBackRelease = wasCreatedInCurrentDataVersion({
  currentVersion: 1,
  directPreviousPublishedVersion: 0,
  fallbackPreviousVersion: 0,
})

assert.equal(
  importedScriptLooksNewInRolledBackRelease && DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY === "soft_delete",
  true,
  "an imported script first published in the rolled-back release must be soft-deleted by default during release rollback",
)

const dataKeyReferenceCandidates = buildDataKeyReferenceCandidates(
  { uuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", uniqueKey: "patient_temp" },
  { uuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", uniqueKey: "patient_temperature" },
)

assert.deepEqual(
  findDataKeyReferencePaths(
    {
      keyId: "patient_temperature",
      fields: [
        {
          keyId: "unrelated",
          items: [{ keyId: "patient_temp", label: "Temperature" }],
        },
      ],
    },
    dataKeyReferenceCandidates,
  ).map((match) => match.path),
  ["keyId", "fields[0].items[0].keyId"],
  "data-key dependency detection should find direct and nested references without matching unrelated fields",
)

const dataKeyDependencies = buildDataKeyRollbackDependencies({
  dataKeyEntityId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  currentSnapshot: { uuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", uniqueKey: "patient_temperature" },
  targetSnapshot: { uuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", uniqueKey: "patient_temp" },
  activeChanges: [
    {
      entityId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      entityType: "data_key",
      fullSnapshot: { uniqueKey: "patient_temperature" },
    },
    {
      entityId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      entityType: "screen",
      fullSnapshot: { fields: [{ keyId: "patient_temperature" }] },
    },
    {
      entityId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      entityType: "diagnosis",
      fullSnapshot: { keyId: "other_key" },
    },
  ] as any,
})

assert.deepEqual(
  dataKeyDependencies.map((dependency) => `${dependency.entityType}:${dependency.entityId}:${dependency.matchedPath}`),
  ["screen:bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb:fields[0].keyId"],
  "data-key rollback planning should include dependent entities and exclude the rolled-back data key itself",
)

assert.deepEqual(
  buildDataKeyDependentRollbackSnapshot({
    dataKeyCurrentSnapshot: {
      uuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      uniqueKey: "patient_temperature",
      name: "patientTemperature",
      label: "Patient temperature",
      confidential: true,
    },
    dataKeyTargetSnapshot: {
      uuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      uniqueKey: "patient_temp",
      name: "patientTemp",
      label: "Patient temp",
      confidential: false,
    },
    currentSnapshot: {
      title: "Later unrelated title edit",
      keyId: "patient_temperature",
      key: "patientTemperature",
      label: "Patient temperature",
      fields: [
        { fieldId: "field-1", keyId: "patient_temperature", key: "patientTemperature", label: "Patient temperature" },
        { fieldId: "field-2", keyId: "other", key: "other", label: "Other" },
      ],
    },
    targetSnapshot: {
      title: "Old title",
      keyId: "patient_temp",
      key: "patientTemp",
      label: "Patient temp",
      fields: [
        { fieldId: "field-1", keyId: "patient_temp", key: "patientTemp", label: "Patient temp" },
        { fieldId: "field-2", keyId: "other", key: "oldOther", label: "Old other" },
      ],
    },
  }),
  {
    title: "Later unrelated title edit",
    keyId: "patient_temp",
    key: "patientTemp",
    label: "Patient temp",
    fields: [
      { fieldId: "field-1", keyId: "patient_temp", key: "patientTemp", label: "Patient temp" },
      { fieldId: "field-2", keyId: "other", key: "other", label: "Other" },
    ],
  },
  "dependent rollback snapshots should restore only data-key-derived fields while preserving unrelated later edits",
)

assert.deepEqual(
  buildHumanDiffRows({
    field: "metadata",
    before: { b: 2, a: { d: 4, c: 3 } },
    after: { a: { c: 3, d: 4 }, b: 2 },
  }),
  [],
  "human diff equality should ignore object key ordering so jsonb round-trips do not show false visual changes",
)

assert.equal(
  isProtectedDependentRollbackChange({
    entityType: "screen",
    changes: [
      { field: "fields.0.keyId", previousValue: "old", newValue: "new" },
      { field: "fields.0.label", previousValue: "Old label", newValue: "New label" },
    ],
  }),
  true,
  "dependent screen changes that only touch data-key-derived fields should block direct rollback",
)

assert.equal(
  isProtectedDependentRollbackChange({
    entityType: "screen",
    changeReason: "Published via data key reference sync",
    changes: {
      action: "update_screen",
      description: "Update screen",
      oldValues: [{ keyId: "old-key" }, { label: "Old label" }],
      newValues: [{ keyId: "new-key" }, { label: "New label" }],
    },
  }),
  true,
  "legacy propagated dependent changelogs should still block direct rollback from their sync reason and old/new value payload",
)

assert.equal(
  isProtectedDependentRollbackChange({
    entityType: "diagnosis",
    changes: {
      action: "update_diagnosis",
      description: "Update diagnosis",
      oldValues: [{ keyId: "old-key" }],
      newValues: [{ keyId: "new-key" }],
      metadata: { source: "data_key_reference_sync", mode: "pure" },
    },
  }),
  true,
  "explicit sync metadata should block direct rollback even without parsing field arrays",
)

assert.equal(
  isProtectedDependentRollbackChange({
    entityType: "screen",
    changes: [
      { field: "title", previousValue: "Old title", newValue: "New title" },
      { field: "fields.0.label", previousValue: "Old label", newValue: "New label" },
    ],
  }),
  false,
  "mixed dependent changes should not be treated as pure propagated data-key changes",
)

assert.equal(
  getProtectedDependentRollbackMessage("screen"),
  "This screen change came from a Data Key propagation. Roll back the Data Key instead to keep linked entities in sync.",
  "protected rollback guidance should explain the supported recovery path",
)

console.log("changelog rollback tests passed")
