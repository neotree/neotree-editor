import { AlertTriangle } from "lucide-react"

import { Title } from "@/components/title"
import { Content } from "@/components/content"
import { Card, CardContent } from "@/components/ui/card"
import { ChangelogManagement } from "./components"
import { getDataVersionSummaries } from "@/app/actions/change-logs"
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user"
import { getPendingDraftQueue } from "@/app/actions/ops"

export const dynamic = "force-dynamic"

type SearchParams = {
  q?: string
  entityType?: string
  action?: string
  sort?: string
  page?: string
}

export default async function ChangelogsPage({ searchParams }: { searchParams?: SearchParams }) {
  const summaries = await getDataVersionSummaries({
    limit: 25,
    offset: 0,
    sortBy: "publishedAt",
    sortOrder: "desc",
  })
  const pendingDraftQueue = await getPendingDraftQueue()
  const currentUser = await getAuthenticatedUser()
  const isSuperUser = currentUser?.role === "super_user"
  const initialSearchValue = typeof searchParams?.q === "string" ? searchParams.q.trim() : ""

  // Drafts saved before a rollback still reflect the pre-rollback state; publishing them
  // would silently reapply what was just rolled back, so keep warning until they're handled.
  const latestSummary = summaries.data.find((entry) => entry.dataVersion === summaries.latestDataVersion)
  const latestReleaseIsRollback = !!latestSummary?.rollbackSourceVersion || !!latestSummary?.rollbackEntity
  const rollbackPublishedAt = latestReleaseIsRollback && latestSummary?.publishedAt ? new Date(latestSummary.publishedAt) : null
  const ownStaleDraftCount = rollbackPublishedAt
    ? pendingDraftQueue.data.filter(
        (entry) => entry.createdByUserId === currentUser?.userId && new Date(entry.createdAt) < rollbackPublishedAt,
      ).length
    : 0

  return (
    <>
      <Title>Changelogs</Title>

      <Content>
        {ownStaleDraftCount > 0 && latestSummary && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span className="font-semibold">
                You have {ownStaleDraftCount} unpublished draft{ownStaleDraftCount === 1 ? "" : "s"} saved before the latest rollback
                (v{latestSummary.dataVersion}).
              </span>{" "}
              They still reflect the pre-rollback state — publishing them will reapply the changes that were rolled back. Review or
              discard them before the next publish.
            </div>
          </div>
        )}

        <Card className="mb-20">
          <CardContent className="p-0">
            <ChangelogManagement
              initialSummaries={summaries.data}
              initialTotal={summaries.total}
              initialLatestDataVersion={summaries.latestDataVersion ?? null}
              initialSearchValue={initialSearchValue}
              initialEntityType={typeof searchParams?.entityType === "string" ? searchParams.entityType : undefined}
              initialAction={typeof searchParams?.action === "string" ? searchParams.action : undefined}
              initialSort={typeof searchParams?.sort === "string" ? searchParams.sort : undefined}
              initialPage={searchParams?.page ? Number(searchParams.page) : undefined}
              pendingDraftCount={pendingDraftQueue.summary.totalEntries}
              isSuperUser={isSuperUser}
              currentUserId={currentUser?.userId ?? null}
            />
          </CardContent>
        </Card>
      </Content>
    </>
  )
}
