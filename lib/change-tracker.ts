import { pendingChangesAPI } from "./indexed-db"

export interface ChangeTrackerOptions {
  entityId: string
  entityType: "script" | "screen" | "diagnosis" | "configKey" | "drugsLibraryItem" | "dataKey" | "alias"
  userId?: string
  userName?: string
  entityTitle?: string
  resolveEntityTitle?: (currentData: any) => string | undefined
}

export type TrackableEntityType = ChangeTrackerOptions["entityType"]

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
  "isDraft",
  "isDeleted",
  "draftCreatedByUserId",
  "createdByUserId",
  "updatedByUserId",
  "createdBy",
  "updatedBy",
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
      return
    }

    this.originalSnapshot = JSON.parse(JSON.stringify(data))
    this.isInitialized = true
  }

  async trackChanges(currentData: any, description?: string) {
    if (!this.isInitialized || !this.originalSnapshot) {
      this.setSnapshot(currentData)
      return
    }


    const changes = this.detectChanges(this.originalSnapshot, currentData)


    const existingChanges = await pendingChangesAPI.getEntityChanges(this.options.entityId, this.options.entityType)
    const existingChangesByPath = new Map(existingChanges.map((change) => [change.fieldPath, change]))
    const entityTitle = this.resolveEntityTitle(currentData)

    for (const change of changes) {
      const existingChange = existingChangesByPath.get(change.path)

      if (existingChange) {
        await pendingChangesAPI.updateChange(existingChange.id!, {
          newValue: change.newValue,
          timestamp: Date.now(),
          description,
          fullSnapshot: currentData,
          entityTitle,
        })
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
          entityTitle,
        })
      }
    }

    for (const [path, existingChange] of Array.from(existingChangesByPath.entries())) {
      const stillChanged = changes.some((c) => c.path === path)
      if (!stillChanged) {
        await pendingChangesAPI.deleteChange(existingChange.id!)
      }
    }

    if (changes.length === 0) {
      await pendingChangesAPI.clearEntityChanges(this.options.entityId, this.options.entityType)
    }
  }

  private resolveEntityTitle(currentData?: any): string {
    if (this.options.resolveEntityTitle) {
      const resolved = this.options.resolveEntityTitle(currentData)
      if (resolved && resolved.toString().trim().length) {
        return resolved.toString().trim()
      }
    }

    const snapshotTitle = this.extractTitle(currentData)
    if (snapshotTitle) return snapshotTitle

    if (typeof this.options.entityTitle === "string" && this.options.entityTitle.trim().length) {
      return this.options.entityTitle.trim()
    }

    const originalTitle = this.extractTitle(this.originalSnapshot)
    if (originalTitle) return originalTitle

    return `${this.options.entityType} ${this.options.entityId}`
  }

  private extractTitle(data: any): string | null {
    if (!data || typeof data !== "object") return null

    const candidateKeys = [
      "title",
      "name",
      "label",
      "key",
      "printTitle",
      "displayName",
      "sectionTitle",
      "collectionLabel",
    ]

    for (const key of candidateKeys) {
      const value = data[key]
      if (typeof value === "string" && value.trim().length) {
        return value.trim()
      }
    }

    return null
  }

  private isMeaningfulValue(value: any): boolean {
    if (value === undefined || value === null) return false
    if (typeof value === "string" && value.trim() === "") return false
    return true
  }

  private normalizeComparableValue(value: any): any {
    if (value === undefined || value === null) return null
    if (typeof value === "string" && value.trim() === "") return null
    return value
  }

  private areEquivalentValues(a: any, b: any): boolean {
    const normalizedA = this.normalizeComparableValue(a)
    const normalizedB = this.normalizeComparableValue(b)

    if (normalizedA === null && normalizedB === null) return true
    if (typeof normalizedA !== "object" || typeof normalizedB !== "object") {
      return normalizedA === normalizedB
    }

    try {
      return JSON.stringify(normalizedA) === JSON.stringify(normalizedB)
    } catch {
      return false
    }
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

    if (this.shouldDiffScreenFields(path) && (Array.isArray(oldObj) || Array.isArray(newObj))) {
      const previous = Array.isArray(oldObj) ? oldObj : []
      const next = Array.isArray(newObj) ? newObj : []
      return this.diffScreenFields(previous, next, path)
    }

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
      if (!this.areEquivalentValues(oldObj, newObj) && this.isMeaningfulValue(newObj)) {
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
      if (this.shouldDiffScreenFields(path)) {
        return this.diffScreenFields(oldObj, newObj, path)
      }
      if (!this.areEquivalentValues(oldObj, newObj)) {
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
      } else if (!this.areEquivalentValues(oldValue, newValue)) {
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

  private shouldDiffScreenFields(path: string): boolean {
    if (this.options.entityType !== "screen") return false
    return path === "fields" || path.endsWith(".fields")
  }

  private diffScreenFields(
    oldFields: any[],
    newFields: any[],
    path: string,
  ): Array<{ path: string; name: string; oldValue: any; newValue: any }> {
    const changes: Array<{ path: string; name: string; oldValue: any; newValue: any }> = []
    const oldMap = this.indexFieldsByKey(oldFields)
    const newMap = this.indexFieldsByKey(newFields)
    const allKeys = new Set<string>()
    oldMap.forEach((_value, key) => allKeys.add(key))
    newMap.forEach((_value, key) => allKeys.add(key))

    for (const key of Array.from(allKeys)) {
      const oldField = oldMap.get(key) || null
      const newField = newMap.get(key) || null
      const label = this.resolveFieldLabel(newField || oldField, key)
      const fieldPath = `${path}.${key}`

      if (!oldField && newField) {
        changes.push({
          path: fieldPath,
          name: `${label} (added)`,
          oldValue: null,
          newValue: newField,
        })
        continue
      }

      if (oldField && !newField) {
        changes.push({
          path: fieldPath,
          name: `${label} (removed)`,
          oldValue: oldField,
          newValue: null,
        })
        continue
      }

      if (oldField && newField) {
        const fieldChanges = this.detectChanges(oldField, newField, fieldPath)
        for (const change of fieldChanges) {
          changes.push({
            ...change,
            name: change.name ? `${label} • ${change.name}` : label,
          })
        }
      }
    }

    return changes
  }

  private indexFieldsByKey(fields: any[]): Map<string, any> {
    const map = new Map<string, any>()
    fields.forEach((field, index) => {
      if (!field || typeof field !== "object") return
      const rawKey = field.fieldId || field.id || field.key || field.name
      const fallbackKey = `index_${index}`
      const safeKey = String(rawKey || fallbackKey).replace(/\./g, "_")
      map.set(safeKey, field)
    })
    return map
  }

  private resolveFieldLabel(field: any, fallbackKey: string): string {
    if (!field || typeof field !== "object") return fallbackKey
    const candidates = [
      field.label,
      field.title,
      field.name,
      field.key,
      field.fieldId,
      field.id,
    ]
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length) return candidate.trim()
      if (typeof candidate === "number" && Number.isFinite(candidate)) return String(candidate)
    }
    return fallbackKey
  }

  async clearChanges() {
    await pendingChangesAPI.clearEntityChanges(this.options.entityId, this.options.entityType)
    this.originalSnapshot = null
    this.isInitialized = false
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

const TITLE_CANDIDATE_KEYS = [
  "title",
  "name",
  "label",
  "key",
  "printTitle",
  "sectionTitle",
  "collectionLabel",
  "drug",
  "fluid",
  "feed",
]

function inferEntityTitleFromSnapshot(snapshot?: any): string | null {
  if (!snapshot || typeof snapshot !== "object") return null

  for (const key of TITLE_CANDIDATE_KEYS) {
    const value = snapshot[key]
    if (typeof value === "string" && value.trim().length) {
      return value.trim()
    }
  }

  return null
}

export async function recordPendingDeletionChange({
  entityId,
  entityType,
  entityTitle,
  snapshot,
  userId,
  userName,
  description,
}: {
  entityId?: string | null
  entityType: TrackableEntityType
  entityTitle?: string
  snapshot?: any
  userId?: string | null
  userName?: string | null
  description?: string
}) {
  if (!entityId) return

  const resolvedTitle =
    entityTitle?.trim() ||
    inferEntityTitleFromSnapshot(snapshot) ||
    `${entityType} ${entityId}`

  await pendingChangesAPI.clearEntityChanges(entityId, entityType)

  await pendingChangesAPI.addChange({
    entityId,
    entityType,
    entityTitle: resolvedTitle,
    action: "delete",
    fieldPath: "entity",
    fieldName: resolvedTitle,
    oldValue: snapshot ?? null,
    newValue: null,
    userId: userId || undefined,
    userName: userName || undefined,
    description: description || `Marked "${resolvedTitle}" for deletion`,
    fullSnapshot: snapshot ?? null,
  })
}
