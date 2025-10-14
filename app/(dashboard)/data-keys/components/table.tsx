'use client';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { DataTable, DataTableProps } from "@/components/data-table";
import { useAppContext } from '@/contexts/app';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/loader';
import { DataKeysTableHeader } from './table-header';
import { DataKeysTableRowActions } from './table-row-actions';
import { DataKeysTableBottomActions } from './table-bottom-actions';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";


export function DataKeysTable({ disabled, }: {
    disabled: boolean;
}) {
    const { viewOnly, } = useAppContext();

    disabled = disabled || viewOnly;

    const { 
        dataKeys,
        selected,
        deleting,
        loadingDataKeys,
        setCurrentDataKeyUuid,
        setSelected,
        pagination,
        currentPage,
        itemsPerPage,
        setCurrentPage,
        searchValue,
        setSearchValue,
    } = useDataKeysCtx();

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelected([]);
    };

    const displayLoader = deleting || loadingDataKeys;

    const tableProps: DataTableProps = {
        selectable: !disabled,
        selectedIndexes: selected.map(s => s.index),
        onSelect: indexes => setSelected(
            indexes
                .map(i => ({
                    index: i,
                    uuid: dataKeys[i]?.uuid,
                }))
                .filter(s => s.uuid)
        ),
        getRowOptions({ rowIndex }) {
            const s = dataKeys[rowIndex];
            return !s ? {} : {
                className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
            };
        },
        search: {
            inputPlaceholder: 'Search data keys',
            value: searchValue,
            setValue: setSearchValue,
        },
        noDataMessage: (
            <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                <div>No data keys found.</div>
            </div>
        ),
        columns: [
            {
                name: 'Key',
            },
            {
                name: 'Label',
            },
            {
                name: 'Ref ID',
                cellClassName: 'hidden',
            },
            {
                name: 'Data type',
            },
            {
                name: '',
                align: 'right',
                cellClassName: cn('w-10'),
                cellRenderer({ rowIndex }) {
                    return (
                        <DataKeysTableRowActions 
                            rowIndex={rowIndex} 
                            disabled={disabled} 
                            setCurrentDataKeyUuid={setCurrentDataKeyUuid}
                        />
                    );
                }
            },
        ],
        data: dataKeys.map(k => [
            k.name || '',
            k.label || '',
            k.refId || '',
            k.dataType || '',
            '',
        ]),
    };

    const renderPageNumbers = () => {
        if (!pagination) return null;

        const { page, totalPages } = pagination;
        const pages: (number | 'ellipsis')[] = [];

        pages.push(1);

        if (totalPages <= 7) {
            for (let i = 2; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (page > 3) {
                pages.push('ellipsis');
            }

            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                pages.push(i);
            }

            if (page < totalPages - 2) {
                pages.push('ellipsis');
            }

            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages.map((pageNum, idx) => {
            if (pageNum === 'ellipsis') {
                return (
                    <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            return (
                <PaginationItem key={pageNum}>
                    <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={pageNum === page}
                        className={cn(
                            "cursor-pointer",
                        )}
                    >
                        {pageNum}
                    </PaginationLink>
                </PaginationItem>
            );
        });
    };

    return (
        <>
            <div className="flex flex-col gap-y-4">
                <DataKeysTableHeader />

                <DataTable {...tableProps} />

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex flex-col gap-2">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        className={cn(
                                            "cursor-pointer",
                                            currentPage === 1 && "pointer-events-none opacity-50"
                                        )}
                                    />
                                </PaginationItem>

                                {renderPageNumbers()}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                                        className={cn(
                                            "cursor-pointer",
                                            currentPage === pagination.totalPages && "pointer-events-none opacity-50"
                                        )}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>

                        <div className="text-sm text-muted-foreground text-center">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} entries
                        </div>
                    </div>
                )}
            </div>

            <DataKeysTableBottomActions disabled={disabled} />

            {displayLoader && <Loader overlay />}
        </>
    );
}