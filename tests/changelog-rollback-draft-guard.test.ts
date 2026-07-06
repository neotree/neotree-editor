import assert from "node:assert/strict"

import { buildRollbackDraftConflictMessage } from "@/databases/mutations/changelogs/_rollback-draft-guard"

const message = buildRollbackDraftConflictMessage({
  totalPendingChanges: 7,
  totalUsers: 2,
  userSummaries: [
    {
      userId: "user-1",
      displayName: "Wilson",
      email: "wilson@neotree.org",
      totalPendingChanges: 5,
    },
    {
      userId: "user-2",
      displayName: null,
      email: "jane@neotree.org",
      totalPendingChanges: 2,
    },
  ],
  sourceSummaries: [
    { source: "screen drafts", totalPendingChanges: 4 },
    { source: "queued deletions", totalPendingChanges: 3 },
  ],
})

assert.match(message, /other users have unpublished changes saved in drafts/i)
assert.match(message, /publish or discard/i)
assert.match(message, /Wilson \(5\)/)
assert.match(message, /jane@neotree\.org \(2\)/)
assert.match(message, /4 screen drafts, 3 queued deletions/i)

console.log("rollback draft guard tests passed")
