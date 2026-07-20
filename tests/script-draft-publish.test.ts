import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import {
  buildPublishedChildScriptReference,
  resolvePublishedScriptId,
} from "../lib/script-draft-publish"

const importedScriptDraft = {
  scriptDraftId: "import-draft-id",
  scriptId: null,
  data: { scriptId: "imported-script-id" },
}

assert.equal(
  resolvePublishedScriptId(importedScriptDraft),
  "imported-script-id",
  "new imported scripts should use the ID that is promoted into the published script row",
)
assert.deepEqual(
  buildPublishedChildScriptReference(importedScriptDraft),
  { scriptId: "imported-script-id", scriptDraftId: null },
  "imported child drafts must be detached from the cascading parent draft reference",
)

const updatedScriptDraft = {
  scriptDraftId: "update-draft-id",
  scriptId: "published-script-id",
  data: { scriptId: "stale-or-legacy-id" },
}

assert.deepEqual(
  buildPublishedChildScriptReference(updatedScriptDraft),
  { scriptId: "published-script-id", scriptDraftId: null },
  "children of updated scripts should retain the authoritative published script ID",
)

const publishSource = readFileSync(
  resolve(process.cwd(), "databases/mutations/scripts/_scripts_publish.ts"),
  "utf8",
)
const reparentIndex = publishSource.indexOf("const childScriptReference = buildPublishedChildScriptReference(draft)")
const pendingDeletionDetachIndex = publishSource.indexOf(".set({ scriptDraftId: null })")
const parentDeleteIndex = publishSource.indexOf("delete(scriptsDrafts)")

assert.ok(reparentIndex >= 0, "script publishing should reparent child drafts")
assert.ok(parentDeleteIndex > reparentIndex, "child drafts must be detached before the parent script draft is deleted")
assert.ok(
  pendingDeletionDetachIndex > reparentIndex && pendingDeletionDetachIndex < parentDeleteIndex,
  "pending child deletions must be detached before the parent script draft is deleted",
)

for (const table of ["screensDrafts", "diagnosesDrafts", "problemsDrafts"]) {
  assert.match(
    publishSource,
    new RegExp(`update\\(${table}\\)[\\s\\S]*?set\\(childScriptReference\\)`),
    `${table} should be reparented before script draft cleanup`,
  )
}

assert.match(
  publishSource,
  /update\(pendingDeletion\)[\s\S]*?set\(\{ scriptDraftId: null \}\)/,
  "pending child deletions should be detached from the parent script draft",
)

console.log("script draft publish tests passed")
