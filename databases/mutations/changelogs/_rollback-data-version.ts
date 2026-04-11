import { and, asc, desc, eq, inArray, isNull, lte, or, sql } from "drizzle-orm"

import logger from "@/lib/logger"
import {
  DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY,
  RELEASE_ROLLBACK_MAX_RECENT_DEPTH,
  SCRIPT_CHILD_ENTITY_TYPES,
  getRollbackAppliedEntityVersion,
  getRollbackParentVersion,
  isReleaseRollbackWithinRecentWindow,
  normalizePublishedRollbackVersion,
  partitionReleaseRollbackCandidates,
  wasCreatedInCurrentDataVersion,
} from "@/lib/changelog-rollback"
import { isUuidLike } from "@/lib/uuid"
import db from "@/databases/pg/drizzle"
import { changeLogs, editorInfo } from "@/databases/pg/schema"
import socket from "@/lib/socket"
import {
  applyRollbackSnapshot,
  assertSnapshotIntegrity,
  CHANGELOG_ENTITY_BINDINGS,
  lockEntityRow,
  normalizeSnapshot,
  type VersionedEntityBinding,
} from "./_rollback-shared"
import { _saveChangeLog, type SaveChangeLogData } from "./_save-change-log"
import { buildReleasePublishChangeLog } from "./_release-log"

export type RollbackDataVersionParams = {
  dataVersion?: number
  toDataVersion?: number
  userId: string
  changeReason?: string
  createdEntityPolicy?: "keep" | "soft_delete"
  allowDeepRollback?: boolean
}

export type RollbackDataVersionResponse = {
  success: boolean
  errors?: string[]
  restoredVersion?: number
}

const RELEASE_ROLLBACK_ENTITY_TYPES = Object.keys(CHANGELOG_ENTITY_BINDINGS) as (typeof changeLogs.$inferSelect)["entityType"][]

async function findRollbackTargetChangeLog(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  current: typeof changeLogs.$inferSelect,
  targetDataVersion: number,
) {
  const target = await tx.query.changeLogs.findFirst({
    where: and(
      eq(changeLogs.entityId, current.entityId),
      eq(changeLogs.entityType, current.entityType),
      lte(changeLogs.dataVersion, targetDataVersion),
    ),
    orderBy: (changeLogs, { desc }) => [desc(changeLogs.dataVersion), desc(changeLogs.version)],
  })
  if (target) return target

  const legacyTarget = await tx.query.changeLogs.findFirst({
    where: and(
      eq(changeLogs.entityId, current.entityId),
      eq(changeLogs.entityType, current.entityType),
      or(isNull(changeLogs.dataVersion), lte(changeLogs.dataVersion, targetDataVersion)),
    ),
    orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
  })
  return legacyTarget ?? null
}

export async function _rollbackDataVersion({
  dataVersion: requestedDataVersion,
  toDataVersion: requestedTargetDataVersion,
  userId,
  changeReason,
  createdEntityPolicy = DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY,
  allowDeepRollback = false,
}: RollbackDataVersionParams): Promise<RollbackDataVersionResponse> {
  const response: RollbackDataVersionResponse = { success: false }
  let restoredVersion: number | undefined

  try {
    if (!isUuidLike(userId)) throw new Error("Invalid userId")

    await db.transaction(async (tx) => {
      const lockedEditorInfo = await tx.execute<{ id: number; dataVersion: number }>(
        sql`select id, data_version as "dataVersion" from nt_editor_info limit 1 for update`,
      )
      const editor = lockedEditorInfo?.[0]

      const currentDataVersion = requestedDataVersion ?? editor?.dataVersion
      if (!currentDataVersion || currentDataVersion < 2) {
        throw new Error("No data version to rollback or already at initial version")
      }

      if (!editor || editor.dataVersion !== currentDataVersion) {
        throw new Error("Data version drift detected; reload and try again")
      }

      const restoreSourceDataVersion = requestedTargetDataVersion ?? (currentDataVersion - 1)
      if (!Number.isInteger(restoreSourceDataVersion) || restoreSourceDataVersion < 1) {
        throw new Error("No previous data version available to restore")
      }
      if (restoreSourceDataVersion >= currentDataVersion) {
        throw new Error("Rollback target must be older than the current published data version")
      }
      if (!allowDeepRollback && !isReleaseRollbackWithinRecentWindow({
        currentDataVersion,
        targetDataVersion: restoreSourceDataVersion,
      })) {
        throw new Error(
          `Release rollback is limited to the last ${RELEASE_ROLLBACK_MAX_RECENT_DEPTH} prior versions unless deep rollback override is enabled`,
        )
      }

      const targetDataVersion = currentDataVersion + 1
      restoredVersion = targetDataVersion

      const currentChanges = await tx.query.changeLogs.findMany({
        where: and(
          eq(changeLogs.isActive, true),
          inArray(changeLogs.entityType, RELEASE_ROLLBACK_ENTITY_TYPES),
        ),
        orderBy: (changeLogs, { asc }) => [asc(changeLogs.entityType), asc(changeLogs.entityId)],
      })
      const {
        rollbackCandidates,
        scriptChanges,
        standaloneChanges: nonScriptChanges,
      } = partitionReleaseRollbackCandidates({
        changes: currentChanges,
        restoreSourceDataVersion,
      })

      if (!rollbackCandidates.length) {
        throw new Error(`No active entities changed after data version v${restoreSourceDataVersion}`)
      }

      // Preflight: ensure each entity has a valid snapshot from the previous published data version (or current if new)
      for (const current of rollbackCandidates) {
        const target = await findRollbackTargetChangeLog(tx, current, restoreSourceDataVersion)

        if (target && !target.fullSnapshot) throw new Error(`Previous snapshot missing for ${current.entityId}`)
        if (target && target.entityType !== current.entityType) {
          throw new Error(`Entity type mismatch for ${current.entityId}`)
        }

        if (target) {
          await assertSnapshotIntegrity(tx, target, current.entityId)
        }
        await assertSnapshotIntegrity(tx, current, `current ${current.entityId}`)
      }

      // Build grouped restore plan per script (parent + children)
      const shouldSoftDeleteCreated = createdEntityPolicy === "soft_delete"

      for (const scriptChange of scriptChanges) {
        const binding = CHANGELOG_ENTITY_BINDINGS[scriptChange.entityType]
        if (!binding) throw new Error(`Unsupported entity type ${scriptChange.entityType}`)
        await lockEntityRow({ tx, binding, entityId: scriptChange.entityId })

        const scriptTarget = await tx.query.changeLogs.findFirst({
          where: and(
            eq(changeLogs.entityId, scriptChange.entityId),
            eq(changeLogs.entityType, scriptChange.entityType),
            lte(changeLogs.dataVersion, restoreSourceDataVersion),
          ),
          orderBy: (changeLogs, { desc }) => [desc(changeLogs.dataVersion), desc(changeLogs.version)],
        })
        const effectiveScriptTarget = scriptTarget ?? (await findRollbackTargetChangeLog(tx, scriptChange, restoreSourceDataVersion))
        if (effectiveScriptTarget && !effectiveScriptTarget.fullSnapshot) {
          throw new Error(`Missing previous script snapshot ${scriptChange.entityId}`)
        }

        const plan: {
          current: typeof changeLogs.$inferSelect
          target: typeof changeLogs.$inferSelect | null
          binding: VersionedEntityBinding
          createdInCurrentVersion: boolean
        }[] = []
        plan.push({
          current: scriptChange,
          target: effectiveScriptTarget,
          binding,
          createdInCurrentVersion: wasCreatedInCurrentDataVersion({
            currentVersion: scriptChange.version,
            directPreviousPublishedVersion: scriptTarget?.version,
            fallbackPreviousVersion: effectiveScriptTarget?.version,
          }),
        })

        const childTypes = [...SCRIPT_CHILD_ENTITY_TYPES] as (typeof changeLogs.$inferSelect)["entityType"][]
        for (const childType of childTypes) {
          const children = rollbackCandidates.filter(
            (c) => c.entityType === childType && c.scriptId === scriptChange.scriptId,
          )
          for (const child of children) {
            const childBinding = CHANGELOG_ENTITY_BINDINGS[childType]
            if (!childBinding) throw new Error(`Unsupported entity type ${childType}`)
            await lockEntityRow({ tx, binding: childBinding, entityId: child.entityId })
            const targetChild = await tx.query.changeLogs.findFirst({
              where: and(
                eq(changeLogs.entityId, child.entityId),
                eq(changeLogs.entityType, child.entityType),
                lte(changeLogs.dataVersion, restoreSourceDataVersion),
              ),
              orderBy: (changeLogs, { desc }) => [desc(changeLogs.dataVersion), desc(changeLogs.version)],
            })
            const fallbackChildTarget = await findRollbackTargetChangeLog(tx, child, restoreSourceDataVersion)
            const effectiveChildTarget = targetChild ?? fallbackChildTarget
            if (effectiveChildTarget && !effectiveChildTarget.fullSnapshot) {
              throw new Error(`Missing previous snapshot for child entity ${child.entityId}`)
            }
            plan.push({
              current: child,
              target: effectiveChildTarget,
              binding: childBinding,
              createdInCurrentVersion: wasCreatedInCurrentDataVersion({
                currentVersion: child.version,
                directPreviousPublishedVersion: targetChild?.version,
                fallbackPreviousVersion: effectiveChildTarget?.version,
              }),
            })
          }
        }

        // Apply plan atomically
        for (const { current, target, binding, createdInCurrentVersion } of plan) {
          const effectiveTarget = target ?? current
          const description = `Rollback release v${currentDataVersion} -> v${targetDataVersion} (state of v${restoreSourceDataVersion})`
          const targetSnapshot = normalizeSnapshot(effectiveTarget.fullSnapshot)
          const currentSnapshot = normalizeSnapshot(current.fullSnapshot)
          const shouldSoftDelete = shouldSoftDeleteCreated && createdInCurrentVersion
          const restoredVersion = normalizePublishedRollbackVersion(effectiveTarget.version)
          if (shouldSoftDelete) {
            targetSnapshot.deletedAt = new Date().toISOString()
          }
          const rollbackChangeLog: SaveChangeLogData = {
            entityId: current.entityId,
            entityType: current.entityType,
            action: "rollback",
            changes: [
              {
                action: "rollback",
                description,
                fromVersion: current.version,
                toVersion: restoredVersion,
                fromDataVersion: currentDataVersion,
                toDataVersion: restoreSourceDataVersion,
              },
            ],
            fullSnapshot: targetSnapshot,
            previousSnapshot: currentSnapshot,
            description,
            changeReason: changeReason || description,
            parentVersion: restoredVersion !== null ? getRollbackParentVersion(restoredVersion) : null,
            dataVersion: targetDataVersion,
            isActive: true,
            userId,
            scriptId: current.scriptId,
            screenId: current.screenId,
            diagnosisId: current.diagnosisId,
            problemId: current.problemId,
            configKeyId: current.configKeyId,
            drugsLibraryItemId: current.drugsLibraryItemId,
            dataKeyId: current.dataKeyId,
            aliasId: current.aliasId,
            hospitalId: current.entityType === "hospital" ? current.entityId : undefined,
          }

          const saved = await _saveChangeLog({ data: rollbackChangeLog, client: tx })
          if (!saved.success || !saved.data) {
            throw new Error(saved.errors?.join(", ") || `Failed to rollback ${current.entityId}`)
          }

          const applied = await applyRollbackSnapshot({
            tx,
            binding,
            entityId: current.entityId,
            snapshot: targetSnapshot,
            newVersion: getRollbackAppliedEntityVersion(saved.data.version),
          })

          if (!applied) throw new Error(`Failed to apply snapshot for ${current.entityId}`)
        }
      }

      // Non-script entities (singletons)
      for (const current of nonScriptChanges) {
        const binding = CHANGELOG_ENTITY_BINDINGS[current.entityType]
        if (!binding) throw new Error(`Unsupported entity type ${current.entityType}`)
        await lockEntityRow({ tx, binding, entityId: current.entityId })

        const target = await tx.query.changeLogs.findFirst({
          where: and(
            eq(changeLogs.entityId, current.entityId),
            eq(changeLogs.entityType, current.entityType),
            lte(changeLogs.dataVersion, restoreSourceDataVersion),
          ),
          orderBy: (changeLogs, { desc }) => [desc(changeLogs.dataVersion), desc(changeLogs.version)],
        })
        const fallbackTarget = await findRollbackTargetChangeLog(tx, current, restoreSourceDataVersion)
        const effectiveTarget = target ?? fallbackTarget

        const description = `Rollback release v${currentDataVersion} -> v${targetDataVersion} (state of v${restoreSourceDataVersion})`
        const targetSnapshot = normalizeSnapshot((effectiveTarget ?? current).fullSnapshot)
        const currentSnapshot = normalizeSnapshot(current.fullSnapshot)
        const restoredVersion = normalizePublishedRollbackVersion(effectiveTarget?.version)
        const createdInCurrentVersion = wasCreatedInCurrentDataVersion({
          currentVersion: current.version,
          directPreviousPublishedVersion: target?.version,
          fallbackPreviousVersion: effectiveTarget?.version,
        })
        const shouldSoftDelete = shouldSoftDeleteCreated && createdInCurrentVersion
        if (shouldSoftDelete) {
          targetSnapshot.deletedAt = new Date().toISOString()
        }
        const rollbackChangeLog: SaveChangeLogData = {
          entityId: current.entityId,
          entityType: current.entityType,
          action: "rollback",
          changes: [
            {
              action: "rollback",
              description,
              fromVersion: current.version,
              toVersion: restoredVersion,
              fromDataVersion: currentDataVersion,
              toDataVersion: restoreSourceDataVersion,
            },
            ],
            fullSnapshot: targetSnapshot,
          previousSnapshot: currentSnapshot,
            description,
            changeReason: changeReason || description,
            parentVersion: restoredVersion !== null ? getRollbackParentVersion(restoredVersion) : null,
            dataVersion: targetDataVersion,
            isActive: true,
          userId,
          scriptId: current.scriptId,
          screenId: current.screenId,
          diagnosisId: current.diagnosisId,
          problemId: current.problemId,
          configKeyId: current.configKeyId,
          drugsLibraryItemId: current.drugsLibraryItemId,
          dataKeyId: current.dataKeyId,
          aliasId: current.aliasId,
          hospitalId: current.entityType === "hospital" ? current.entityId : undefined,
        }

        const saved = await _saveChangeLog({ data: rollbackChangeLog, client: tx })
        if (!saved.success || !saved.data) {
          throw new Error(saved.errors?.join(", ") || `Failed to rollback ${current.entityId}`)
        }

        const applied = await applyRollbackSnapshot({
          tx,
          binding,
          entityId: current.entityId,
          snapshot: targetSnapshot,
          newVersion: getRollbackAppliedEntityVersion(saved.data.version),
        })

        if (!applied) throw new Error(`Failed to apply snapshot for ${current.entityId}`)
      }

      if (editor) {
        await tx
          .update(editorInfo)
          .set({ dataVersion: targetDataVersion, lastPublishDate: new Date() })
          .where(eq(editorInfo.id, editor.id))
      }

      const releaseLog = await _saveChangeLog({
        data: buildReleasePublishChangeLog({
          dataVersion: targetDataVersion,
          userId,
          description: `Release v${targetDataVersion} published via rollback from v${currentDataVersion} to state of v${restoreSourceDataVersion}`,
          changeReason:
            changeReason ||
            `Release v${targetDataVersion} published via rollback from v${currentDataVersion} to state of v${restoreSourceDataVersion}`,
          changes: [
            {
              action: "publish",
              description: `Release v${targetDataVersion} published via rollback`,
              fromDataVersion: currentDataVersion,
              toDataVersion: targetDataVersion,
              rollbackSourceDataVersion: restoreSourceDataVersion,
            },
          ],
        }),
        client: tx,
      })
      if (!releaseLog.success) {
        throw new Error(releaseLog.errors?.join(", ") || "Failed to save rollback release changelog")
      }
    })

    response.success = true
    response.restoredVersion = restoredVersion
    socket.emit("data_changed", "rollback_data_version")
    return response
  } catch (e: any) {
    logger.error("_rollbackDataVersion ERROR", e.message)
    response.errors = [e.message]
    return response
  }
}
