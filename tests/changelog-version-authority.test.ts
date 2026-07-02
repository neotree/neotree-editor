import assert from "node:assert/strict"

import {
  coerceRollbackSnapshotValues,
  getPublishedEntityVersion,
  getRollbackTargetVersion,
} from "@/lib/changelog-rollback"
import { isMeaningfulSnapshot } from "@/databases/mutations/changelogs/_rollback-shared"
import { buildOwnDraftRollbackWarning } from "@/databases/mutations/changelogs/_rollback-draft-guard"

function run() {
  // --- getPublishedEntityVersion ---
  // Creates keep the staged draft version so the entity row matches the changelog's
  // create entry (previously creates were bumped to 2 while isCreate checked === 1).
  assert.equal(getPublishedEntityVersion({ currentVersion: 1, isCreate: true }), 1)
  assert.equal(getPublishedEntityVersion({ currentVersion: undefined, isCreate: true }), 1)
  assert.equal(getPublishedEntityVersion({ currentVersion: null, isCreate: true }), 1)
  assert.equal(getPublishedEntityVersion({ currentVersion: 0, isCreate: true }), 1)
  // Updates/deletes bump from the current version
  assert.equal(getPublishedEntityVersion({ currentVersion: 4, isCreate: false }), 5)
  assert.equal(getPublishedEntityVersion({ currentVersion: undefined, isCreate: false }), 2)

  // --- getRollbackTargetVersion ---
  assert.equal(getRollbackTargetVersion({ parentVersion: 3, mergedFromVersion: 1 }), 3)
  assert.equal(getRollbackTargetVersion({ parentVersion: null, mergedFromVersion: 2 }), 2)
  assert.equal(getRollbackTargetVersion({ parentVersion: null, mergedFromVersion: null }), null)

  // --- coerceRollbackSnapshotValues ---
  // Fields are only coerced when explicitly listed; names that merely look temporal
  // must never be touched (they used to be nulled by a key-name regex).
  const coerced = coerceRollbackSnapshotValues(
    {
      reviewDate: "keep this text",
      feedTime: "07:30 as free text",
      publishDate: "2026-01-02T03:04:05.000Z",
      deletedAt: "not a real date",
      position: "12",
      title: "unchanged",
    },
    {
      numericKeys: ["position"],
      timestampKeys: ["publishDate", "deletedAt"],
    },
  )

  assert.equal(coerced.reviewDate, "keep this text")
  assert.equal(coerced.feedTime, "07:30 as free text")
  assert.ok(coerced.publishDate instanceof Date)
  assert.equal((coerced.publishDate as Date).toISOString(), "2026-01-02T03:04:05.000Z")
  assert.equal(coerced.deletedAt, null)
  assert.equal(coerced.position, 12)
  assert.equal(coerced.title, "unchanged")

  // --- isMeaningfulSnapshot ---
  assert.equal(isMeaningfulSnapshot({ title: "x" }), true)
  assert.equal(isMeaningfulSnapshot({}), false)
  assert.equal(isMeaningfulSnapshot(null), false)
  assert.equal(isMeaningfulSnapshot(undefined), false)
  assert.equal(isMeaningfulSnapshot("{}"), false)
  assert.equal(isMeaningfulSnapshot('{"a":1}'), true)
  assert.equal(isMeaningfulSnapshot([]), false)

  // --- buildOwnDraftRollbackWarning ---
  assert.equal(buildOwnDraftRollbackWarning(0), null)
  assert.match(buildOwnDraftRollbackWarning(1) || "", /1 unpublished draft /)
  assert.match(buildOwnDraftRollbackWarning(3) || "", /3 unpublished drafts /)
}

run()
console.log("changelog version authority tests passed")
