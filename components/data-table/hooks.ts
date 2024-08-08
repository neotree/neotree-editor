import { useState, useEffect, useCallback, useRef } from "react";
import clsx from "clsx";

import { DataTableProps, FilterValue, TableState } from "./types";
import { sortRows } from "./utils/sortRows";

export function useTable({ props: _props }: {
    props: DataTableProps;
}) {
    const mounted = useRef(false);

    const { selectable, sortable, selectedIndexes, columns, data, maxRows, onSelect } = _props;

    const [state, setState] = useState<TableState>({
        selected: {},
        columns: [],
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

        setState(prev => ({
            ...prev,

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

            skeletonRows,

            rows: data.map((cells, rowIndex) => {
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
            }),
        }));

        if (!mounted.current) mounted.current = true;
    }, [columns, data, maxRows]);

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
