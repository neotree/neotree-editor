import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Content } from "@/components/content"
import { Title } from "@/components/title"
import { Card, CardContent } from "@/components/ui/card"
import { getPendingDraftQueue } from "@/app/actions/ops"
import { DraftReviewWorkspace } from "../components/draft-review-workspace"

export const dynamic = "force-dynamic"

export default async function PendingChangesPage({
  searchParams,
}: {
  searchParams?: {
    scope?: string
    tab?: string
    q?: string
    entityType?: string
    creator?: string
    sort?: string
    groupBy?: string
    page?: string
  }
}) {
  const pendingDraftQueue = await getPendingDraftQueue({
    scope: searchParams?.scope === "all" ? "all" : "mine",
    tab: searchParams?.tab as any,
    query: searchParams?.q,
    entityType: searchParams?.entityType as any,
    creator: searchParams?.creator,
    sort: searchParams?.sort as any,
    groupBy: searchParams?.groupBy as any,
    page: searchParams?.page ? Number(searchParams.page) : 1,
  })

  return (
    <>
      <Title>Draft Queue</Title>

      <Content className="space-y-6">
        <Link href="/changelogs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to published releases
        </Link>

        {pendingDraftQueue.errors?.length ? (
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-danger">{pendingDraftQueue.errors.join(", ")}</div>
            </CardContent>
          </Card>
        ) : (
          <DraftReviewWorkspace entries={pendingDraftQueue.data} summary={pendingDraftQueue.summary} meta={pendingDraftQueue.meta} />
        )}
      </Content>
    </>
  )
}
