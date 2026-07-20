"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

type Props = {
  page: number
  totalPages: number
  total: number
  pageSize: number
  // Plural noun for the "Showing X to Y of Z ..." line, e.g. "releases"
  itemNoun: string
  onPageChange: (page: number) => void
}

// Single pagination treatment for all list/table views so pages don't drift apart:
// numbered pages with ellipsis, previous/next, and a "Showing X to Y of Z" summary.
export function TablePagination({ page, totalPages, total, pageSize, itemNoun, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const pages: (number | "ellipsis")[] = [1]

  if (totalPages <= 7) {
    for (let i = 2; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (page > 3) {
      pages.push("ellipsis")
    }

    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis")
    }

    pages.push(totalPages)
  }

  const firstShown = (page - 1) * pageSize + 1
  const lastShown = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={cn("cursor-pointer", page === 1 && "pointer-events-none opacity-50")}
            />
          </PaginationItem>

          {pages.map((pageNum, idx) => {
            if (pageNum === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink onClick={() => onPageChange(pageNum)} isActive={pageNum === page} className="cursor-pointer">
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className={cn("cursor-pointer", page === totalPages && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="text-sm text-muted-foreground text-center">
        Showing {firstShown} to {lastShown} of {total} {itemNoun}
      </div>
    </div>
  )
}
