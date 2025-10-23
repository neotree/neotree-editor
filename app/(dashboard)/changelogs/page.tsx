import { Title } from "@/components/title"
import { ChangelogManagementContent } from "./components/content"
import { getChangeLogs, searchChangeLogs, getEntityHistory } from "@/app/actions/change-logs"

export const dynamic = "force-dynamic"

export default async function ChangelogsPage() {
  return (
    <>
      <Title>Changelog Management</Title>
      <ChangelogManagementContent
        _getChangeLogs={getChangeLogs}
        _searchChangeLogs={searchChangeLogs}
        _getEntityHistory={getEntityHistory}
      />
    </>
  )
}
