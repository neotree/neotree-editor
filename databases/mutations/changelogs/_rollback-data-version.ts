import { and, asc, desc, eq, inArray, isNull, lte, or, sql } from "drizzle-orm"

import logger from "@/lib/logger"
import {
  applySoftDeleteRollbackSideEffects,
  DEFAULT_RELEASE_ROLLBACK_CREATED_ENTITY_POLICY,
  RELEASE_ROLLBACK_MAX_RECENT_DEPTH,
  SCRIPT_CHILD_ENTITY_TYPES,
  getRollbackParentVersion,
  isChangeAlreadyAlignedToRollbackTarget,
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
  ensureActiveChangeApplied,
  lockEntityRow,
  lockChangeLogChain,
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
      restoredVersion = restoreSourceDataVersion

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
        await lockChangeLogChain(tx, scriptChange.entityType, scriptChange.entityId)

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
        const scriptTargetDataVersion = Number(effectiveScriptTarget?.dataVersion)
        if (!Number.isFinite(scriptTargetDataVersion)) {
          throw new Error(
            `Script rollback requires a target changelog with dataVersion to restore a release-consistent child bundle (${scriptChange.entityId})`,
          )
        }
        const scriptScopeId = scriptChange.scriptId ?? scriptChange.entityId

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
        const targetBundleChildren = await tx.query.changeLogs.findMany({
          where: and(
            eq(changeLogs.scriptId, scriptScopeId),
            lte(changeLogs.dataVersion, scriptTargetDataVersion),
          ),
          orderBy: (changeLogs, { desc, asc }) => [
            asc(changeLogs.entityType),
            asc(changeLogs.entityId),
            desc(changeLogs.dataVersion),
            desc(changeLogs.version),
          ],
        })
        const targetChildrenByEntity = new Map<string, typeof changeLogs.$inferSelect>()
        for (const entry of targetBundleChildren) {
          if (!childTypes.includes(entry.entityType)) continue
          const key = `${entry.entityType}:${entry.entityId}`
          if (!targetChildrenByEntity.has(key)) {
            targetChildrenByEntity.set(key, entry)
          }
        }
        const childStubsByEntity = new Map<string, typeof changeLogs.$inferSelect>()
        for (const childType of childTypes) {
          const children = rollbackCandidates.filter(
            (c) => c.entityType === childType && c.scriptId === scriptChange.scriptId,
          )
          for (const child of children) {
            childStubsByEntity.set(`${child.entityType}:${child.entityId}`, child)
          }
        }
        for (const entry of Array.from(targetChildrenByEntity.values())) {
          const key = `${entry.entityType}:${entry.entityId}`
          if (!childStubsByEntity.has(key)) {
            childStubsByEntity.set(key, entry)
          }
        }
        for (const childStub of Array.from(childStubsByEntity.values())) {
          const childBinding = CHANGELOG_ENTITY_BINDINGS[childStub.entityType]
          if (!childBinding) throw new Error(`Unsupported entity type ${childStub.entityType}`)
          await lockEntityRow({ tx, binding: childBinding, entityId: childStub.entityId })
          await lockChangeLogChain(tx, childStub.entityType, childStub.entityId)

          const childActive = await tx.query.changeLogs.findFirst({
            where: and(
              eq(changeLogs.entityId, childStub.entityId),
              eq(changeLogs.entityType, childStub.entityType),
              eq(changeLogs.isActive, true),
            ),
            orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
          })
          const childCurrent =
            childActive ??
            (await tx.query.changeLogs.findFirst({
              where: and(eq(changeLogs.entityId, childStub.entityId), eq(changeLogs.entityType, childStub.entityType)),
              orderBy: (changeLogs, { desc }) => [desc(changeLogs.version)],
            }))
          if (!childCurrent) {
            throw new Error(`No changelog history found for child entity ${childStub.entityId}`)
          }

          const targetChild = targetChildrenByEntity.get(`${childStub.entityType}:${childStub.entityId}`) ?? null
          if (targetChild) {
            await assertSnapshotIntegrity(tx, targetChild, targetChild.entityId)
          }
          if (
            !!childActive &&
            isChangeAlreadyAlignedToRollbackTarget({
              currentDataVersion: childCurrent.dataVersion,
              targetDataVersion: scriptTargetDataVersion,
            })
          ) {
            await ensureActiveChangeApplied({
              tx,
              binding: childBinding,
              activeChange: childCurrent,
            })
            continue
          }

          const effectiveChildTarget =
            targetChild ??
            (await findRollbackTargetChangeLog(tx, childCurrent, restoreSourceDataVersion))
          if (effectiveChildTarget && !effectiveChildTarget.fullSnapshot) {
            throw new Error(`Missing previous snapshot for child entity ${childCurrent.entityId}`)
          }
          plan.push({
            current: childCurrent,
            target: effectiveChildTarget,
            binding: childBinding,
            createdInCurrentVersion: wasCreatedInCurrentDataVersion({
              currentVersion: childCurrent.version,
              directPreviousPublishedVersion: targetChild?.version,
              fallbackPreviousVersion: effectiveChildTarget?.version,
            }),
          })
        }

        // Apply plan atomically
        for (const { current, target, binding, createdInCurrentVersion } of plan) {
          const effectiveTarget = target ?? current
          const description = `Rollback release v${currentDataVersion} -> v${targetDataVersion} (state of v${restoreSourceDataVersion})`
          let targetSnapshot = normalizeSnapshot(effectiveTarget.fullSnapshot)
          const currentSnapshot = normalizeSnapshot(current.fullSnapshot)
          const shouldSoftDelete = shouldSoftDeleteCreated && createdInCurrentVersion
          const restoredVersion = normalizePublishedRollbackVersion(effectiveTarget.version)
          if (shouldSoftDelete) {
            targetSnapshot = applySoftDeleteRollbackSideEffects({
              entityType: current.entityType,
              entityId: current.entityId,
              snapshot: targetSnapshot,
            })
          }
          const nextVersion = current.version + 1

          const applied = await applyRollbackSnapshot({
            tx,
            binding,
            entityId: current.entityId,
            snapshot: targetSnapshot,
            newVersion: nextVersion,
          })

          if (!applied) throw new Error(`Failed to stage rollback snapshot for ${current.entityId}`)

          const rollbackChangeLog: SaveChangeLogData = {
            entityId: current.entityId,
            entityType: current.entityType,
            action: "rollback",
            version: nextVersion,
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
            fullSnapshot: applied,
            previousSnapshot: currentSnapshot,
            description,
            changeReason: changeReason || description,
            parentVersion: getRollbackParentVersion(current.version),
            mergedFromVersion: restoredVersion,
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
        }
      }

      // Non-script entities (singletons)
      for (const current of nonScriptChanges) {
        const binding = CHANGELOG_ENTITY_BINDINGS[current.entityType]
        if (!binding) throw new Error(`Unsupported entity type ${current.entityType}`)
        await lockEntityRow({ tx, binding, entityId: current.entityId })
        await lockChangeLogChain(tx, current.entityType, current.entityId)

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
        let targetSnapshot = normalizeSnapshot((effectiveTarget ?? current).fullSnapshot)
        const currentSnapshot = normalizeSnapshot(current.fullSnapshot)
        const restoredVersion = normalizePublishedRollbackVersion(effectiveTarget?.version)
        const createdInCurrentVersion = wasCreatedInCurrentDataVersion({
          currentVersion: current.version,
          directPreviousPublishedVersion: target?.version,
          fallbackPreviousVersion: effectiveTarget?.version,
        })
        const shouldSoftDelete = shouldSoftDeleteCreated && createdInCurrentVersion
        if (shouldSoftDelete) {
          targetSnapshot = applySoftDeleteRollbackSideEffects({
            entityType: current.entityType,
            entityId: current.entityId,
            snapshot: targetSnapshot,
          })
        }
        const nextVersion = current.version + 1

        const applied = await applyRollbackSnapshot({
          tx,
          binding,
          entityId: current.entityId,
          snapshot: targetSnapshot,
          newVersion: nextVersion,
        })

        if (!applied) throw new Error(`Failed to stage rollback snapshot for ${current.entityId}`)

        const rollbackChangeLog: SaveChangeLogData = {
          entityId: current.entityId,
          entityType: current.entityType,
          action: "rollback",
          version: nextVersion,
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
          fullSnapshot: applied,
          previousSnapshot: currentSnapshot,
          description,
          changeReason: changeReason || description,
          parentVersion: getRollbackParentVersion(current.version),
          mergedFromVersion: restoredVersion,
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
