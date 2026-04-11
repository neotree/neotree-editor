import assert from "node:assert/strict"

import {
  getRollbackSourceVersion,
  partitionReleaseRollbackCandidates,
} from "../lib/changelog-rollback"
import { buildDataVersionSummary } from "../lib/changelog-data-version-summary"
import { runRemoteScriptImports } from "../lib/scripts-remote-import"

const activeChanges = [
  {
    entityId: "entity-a",
    entityType: "script",
    dataVersion: 10,
    fullSnapshot: { title: "current-a" },
  },
  {
    entityId: "entity-b",
    entityType: "screen",
    dataVersion: 8,
    fullSnapshot: { title: "current-b" },
  },
  {
    entityId: "entity-c",
    entityType: "problem",
    dataVersion: 7,
    fullSnapshot: { title: "current-c" },
  },
]

const restoreSourceDataVersion = 7
const { rollbackCandidates, scriptChanges, standaloneChanges } = partitionReleaseRollbackCandidates({
  changes: [
    ...activeChanges,
    {
      entityId: "entity-a-screen",
      entityType: "screen",
      scriptId: "entity-a",
      dataVersion: 10,
      fullSnapshot: { title: "screen-a" },
    },
    {
      entityId: "entity-d-screen",
      entityType: "screen",
      scriptId: "other-script",
      dataVersion: 8,
      fullSnapshot: { title: "screen-d" },
    },
  ],
  restoreSourceDataVersion,
})

assert.deepEqual(
  rollbackCandidates.map((change) => change.entityId),
  ["entity-a", "entity-b", "entity-a-screen", "entity-d-screen"],
  "deep release rollback should include every entity changed after the restore source release, not just the latest release",
)

assert.deepEqual(
  scriptChanges.map((change) => change.entityId),
  ["entity-a"],
  "script rollback partition should isolate root scripts for grouped rollback planning",
)

assert.deepEqual(
  standaloneChanges.map((change) => change.entityId),
  ["entity-b", "entity-d-screen"],
  "child entities belonging to a rolled back script must be excluded from the standalone pass to avoid duplicate rollback writes",
)

const restoredDataVersion = getRollbackSourceVersion([
  {
    action: "rollback",
    fromDataVersion: 10,
    toDataVersion: 7,
    fromVersion: 5,
    toVersion: 3,
  },
])

assert.equal(
  restoredDataVersion,
  7,
  "release rollback metadata should keep pointing at the restored release version after publish and summary rendering",
)

const dataVersionSummary = buildDataVersionSummary({
  dataVersion: 11,
  latestDataVersion: 12,
  latestVersionMap: new Map([
    ["script:entity-a", 6],
    ["screen:entity-a-screen", 8],
  ]),
  versionLogs: [
    {
      changeLog: {
        action: "rollback",
        entityType: "script",
        entityId: "entity-a",
        version: 6,
        isActive: false,
        dateOfChange: new Date("2026-04-10T12:00:00.000Z"),
        description: "Rollback release v10 -> v11",
        changes: [
          {
            action: "rollback",
            fromDataVersion: 10,
            toDataVersion: 7,
            fromVersion: 5,
            toVersion: 3,
          },
        ],
      },
      user: { name: "Reviewer", email: "reviewer@example.com" },
    },
    {
      changeLog: {
        action: "publish",
        entityType: "release",
        entityId: "release-11",
        version: 11,
        isActive: false,
        dateOfChange: new Date("2026-04-10T11:00:00.000Z"),
        description: "Published rollback release",
      },
      user: { name: "Publisher", email: "publisher@example.com" },
    },
    {
      changeLog: {
        action: "rollback",
        entityType: "screen",
        entityId: "entity-a-screen",
        version: 8,
        isActive: true,
        dateOfChange: new Date("2026-04-10T12:01:00.000Z"),
        description: "Screen rollback",
      },
      user: { name: "Reviewer", email: "reviewer@example.com" },
    },
  ],
})

assert.equal(
  dataVersionSummary.rollbackSourceVersion,
  7,
  "data version summaries should surface the restored release number from rollback metadata",
)

assert.equal(
  dataVersionSummary.publishedByName,
  "Publisher",
  "data version summaries should continue to attribute published-by details to the publish entry when present",
)

assert.equal(
  dataVersionSummary.hasActiveChanges,
  true,
  "data version summaries should recompute active state from the latest version map instead of stale row flags",
)

async function main() {
  const copyCalls: Array<{
    fromRemoteSiteId: string
    scriptsIds: string[]
    overWriteScriptWithId?: string
    broadcastAction?: boolean
  }> = []

  const importResult = await runRemoteScriptImports({
    siteId: "remote-site-1",
    scriptsToImport: [
      { scriptId: "script-1" },
      { scriptId: "script-2", overWriteExistingScriptWithId: "local-script-2" },
    ],
    copyScript: async (params) => {
      copyCalls.push(params)
      return { errors: undefined }
    },
  })

  assert.equal(importResult.success, true, "remote import should succeed when delegated copy calls succeed")
  assert.deepEqual(
    copyCalls,
    [
      {
        fromRemoteSiteId: "remote-site-1",
        scriptsIds: ["script-1"],
        overWriteScriptWithId: undefined,
        broadcastAction: false,
      },
      {
        fromRemoteSiteId: "remote-site-1",
        scriptsIds: ["script-2"],
        overWriteScriptWithId: "local-script-2",
        broadcastAction: false,
      },
    ],
    "remote import should delegate each requested script through the established copy flow",
  )

  const failedImport = await runRemoteScriptImports({
    siteId: "remote-site-1",
    scriptsToImport: [{ scriptId: "script-3" }],
    copyScript: async () => ({ errors: ["copy failed"] }),
  })

  assert.equal(failedImport.success, false, "remote import should surface delegated copy failures")
  assert.deepEqual(
    failedImport.errors,
    ["[scriptId=script-3] copy failed"],
    "remote import errors should preserve per-script context",
  )

  console.log("changelog feature integration tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
