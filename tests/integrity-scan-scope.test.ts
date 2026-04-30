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
  data: { screenId: "screen-4", title: "Imported" },
}

const policyDataKeysOff = {
  ...DEFAULT_INTEGRITY_POLICY,
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
  triggerSources: {
    ...DEFAULT_INTEGRITY_POLICY.triggerSources,
    scriptEdits: true,
    dataKeyLibraryEdits: true,
    deletions: true,
  },
}

const policyImportsOff = {
  ...DEFAULT_INTEGRITY_POLICY,
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
  deletedDataKeyIdsSize: 0,
  screenPreviewMap: emptyPreview,
  diagnosisPreviewMap: emptyPreview,
  problemPreviewMap: emptyPreview,
  dataKeyImpactScriptIds: [],
})

assert.equal(importsIncluded.shouldRunIntegrityChecks, true, "import drafts should trigger scans when imports are enabled")
assert.deepEqual(importsIncluded.affectedScriptIds, ["script-4"], "import drafts should participate in affected script scope when enabled")

const propagatedIncluded = evaluateIntegrityScanScope({
  policy: policyDataKeysOn,
  userScriptDrafts: [],
  userScreenDrafts: [propagatedScreenDraft],
  userDiagnosisDrafts: [],
  userProblemDrafts: [],
  userPendingDeletion: [],
  hasExistingDataKeyLibraryChanges: true,
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

console.log("integrity scan scope tests passed")
