'use client';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { DataTable, DataTableProps } from "@/components/data-table";
import { useAppContext } from '@/contexts/app';
import { cn } from '@/lib/utils';
import { dataKeysStatuses } from '@/constants';
import { Loader } from '@/components/loader';
import { DataKeysTableHeader } from './table-header';
import { DataKeysTableRowActions } from './table-row-actions';
import { DataKeysTableBottomActions } from './table-bottom-actions';
import { useMemo } from 'react';
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
        allDataKeys,
        dataKeys,
        selected,
        filter: filterValue,
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

    // Apply global filtering and search to allDataKeys
    const filteredDataKeys = useMemo(() => {
        let filtered = [...allDataKeys];

        // Apply filter
        if (filterValue) {
            if (filterValue === dataKeysStatuses[0].value) {
                filtered = filtered.filter(dataKey => !dataKey?.isDraft);
            } else if (filterValue === dataKeysStatuses[1].value) {
                filtered = filtered.filter(dataKey => !!dataKey?.isDraft);
            } else {
                filtered = filtered.filter(dataKey => dataKey?.dataType === filterValue);
            }
        }

        // Apply search
        if (searchValue) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(dataKey => {
                const searchableFields = [
                    dataKey.name || '',
                    dataKey.label || '',
                    dataKey.refId || '',
                    dataKey.dataType || '',
                ].map(field => field.toLowerCase());
                
                return searchableFields.some(field => field.includes(searchLower));
            });
        }

        return filtered;
    }, [allDataKeys, filterValue, searchValue]);

    // Calculate pagination based on filtered results
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredDataKeys.slice(startIndex, endIndex);
    }, [filteredDataKeys, currentPage, itemsPerPage]);

    // Update pagination info
    const updatedPagination = useMemo(() => {
        const total = filteredDataKeys.length;
        const totalPages = Math.ceil(total / itemsPerPage);
        
        return {
            page: currentPage,
            totalPages,
            total,
        };
    }, [filteredDataKeys.length, itemsPerPage, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelected([]);
    };

    const displayLoader = deleting || loadingDataKeys;

    const tableProps: DataTableProps = {
        selectable: !disabled,
        selectedIndexes: selected.map(s => s.index),
        // Remove filter prop since filtering is now done globally
        onSelect: indexes => setSelected(
            indexes
                .map(i => ({
                    index: i,
                    uuid: paginatedData[i]?.uuid,
                }))
                .filter(s => s.uuid)
        ),
        getRowOptions({ rowIndex }) {
            const s = paginatedData[rowIndex];
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
        data: paginatedData.map(k => [
            k.name || '',
            k.label || '',
            k.refId || '',
            k.dataType || '',
            '',
        ]),
    };

    const renderPageNumbers = () => {
        if (!updatedPagination) return null;

        const { page, totalPages } = updatedPagination;
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
                            pageNum === page && "bg-primary text-primary-foreground hover:bg-primary/90"
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

                {updatedPagination && updatedPagination.totalPages > 1 && (
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
                                        onClick={() => handlePageChange(Math.min(updatedPagination.totalPages, currentPage + 1))}
                                        className={cn(
                                            "cursor-pointer",
                                            currentPage === updatedPagination.totalPages && "pointer-events-none opacity-50"
                                        )}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>

                        <div className="text-sm text-muted-foreground text-center">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, updatedPagination.total)} of {updatedPagination.total} entries
                        </div>
                    </div>
                )}
            </div>

            <DataKeysTableBottomActions disabled={disabled} />

            {displayLoader && <Loader overlay />}
        </>
    );
}