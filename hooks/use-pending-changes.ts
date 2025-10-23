"use client"

import { useCallback, useEffect, useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { pendingChangesAPI, type PendingChange } from "@/lib/indexed-db"

export interface UsePendingChangesOptions {
  entityId?: string
  entityType?: string
  userId?: string
  autoTrack?: boolean
}

export function usePendingChanges(options: UsePendingChangesOptions = {}) {
  const { entityId, entityType, userId, autoTrack = true } = options
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Live query for pending changes
  const pendingChanges = useLiveQuery(async () => {
    if (entityId) {
      return await pendingChangesAPI.getEntityChanges(entityId, entityType)
    }
    return await pendingChangesAPI.getRecentChanges(100)
  }, [entityId, entityType])

  // Live query for change count
  const changeCount = useLiveQuery(async () => {
    return await pendingChangesAPI.getChangeCount(entityId)
  }, [entityId])

  // Live query for all changes grouped by entity
  const allChangesByEntity = useLiveQuery(async () => {
    return await pendingChangesAPI.getAllChangesByEntity()
  }, [])

  // Start tracking session
  useEffect(() => {
    if (autoTrack && entityId && entityType) {
      pendingChangesAPI.startSession(entityId, entityType, userId).then((id) => {
        setSessionId(`${entityType}-${entityId}-${Date.now()}`)
      })

      return () => {
        if (sessionId) {
          pendingChangesAPI.endSession(sessionId)
        }
      }
    }
  }, [autoTrack, entityId, entityType, userId, sessionId])

  // Track a change
  const trackChange = useCallback(
    async (change: Omit<PendingChange, "id" | "timestamp" | "entityId" | "entityType">) => {
      if (!entityId || !entityType) {
        console.warn("Cannot track change: entityId and entityType are required")
        return
      }

      await pendingChangesAPI.addChange({
        ...change,
        entityId,
        entityType: entityType as any,
        userId,
      })

      if (sessionId) {
        await pendingChangesAPI.updateSession(sessionId)
      }
    },
    [entityId, entityType, userId, sessionId],
  )

  // Track multiple changes at once
  const trackChanges = useCallback(
    async (changes: Omit<PendingChange, "id" | "timestamp" | "entityId" | "entityType">[]) => {
      if (!entityId || !entityType) {
        console.warn("Cannot track changes: entityId and entityType are required")
        return
      }

      for (const change of changes) {
        await pendingChangesAPI.addChange({
          ...change,
          entityId,
          entityType: entityType as any,
          userId,
        })
      }

      if (sessionId) {
        await pendingChangesAPI.updateSession(sessionId)
      }
    },
    [entityId, entityType, userId, sessionId],
  )

  // Clear changes for current entity
  const clearChanges = useCallback(async () => {
    if (entityId) {
      await pendingChangesAPI.clearEntityChanges(entityId, entityType)
      if (sessionId) {
        await pendingChangesAPI.endSession(sessionId)
      }
    }
  }, [entityId, entityType, sessionId])

  // Clear all changes
  const clearAllChanges = useCallback(async () => {
    await pendingChangesAPI.clearAllChanges()
  }, [])

  // Get changes summary
  const getChangesSummary = useCallback(() => {
    if (!pendingChanges) return null

    const summary = {
      total: pendingChanges.length,
      byAction: {} as Record<string, number>,
      byField: {} as Record<string, number>,
      fields: new Set<string>(),
    }

    pendingChanges.forEach((change) => {
      summary.byAction[change.action] = (summary.byAction[change.action] || 0) + 1
      summary.byField[change.fieldName] = (summary.byField[change.fieldName] || 0) + 1
      summary.fields.add(change.fieldName)
    })

    return summary
  }, [pendingChanges])

  return {
    pendingChanges: pendingChanges || [],
    changeCount: changeCount || 0,
    allChangesByEntity: allChangesByEntity || {},
    trackChange,
    trackChanges,
    clearChanges,
    clearAllChanges,
    getChangesSummary,
    hasChanges: (changeCount || 0) > 0,
  }
}
