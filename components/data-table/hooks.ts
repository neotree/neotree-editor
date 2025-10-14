import { useState, useEffect, useCallback, useRef } from "react";
import clsx from "clsx";

import { DataTableProps, FilterValue, TableState } from "./types";
import { sortRows } from "./utils/sortRows";
import { useDebounce } from "@/hooks/use-debounce";

function getFilteredRows({
    rows,
    searchValue,
}: {
    searchValue?: string;
    rows: TableState['rows'];
}) {
    const filtered = rows
        .filter(row => {
            const json = JSON.stringify(row.cells.map(c => c.value));
            if (!searchValue) return true;
            return json.toLowerCase().includes(searchValue.toLowerCase());
        });

    return filtered;
}

export function useTable({ props: _props }: {
    props: DataTableProps;
}) {
    const mounted = useRef(false);

    const { 
        selectable, 
        sortable, 
        selectedIndexes, 
        columns, 
        data, 
        maxRows, 
        search,
        onFilteredRowsChange,
        onSelect 
    } = _props;

    const [internalSearchValue, setInternalSearchValue] = useState(''); 
    const searchValue = useDebounce(search?.value || internalSearchValue);
    const setSearchValue = useCallback((value = '') => {
        // if (search?.setValue) {
        //     search?.setValue(value);
        // } else {
        //     setInternalSearchValue(value);
        // }
        setInternalSearchValue(value);
        search?.setValue?.(value);
    }, [search]);

    const [state, setState] = useState<TableState>({
        selected: {},
        columns: [],
        unfilteredRows: [],
        rows: [],
        skeletonRows: [],
    });

    const getDefaultSelected = useCallback(() => {
        return !selectable ? 
            {} 
            : 
            { ...selectedIndexes?.reduce((acc, i) => ({ ...acc, [i]: true, }), {} as { [key: string]: boolean; }) };
    }, [selectedIndexes, selectable]);

    useEffect(() => {
        const skeletonRows: TableState['skeletonRows'] = [];
        const totalRows = maxRows || 25;
        for (let i = 0; i < totalRows; i++) {
            skeletonRows.push({
                id: `${i}`,
                rowIndex: i,
                cells: columns.map((c, colIndex) => {
                    return {
                        id: `${i}.${colIndex}`,
                        columnIndex: colIndex,
                        rowIndex: i,
                        value: '',
                    };
                }),
            });
        }

        setState(prev => {
            const rows: TableState['rows'] = data.map((cells, rowIndex) => {
                return {
                    id: `${rowIndex}`,
                    rowIndex,
                    cells: columns.map((c, colIndex) => {
                        return {
                            id: `${rowIndex}.${colIndex}`,
                            rowIndex,
                            columnIndex: colIndex,
                            value: cells[colIndex] || '',
                        };
                    }),
                };
            });

            return {
                ...prev,
                skeletonRows,
                rows,
                unfilteredRows: rows,
                columns: columns.map((c, columnIndex) => {
                    return {
                        ...c,
                        id: `${columnIndex}`,
                        columnIndex,
                        filter: null,
                        hidden: false,
                        cellClassName: clsx(c.cellClassName, 'py-2'),
                    };
                }),
            };
        });

        if (!mounted.current) mounted.current = true;
    }, [columns, data, maxRows]);

    useEffect(() => {
        if (mounted.current) {
            let filteredRows: undefined | Parameters<NonNullable<DataTableProps['onFilteredRowsChange']>>[0] = undefined;
            setState(prev => {
                const rows = getFilteredRows({ rows: prev.unfilteredRows, searchValue, });
                if (JSON.stringify(prev.rows) === (JSON.stringify(rows))) return prev;
                filteredRows = rows.map(r => ({ rowIndex: r.rowIndex, }));
                return {
                    ...prev,
                    rows,
                };
            });
            if (filteredRows) onFilteredRowsChange?.(filteredRows);
        }
    }, [state.rows, searchValue]);

    useEffect(() => {
        setState(prev => ({
            ...prev,
            selected: getDefaultSelected(),
        }));
    }, [sortable, selectedIndexes, getDefaultSelected]);

    const setSelected = useCallback((arr: number[]) => {
        let selectedIndexes: number[] = [];
        setState(prev => {
            const isAll = arr.length === prev.rows.length;
            const allSelected = Object.values(prev.selected).filter(v => v).length === prev.rows.length;
            const selected = { ...prev.selected };
            arr.forEach(n => {
                selected[n] = isAll ? !allSelected : !selected[n];
            });
            selectedIndexes = Object.keys(selected).filter(i => selected[i]).map(i => Number(i));
            return {
                ...prev,
                selected,
            };
        });
        onSelect?.(selectedIndexes);
    }, [setState, onSelect]);

    return {
        state,
        searchValue,
        setSearchValue,
        setState,
        setSelected,
        toggleColumn: (colIndex: number) => setState(prev => {
            const columns = [...prev.columns]
                .map(col => {
                    return { 
                        ...col, 
                        filter: null, 
                        hidden: col.columnIndex === colIndex ? !col.hidden : col.hidden,
                    };
                });

            return {
                ...prev,
                columns,
            };
        }),
        setFilter: (colIndex: number, value: FilterValue) => setState(prev => {
            const columns = [...prev.columns]
                .map(col => {
                    const filter = col.columnIndex === colIndex ? value : null;
                    return { ...col, filter, };
                });

            const column = columns.filter(c => c.columnIndex === colIndex)[0];

            let rows = [...prev.rows];

            if (value) {
                rows = sortRows({ rows, column });
            }

            return {
                ...prev,
                columns,
                rows,
            }
        }),
    };
}
