import { createHash } from "crypto"

// Server-side only. Kept out of lib/changelog-rollback.ts because client components import
// the rollback policy helpers from there, and a top-level Node `crypto` import makes webpack
// bundle crypto-browserify (and its vm/eval polyfill) into the browser.

function normalizeSnapshotValueForHash(snapshot: any): any {
  if (snapshot instanceof Date) return snapshot.toISOString()

  if (Array.isArray(snapshot)) {
    return snapshot.map((value) => {
      if (value === undefined || typeof value === "function" || typeof value === "symbol") return null
      return normalizeSnapshotValueForHash(value)
    })
  }

  if (snapshot && typeof snapshot === "object") {
    return Object.keys(snapshot)
      .sort()
      .reduce<Record<string, any>>((acc, key) => {
        const value = snapshot[key]
        if (value === undefined || typeof value === "function" || typeof value === "symbol") return acc
        acc[key] = normalizeSnapshotValueForHash(value)
        return acc
      }, {})
  }

  if (typeof snapshot === "number" && !Number.isFinite(snapshot)) return null
  if (typeof snapshot === "bigint") return snapshot.toString()
  return snapshot
}

export function computeRollbackSnapshotHash(snapshot: any) {
  const normalizedSnapshot = normalizeSnapshotValueForHash(snapshot ?? {})
  return createHash("sha256").update(JSON.stringify(normalizedSnapshot)).digest("hex")
}
