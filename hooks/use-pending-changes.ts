"use client"

import { useCallback, useEffect, useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { pendingChangesAPI, type PendingChange } from "@/lib/indexed-db"

type PendingChangesByEntity = Record<string, { title: string; changes: PendingChange[] }>

export interface UsePendingChangesOptions {
  entityId?: string
  entityType?: string
  entityTitle?: string
  userId?: string
  autoTrack?: boolean
}

export function usePendingChanges(options: UsePendingChangesOptions = {}) {
  const { entityId, entityType, entityTitle, userId, autoTrack = true } = options
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
  const allChangesByEntity = useLiveQuery<PendingChangesByEntity>(async () => {
    return await pendingChangesAPI.getAllChangesByEntity()
  }, [])

  // Start tracking session
  useEffect(() => {
    let activeSessionId: string | null = null
    let cancelled = false

    if (autoTrack && entityId && entityType) {
      // Clear any lingering legacy sessions to keep Dexie tidy
      pendingChangesAPI.clearAllSessions().catch(() => {})

      pendingChangesAPI.startSession(entityId, entityType, entityTitle, userId).then((id) => {
        if (cancelled) return
        activeSessionId = id || null
        setSessionId(id || null)
      })

      return () => {
        cancelled = true
        if (activeSessionId) {
          pendingChangesAPI.endSession(activeSessionId)
        }
      }
    }

    return () => {
      cancelled = true
    }
  }, [autoTrack, entityId, entityType, entityTitle, userId])

  // Track a change
  const trackChange = useCallback(
    async (change: Omit<PendingChange, "id" | "timestamp" | "entityId" | "entityType" | "entityTitle">) => {
      if (!entityId || !entityType) {
        console.warn("Cannot track change: entityId and entityType are required")
        return
      }

      if (!entityTitle) {
        console.warn("Cannot track change: entityTitle is required")
        return
      }

      await pendingChangesAPI.addChange({
        ...change,
        entityId,
        entityType: entityType as any,
        entityTitle,
        userId,
      })

      if (sessionId) {
        await pendingChangesAPI.updateSession(sessionId)
      }
    },
    [entityId, entityType, entityTitle, userId, sessionId],
  )

  // Track multiple changes at once
  const trackChanges = useCallback(
    async (changes: Omit<PendingChange, "id" | "timestamp" | "entityId" | "entityType" | "entityTitle">[]) => {
      if (!entityId || !entityType) {
        console.warn("Cannot track changes: entityId and entityType are required")
        return
      }

      if (!entityTitle) {
        console.warn("Cannot track changes: entityTitle is required")
        return
      }

      for (const change of changes) {
        await pendingChangesAPI.addChange({
          ...change,
          entityId,
          entityType: entityType as any,
          entityTitle,
          userId,
        })
      }

      if (sessionId) {
        await pendingChangesAPI.updateSession(sessionId)
      }
    },
    [entityId, entityType, entityTitle, userId, sessionId],
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
      entityTitle: pendingChanges[0]?.entityTitle,
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
    entityTitle,
  }
}
