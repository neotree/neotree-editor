import { Title } from "@/components/title"
import { Content } from "@/components/content"
import { Card, CardContent } from "@/components/ui/card"
import { ChangelogManagement } from "./components"
import { getDataVersionSummaries } from "@/app/actions/change-logs"
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user"

export const dynamic = "force-dynamic"

export default async function ChangelogsPage() {
  const summaries = await getDataVersionSummaries({
    limit: 25,
    offset: 0,
    sortBy: "publishedAt",
    sortOrder: "desc",
  })
  const currentUser = await getAuthenticatedUser()
  const isSuperUser = currentUser?.role === "super_user"

  return (
    <>
      <Title>Changelog Management</Title>

      <Content>
        <Card className="mb-20">
          <CardContent className="p-0">
            <ChangelogManagement
              initialSummaries={summaries.data}
              initialTotal={summaries.total}
              initialLatestDataVersion={summaries.latestDataVersion ?? null}
              isSuperUser={isSuperUser}
            />
          </CardContent>
        </Card>
      </Content>
    </>
  )
}
