import Dexie, { type Table } from "dexie"

export interface PendingChange {
  id?: number
  entityId: string
  entityType: "script" | "screen" | "diagnosis" | "configKey" | "drugsLibraryItem" | "dataKey" | "alias"
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
  // Add a new pending change
  async addChange(change: Omit<PendingChange, "id" | "timestamp">) {
    const timestamp = Date.now()
    return await changeLogDB.pendingChanges.add({
      ...change,
      timestamp,
    })
  },

  // Get all pending changes for an entity
  async getEntityChanges(entityId: string, entityType?: string) {
    const query = changeLogDB.pendingChanges.where("entityId").equals(entityId)

    if (entityType) {
      return await query.and((change) => change.entityType === entityType).toArray()
    }

    return await query.toArray()
  },

  // Get all pending changes grouped by entity
  async getAllChangesByEntity() {
    const allChanges = await changeLogDB.pendingChanges.toArray()
    const grouped: Record<string, PendingChange[]> = {}

    allChanges.forEach((change) => {
      const key = `${change.entityType}:${change.entityId}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(change)
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
  async startSession(entityId: string, entityType: string, userId?: string) {
    const sessionId = `${entityType}-${entityId}-${Date.now()}`
    const session: Omit<ChangeSession, "id"> = {
      sessionId,
      entityId,
      entityType,
      startedAt: Date.now(),
      lastModifiedAt: Date.now(),
      changeCount: 0,
      userId,
    }

    return await changeLogDB.changeSessions.add(session)
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
