import { Title } from "@/components/title"
import { Content } from "@/components/content"
import { Card, CardContent } from "@/components/ui/card"
import { ChangelogManagement } from "./components"
import { getChangeLogSummaries } from "@/app/actions/change-logs"

export const dynamic = "force-dynamic"

export default async function ChangelogsPage() {
  const summaries = await getChangeLogSummaries({
    limit: 25,
    sort: "publishedAt.desc",
  })

  return (
    <>
      <Title>Changelog Management</Title>

      <Content>
        <Card className="mb-20">
          <CardContent className="p-0">
            <ChangelogManagement
              initialSummaries={summaries.data}
              initialPagination={summaries.pagination}
              activeDataVersion={summaries.activeDataVersion ?? null}
            />
          </CardContent>
        </Card>
      </Content>
    </>
  )
}
