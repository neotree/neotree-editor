export type SelectionRuleItem = {
  itemId: string
  exclusiveGroup?: string
  forbidWith?: string[]
}

export type SelectionConflict = {
  selectedValue: string
  conflictWith: string[]
  reason: "exclusive_group" | "forbid_with"
  group?: string
}

export function normalizeSelectionRuleItems<T extends SelectionRuleItem>(
  items: T[],
  createId: () => string,
): {
  items: T[]
  warnings: string[]
} {
  const usedIds = new Set<string>()
  const remappedIds = new Map<string, string>()
  const warnings: string[] = []

  const normalized = items.map((item, index) => {
    const originalId = `${item.itemId || ""}`.trim()
    let itemId = originalId

    if (!itemId || usedIds.has(itemId)) {
      itemId = createId()
      warnings.push(
        !originalId
          ? `Assigned generated itemId ${itemId} to item at index ${index}`
          : `Remapped duplicate itemId ${originalId} to ${itemId} at item index ${index}`,
      )
    }

    usedIds.add(itemId)
    if (originalId && originalId !== itemId) {
      remappedIds.set(originalId, itemId)
    }

    return {
      ...item,
      itemId,
    }
  })

  const validIds = new Set(normalized.map((item) => `${item.itemId || ""}`.trim()).filter(Boolean))

  return {
    items: normalized.map((item, index) => {
    const currentItemId = `${item.itemId || ""}`.trim()
    const originalForbidWith = (item.forbidWith || []).map((id) => `${id}`.trim()).filter(Boolean)
    const forbidWith: string[] = []
    const seen = new Set<string>()

    originalForbidWith.forEach((id) => {
      const remappedId = remappedIds.get(id) || id
      if (remappedId !== id) {
        warnings.push(`Remapped forbidWith ${id} to ${remappedId} for item ${currentItemId || index}`)
      }
      if (remappedId === currentItemId) {
        warnings.push(`Dropped self-referencing forbidWith ${remappedId} for item ${currentItemId || index}`)
        return
      }
      if (!validIds.has(remappedId)) {
        warnings.push(`Dropped unknown forbidWith ${remappedId} for item ${currentItemId || index}`)
        return
      }
      if (seen.has(remappedId)) return
      seen.add(remappedId)
      forbidWith.push(remappedId)
    })

    return {
      ...item,
      forbidWith,
    }
    }),
    warnings,
  }
}

export function validateSelectionRules<T extends SelectionRuleItem>(
  items: T[],
  contextLabel: string,
): string[] {
  const errors: string[] = []
  const ids = new Set<string>()

  items.forEach((item, index) => {
    const itemId = `${item.itemId || ""}`.trim()
    // Temporarily disabled until legacy data migration is complete.
    // Re-enable to enforce strict item identity validation after migration.
    // if (!itemId) {
    //   errors.push(`${contextLabel}: item at index ${index} is missing itemId`)
    //   return
    // }
    if (!itemId) return

    if (ids.has(itemId)) {
      errors.push(`${contextLabel}: duplicate itemId ${itemId}`)
      return
    }
    ids.add(itemId)
  })

  items.forEach((item) => {
    const itemId = `${item.itemId || ""}`.trim()
    if (!itemId) return

    const forbidWith = (item.forbidWith || []).map((id) => `${id}`.trim()).filter(Boolean)
    forbidWith.forEach((forbidId) => {
      if (forbidId === itemId) {
        errors.push(`${contextLabel}: item ${itemId} cannot forbid itself`)
        return
      }
      // Temporarily disabled until legacy data migration is complete.
      // Re-enable to enforce strict forbidWith target integrity after migration.
      // if (!ids.has(forbidId)) {
      //   errors.push(`${contextLabel}: item ${itemId} forbids unknown itemId ${forbidId}`)
      // }
    })
  })

  return errors
}

export function getSelectionConflicts<T extends SelectionRuleItem>(params: {
  items: T[]
  selectedValues: Array<string | number>
  getItemValue: (item: T) => string | number
}): SelectionConflict[] {
  const { items, selectedValues, getItemValue } = params
  const selectedSet = new Set(selectedValues.map((value) => `${value}`))

  const itemIdByValue = new Map<string, string>()
  const itemById = new Map<string, T>()
  items.forEach((item) => {
    const itemId = `${item.itemId || ""}`.trim()
    if (!itemId) return
    itemById.set(itemId, item)
    itemIdByValue.set(`${getItemValue(item)}`, itemId)
  })

  const selectedItemIds = new Set<string>()
  selectedSet.forEach((value) => {
    const itemId = itemIdByValue.get(value)
    if (itemId) selectedItemIds.add(itemId)
  })

  const conflicts: SelectionConflict[] = []

  const groups = new Map<string, string[]>()
  items.forEach((item) => {
    const group = `${item.exclusiveGroup || ""}`.trim()
    if (!group) return
    const value = `${getItemValue(item)}`
    if (!selectedSet.has(value)) return
    const list = groups.get(group) || []
    list.push(value)
    groups.set(group, list)
  })

  groups.forEach((values, group) => {
    if (values.length < 2) return
    values.forEach((value) => {
      conflicts.push({
        selectedValue: value,
        conflictWith: values.filter((v) => v !== value),
        reason: "exclusive_group",
        group,
      })
    })
  })

  selectedSet.forEach((value) => {
    const itemId = itemIdByValue.get(value)
    if (!itemId) return
    const item = itemById.get(itemId)
    if (!item) return

    const forbidWith = (item.forbidWith || []).map((id) => `${id}`.trim()).filter(Boolean)
    const conflictsWith: string[] = []

    forbidWith.forEach((forbidId) => {
      if (!selectedItemIds.has(forbidId)) return
      const conflictItem = itemById.get(forbidId)
      if (!conflictItem) return
      conflictsWith.push(`${getItemValue(conflictItem)}`)
    })

    if (conflictsWith.length) {
      conflicts.push({
        selectedValue: value,
        conflictWith: conflictsWith,
        reason: "forbid_with",
      })
    }
  })

  return conflicts
}
