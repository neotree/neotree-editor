import type { ApkReleaseDraft } from "@/databases/queries/app-updates"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import type { apkReleases } from "@/databases/pg/schema"

type ApkRelease = typeof apkReleases.$inferSelect

export function releaseSemanticKey(value: {
  apkReleaseId?: string | null
  runtimeVersion?: string | null
  versionCode?: number | null
}) {
  const runtimeVersion = `${value.runtimeVersion || ""}`.trim()
  const versionCode = Number(value.versionCode)

  if (runtimeVersion && Number.isFinite(versionCode) && versionCode > 0) {
    return `${runtimeVersion}::${versionCode}`
  }

  return value.apkReleaseId || null
}

function resolvePublishedReleaseId(
  releaseId: string | null | undefined,
  publishedRows: ApkRelease[],
  draftRows: ApkReleaseDraft[],
) {
  if (!releaseId) return null
  if (publishedRows.some((release) => release.apkReleaseId === releaseId)) return releaseId

  const draft = draftRows.find((entry) => {
    const payload = (entry.data || {}) as any
    return entry.apkReleaseDraftId === releaseId || payload.apkReleaseId === releaseId
  })
  if (!draft) return releaseId

  const draftPayload = (draft.data || {}) as any
  const semanticKey = releaseSemanticKey(draftPayload)
  const published = publishedRows.find((release) => releaseSemanticKey(release) === semanticKey)
  return published?.apkReleaseId || releaseId
}

export async function resolvePolicyReleaseReferences<T extends {
  currentApkReleaseId?: string | null
  rollbackApkReleaseId?: string | null
}>(
  executor: DbOrTransaction,
  policy: T,
) {
  const referencedReleaseIds = [policy.currentApkReleaseId, policy.rollbackApkReleaseId].filter(Boolean) as string[]
  if (!referencedReleaseIds.length) {
    return {
      resolvedPolicy: policy,
      releasesById: new Map<string, ApkRelease>(),
      errors: [] as string[],
    }
  }

  const [publishedRows, draftRows] = await Promise.all([
    executor.query.apkReleases.findMany(),
    executor.query.apkReleasesDrafts.findMany(),
  ])

  const resolvedCurrentApkReleaseId = resolvePublishedReleaseId(policy.currentApkReleaseId, publishedRows, draftRows)
  const resolvedRollbackApkReleaseId = resolvePublishedReleaseId(policy.rollbackApkReleaseId, publishedRows, draftRows)
  const resolvedPolicy = {
    ...policy,
    currentApkReleaseId: resolvedCurrentApkReleaseId,
    rollbackApkReleaseId: resolvedRollbackApkReleaseId,
  }

  const releasesById = new Map(publishedRows.map((release) => [release.apkReleaseId, release]))
  const errors: string[] = []

  if (policy.currentApkReleaseId && resolvedCurrentApkReleaseId && !releasesById.has(resolvedCurrentApkReleaseId)) {
    errors.push("Publish the selected current APK release before saving the policy")
  }
  if (policy.rollbackApkReleaseId && resolvedRollbackApkReleaseId && !releasesById.has(resolvedRollbackApkReleaseId)) {
    errors.push("Publish the selected rollback APK release before saving the policy")
  }

  return { resolvedPolicy, releasesById, errors }
}

