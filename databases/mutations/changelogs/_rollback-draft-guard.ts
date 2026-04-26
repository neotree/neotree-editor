import { sql } from "drizzle-orm"

import db from "@/databases/pg/drizzle"

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export type RollbackDraftConflictReport = {
  totalPendingChanges: number
  totalUsers: number
  userSummaries: Array<{
    userId: string
    displayName: string | null
    email: string | null
    totalPendingChanges: number
  }>
  sourceSummaries: Array<{
    source: string
    totalPendingChanges: number
  }>
}

export function buildRollbackDraftConflictMessage(report: RollbackDraftConflictReport) {
  const userSummary = report.userSummaries
    .slice(0, 3)
    .map((user) => {
      const label = user.displayName?.trim() || user.email?.trim() || "Another user"
      return `${label} (${user.totalPendingChanges})`
    })
    .join(", ")

  const sourceSummary = report.sourceSummaries
    .filter((source) => source.totalPendingChanges > 0)
    .slice(0, 4)
    .map((source) => `${source.totalPendingChanges} ${source.source}`)
    .join(", ")

  return [
    `Rollback is blocked because ${report.totalUsers === 1 ? "another user has" : "other users have"} unpublished changes saved in drafts.`,
    `Please ask them to publish or discard those changes first, then retry the rollback.`,
    userSummary ? `Users: ${userSummary}.` : null,
    sourceSummary ? `Pending work: ${sourceSummary}.` : null,
  ]
    .filter(Boolean)
    .join(" ")
}

export async function getRollbackDraftConflictReport(tx: Tx, currentUserId: string): Promise<RollbackDraftConflictReport> {
  const draftSources = sql`
    with draft_sources as (
      select created_by_user_id as user_id, 'script drafts' as source from nt_scripts_drafts where created_by_user_id is not null and created_by_user_id <> ${currentUserId}
      union all
      select created_by_user_id as user_id, 'screen drafts' as source from nt_screens_drafts where created_by_user_id is not null and created_by_user_id <> ${currentUserId}
      union all
      select created_by_user_id as user_id, 'diagnosis drafts' as source from nt_diagnoses_drafts where created_by_user_id is not null and created_by_user_id <> ${currentUserId}
      union all
      select created_by_user_id as user_id, 'problem drafts' as source from nt_problems_drafts where created_by_user_id is not null and created_by_user_id <> ${currentUserId}
      union all
      select created_by_user_id as user_id, 'configuration drafts' as source from nt_config_keys_drafts where created_by_user_id is not null and created_by_user_id <> ${currentUserId}
      union all
      select created_by_user_id as user_id, 'hospital drafts' as source from nt_hospitals_drafts where created_by_user_id is not null and created_by_user_id <> ${currentUserId}
      union all
      select created_by_user_id as user_id, 'drug library drafts' as source from nt_drugs_library_drafts where created_by_user_id is not null and created_by_user_id <> ${currentUserId}
      union all
      select created_by_user_id as user_id, 'data key drafts' as source from nt_data_keys_drafts where created_by_user_id is not null and created_by_user_id <> ${currentUserId}
      union all
      select created_by_user_id as user_id, 'queued deletions' as source from nt_pending_deletion where created_by_user_id is not null and created_by_user_id <> ${currentUserId}
    )
  `

  const [userRows, sourceRows] = await Promise.all([
    tx.execute<{
      userId: string
      displayName: string | null
      email: string | null
      totalPendingChanges: number
    }>(sql`
      ${draftSources}
      select
        draft_sources.user_id as "userId",
        max(nt_users.display_name) as "displayName",
        max(nt_users.email) as "email",
        count(*)::int as "totalPendingChanges"
      from draft_sources
      left join nt_users on nt_users.user_id = draft_sources.user_id
      group by draft_sources.user_id
      order by count(*) desc, max(nt_users.display_name) asc nulls last
    `),
    tx.execute<{
      source: string
      totalPendingChanges: number
    }>(sql`
      ${draftSources}
      select
        draft_sources.source as "source",
        count(*)::int as "totalPendingChanges"
      from draft_sources
      group by draft_sources.source
      order by count(*) desc, draft_sources.source asc
    `),
  ])

  const userSummaries = userRows.map((row) => ({
    userId: row.userId,
    displayName: row.displayName,
    email: row.email,
    totalPendingChanges: Number(row.totalPendingChanges) || 0,
  }))

  const sourceSummaries = sourceRows.map((row) => ({
    source: row.source,
    totalPendingChanges: Number(row.totalPendingChanges) || 0,
  }))

  return {
    totalPendingChanges: userSummaries.reduce((sum, row) => sum + row.totalPendingChanges, 0),
    totalUsers: userSummaries.length,
    userSummaries,
    sourceSummaries,
  }
}

export async function assertRollbackAllowedWithDrafts(tx: Tx, currentUserId: string) {
  const report = await getRollbackDraftConflictReport(tx, currentUserId)
  if (report.totalPendingChanges <= 0) return

  throw new Error(buildRollbackDraftConflictMessage(report))
}
