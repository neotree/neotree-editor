function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

const DATA_KEY_CHANGE_TERMINALS = new Set([
  "keyid",
  "refid",
  "refiddatakey",
  "refkeyid",
  "refkey",
  "mindatekeyid",
  "mindatekey",
  "maxdatekeyid",
  "maxdatekey",
  "mintimekeyid",
  "mintimekey",
  "maxtimekeyid",
  "maxtimekey",
])

function compareValues(a: unknown, b: unknown) {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return a === b
  }
}

function collectChangedTerminalKeys(previous: unknown, next: unknown, path: string[] = [], terminals = new Set<string>()) {
  if (compareValues(previous, next)) return terminals

  if (Array.isArray(previous) || Array.isArray(next)) {
    const previousArray = Array.isArray(previous) ? previous : []
    const nextArray = Array.isArray(next) ? next : []
    const max = Math.max(previousArray.length, nextArray.length)

    for (let index = 0; index < max; index++) {
      collectChangedTerminalKeys(previousArray[index], nextArray[index], path, terminals)
    }
    return terminals
  }

  if (isObject(previous) || isObject(next)) {
    const previousObject = isObject(previous) ? previous : {}
    const nextObject = isObject(next) ? next : {}
    const keys = new Set([...Object.keys(previousObject), ...Object.keys(nextObject)])

    Array.from(keys).forEach((key) => {
      collectChangedTerminalKeys(previousObject[key], nextObject[key], [...path, key], terminals)
    })
    return terminals
  }

  const terminal = (path[path.length - 1] || "").replace(/[^a-z0-9]/gi, "").toLowerCase()
  if (terminal) terminals.add(terminal)
  return terminals
}

export function getDataKeySyncChangeReason(previous: unknown, next: unknown): string | undefined {
  const changedTerminals = Array.from(collectChangedTerminalKeys(previous, next).values())
  if (!changedTerminals.length) return undefined

  const matching = changedTerminals.filter((key) => DATA_KEY_CHANGE_TERMINALS.has(key))
  if (!matching.length) return undefined

  return matching.length === changedTerminals.length
    ? "Published via data key reference sync"
    : "Includes data key reference sync"
}
