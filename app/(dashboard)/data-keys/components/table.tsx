'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, PlusIcon } from "lucide-react";

import * as ddMenu from '@/components/ui/dropdown-menu';
import { DataTable, DataTableProps } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { DataKey } from "@/databases/queries/data-keys";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_DATA_KEYS_SORT, SortDataKeysComponent, sortDataKeysFn } from '@/lib/data-keys-sort';
import { 
    DEFAULT_DATA_KEYS_FILTER, 
    FilterDataKeysComponent, 
    filterDataKeysFn, 
    getDataKeysTypes,
} from '@/lib/data-keys-filter';
import * as actions from '@/app/actions/data-keys';
import { DataKeyForm } from "./form";

type Props = typeof actions & {
    dataKeys: DataKey[];
};

export function DataKeysTable(props: Props) {
    const containerDivRef = useRef<HTMLDivElement>(null);
    const addBtnRef = useRef<HTMLButtonElement>(null);
    const [refresh, setRefresh] = useState(false);

    const [data, setDataKeys] = useState({
        sortValue: DEFAULT_DATA_KEYS_SORT,
        filter: DEFAULT_DATA_KEYS_FILTER,
        dataKeys: props.dataKeys,
    });

    const [showAddForm, setShowAddForm] = useState(false);
    const [activeDataKey, setActiveDataKey] = useState<null | {
        dataKey: DataKey & {
            children: DataKey[];
        };
        index: number;
    }>(null);

    const types = useMemo(() => getDataKeysTypes(props.dataKeys).map(k => k.value), [props.dataKeys]);

    useEffect(() => {
        setDataKeys(prev => {
            let dataKeys = sortDataKeysFn(props.dataKeys, prev.sortValue);
            dataKeys = filterDataKeysFn(dataKeys, prev.filter);

            return {
                ...prev,
                dataKeys,
            };
        });
    }, [props.dataKeys]);

    const tableProps = {
        selectedIndexes: [],
        onSelect: () => {},
        // title: Data keys,
        selectable: false,
        sortable: false,
        loading: false,
        maxRows: undefined,
        onSort: () => {},
        getRowOptions: () => ({}),
        // search: {
        //     inputPlaceholder: 'Search data keys',
        // },
        noDataMessage: (
            <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                <div>No data keys saved.</div>
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
                name: 'Data type',
            },
            {
                name: '',
                align: 'right',
                cellClassName: 'w-10 hidden', // TODO: unhide
                cellRenderer({ rowIndex }) {
                    const dataKey = data.dataKeys[rowIndex];

                    if (!dataKey) return null;

                    return (
                        <div>
                            <ddMenu.DropdownMenu>
                                <ddMenu.DropdownMenuTrigger>
                                    <MoreVertical className="size-4" />
                                </ddMenu.DropdownMenuTrigger>

                                <ddMenu.DropdownMenuContent>
                                    <ddMenu.DropdownMenuItem
                                        onClick={() => {
                                            setTimeout(() => setActiveDataKey({
                                                index: rowIndex,
                                                dataKey: {
                                                    ...dataKey,
                                                    children: props.dataKeys
                                                        .filter(k => {
                                                            return (k.parentKeys || [])
                                                                .map(k => (k || '').toLowerCase())
                                                                .includes(dataKey.name.toLowerCase());
                                                        }),
                                                }
                                            }), 0);
                                        }}
                                    >
                                        Edit
                                    </ddMenu.DropdownMenuItem>
                                </ddMenu.DropdownMenuContent>
                            </ddMenu.DropdownMenu>
                        </div>
                    );
                }
            },
        ],
        data: data.dataKeys.map(key => [
            (key.name || '').trim(),
            (key.label || key.name || '').trim(),
            (key.dataType || '').trim(),
            '',
        ]),
    } satisfies DataTableProps;

    return (
        <>
            <DataKeyForm 
                {...props}
                item={activeDataKey || undefined}
                open={showAddForm || !!activeDataKey}
                onOpenChange={() => {
                    setShowAddForm(false);
                    setActiveDataKey(null);
                }}
                types={types}
            />

            <div ref={containerDivRef}>
                <div className="flex py-6 px-4">
                    <div className="flex-1">
                        <h1 className="text-2xl">Data keys</h1>
                    </div>

                    <div className="flex items-center gap-x-2">
                        <SortDataKeysComponent 
                            dataKeys={data.dataKeys}
                            onSort={(dataKeys, sortValue) => {
                                setRefresh(true);
                                setDataKeys(prev => ({ ...prev, dataKeys, sortValue, }));
                                setTimeout(() => setRefresh(false), 0);
                            }}
                        />

                        <FilterDataKeysComponent 
                            dataKeys={props.dataKeys}
                            onFilter={(dataKeys, filter) => {
                                setRefresh(true);
                                setDataKeys(prev => {
                                    dataKeys = sortDataKeysFn(dataKeys, prev.sortValue);
                                    return { ...prev, dataKeys, filter, };
                                });
                                setTimeout(() => setRefresh(false), 0);
                            }}
                        />

                        <Button
                            ref={addBtnRef}
                            variant="ghost"
                            onClick={() => {
                                addBtnRef.current?.blur?.();
                                setTimeout(() => setShowAddForm(true), 0);
                            }}
                        >
                            <PlusIcon className="size-4" />
                            Add
                        </Button>
                    </div>
                </div>

                <Separator />

                {refresh ? <DataTable {...tableProps} /> : <DataTable {...tableProps} />}
            </div>
        </>
    );
}
