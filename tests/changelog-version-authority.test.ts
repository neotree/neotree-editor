import assert from "node:assert/strict"

import {
  coerceRollbackSnapshotValues,
  computeRollbackSnapshotHash,
  evaluateEntityRollbackTargetPolicy,
  evaluateReleaseRollbackTargetPolicy,
  getEntityRollbackSummary,
  getPublishedEntityVersion,
  getRollbackSourceVersion,
  getRollbackTargetVersion,
  isRollbackTargetOlderThanMaxAge,
  ROLLBACK_CLEAN_SLATE_FLOOR_AT,
  ROLLBACK_MAX_TARGET_AGE_DAYS,
  shouldAutoRepairLegacySnapshotHash,
  SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT,
  STALE_CHILD_ROLLBACK_MAX_DEPTH,
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

  // --- computeRollbackSnapshotHash: golden hash ---
  // The canonical hash algorithm is load-bearing: every stored snapshotHash was computed
  // with it, and rollback integrity checks recompute it. If this assertion fails you have
  // changed the algorithm — every stored hash becomes unverifiable and rollbacks will hard
  // fail. Do NOT just update the constant: move SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT past
  // the deploy date first so the in-transaction auto-repair rehashes old rows on contact.
  const goldenFixture = {
    title: "Golden fixture",
    version: 3,
    position: "2",
    deletedAt: null,
    publishDate: new Date("2026-01-02T03:04:05.678Z"),
    nested: { b: 2, a: [1, "two", null, { z: true, y: undefined }] },
    emptyObject: {},
    notANumber: NaN,
  }
  assert.equal(
    computeRollbackSnapshotHash(goldenFixture),
    "1ef84fadc4441966593b47475967924cab009117d88b9e7ca34d19909e2da67b",
  )

  // The hash must be stable across a JSON round trip: the writer hashes the in-memory
  // object while the verifier re-hashes what jsonb returns. If these ever diverge, every
  // new row would fail its own integrity check.
  const roundTripped = JSON.parse(
    JSON.stringify({ ...goldenFixture, publishDate: goldenFixture.publishDate.toISOString() }),
  )
  assert.equal(computeRollbackSnapshotHash(goldenFixture), computeRollbackSnapshotHash(roundTripped))

  // Key order must not affect the hash (jsonb re-orders keys)
  assert.equal(
    computeRollbackSnapshotHash({ a: 1, b: 2 }),
    computeRollbackSnapshotHash({ b: 2, a: 1 }),
  )

  // --- shouldAutoRepairLegacySnapshotHash: legacy-era boundary ---
  // Rows from the legacy raw-JSON.stringify hash era (pre-cutoff) must auto-repair
  // instead of blocking rollbacks; rows after the cutoff are enforced strictly.
  const justBeforeCutoff = new Date(SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT.valueOf() - 1)
  const justAfterCutoff = new Date(SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT.valueOf() + 1)
  assert.equal(shouldAutoRepairLegacySnapshotHash({ snapshotHash: "x", dateOfChange: justBeforeCutoff }), true)
  assert.equal(shouldAutoRepairLegacySnapshotHash({ snapshotHash: "x", dateOfChange: justAfterCutoff }), false)
  assert.equal(shouldAutoRepairLegacySnapshotHash({ snapshotHash: null, dateOfChange: justAfterCutoff }), true)
  assert.equal(shouldAutoRepairLegacySnapshotHash({ snapshotHash: "x", dateOfChange: null }), true)
  // The last known legacy-hash row was written 2026-05-21; the cutoff must stay past it.
  assert.ok(SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT >= new Date("2026-05-22T00:00:00.000Z"))

  // --- rollback target age policy ---
  const now = new Date("2026-08-15T12:00:00.000Z")
  const dayMs = 24 * 60 * 60 * 1000
  const recentDate = new Date(now.valueOf() - 5 * dayMs)
  const staleDate = new Date(now.valueOf() - (ROLLBACK_MAX_TARGET_AGE_DAYS + 10) * dayMs)

  assert.equal(isRollbackTargetOlderThanMaxAge({ targetDate: recentDate, now }), false)
  assert.equal(isRollbackTargetOlderThanMaxAge({ targetDate: staleDate, now }), true)
  // Unknown dates cannot be verified against the window and must be treated as too old
  assert.equal(isRollbackTargetOlderThanMaxAge({ targetDate: null, now }), true)
  assert.equal(isRollbackTargetOlderThanMaxAge({ targetDate: "not a date", now }), true)

  // Recent targets are always allowed, for any entity type
  assert.equal(
    evaluateEntityRollbackTargetPolicy({ entityType: "script", currentVersion: 10, targetVersion: 2, targetDate: recentDate, now })
      .allowed,
    true,
  )

  // Stale targets: parent entities are blocked outright
  const staleScript = evaluateEntityRollbackTargetPolicy({
    entityType: "script",
    currentVersion: 10,
    targetVersion: 9,
    targetDate: staleDate,
    now,
  })
  assert.equal(staleScript.allowed, false)
  assert.match((staleScript as { reason: string }).reason, /older than/)

  // Stale targets: child entities (rarely changed independently) may restore up to
  // STALE_CHILD_ROLLBACK_MAX_DEPTH versions back...
  assert.equal(
    evaluateEntityRollbackTargetPolicy({
      entityType: "screen",
      currentVersion: 6,
      targetVersion: 6 - STALE_CHILD_ROLLBACK_MAX_DEPTH,
      targetDate: staleDate,
      now,
    }).allowed,
    true,
  )
  // ...but not deeper
  assert.equal(
    evaluateEntityRollbackTargetPolicy({
      entityType: "screen",
      currentVersion: 7,
      targetVersion: 7 - STALE_CHILD_ROLLBACK_MAX_DEPTH - 1,
      targetDate: staleDate,
      now,
    }).allowed,
    false,
  )
  // Child depth must be known to qualify for the stale exemption
  assert.equal(
    evaluateEntityRollbackTargetPolicy({
      entityType: "screen",
      currentVersion: null,
      targetVersion: 1,
      targetDate: staleDate,
      now,
    }).allowed,
    false,
  )
  // Pre-creation rollback of a stale child (v1 -> v0) stays possible
  assert.equal(
    evaluateEntityRollbackTargetPolicy({ entityType: "screen", currentVersion: 1, targetVersion: 0, targetDate: staleDate, now })
      .allowed,
    true,
  )

  // --- release rollback target policy ---
  const preFloorDate = new Date(ROLLBACK_CLEAN_SLATE_FLOOR_AT.valueOf() - dayMs)
  const nowNearFloor = new Date(ROLLBACK_CLEAN_SLATE_FLOOR_AT.valueOf() + 3 * dayMs)

  // Clean-slate floor: releases published before it are never restorable, even when recent
  const preFloor = evaluateReleaseRollbackTargetPolicy({
    targetDataVersion: 5052,
    targetPublishedAt: preFloorDate,
    now: nowNearFloor,
  })
  assert.equal(preFloor.allowed, false)
  assert.match((preFloor as { reason: string }).reason, /clean slate/)

  // Post-floor and recent: allowed
  assert.equal(
    evaluateReleaseRollbackTargetPolicy({
      targetDataVersion: 5060,
      targetPublishedAt: new Date(ROLLBACK_CLEAN_SLATE_FLOOR_AT.valueOf() + dayMs),
      now: nowNearFloor,
    }).allowed,
    true,
  )

  // Post-floor but older than the age window: blocked
  const staleRelease = evaluateReleaseRollbackTargetPolicy({
    targetDataVersion: 5060,
    targetPublishedAt: new Date(ROLLBACK_CLEAN_SLATE_FLOOR_AT.valueOf() + dayMs),
    now: new Date(ROLLBACK_CLEAN_SLATE_FLOOR_AT.valueOf() + (ROLLBACK_MAX_TARGET_AGE_DAYS + 5) * dayMs),
  })
  assert.equal(staleRelease.allowed, false)
  assert.match((staleRelease as { reason: string }).reason, /within the last/)

  // Missing publish date: blocked
  assert.equal(
    evaluateReleaseRollbackTargetPolicy({ targetDataVersion: 1, targetPublishedAt: null, now: nowNearFloor }).allowed,
    false,
  )

  // --- getRollbackSourceVersion: release versions only ---
  // Release-rollback rows carry the restored release in toDataVersion
  assert.equal(getRollbackSourceVersion([{ action: "rollback", fromDataVersion: 5055, toDataVersion: 5054 }]), 5054)
  assert.equal(getRollbackSourceVersion([{ rollbackSourceDataVersion: 5052 }]), 5052)
  // Entity-rollback rows only carry the ITEM's version (toVersion) — that must never be
  // reported as a release restore source (it used to render as "Restores v64").
  assert.equal(getRollbackSourceVersion([{ action: "rollback", fromVersion: 65, toVersion: 64 }]), null)
  assert.equal(getRollbackSourceVersion([{ to_version: 64 }]), null)
  assert.equal(getRollbackSourceVersion(null), null)

  // --- getEntityRollbackSummary ---
  const entityRollback = getEntityRollbackSummary([
    {
      action: "publish",
      rolledBackEntityType: "data_key",
      rolledBackEntityId: "8b7f0a51-1111-2222-3333-444455556666",
      rollbackTargetVersion: 64,
      fromDataVersion: 5054,
      toDataVersion: 5055,
    },
  ])
  assert.deepEqual(entityRollback, {
    entityType: "data_key",
    entityId: "8b7f0a51-1111-2222-3333-444455556666",
    targetVersion: 64,
  })
  // Plain release publishes and release rollbacks are not entity rollbacks
  assert.equal(getEntityRollbackSummary([{ action: "publish", fromDataVersion: 5054, toDataVersion: 5055 }]), null)
  assert.equal(getEntityRollbackSummary(undefined), null)
}

run()
console.log("changelog version authority tests passed")
