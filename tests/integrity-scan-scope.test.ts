import assert from "assert"

import { DEFAULT_INTEGRITY_POLICY } from "../lib/integrity-policy"
import { evaluateIntegrityScanScope } from "../lib/integrity-scan-scope"

const emptyPreview = new Map<string, Record<string, any>>()

const propagatedScreenDraft = {
  screenId: "screen-1",
  scriptId: "script-1",
  draftOrigin: "data_key_sync" as const,
  data: { screenId: "screen-1", title: "Synced" },
}

const manualScreenDraft = {
  screenId: "screen-2",
  scriptId: "script-2",
  draftOrigin: "editor" as const,
  data: { screenId: "screen-2", title: "Manual" },
}

const importedScreenDraft = {
  screenId: "screen-4",
  scriptId: "script-4",
  draftOrigin: "import" as const,
  updatedAt: new Date("2026-04-30T10:00:00.000Z"),
  data: { screenId: "screen-4", title: "Imported" },
}

const policyDataKeysOff = {
  ...DEFAULT_INTEGRITY_POLICY,
  enforcementMode: "block_new_issues_only" as const,
  triggerSources: {
    ...DEFAULT_INTEGRITY_POLICY.triggerSources,
    scriptEdits: true,
    dataKeyLibraryEdits: false,
    deletions: true,
  },
}

const propagatedIgnored = evaluateIntegrityScanScope({
  policy: policyDataKeysOff,
  userScriptDrafts: [],
  userScreenDrafts: [propagatedScreenDraft],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: false,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: [],
})

assert.equal(propagatedIgnored.shouldRunIntegrityChecks, false, "pure propagated drafts should not trigger script-edit scans when data key library edit scanning is off")
assert.equal(propagatedIgnored.effectiveUserScreenDrafts.length, 0, "propagated drafts should be excluded from effective screen drafts")

const manualStillCounts = evaluateIntegrityScanScope({
  policy: policyDataKeysOff,
  userScriptDrafts: [],
  userScreenDrafts: [propagatedScreenDraft, manualScreenDraft],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: false,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: [],
})

assert.equal(manualStillCounts.shouldRunIntegrityChecks, true, "real script drafts must still trigger integrity scans")
assert.deepEqual(manualStillCounts.affectedScriptIds, ["script-2"], "only real script edits should remain in affected script scope")

const policyDataKeysOn = {
  ...DEFAULT_INTEGRITY_POLICY,
  enforcementMode: "block_new_issues_only" as const,
  triggerSources: {
    ...DEFAULT_INTEGRITY_POLICY.triggerSources,
    scriptEdits: true,
    dataKeyLibraryEdits: true,
    deletions: true,
  },
}

const policyImportsOff = {
  ...DEFAULT_INTEGRITY_POLICY,
  enforcementMode: "block_new_issues_only" as const,
  triggerSources: {
    ...DEFAULT_INTEGRITY_POLICY.triggerSources,
    scriptEdits: true,
    dataKeyLibraryEdits: false,
    deletions: true,
    imports: false,
  },
}

const importsIgnored = evaluateIntegrityScanScope({
  policy: policyImportsOff,
  userScriptDrafts: [],
  userScreenDrafts: [importedScreenDraft],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: false,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: [],
})

assert.equal(importsIgnored.shouldRunIntegrityChecks, false, "pure import drafts should not trigger scans when imports are disabled")
assert.equal(importsIgnored.effectiveUserScreenDrafts.length, 0, "import drafts should be excluded when imports are disabled")

const policyImportsOn = {
  ...DEFAULT_INTEGRITY_POLICY,
  enforcementMode: "block_new_issues_only" as const,
  triggerSources: {
    ...DEFAULT_INTEGRITY_POLICY.triggerSources,
    scriptEdits: true,
    dataKeyLibraryEdits: false,
    deletions: true,
    imports: true,
  },
}

const importsIncluded = evaluateIntegrityScanScope({
  policy: policyImportsOn,
  userScriptDrafts: [],
  userScreenDrafts: [importedScreenDraft],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: false,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: [],
})

assert.equal(importsIncluded.shouldRunIntegrityChecks, true, "import drafts should trigger scans when imports are enabled")
assert.deepEqual(importsIncluded.affectedScriptIds, ["script-4"], "import drafts should participate in affected script scope when enabled")
assert.deepEqual(
  importsIncluded.importAllowanceCandidatesByScript,
  {
    "script-4": {
      hasImportDraft: true,
      hasDataKeySyncDraft: false,
      hasManualDraft: false,
      hasPendingDeletion: false,
      latestImportManagedUpdatedAt: "2026-04-30T10:00:00.000Z",
    },
  },
  "pure import-managed scripts should expose import allowance candidate details"
)

const importPendingDeletionOnly = evaluateIntegrityScanScope({
  policy: policyImportsOn,
  userScriptDrafts: [],
  userScreenDrafts: [],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [{
    screenScriptId: "script-4",
    draftOrigin: "import" as const,
  }],
  hasExistingDataKeyLibraryChanges: false,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: [],
})

assert.equal(
  importPendingDeletionOnly.hasScriptFamilyChanges,
  false,
  "pure import-origin pending deletions must not count as normal script edits",
)
assert.deepEqual(
  importPendingDeletionOnly.affectedScriptIds,
  ["script-4"],
  "import-origin pending deletions should still participate in import affected-script scope",
)

const importPendingDeletionIgnoredWhenImportsOff = evaluateIntegrityScanScope({
  policy: policyImportsOff,
  userScriptDrafts: [],
  userScreenDrafts: [],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [{
    screenScriptId: "script-4",
    draftOrigin: "import" as const,
  }],
  hasExistingDataKeyLibraryChanges: false,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: [],
})

assert.equal(
  importPendingDeletionIgnoredWhenImportsOff.shouldRunIntegrityChecks,
  false,
  "pure import-origin pending deletions should be ignored when imports are disabled",
)
assert.deepEqual(
  importPendingDeletionIgnoredWhenImportsOff.affectedScriptIds,
  [],
  "import-origin pending deletions should be excluded from affected-script scope when imports are disabled",
)

const mixedImportAndManual = evaluateIntegrityScanScope({
  policy: policyImportsOn,
  userScriptDrafts: [],
  userScreenDrafts: [
    importedScreenDraft,
    { ...manualScreenDraft, scriptId: "script-4", screenId: "screen-5", updatedAt: new Date("2026-04-30T10:05:00.000Z") },
  ],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: false,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: [],
})

assert.equal(
  mixedImportAndManual.importAllowanceCandidatesByScript["script-4"]?.hasManualDraft,
  true,
  "scripts with mixed import and manual changes should be marked as manually changed for publish allowance filtering"
)

const propagatedIncluded = evaluateIntegrityScanScope({
  policy: policyDataKeysOn,
  userScriptDrafts: [],
  userScreenDrafts: [propagatedScreenDraft],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: true,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: ["script-1"],
})

assert.equal(propagatedIncluded.shouldRunIntegrityChecks, true, "data key library edits should trigger scans when enabled")
assert.deepEqual(propagatedIncluded.affectedScriptIds, ["script-1"], "affected scripts should include data-key impact when enabled")

const legacyEditorTaggedSyncDraft = {
  screenId: "screen-3",
  scriptId: "script-3",
  draftOrigin: "editor" as const,
  data: { screenId: "screen-3", title: "Propagated" },
}

const legacyPreviewMap = new Map<string, Record<string, any>>([
  ["screen-3", { title: "Propagated", screenId: "screen-3" }],
])

const legacyClassified = evaluateIntegrityScanScope({
  policy: policyDataKeysOff,
  userScriptDrafts: [],
  userScreenDrafts: [legacyEditorTaggedSyncDraft],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: true,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: legacyPreviewMap,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: [],
})

assert.equal(legacyClassified.effectiveUserScreenDrafts.length, 0, "legacy propagated drafts should be filtered when they match the current propagation preview")

const warningOnlyLegacyClassified = evaluateIntegrityScanScope({
  policy: policyDataKeysOff,
  userScriptDrafts: [],
  userScreenDrafts: [legacyEditorTaggedSyncDraft],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: true,
  hasImportOriginDataKeyChanges: false,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  publishedScreenMap: new Map([["screen-3", { screenId: "screen-3", title: "Propagated" }]]),
  affectedScreenIds: new Set(["screen-3"]),
  dataKeyImpactScriptIds: [],
})

assert.equal(
  warningOnlyLegacyClassified.effectiveUserScreenDrafts.length,
  0,
  "legacy propagated drafts should be filtered when the current data key change affects the entity without producing a preview diff"
)

const importOriginDataKeyOnlyWithImportsOff = evaluateIntegrityScanScope({
  policy: policyDataKeysOn,
  userScriptDrafts: [],
  userScreenDrafts: [],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: false,
  hasImportOriginDataKeyChanges: true,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: ["script-9"],
})

assert.equal(
  importOriginDataKeyOnlyWithImportsOff.shouldRunIntegrityChecks,
  false,
  "manual data-key trigger settings alone should not scan pure import-driven data-key fallout",
)

const importOriginDataKeyOnlyWithImportsOn = evaluateIntegrityScanScope({
  policy: policyImportsOn,
  userScriptDrafts: [],
  userScreenDrafts: [],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: false,
  hasImportOriginDataKeyChanges: true,
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: ["script-9"],
})

assert.equal(
  importOriginDataKeyOnlyWithImportsOn.shouldRunIntegrityChecks,
  true,
  "import-origin data-key fallout should scan when imports are enabled",
)
assert.deepEqual(
  importOriginDataKeyOnlyWithImportsOn.affectedScriptIds,
  ["script-9"],
  "import-origin data-key impact should participate in affected-script scope under imports",
)

console.log("integrity scan scope tests passed")
