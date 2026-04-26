import fs from "node:fs"
import path from "node:path"

import { analyzeLegacyChangeLog } from "@/lib/changelog-legacy-repair"
import { SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT } from "@/lib/changelog-rollback"
import logger from "@/lib/logger"


type RepairSummary = {
  dryRun: boolean
  strictCutoverAt: string
  scannedRows: number
  legacyEligibleRows: number
  missingHashRows: number
  staleHashRows: number
  strictHashMismatchRows: number
  repairedHashRows: number
  rowsMissingManagedFields: number
  rowsMissingManagedFieldsInFullSnapshot: number
  rowsMissingManagedFieldsInPreviousSnapshot: number
  unsupportedEntityTypeRows: number
  byEntityType: Record<
    string,
    {
      scanned: number
      missingHashRows: number
      staleHashRows: number
      strictHashMismatchRows: number
      repairedHashRows: number
      rowsMissingManagedFields: number
    }
  >
  sampleRows: Array<{
    id: number
    entityType: string
    entityId: string
    version: number
    dataVersion: number | null
    dateOfChange: string | null
    hashStatus: string
    fullSnapshotMissingManagedFields: string[]
    previousSnapshotMissingManagedFields: string[]
  }>
}

function parseArgs() {
  const args = process.argv.slice(2)
  const getValue = (flag: string) => {
    const index = args.indexOf(flag)
    return index >= 0 ? args[index + 1] : undefined
  }

  return {
    apply: args.includes("--apply"),
    batchSize: Math.max(100, Number(getValue("--batch-size")) || 1000),
    limit: Math.max(0, Number(getValue("--limit")) || 0),
    writePath: getValue("--write"),
  }
}

function getManagedSnapshotKeys(
  entityType: string,
  bindings: Record<string, { publishDateKey?: string | undefined } | undefined>,
) {
  const binding = bindings[entityType]
  if (!binding) return []

  return Array.from(new Set(["createdAt", "updatedAt", binding.publishDateKey].filter(Boolean) as string[]))
}

function ensureEntityTypeSummary(summary: RepairSummary, entityType: string) {
  if (!summary.byEntityType[entityType]) {
    summary.byEntityType[entityType] = {
      scanned: 0,
      missingHashRows: 0,
      staleHashRows: 0,
      strictHashMismatchRows: 0,
      repairedHashRows: 0,
      rowsMissingManagedFields: 0,
    }
  }

  return summary.byEntityType[entityType]
}

async function main() {
  const [{ asc, eq, gt }, rollbackSharedModule, dbModule, schemaModule] = await Promise.all([
    import("drizzle-orm"),
    import("@/databases/mutations/changelogs/_rollback-shared"),
    import("@/databases/pg/drizzle"),
    import("@/databases/pg/schema"),
  ])
  const db = dbModule.default
  const { changeLogs } = schemaModule
  const { CHANGELOG_ENTITY_BINDINGS } = rollbackSharedModule
  const options = parseArgs()
  const summary: RepairSummary = {
    dryRun: !options.apply,
    strictCutoverAt: SNAPSHOT_HASH_STRICT_ENFORCEMENT_AT.toISOString(),
    scannedRows: 0,
    legacyEligibleRows: 0,
    missingHashRows: 0,
    staleHashRows: 0,
    strictHashMismatchRows: 0,
    repairedHashRows: 0,
    rowsMissingManagedFields: 0,
    rowsMissingManagedFieldsInFullSnapshot: 0,
    rowsMissingManagedFieldsInPreviousSnapshot: 0,
    unsupportedEntityTypeRows: 0,
    byEntityType: {},
    sampleRows: [],
  }

  let lastId = 0

  while (true) {
    const rows = await db
      .select()
      .from(changeLogs)
      .where(gt(changeLogs.id, lastId))
      .orderBy(asc(changeLogs.id))
      .limit(options.batchSize)

    if (!rows.length) break

    for (const row of rows) {
      if (options.limit > 0 && summary.scannedRows >= options.limit) break

      lastId = row.id
      summary.scannedRows += 1

      const entitySummary = ensureEntityTypeSummary(summary, row.entityType)
      entitySummary.scanned += 1

      const managedSnapshotKeys = getManagedSnapshotKeys(row.entityType, CHANGELOG_ENTITY_BINDINGS)
      if (!managedSnapshotKeys.length) {
        summary.unsupportedEntityTypeRows += 1
      }

      const analysis = analyzeLegacyChangeLog({
        change: row,
        managedSnapshotKeys,
      })

      const isLegacyEligible = analysis.hashStatus !== "strict_mismatch"
      if (isLegacyEligible) summary.legacyEligibleRows += 1

      if (analysis.hashStatus === "missing") {
        summary.missingHashRows += 1
        entitySummary.missingHashRows += 1
      }

      if (analysis.hashStatus === "stale") {
        summary.staleHashRows += 1
        entitySummary.staleHashRows += 1
      }

      if (analysis.hashStatus === "strict_mismatch") {
        summary.strictHashMismatchRows += 1
        entitySummary.strictHashMismatchRows += 1
      }

      const missingManagedFieldCount =
        analysis.fullSnapshotMissingManagedFields.length + analysis.previousSnapshotMissingManagedFields.length
      if (missingManagedFieldCount > 0) {
        summary.rowsMissingManagedFields += 1
        entitySummary.rowsMissingManagedFields += 1
      }
      if (analysis.fullSnapshotMissingManagedFields.length > 0) {
        summary.rowsMissingManagedFieldsInFullSnapshot += 1
      }
      if (analysis.previousSnapshotMissingManagedFields.length > 0) {
        summary.rowsMissingManagedFieldsInPreviousSnapshot += 1
      }

      if (summary.sampleRows.length < 100) {
        const shouldCaptureSample =
          analysis.hashStatus !== "healthy" ||
          analysis.fullSnapshotMissingManagedFields.length > 0 ||
          analysis.previousSnapshotMissingManagedFields.length > 0

        if (shouldCaptureSample) {
          summary.sampleRows.push({
            id: row.id,
            entityType: row.entityType,
            entityId: row.entityId,
            version: row.version,
            dataVersion: row.dataVersion ?? null,
            dateOfChange: row.dateOfChange ? new Date(row.dateOfChange).toISOString() : null,
            hashStatus: analysis.hashStatus,
            fullSnapshotMissingManagedFields: analysis.fullSnapshotMissingManagedFields,
            previousSnapshotMissingManagedFields: analysis.previousSnapshotMissingManagedFields,
          })
        }
      }

      if (options.apply && analysis.canAutoRepairHash) {
        await db.update(changeLogs).set({ snapshotHash: analysis.computedHash }).where(eq(changeLogs.id, row.id))
        summary.repairedHashRows += 1
        entitySummary.repairedHashRows += 1
      }
    }

    if (options.limit > 0 && summary.scannedRows >= options.limit) break
  }

  if (options.writePath) {
    const targetPath = path.resolve(options.writePath)
    fs.writeFileSync(targetPath, JSON.stringify(summary, null, 2))
  }

  logger.log("legacy changelog repair summary", {
    dryRun: summary.dryRun,
    strictCutoverAt: summary.strictCutoverAt,
    scannedRows: summary.scannedRows,
    legacyEligibleRows: summary.legacyEligibleRows,
    missingHashRows: summary.missingHashRows,
    staleHashRows: summary.staleHashRows,
    strictHashMismatchRows: summary.strictHashMismatchRows,
    repairedHashRows: summary.repairedHashRows,
    rowsMissingManagedFields: summary.rowsMissingManagedFields,
    rowsMissingManagedFieldsInFullSnapshot: summary.rowsMissingManagedFieldsInFullSnapshot,
    rowsMissingManagedFieldsInPreviousSnapshot: summary.rowsMissingManagedFieldsInPreviousSnapshot,
  })

  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error("repair-legacy-changelogs ERROR", error?.message || error)
    console.error(error)
    process.exit(1)
  })
