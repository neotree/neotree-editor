import Dexie, { type Table } from "dexie"

export interface PendingChange {
  id?: number
  entityId: string
  entityType: "script" | "screen" | "diagnosis" | "configKey" | "drugsLibraryItem" | "dataKey" | "alias"
  entityTitle: string
  action: "create" | "update" | "delete"
  fieldPath: string
  fieldName: string
  oldValue: any
  newValue: any
  timestamp: number
  userId?: string
  userName?: string
  description?: string
  fullSnapshot?: any
}

export interface ChangeSession {
  id?: number
  sessionId: string
  entityId: string
  entityType: string
  entityTitle?: string
  startedAt: number
  lastModifiedAt: number
  changeCount: number
  userId?: string
}

export class ChangeLogDB extends Dexie {
  pendingChanges!: Table<PendingChange, number>
  changeSessions!: Table<ChangeSession, number>

  constructor() {
    super("NeotreeChangeLogDB")

    this.version(1).stores({
      pendingChanges: "++id, entityId, entityType, timestamp, userId, [entityId+fieldPath]",
      changeSessions: "++id, sessionId, entityId, entityType, startedAt, lastModifiedAt",
    })
  }
}

export const changeLogDB = new ChangeLogDB()

// Helper functions for managing pending changes
export const pendingChangesAPI = {
  // Add a new pending change (entityTitle is required)
  async addChange(change: Omit<PendingChange, "id" | "timestamp">) {
    const timestamp = Date.now()
    const entityTitle =
      typeof change.entityTitle === "string" && change.entityTitle.trim().length
        ? change.entityTitle.trim()
        : `${change.entityType} ${change.entityId}`

    return await changeLogDB.pendingChanges.add({
      ...change,
      entityTitle,
      timestamp,
    })
  },

  async updateChange(id: number, updates: Partial<Omit<PendingChange, "id">>) {
    const nextUpdates = { ...updates }

    if (updates.entityTitle && typeof updates.entityTitle === "string") {
      nextUpdates.entityTitle =
        updates.entityTitle.trim().length > 0 ? updates.entityTitle.trim() : undefined
    }

    return await changeLogDB.pendingChanges.update(id, nextUpdates)
  },

  async deleteChange(id: number) {
    return await changeLogDB.pendingChanges.delete(id)
  },

  // Get all pending changes for an entity
  async getEntityChanges(entityId: string, entityType?: string) {
    const query = changeLogDB.pendingChanges.where("entityId").equals(entityId)

    if (entityType) {
      return await query.and((change) => change.entityType === entityType).toArray()
    }

    return await query.toArray()
  },

  // Get all pending changes grouped by entity (includes title)
  async getAllChangesByEntity() {
    const allChanges = await changeLogDB.pendingChanges.toArray()
    const grouped: Record<string, { title: string; changes: PendingChange[] }> = {}

    allChanges.forEach((change) => {
      const key = `${change.entityType}:${change.entityId}`
      if (!grouped[key]) {
        grouped[key] = {
          title:
            (typeof change.entityTitle === "string" && change.entityTitle.trim().length
              ? change.entityTitle.trim()
              : `${change.entityType} ${change.entityId}`),
          changes: [],
        }
      }
      grouped[key].changes.push(change)
    })

    return grouped
  },

  // Get count of pending changes
  async getChangeCount(entityId?: string) {
    if (entityId) {
      return await changeLogDB.pendingChanges.where("entityId").equals(entityId).count()
    }
    return await changeLogDB.pendingChanges.count()
  },

  // Clear changes for an entity (called after save/publish)
  async clearEntityChanges(entityId: string, entityType?: string) {
    if (entityType) {
      return await changeLogDB.pendingChanges
        .where("entityId")
        .equals(entityId)
        .and((change) => change.entityType === entityType)
        .delete()
    }
    return await changeLogDB.pendingChanges.where("entityId").equals(entityId).delete()
  },

  // Clear all pending changes
  async clearAllChanges() {
    return await changeLogDB.pendingChanges.clear()
  },

  // Get changes by user
  async getChangesByUser(userId: string) {
    return await changeLogDB.pendingChanges.where("userId").equals(userId).toArray()
  },

  // Get recent changes (last N changes)
  async getRecentChanges(limit = 50) {
    return await changeLogDB.pendingChanges.orderBy("timestamp").reverse().limit(limit).toArray()
  },

  // Session management
  async startSession(entityId: string, entityType: string, entityTitle?: string, userId?: string) {
    const sessionId = `${entityType}-${entityId}-${Date.now()}`
    const session: Omit<ChangeSession, "id"> = {
      sessionId,
      entityId,
      entityType,
      entityTitle,
      startedAt: Date.now(),
      lastModifiedAt: Date.now(),
      changeCount: 0,
      userId,
    }

    await changeLogDB.changeSessions.add(session)
    return sessionId
  },

  async updateSession(sessionId: string) {
    const session = await changeLogDB.changeSessions.where("sessionId").equals(sessionId).first()

    if (session) {
      await changeLogDB.changeSessions.update(session.id!, {
        lastModifiedAt: Date.now(),
        changeCount: (session.changeCount || 0) + 1,
      })
    }
  },

  async endSession(sessionId: string) {
    return await changeLogDB.changeSessions.where("sessionId").equals(sessionId).delete()
  },

  async getActiveSession(entityId: string) {
    return await changeLogDB.changeSessions.where("entityId").equals(entityId).first()
  },
}
