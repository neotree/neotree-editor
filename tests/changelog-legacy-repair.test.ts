import assert from "node:assert/strict"

import { analyzeLegacyChangeLog } from "@/lib/changelog-legacy-repair"

function run() {
  const staleLegacy = analyzeLegacyChangeLog({
    change: {
      snapshotHash: "old-hash",
      fullSnapshot: { b: 1, a: 2 },
      previousSnapshot: {},
      dateOfChange: "2026-03-27T13:22:02.700Z",
    },
    managedSnapshotKeys: ["createdAt", "updatedAt"],
  })

  assert.equal(staleLegacy.hashStatus, "stale")
  assert.equal(staleLegacy.canAutoRepairHash, true)
  assert.deepEqual(staleLegacy.fullSnapshotMissingManagedFields, ["createdAt", "updatedAt"])

  const strictMismatch = analyzeLegacyChangeLog({
    change: {
      snapshotHash: "old-hash",
      fullSnapshot: { a: 1 },
      previousSnapshot: {},
      dateOfChange: "2026-04-24T10:00:00.000Z",
    },
    managedSnapshotKeys: ["createdAt"],
  })

  assert.equal(strictMismatch.hashStatus, "strict_mismatch")
  assert.equal(strictMismatch.canAutoRepairHash, false)

  const healthy = analyzeLegacyChangeLog({
    change: {
      snapshotHash: staleLegacy.computedHash,
      fullSnapshot: { a: 2, b: 1 },
      previousSnapshot: { createdAt: "2026-03-01T00:00:00.000Z" },
      dateOfChange: "2026-04-24T10:00:00.000Z",
    },
    managedSnapshotKeys: ["createdAt"],
  })

  assert.equal(healthy.hashStatus, "healthy")
  assert.deepEqual(healthy.previousSnapshotMissingManagedFields, [])
}

run()
console.log("changelog legacy repair tests passed")
