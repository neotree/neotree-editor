import { Title } from "@/components/title"
import { Content } from "@/components/content"
import { ChangelogManagement } from "./components"
import { getDataVersionSummaries } from "@/app/actions/change-logs"
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user"
import { getPendingDraftQueue } from "@/app/actions/ops"
import { ChangelogWorkflowRail } from "./components/workflow-rail"

export const dynamic = "force-dynamic"

export default async function ChangelogsPage({ searchParams }: { searchParams?: { q?: string } }) {
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

  return (
    <>
      <Title>Changelog Management</Title>

      <Content className="space-y-6">
        <ChangelogWorkflowRail current="releases" />
        <ChangelogManagement
          initialSummaries={summaries.data}
          initialTotal={summaries.total}
          initialLatestDataVersion={summaries.latestDataVersion ?? null}
          initialSearchValue={initialSearchValue}
          pendingDraftSummary={pendingDraftQueue.summary}
          pendingDraftLatestEntry={pendingDraftQueue.data[0]}
          isSuperUser={isSuperUser}
          currentUserId={currentUser?.userId ?? null}
        />
      </Content>
    </>
  )
}
