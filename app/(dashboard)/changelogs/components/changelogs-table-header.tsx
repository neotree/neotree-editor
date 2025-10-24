"use client"

import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

type Props = {
  searchValue: string
  entityType: string
  action: string
  isActiveOnly: boolean
  sort: string
  sortOptions: { value: string; label: string }[]
  setSearchValue: (value: string) => void
  setEntityType: (value: string) => void
  setAction: (value: string) => void
  setIsActiveOnly: (value: boolean) => void
  setSort: (value: string) => void
  clearFilters: () => void
  loading: boolean
}

const entityTypeLabels = {
  script: "Script",
  screen: "Screen",
  diagnosis: "Diagnosis",
  config_key: "Config Key",
  drugs_library: "Drugs Library",
  data_key: "Data Key",
  alias: "Alias",
}

export function ChangelogsTableHeader({
  searchValue,
  entityType,
  action,
  isActiveOnly,
  sort,
  sortOptions,
  setSearchValue,
  setEntityType,
  setAction,
  setIsActiveOnly,
  setSort,
  clearFilters,
  loading,
}: Props) {
  return (
    <>
      <div className="p-4 flex flex-col gap-y-4">
        <div className="flex flex-wrap items-center">
          <div className="text-2xl">Changelogs</div>
          <div className="flex-1 flex flex-wrap items-center justify-end gap-x-4">
            <div className="w-[200px]">
              <Input
                placeholder="Search changelogs..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(entityTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="publish">Publish</SelectItem>
                    <SelectItem value="restore">Restore</SelectItem>
                    <SelectItem value="rollback">Rollback</SelectItem>
                    <SelectItem value="merge">Merge</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActiveOnly}
                  onChange={(e) => setIsActiveOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm whitespace-nowrap">Active only</span>
              </label>
            </div>

            <Button variant="outline" onClick={clearFilters} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <Separator />
    </>
  )
}