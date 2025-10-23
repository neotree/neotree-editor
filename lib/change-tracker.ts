import { pendingChangesAPI } from "./indexed-db"

export interface ChangeTrackerOptions {
  entityId: string
  entityType: "script" | "screen" | "diagnosis" | "configKey" | "drugsLibraryItem" | "dataKey" | "alias"
  userId?: string
  userName?: string
}

export class ChangeTracker {
  private options: ChangeTrackerOptions
  private previousSnapshot: any = null

  constructor(options: ChangeTrackerOptions) {
    this.options = options
  }

  // Set the initial snapshot to compare against
  setSnapshot(data: any) {
    this.previousSnapshot = JSON.parse(JSON.stringify(data))
  }

  // Compare current data with snapshot and track changes
  async trackChanges(currentData: any, description?: string) {
    if (!this.previousSnapshot) {
      this.setSnapshot(currentData)
      return
    }

    const changes = this.detectChanges(this.previousSnapshot, currentData)

    if (changes.length > 0) {
      for (const change of changes) {
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
      }
    }

    this.setSnapshot(currentData)
  }

  // Detect changes between two objects
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
      if (newObj !== null && newObj !== undefined) {
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
      changes.push({
        path: path || "root",
        name: path.split(".").pop() || "root",
        oldValue: oldObj,
        newValue: newObj,
      })
      return changes
    }

    // Handle primitive types
    if (typeof oldObj !== "object" || typeof newObj !== "object") {
      if (oldObj !== newObj) {
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

    // Handle objects
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

    Array.from(allKeys).forEach((key) => {
      const newPath = path ? `${path}.${key}` : key
      const oldValue = oldObj[key]
      const newValue = newObj[key]

      if (
        typeof oldValue === "object" &&
        typeof newValue === "object" &&
        !Array.isArray(oldValue) &&
        !Array.isArray(newValue)
      ) {
        changes.push(...this.detectChanges(oldValue, newValue, newPath))
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          path: newPath,
          name: key,
          oldValue,
          newValue,
        })
      }
    })

    return changes
  }

  // Clear all tracked changes for this entity
  async clearChanges() {
    await pendingChangesAPI.clearEntityChanges(this.options.entityId, this.options.entityType)
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
