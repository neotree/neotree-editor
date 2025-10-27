import { pendingChangesAPI } from "./indexed-db"

export interface ChangeTrackerOptions {
  entityId: string
  entityType: "script" | "screen" | "diagnosis" | "configKey" | "drugsLibraryItem" | "dataKey" | "alias"
  userId?: string
  userName?: string
}

const IGNORED_FIELDS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "oldScriptId",
  "oldScreenId",
  "oldDiagnosisId",
  "oldConfigKeyId",
  "version",
  "publishDate",
])

export class ChangeTracker {
  private options: ChangeTrackerOptions
  private originalSnapshot: any = null
  private isInitialized = false

  constructor(options: ChangeTrackerOptions) {
    this.options = options
  }

  setSnapshot(data: any) {
    if (this.isInitialized) {
      console.warn("Snapshot already initialized, ignoring subsequent calls")
      return
    }

    this.originalSnapshot = JSON.parse(JSON.stringify(data))
    this.isInitialized = true
    console.log("Initial snapshot set for entity:", this.options.entityId)
  }

  async trackChanges(currentData: any, description?: string) {
    if (!this.isInitialized || !this.originalSnapshot) {
      console.warn("Snapshot not initialized, initializing now")
      this.setSnapshot(currentData)
      return
    }

    console.log("Tracking changes for entity:", this.options.entityId)

    const changes = this.detectChanges(this.originalSnapshot, currentData)

    console.log("Detected changes:", changes.length)

    const existingChanges = await pendingChangesAPI.getEntityChanges(this.options.entityId, this.options.entityType)
    const existingChangesByPath = new Map(existingChanges.map((change) => [change.fieldPath, change]))

    for (const change of changes) {
      const existingChange = existingChangesByPath.get(change.path)

      if (existingChange) {
        await pendingChangesAPI.updateChange(existingChange.id!, {
          newValue: change.newValue,
          timestamp: Date.now(),
          description,
          fullSnapshot: currentData,
        })
        console.log("Updated change for field:", change.path)
      } else {
        await pendingChangesAPI.addChange({
          entityId: this.options.entityId,
          entityType: this.options.entityType,
          action: "update",
          fieldPath: change.path,
          fieldName: change.name,
          oldValue: change.oldValue,
          newValue: change.newValue,
          userId: this.options.userId,
          userName: this.options.userName,
          description,
          fullSnapshot: currentData,
        })
        console.log("Added new change for field:", change.path)
      }
    }

    for (const [path, existingChange] of Array.from(existingChangesByPath)) {
      const stillChanged = changes.some((c) => c.path === path)
      if (!stillChanged) {
        await pendingChangesAPI.deleteChange(existingChange.id!)
        console.log("Removed reverted change for field:", path)
      }
    }

    if (changes.length === 0) {
      await pendingChangesAPI.clearEntityChanges(this.options.entityId, this.options.entityType)
      console.log("All changes cleared - form back to original state")
    }
  }

  private isMeaningfulValue(value: any): boolean {
    if (value === undefined || value === null) return false
    if (typeof value === "string" && value.trim() === "") return false
    return true
  }

  private detectChanges(
    oldObj: any,
    newObj: any,
    path = "",
  ): Array<{
    path: string
    name: string
    oldValue: any
    newValue: any
  }> {
    const changes: Array<{ path: string; name: string; oldValue: any; newValue: any }> = []

    // Handle null/undefined cases
    if (oldObj === null || oldObj === undefined) {
      if (newObj !== null && newObj !== undefined && this.isMeaningfulValue(newObj)) {
        changes.push({
          path: path || "root",
          name: path.split(".").pop() || "root",
          oldValue: oldObj,
          newValue: newObj,
        })
      }
      return changes
    }

    if (newObj === null || newObj === undefined) {
      if (this.isMeaningfulValue(oldObj)) {
        changes.push({
          path: path || "root",
          name: path.split(".").pop() || "root",
          oldValue: oldObj,
          newValue: newObj,
        })
      }
      return changes
    }

    // Handle primitive types
    if (typeof oldObj !== "object" || typeof newObj !== "object") {
      if (oldObj !== newObj && this.isMeaningfulValue(newObj)) {
        changes.push({
          path: path || "root",
          name: path.split(".").pop() || "root",
          oldValue: oldObj,
          newValue: newObj,
        })
      }
      return changes
    }

    // Handle arrays
    if (Array.isArray(oldObj) && Array.isArray(newObj)) {
      if (JSON.stringify(oldObj) !== JSON.stringify(newObj)) {
        changes.push({
          path: path || "root",
          name: path.split(".").pop() || "root",
          oldValue: oldObj,
          newValue: newObj,
        })
      }
      return changes
    }

    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

    Array.from(allKeys).forEach((key) => {
      if (IGNORED_FIELDS.has(key)) {
        return
      }

      const newPath = path ? `${path}.${key}` : key
      const oldValue = oldObj[key]
      const newValue = newObj[key]

      if (!this.isMeaningfulValue(oldValue) && !this.isMeaningfulValue(newValue)) {
        return
      }

      if (
        typeof oldValue === "object" &&
        typeof newValue === "object" &&
        oldValue !== null &&
        newValue !== null &&
        !Array.isArray(oldValue) &&
        !Array.isArray(newValue)
      ) {
        changes.push(...this.detectChanges(oldValue, newValue, newPath))
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        if (this.isMeaningfulValue(newValue)) {
          changes.push({
            path: newPath,
            name: key,
            oldValue,
            newValue,
          })
        }
      }
    })

    return changes
  }

  async clearChanges() {
    await pendingChangesAPI.clearEntityChanges(this.options.entityId, this.options.entityType)
    this.originalSnapshot = null
    this.isInitialized = false
    console.log("Change tracker reset for entity:", this.options.entityId)
  }

  // Get all pending changes for this entity
  async getPendingChanges() {
    return await pendingChangesAPI.getEntityChanges(this.options.entityId, this.options.entityType)
  }
}

// Helper function to create a change tracker
export function createChangeTracker(options: ChangeTrackerOptions) {
  return new ChangeTracker(options)
}
