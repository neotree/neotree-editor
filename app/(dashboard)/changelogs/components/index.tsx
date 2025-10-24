"use client"

import { ChangelogsTableHeader } from "./changelogs-table-header"
import { ChangelogsTable } from "./changelogs-table"
import { useChangelogsTable, UseChangelogsTableParams } from "../hooks/use-changelogs-table"

type Props = UseChangelogsTableParams

export function ChangelogManagement(props: Props) {
  const {
    changelogs,
    loading,
    expandedItems,
    selectedChangelog,
    entityHistory,
    filters,
    setFilters,
    onSearch,
    toggleExpanded,
    viewDetails,
    onRollback,
    onExport,
    clearFilters,
    setSelectedChangelog,
  } = useChangelogsTable(props)

  return (
    <div className="p-6 space-y-6">
      <ChangelogsTableHeader
        filters={filters}
        setFilters={setFilters}
        onSearch={onSearch}
        clearFilters={clearFilters}
        loading={loading}
      />

      <ChangelogsTable
        initialChangelogs={props.initialChangelogs}
        changelogs={changelogs}
        loading={loading}
        expandedItems={expandedItems}
        selectedChangelog={selectedChangelog}
        entityHistory={entityHistory}
        toggleExpanded={toggleExpanded}
        viewDetails={viewDetails}
        onRollback={onRollback}
        onExport={onExport}
        setSelectedChangelog={setSelectedChangelog}
      />
    </div>
  )
}
