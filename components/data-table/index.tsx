'use client';

import SortableList, { SortableItem, SortableKnob } from 'react-easy-sort';
import { arrayMoveImmutable } from 'array-move';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Move } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useTable } from "./hooks";
import type { DataTableProps, } from './types';
import { FilterText } from "./filter-text";
import { DataTableHeader } from './header';

export {
    type DataTableProps,
};

export const DataTable = (props: DataTableProps) => {
    const { selectable = false, loading, sortable, tableClassname, tableRowClassname, tableBodyClassname, onSort, searchKeys } = props;

    const tBodyRef = useRef<HTMLTableSectionElement>(null);

    const table = useTable({ props });
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const {
        state: { columns, rows, skeletonRows, selected },
        setState,
        setFilter,
        setSelected,
        toggleColumn,
    } = table;

    const displayRows = useMemo(() => loading ? skeletonRows : rows, [loading, skeletonRows, rows]);

    const searchableColumns = useMemo(() => {
        return columns
            .filter(col => !col.hidden && col.name &&
                (/title|name|key|ref|hospital|field|type/i.test(String(col.name))))
            .map(col => col.columnIndex);
    }, [columns]);

    const handleSearch = useCallback((value: string) => {
        setSearchValue(value.toLowerCase());
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchValue]);

    // const filterRows = useCallback((rows: typeof displayRows, term: string) => {
    //     if (!term.trim()) return rows;
    //     const lowerTerm = term.toLowerCase();

    //     return rows.filter(row => {
    //         for (const colIndex of searchableColumns) {
    //             const cell = row.cells[colIndex];
    //             const cellValue = cell?.value;

    //             if (cellValue != null &&
    //                 String(cellValue).toLowerCase().includes(lowerTerm)) {
    //                 return true;
    //             }
    //         }
    //         return false;
    //     });


    // }, [searchableColumns]);

    const filterRows = useCallback(
        (
            rows: typeof displayRows,
            term: string,
        ) => {
            if (!term.trim()) return rows;
            const lowerTerm = term.toLowerCase();
                
            return rows.filter(row => {
                for (const colIndex of searchableColumns) {
                    const cell = row.cells[colIndex];
                    const cellValue = cell?.value;

                    if (
                        cellValue != null &&
                        String(cellValue).toLowerCase().includes(lowerTerm)
                    ) {
                        return true;
                    }
                }
                const positionCol = row.cells[0]?.value;
           
                if (positionCol != null) {
                    const match = searchKeys?.find(
                        sk => String(sk.position) === String(positionCol)
                    );
                    if (match && match.keys.some(k => k.toLowerCase().includes(lowerTerm))) {
                        return true;
                    }
                }


                return false;
            });
        },
        [searchableColumns]
    );



    // Final filtered rows
    const filteredRows = useMemo(() => {
        return filterRows(displayRows, debouncedSearch);
    }, [displayRows, debouncedSearch, filterRows]);

    const onSortEnd = useCallback((oldIndex: number, newIndex: number) => {
        let sorted: { oldIndex: number, newIndex: number; }[] = [];
        setState(prev => {
            const sortedRows = arrayMoveImmutable([...prev.rows], oldIndex, newIndex);
            sorted = sortedRows.map((row, newIndex) => ({
                oldIndex: row.rowIndex,
                newIndex,
            }));
            return {
                ...prev,
                rows: sortedRows,
            };
        });
        onSort?.(oldIndex, newIndex, sorted);
        setSelected([]);
    }, [setState, onSort, setSelected]);

    return (
        <>
            <DataTableHeader {...props}
                search={{
                    ...props.search,
                    onSearch: handleSearch,
                }}
            />

            <SortableList
                allowDrag={!!sortable}
                onSortEnd={onSortEnd}
                draggedItemClassName="opacity-90 z-[9999999999999]"
                customHolderRef={tBodyRef}
            >
                <div className="space-y-4">
                    <Table className={cn('w-full overflow-x-auto', tableClassname)}>
                        <TableHeader
                            className={cn(
                                props.theadClassName,
                            )}
                        >
                            <TableRow>
                                {selectable && (
                                    <TableHead
                                        className={cn(columns[0]?.cellClassName, 'w-8')}
                                    >
                                        <Checkbox
                                            disabled={loading}
                                            checked={!!filteredRows.length && (Object.values(selected).filter(v => v).length === filteredRows.length)}
                                            onCheckedChange={() => setSelected(filteredRows.map(r => r.rowIndex))}
                                        />
                                    </TableHead>
                                )}

                                {sortable && (
                                    <TableHead
                                        className={cn(columns[0]?.cellClassName, 'w-4')}
                                    />
                                )}

                                {columns.map((col) => {
                                    return (
                                        <TableHead
                                            key={col.id}
                                            colSpan={col.colSpan}
                                            align={col.align}
                                            className={cn(
                                                props.cellClassName,
                                                props.thClassName,
                                                col.cellClassName,
                                                col.thClassName,
                                                'px-2',
                                                col.hidden ? 'hidden' : '',
                                                col.align ? ({
                                                    left: 'text-left',
                                                    center: 'text-center',
                                                    right: 'text-right',
                                                    justify: 'text-justify',
                                                    char: '',
                                                })[col.align] : '',
                                            )}
                                        >
                                            {(() => {
                                                switch (col.filterType) {
                                                    case 'number':
                                                    case 'text':
                                                        return (
                                                            <FilterText
                                                                column={col}
                                                                value={col.filter}
                                                                onFilter={value => {
                                                                    if (value === 'hide') {
                                                                        toggleColumn(col.columnIndex);
                                                                    } else {
                                                                        setFilter(col.columnIndex, value);
                                                                    }
                                                                }}
                                                            />
                                                        );
                                                    default:
                                                        return (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="
                                                                    focus-visible:ring-0 
                                                                    focus-visible:ring-transparent 
                                                                    focus-visible:ring-offset-0
                                                                    hover:bg-transparent
                                                                    hover:text-primary
                                                                "
                                                            >
                                                                {col.name || ''}
                                                            </Button>
                                                        );
                                                }
                                            })()}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        </TableHeader>

                        <TableBody ref={tBodyRef} className={tableBodyClassname}>
                            {!filteredRows.length && (
                                <TableRow className="p-0">
                                    <TableCell
                                        colSpan={columns.length + (selectable ? 1 : 0) + (sortable ? 1 : 0)}
                                        className="p-4 text-center text-muted-foreground"
                                    >
                                        {props.noDataMessage || 'No data to display'}
                                    </TableCell>
                                </TableRow>
                            )}

                            {filteredRows.map((row) => {
                                const rowProps = { ...props.getRowOptions?.({ rowIndex: row.rowIndex, }), };

                                return (
                                    <SortableItem key={row.id}>
                                        <TableRow
                                            {...rowProps}
                                            className={cn(
                                                props.trClassName,
                                                'hover:bg-primary/10',
                                                selected[row.rowIndex] ? 'bg-primary/10' : '',
                                                tableRowClassname,
                                                rowProps.className,
                                            )}
                                        >
                                            {selectable && (
                                                <TableCell
                                                    className={cn(columns[0]?.cellClassName, 'w-8')}
                                                >
                                                    <Checkbox
                                                        disabled={loading}
                                                        checked={!!selected[row.rowIndex]}
                                                        onCheckedChange={() => setSelected([row.rowIndex])}
                                                    />
                                                </TableCell>
                                            )}

                                            {sortable && (
                                                <TableCell
                                                    className={cn(columns[0]?.cellClassName, 'w-4 cursor-move')}
                                                >
                                                    <SortableKnob>
                                                        <Move className="w-4 h-4 text-muted-foreground" />
                                                    </SortableKnob>
                                                </TableCell>
                                            )}

                                            {row.cells.map((cell: any) => {
                                                const col = columns[cell.columnIndex];
                                                const cellProps = { ...props.getCellOptions?.({ rowIndex: row.rowIndex, columnIndex: cell.columnIndex }), };

                                                return (
                                                    <TableCell
                                                        {...cellProps}
                                                        key={cell.id}
                                                        colSpan={col.colSpan}
                                                        align={col.align}
                                                        className={cn(
                                                            props.cellClassName,
                                                            props.tdClassName,
                                                            col.cellClassName,
                                                            col.tdClassName,
                                                            'px-4',
                                                            cellProps.className,
                                                            col.hidden ? 'hidden' : '',
                                                        )}
                                                    >
                                                        {loading ? (
                                                            <Skeleton className="h-4 w-[120px] bg-black/10 dark:bg-white/10" />
                                                        ) : col.cellRenderer?.(cell) || cell.value}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    </SortableItem>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </SortableList>
        </>
    );
};
