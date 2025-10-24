"use client"

import { Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DateTimePicker } from "@/components/datetime-picker"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useChangelogsTable } from "../hooks/use-changelogs-table"


type Props = {
  filters: ReturnType<typeof useChangelogsTable>["filters"]
  setFilters: ReturnType<typeof useChangelogsTable>["setFilters"]
  onSearch: ReturnType<typeof useChangelogsTable>["onSearch"]
  clearFilters: ReturnType<typeof useChangelogsTable>["clearFilters"]
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

export function ChangelogsTableHeader({ filters, setFilters, onSearch, clearFilters, loading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        <CardDescription>Filter and search through changelog history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Search</Label>
            <Input
              placeholder="Search changelogs..."
              value={filters.searchTerm}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>

          <div>
            <Label>Entity Type</Label>
            <Select
              value={filters.entityType}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, entityType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
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
            <Label>Action</Label>
            <Select
              value={filters.action}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, action: value }))}
            >
              <SelectTrigger>
                <SelectValue />
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

          <div>
            <Label>Start Date</Label>
            <DateTimePicker
              type="date"
              value={filters.startDate}
              max={new Date()}
              onChange={(value) => setFilters((prev) => ({ ...prev, startDate: value.date! }))}
            />
          </div>

          <div>
            <Label>End Date</Label>
            <DateTimePicker
              type="date"
              disabled={!filters.startDate}
              min={filters.startDate || undefined}
              max={new Date()}
              value={filters.endDate}
              onChange={(value) => setFilters((prev) => ({ ...prev, endDate: value.date! }))}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isActiveOnly}
                onChange={(e) => setFilters((prev) => ({ ...prev, isActiveOnly: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Active versions only</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={onSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" onClick={clearFilters} disabled={loading}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
