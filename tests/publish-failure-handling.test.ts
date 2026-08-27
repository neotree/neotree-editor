import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

const screenPublishSource = readSource("databases/mutations/scripts/_screens_publish.ts")
const aliasResultIndex = screenPublishSource.indexOf("const aliasResult = await _generateScreenAliases")
const changeLogIndex = screenPublishSource.indexOf("const saveResult = await _saveChangeLogs")

assert.ok(aliasResultIndex >= 0, "screen publishing should retain the alias-generation result")
assert.ok(
  screenPublishSource.includes("if (!aliasResult.success)"),
  "screen publishing should stop when alias generation fails",
)
assert.ok(
  changeLogIndex > aliasResultIndex,
  "alias failures must be handled before attempting changelog writes in the transaction",
)
assert.ok(
  screenPublishSource.includes('logger.error("_publishScreens ERROR", message)'),
  "screen publish errors should log a serializable message",
)

const publishActionSource = readSource("app/actions/ops.ts")
const conditionGateIndex = publishActionSource.indexOf("const ceGate = await getScriptsWithConditionErrors({")

assert.ok(
  conditionGateIndex >= 0 && publishActionSource.indexOf("forceRefresh: true", conditionGateIndex) > conditionGateIndex,
  "publish should force a draft-inclusive refresh while reading scoped conditional-expression findings",
)
assert.ok(
  publishActionSource.includes("row?.scriptId || row?.scriptDraftId"),
  "publish scope should include never-published scripts through scriptDraftId",
)
assert.equal(
  publishActionSource.includes("results.blockingDetails = { conditionErrors: ceGate }"),
  false,
  "conditional-expression warnings must not use the data-key blocking-details response field",
)

const conditionReportSource = readSource("app/actions/scripts.ts")
assert.ok(
  conditionReportSource.includes("await active.promise"),
  "publish-time refreshes should wait for any in-flight condition report recomputation",
)
assert.ok(
  conditionReportSource.includes("oldKeyStillProduced"),
  "outcome renames should preserve references when another outcome still produces the old key",
)
assert.ok(
  conditionReportSource.includes("client: tx"),
  "outcome renames and their conditional-expression rewrites should share one transaction",
)
assert.ok(
  conditionReportSource.includes("resolveSaveAffectedScriptIds"),
  "partial and reorder saves should refresh the affected script's conditional-expression report",
)

const screenSaveSource = readSource("databases/mutations/scripts/_screens_save.ts")
assert.ok(
  screenSaveSource.includes("await executor.query.screensDrafts.findFirst"),
  "screen reference rewrites should read through the supplied transaction executor",
)

const sequenceMigration = readSource("manual_migrations/2026-08-20_realign_alias_id_sequence.sql")
assert.match(sequenceMigration, /LOCK TABLE "public"\."nt_aliases" IN ACCESS EXCLUSIVE MODE/)
assert.match(sequenceMigration, /IF sequence_value <= maximum_id THEN/)
assert.match(sequenceMigration, /setval\(sequence_name::regclass, maximum_id, true\)/)

console.log("publish failure handling tests passed")
