import assert from "assert"
import { sanitizeChangeLogForResponse, type ChangeLogType } from "../databases/queries/changelogs/_get-change-logs"

const baseChange = {
  id: 1,
  changeLogId: "00000000-0000-0000-0000-000000000000",
  entityId: "00000000-0000-0000-0000-000000000001",
  entityType: "script",
  action: "update",
  version: 1,
  changes: [],
  fullSnapshot: {
    safe: "keep-me",
    password: "secret",
    nested: {
      apiKey: "should-be-removed",
      title: "visible",
    },
  },
  description: "",
  changeReason: "",
  isActive: true,
  userId: "00000000-0000-0000-0000-000000000002",
  dateOfChange: new Date(),
  createdAt: new Date(),
  parentVersion: null,
  mergedFromVersion: null,
  supersededBy: null,
  supersededAt: null,
  dataVersion: null,
} as unknown as ChangeLogType;

const sanitized = sanitizeChangeLogForResponse(baseChange)

// redaction assertions
assert.equal((sanitized.fullSnapshot as any)?.password, undefined, "password should be removed")
assert.equal((sanitized.fullSnapshot as any)?.nested?.apiKey, undefined, "apiKey should be removed")
assert.equal((sanitized.fullSnapshot as any)?.nested?.title, "visible", "non-sensitive fields should remain")
assert.equal((sanitized.fullSnapshot as any)?.safe, "keep-me", "non-sensitive fields should remain")

console.log("sanitizeChangeLogForResponse redaction test passed")
