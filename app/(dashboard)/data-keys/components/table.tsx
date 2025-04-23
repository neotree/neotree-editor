'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
import queryString from "query-string";

type Props = typeof actions & {
    dataKeys: DataKey[];
};

export function DataKeysTable(props: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const sortValue = (searchParamsObj.sort as typeof DEFAULT_DATA_KEYS_SORT) || DEFAULT_DATA_KEYS_SORT;
    
    const [refresh, setRefresh] = useState(false);

    const [data, setDataKeys] = useState({
        sortValue: sortValue,
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
                cellClassName: 'w-10',
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
                                    <ddMenu.DropdownMenuItem asChild>
                                        <Link
                                            href={`/data-keys/key/${dataKey.uuid}`}
                                        >
                                            Edit
                                        </Link>
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
                modal
                item={activeDataKey || undefined}
                open={showAddForm || !!activeDataKey}
                onOpenChange={() => {
                    setShowAddForm(false);
                    setActiveDataKey(null);
                }}
            />

            <div>
                <div className="flex py-6 px-4">
                    <div className="flex-1">
                        <h1 className="text-2xl">Data keys</h1>
                    </div>

                    <div className="flex items-center gap-x-2">
                        <SortDataKeysComponent 
                            value={sortValue}
                            dataKeys={data.dataKeys}
                            onSort={(dataKeys, sortValue) => {
                                setRefresh(true);
                                setDataKeys(prev => ({ ...prev, dataKeys, sortValue, }));
                                setTimeout(() => setRefresh(false), 0);
                                router.push('/data-keys?' + queryString.stringify({
                                    ...searchParamsObj,
                                    sort: sortValue,
                                }));
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
                            asChild
                            variant="ghost"
                        >
                            <Link
                                href="/data-keys/add"
                            >
                                <PlusIcon className="size-4" />
                                Add
                            </Link>
                        </Button>
                    </div>
                </div>

                <Separator />

                {refresh ? <DataTable {...tableProps} /> : <DataTable {...tableProps} />}
            </div>
        </>
    );
}
