import assert from "assert"

import {
  DEFAULT_INTEGRITY_POLICY,
  EMPTY_INTEGRITY_BASELINE,
  evaluateIntegrityPolicyBlockingEntries,
  getIntegrityEntryFingerprint,
  normalizeIntegrityBaseline,
  normalizeIntegrityPolicy,
} from "../lib/integrity-policy"

const baseEntry = {
  scriptId: "script-1",
  kind: "missing",
  currentUniqueKey: "dk-1",
}

const nextEntry = {
  scriptId: "script-2",
  kind: "unmanaged",
  currentUniqueKey: "dk-2",
}

const warnOnly = evaluateIntegrityPolicyBlockingEntries({
  policy: { ...DEFAULT_INTEGRITY_POLICY, enforcementMode: "warn_only" },
  baseline: EMPTY_INTEGRITY_BASELINE,
  blockingEntries: [baseEntry],
  getFingerprint: getIntegrityEntryFingerprint,
})

assert.equal(warnOnly.enforcedBlockingEntries.length, 0, "warn_only should not enforce blocking entries")
assert.ok(warnOnly.warnings.length > 0, "warn_only should emit warnings")

const noBaseline = evaluateIntegrityPolicyBlockingEntries({
  policy: { ...DEFAULT_INTEGRITY_POLICY, enforcementMode: "block_new_issues_only" },
  baseline: EMPTY_INTEGRITY_BASELINE,
  blockingEntries: [baseEntry],
  getFingerprint: getIntegrityEntryFingerprint,
})

assert.equal(noBaseline.enforcedBlockingEntries.length, 0, "block_new_issues_only without baseline should degrade to warn-only")
assert.equal(noBaseline.baselineState, "none", "missing baseline should be reported")

const compatibleBaseline = normalizeIntegrityBaseline({
  ...EMPTY_INTEGRITY_BASELINE,
  capturedAt: new Date().toISOString(),
  capturedByUserId: "user-1",
  totalBlockingIssues: 1,
  totalScripts: 1,
  fingerprints: [getIntegrityEntryFingerprint(baseEntry)],
})

const blockNewOnly = evaluateIntegrityPolicyBlockingEntries({
  policy: { ...DEFAULT_INTEGRITY_POLICY, enforcementMode: "block_new_issues_only" },
  baseline: compatibleBaseline,
  blockingEntries: [baseEntry, nextEntry],
  getFingerprint: getIntegrityEntryFingerprint,
})

assert.equal(blockNewOnly.baselineState, "active", "compatible baseline should be active")
assert.equal(blockNewOnly.enforcedBlockingEntries.length, 1, "only newly introduced issues should be enforced")
assert.equal(blockNewOnly.enforcedBlockingEntries[0].scriptId, "script-2", "baseline issue should be filtered out")

const normalized = normalizeIntegrityPolicy({
  enforcementMode: "block_new_issues_only",
  useBaseline: false,
})

assert.equal(normalized.useBaseline, true, "block_new_issues_only must force baseline usage")

console.log("integrity policy tests passed")
