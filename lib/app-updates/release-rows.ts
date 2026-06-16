import type { ApkReleaseDraft } from "@/databases/queries/app-updates"
import type { apkReleases } from "@/databases/pg/schema"
import { releaseSemanticKey } from "@/lib/app-updates/policy-release-resolution"

type ApkRelease = typeof apkReleases.$inferSelect

export type AppUpdateReleaseRow = ApkRelease & {
  __draft: boolean
  __draftId?: string
  __updatedAt?: string | Date | null
}

export function buildAppUpdateReleaseRows(apkReleases: ApkRelease[], apkReleaseDrafts: ApkReleaseDraft[]): AppUpdateReleaseRow[] {
  const byKey = new Map<string, AppUpdateReleaseRow>()

  const sortedDrafts = [...apkReleaseDrafts].sort((a, b) => {
    const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return bDate - aDate
  })

  for (const draft of sortedDrafts) {
    const payload = (draft.data || {}) as Partial<ApkRelease>
    const row: AppUpdateReleaseRow = {
      ...(payload as ApkRelease),
      apkReleaseId: payload.apkReleaseId || draft.apkReleaseDraftId,
      __draft: true,
      __draftId: draft.apkReleaseDraftId,
      __updatedAt: draft.updatedAt || draft.createdAt,
    }
    const key = releaseSemanticKey(row)
    if (!key || byKey.has(key)) continue
    byKey.set(key, row)
  }

  for (const release of apkReleases) {
    const row: AppUpdateReleaseRow = {
      ...release,
      __draft: false,
    }
    const key = releaseSemanticKey(row)
    if (!key || byKey.has(key)) continue
    byKey.set(key, row)
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const aDate = new Date(a.__updatedAt || a.updatedAt || a.createdAt || 0).getTime()
    const bDate = new Date(b.__updatedAt || b.updatedAt || b.createdAt || 0).getTime()
    return bDate - aDate
  })
}
