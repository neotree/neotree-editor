import { and, asc, desc, eq, lt, lte, sql } from "drizzle-orm"
import * as uuid from "uuid"

import logger from "@/lib/logger"
import db from "@/databases/pg/drizzle"
import { changeLogs, editorInfo } from "@/databases/pg/schema"
import socket from "@/lib/socket"
import {
  getNextRollbackDataVersion,
  getRollbackParentVersion,
  isChangeAlreadyAlignedToRollbackTarget,
  normalizePublishedRollbackVersion,
} from "@/lib/changelog-rollback"
import {
  applyRollbackSnapshot,
  assertSnapshotIntegrity,
  CHANGELOG_ENTITY_BINDINGS,
  lockChangeLogChain,
  lockEntityRow,
  normalizeSnapshot,
} from "./_rollback-shared"
import { _saveChangeLog, type SaveChangeLogData } from "./_save-change-log"
import { buildReleasePublishChangeLog } from "./_release-log"

export type RollbackChangeLogParams = {
  entityId: string
  entityType: (typeof changeLogs.$inferSelect)["entityType"]
  toVersion?: number
  userId: string
  changeReason?: string
  broadcastAction?: boolean
}

export type RollbackChangeLogResponse = {
  success: boolean
  errors?: string[]
  newVersion?: number
  data?: typeof changeLogs.$inferSelect
}

export async function _rollbackChangeLog({
  entityId,
  entityType,
  toVersion,
  userId,
  changeReason,
  broadcastAction,
}: RollbackChangeLogParams): Promise<RollbackChangeLogResponse> {
  const response: RollbackChangeLogResponse = { success: false }

  try {
    if (!entityId || !uuid.validate(entityId)) {
      throw new Error("Invalid entityId")
    }
    if (!entityType) {
      throw new Error("Invalid entityType")
    }

    const result = await db.transaction(async (tx) => {
      const findTargetByVersion = async ({
        entityId,
        entityType,
        version,
      }: {
        entityId: string
        entityType: (typeof changeLogs.$inferSelect)["entityType"]
        version?: number | null
      }) => {
        if (!Number.isFinite(version)) return null

        return (
          (await tx.query.changeLogs.findFirst({
            where: and(
              eq(changeLogs.entityId, entityId),
              eq(changeLogs.entityType, entityType),
              eq(changeLogs.version, Number(version)),
            ),
          })) ?? null
        )
      }

      const findPreviousTarget = async ({
        entityId,
        entityType,
        currentVersion,
      }: {
        entityId: string
        entityType: (typeof changeLogs.$inferSelect)["entityType"]
        currentVersion: number
      }) =>
        (
          (await tx.query.changeLogs.findFirst({
            where: and(
              eq(changeLogs.entityId, entityId),
              eq(changeLogs.entityType, entityType),
              lt(changeLogs.version, currentVersion),
            ),
            orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
          })) ?? null
        )

        const findTargetForRollback = async ({
          entityId,
          entityType,
          currentVersion,
          explicitVersion,
        targetDataVersion,
      }: {
        entityId: string
        entityType: (typeof changeLogs.$inferSelect)["entityType"]
        currentVersion: number
        explicitVersion?: number | null
        targetDataVersion?: number | null
      }) => {
        const explicitTarget = await findTargetByVersion({ entityId, entityType, version: explicitVersion })
        if (explicitTarget) return explicitTarget

        if (Number.isFinite(targetDataVersion)) {
          const dataVersionTarget =
            (await tx.query.changeLogs.findFirst({
              where: and(
                eq(changeLogs.entityId, entityId),
                eq(changeLogs.entityType, entityType),
                lte(changeLogs.dataVersion, Number(targetDataVersion)),
              ),
              orderBy: (changeLogs, { desc }) => [desc(changeLogs.dataVersion), desc(changeLogs.version)],
            })) ?? null

          if (dataVersionTarget) return dataVersionTarget
        }

        return await findPreviousTarget({ entityId, entityType, currentVersion })
      }

      const rollbackTimestamp = new Date().toISOString()
      const initiallyCurrent = await tx.query.changeLogs.findFirst({
        where: and(eq(changeLogs.entityId, entityId), eq(changeLogs.entityType, entityType), eq(changeLogs.isActive, true)),
        orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
      })

      if (!initiallyCurrent) throw new Error("No active version found for entity")
      const binding = CHANGELOG_ENTITY_BINDINGS[initiallyCurrent.entityType]
      if (!binding) throw new Error(`Unsupported entity type ${initiallyCurrent.entityType}`)
      await lockEntityRow({ tx, binding, entityId })
      await lockChangeLogChain(tx, initiallyCurrent.entityType, entityId)

      const current = await tx.query.changeLogs.findFirst({
        where: and(
          eq(changeLogs.entityId, entityId),
          eq(changeLogs.entityType, entityType),
          eq(changeLogs.isActive, true),
        ),
        orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
      })

      if (!current) throw new Error("No active version found for entity after locking")

      const explicitPreviousVersion = Number.isFinite(current.parentVersion) ? current.parentVersion! : undefined

      const target = await findTargetForRollback({
        entityId,
        entityType,
        currentVersion: current.version,
        explicitVersion: explicitPreviousVersion,
      })

      if (!target) {
        throw new Error("No previous version available to restore")
      }

      const expectedPreviousVersion = target.version

      if (toVersion !== undefined && toVersion !== expectedPreviousVersion) {
        throw new Error(`Can only restore to immediate previous version (${expectedPreviousVersion})`)
      }

      if (!target) {
        throw new Error(`Previous version ${expectedPreviousVersion} not found for entity`)
      }
      if (target.entityType !== current.entityType) {
        throw new Error("Entity type mismatch between current and previous versions")
      }
      if (!target.fullSnapshot) {
        throw new Error(`Previous version ${expectedPreviousVersion} is missing a full snapshot`)
      }

      const lockedEditorInfo = await tx.execute<{ id: number; dataVersion: number }>(
        sql`select id, data_version as "dataVersion" from nt_editor_info limit 1 for update`,
      )
      const editor = lockedEditorInfo?.[0]
      const nextDataVersion = getNextRollbackDataVersion({
        editorDataVersion: editor?.dataVersion,
        currentDataVersion: current.dataVersion,
      })
      const rollbackEntity = async ({
        currentChange,
        targetChange,
        binding,
        overrideDescription,
        allowSoftDeleteIfCreated = false,
      }: {
        currentChange: typeof changeLogs.$inferSelect
        targetChange: typeof changeLogs.$inferSelect | null
        binding: (typeof CHANGELOG_ENTITY_BINDINGS)[keyof typeof CHANGELOG_ENTITY_BINDINGS]
        overrideDescription?: string
        allowSoftDeleteIfCreated?: boolean
      }) => {
        const meaningfulTarget = targetChange && normalizePublishedRollbackVersion(targetChange.version) !== null ? targetChange : null
        const restoredVersion = normalizePublishedRollbackVersion(meaningfulTarget?.version)
        const shouldSoftDeleteCreated = allowSoftDeleteIfCreated && !meaningfulTarget
        const effectiveSnapshotSource = meaningfulTarget?.fullSnapshot ?? currentChange.fullSnapshot
        if (!effectiveSnapshotSource) {
          throw new Error(`Previous snapshot missing for ${currentChange.entityType} ${currentChange.entityId}`)
        }

        await assertSnapshotIntegrity(tx, currentChange, currentChange.entityId)
        if (meaningfulTarget) {
          await assertSnapshotIntegrity(tx, meaningfulTarget, meaningfulTarget.entityId)
        }

        const description =
          overrideDescription ??
          (shouldSoftDeleteCreated
            ? `Rollback ${currentChange.entityType} created after version ${target.version}`
            : `Rollback to version ${meaningfulTarget!.version}`)
        const targetSnapshot = normalizeSnapshot(effectiveSnapshotSource)
        if (shouldSoftDeleteCreated) {
          targetSnapshot.deletedAt = rollbackTimestamp
        }
        const currentSnapshot = normalizeSnapshot(currentChange.fullSnapshot)

        const saveResult = await _saveChangeLog({
          data: {
            entityId: currentChange.entityId,
            entityType: currentChange.entityType,
            action: "rollback",
            changes: [
              {
                action: "rollback",
                description,
                fromVersion: currentChange.version,
                toVersion: restoredVersion,
              },
            ],
            fullSnapshot: targetSnapshot,
            previousSnapshot: currentSnapshot,
            description,
            changeReason: changeReason || description,
            parentVersion: restoredVersion !== null ? getRollbackParentVersion(restoredVersion) : null,
            dataVersion: nextDataVersion,
            isActive: true,
            userId,
            scriptId: currentChange.scriptId,
            screenId: currentChange.screenId,
            diagnosisId: currentChange.diagnosisId,
            problemId: currentChange.problemId,
            configKeyId: currentChange.configKeyId,
            hospitalId: currentChange.hospitalId,
            drugsLibraryItemId: currentChange.drugsLibraryItemId,
            dataKeyId: currentChange.dataKeyId,
            aliasId: currentChange.aliasId,
          },
          broadcastAction: false,
          client: tx,
        })

        if (!saveResult.success || !saveResult.data) {
          throw new Error(saveResult.errors?.join(", ") || `Failed to save rollback changelog for ${currentChange.entityId}`)
        }

        const applied = await applyRollbackSnapshot({
          tx,
          binding: binding!,
          entityId: currentChange.entityId,
          snapshot: targetSnapshot,
          newVersion: saveResult.data.version,
        })

        if (!applied) {
          throw new Error(`Failed to apply snapshot to entity ${currentChange.entityId}`)
        }

        return saveResult.data
      }

      const savedRoot = await rollbackEntity({
        currentChange: current,
        targetChange: target,
        binding,
        allowSoftDeleteIfCreated: true,
      })

      if (current.entityType === "script") {
        const childTypes: (typeof changeLogs.$inferSelect)["entityType"][] = ["screen", "diagnosis", "problem"]
        const activeChildren = await tx.query.changeLogs.findMany({
          where: and(eq(changeLogs.scriptId, entityId), eq(changeLogs.isActive, true)),
          orderBy: (changeLogs, { asc }) => [asc(changeLogs.entityType), asc(changeLogs.entityId)],
        })

        for (const childStub of activeChildren.filter((entry) => childTypes.includes(entry.entityType))) {
          const childBinding = CHANGELOG_ENTITY_BINDINGS[childStub.entityType]
          if (!childBinding) throw new Error(`Unsupported child entity type ${childStub.entityType}`)

          await lockEntityRow({ tx, binding: childBinding, entityId: childStub.entityId })
          await lockChangeLogChain(tx, childStub.entityType, childStub.entityId)

          const childCurrent = await tx.query.changeLogs.findFirst({
            where: and(
              eq(changeLogs.entityId, childStub.entityId),
              eq(changeLogs.entityType, childStub.entityType),
              eq(changeLogs.isActive, true),
            ),
            orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
          })

          if (!childCurrent) continue
          if (
            isChangeAlreadyAlignedToRollbackTarget({
              currentDataVersion: childCurrent.dataVersion,
              targetDataVersion: target.dataVersion,
            })
          ) {
            continue
          }

          const childTarget = await findTargetForRollback({
            entityId: childCurrent.entityId,
            entityType: childCurrent.entityType,
            currentVersion: childCurrent.version,
            targetDataVersion: target.dataVersion,
          })

          await rollbackEntity({
            currentChange: childCurrent,
            targetChange: childTarget,
            binding: childBinding,
            allowSoftDeleteIfCreated: true,
            overrideDescription: childTarget
              ? `Rollback ${childCurrent.entityType} to version ${childTarget.version} with script rollback`
              : `Rollback ${childCurrent.entityType} created after script version ${target.version}`,
          })
        }
      }

      if (editor) {
        await tx
          .update(editorInfo)
          .set({ dataVersion: nextDataVersion, lastPublishDate: new Date() })
          .where(eq(editorInfo.id, editor.id))
      }

      const releaseLog = await _saveChangeLog({
        data: buildReleasePublishChangeLog({
          dataVersion: nextDataVersion,
          userId,
          description: `Release v${nextDataVersion} published via rollback of ${entityType} ${entityId}`,
          changeReason: changeReason || `Release v${nextDataVersion} published via rollback of ${entityType} ${entityId}`,
          changes: [
            {
              action: "publish",
              description: `Release v${nextDataVersion} published via entity rollback`,
              rolledBackEntityId: entityId,
              rolledBackEntityType: entityType,
              rollbackTargetVersion: target.version,
              fromDataVersion: current.dataVersion,
              toDataVersion: nextDataVersion,
            },
          ],
        }),
        client: tx,
      })
      if (!releaseLog.success) {
        throw new Error(releaseLog.errors?.join(", ") || "Failed to save rollback release changelog")
      }

      return savedRoot
    })

    response.success = true
    response.newVersion = result?.version
    response.data = result

    if (broadcastAction) {
      socket.emit("data_changed", "rollback_change_log")
    }

    return response
  } catch (e: any) {
    response.success = false
    response.errors = [e.message]
    logger.error("_rollbackChangeLog ERROR", e.message)
    return response
  }
}
