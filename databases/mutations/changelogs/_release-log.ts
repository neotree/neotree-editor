import { type SaveChangeLogData } from "./_save-change-log"

export const RELEASE_CHANGELOG_ENTITY_ID = "00000000-0000-0000-0000-000000000000"

export function buildReleasePublishChangeLog(params: {
  dataVersion: number
  userId: string
  publishedAt?: Date
  description?: string
  changeReason?: string
  previousSnapshot?: Record<string, unknown>
  changes?: any[]
}): SaveChangeLogData {
  const publishedAt = params.publishedAt ?? new Date()
  const description = params.description ?? `Release v${params.dataVersion} published`
  const changeReason = params.changeReason ?? description
  const changes =
    params.changes ??
    [
      {
        action: "publish",
        description,
        fromDataVersion: params.dataVersion - 1,
        toDataVersion: params.dataVersion,
      },
    ]

  return {
    entityId: RELEASE_CHANGELOG_ENTITY_ID,
    entityType: "release",
    action: "publish",
    dataVersion: params.dataVersion,
    changes,
    fullSnapshot: {
      dataVersion: params.dataVersion,
      publishedAt: publishedAt.toISOString(),
      publishedBy: params.userId,
    },
    previousSnapshot: params.previousSnapshot ?? {},
    baselineSnapshot: {
      dataVersion: params.dataVersion,
      publishedAt: publishedAt.toISOString(),
      publishedBy: params.userId,
    },
    description,
    changeReason,
    isActive: false,
    userId: params.userId,
  }
}
