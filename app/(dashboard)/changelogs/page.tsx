import { Title } from "@/components/title"
import { Content } from "@/components/content"
import { Card, CardContent } from "@/components/ui/card"
import { ChangelogManagement } from "./components"
import { getChangeLogs } from "@/app/actions/change-logs"

export const dynamic = "force-dynamic"

export default async function ChangelogsPage() {
  const changelogs = await getChangeLogs({
    limit: 500,
    sortBy: "dateOfChange",
    sortOrder: "desc",
  })

  return (
    <>
      <Title>Changelog Management</Title>

      <Content>
        <Card className="mb-20">
          <CardContent className="p-0">
            <ChangelogManagement initialChangelogs={changelogs.data} />
          </CardContent>
        </Card>
      </Content>
    </>
  )
}
