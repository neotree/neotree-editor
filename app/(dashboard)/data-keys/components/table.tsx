'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreVertical, PlusIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { TrashIcon } from "lucide-react";
import axios from "axios";

import { ActionsBar } from "@/components/actions-bar";
import { Loader } from "@/components/loader";
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
} from '@/lib/data-keys-filter';
import * as actions from '@/app/actions/data-keys';
import { useAppContext } from '@/contexts/app';
import { cn } from "@/lib/utils";
import { DeleteDataKeysResponse, DeleteDataKeysParams, SaveDataKeysParams } from "@/databases/mutations/data-keys";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { DataKeyForm } from "./form";
import { ExportModal } from "./export-modal";

type Props = typeof actions & {
    disabled?: boolean;
    dataKeys: DataKey[];
};

export function DataKeysTable(props: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);

    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const sortValue = (searchParamsObj.sort as typeof DEFAULT_DATA_KEYS_SORT) || DEFAULT_DATA_KEYS_SORT;
    
    const [refresh, setRefresh] = useState(false);
    const { viewOnly, } = useAppContext();

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
        setSelected([]);
    }, [data]);

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

    const { confirm, } = useConfirmModal();
    const { alert, } = useAlertModal();

    const onDelete = useCallback(async (dataKeys: (DataKey & { children: DataKey[]; })[]) => {
        try {
            setLoading(true);

            // TODO: Replace this with server action
            const response = await axios.delete<DeleteDataKeysResponse>('/api/data-keys?data='+JSON.stringify({ 
                dataKeysIds: dataKeys.map(k => k.uuid), 
                broadcastAction: true, 
            } satisfies DeleteDataKeysParams));

            const res = response.data;

            if (res.errors?.length) throw new Error(res.errors[0]);

            const children = dataKeys.reduce((acc: DataKey[], k) => [
                ...acc, 
                ...k.children.map(child => ({
                    ...child,
                    parentKeys: child.parentKeys.filter(parentKey => parentKey != k.name),
                })),
            ], []);

            if (children.length) {
                await axios.post('/api/data-keys/save', { 
                    data: children, 
                    broadcastAction: true, 
                } satisfies SaveDataKeysParams);
            }

            setSelected([]);

            router.refresh();

            alert({
                title: 'Success',
                message: 'Scripts deleted successfully!',
                variant: 'success',
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [router.refresh, alert, confirm]);

    const disabled = props.disabled || viewOnly;

    const tableProps = {
        selectedIndexes: selected,
        // title: Data keys,
        selectable: !disabled,
        sortable: false,
        loading: false,
        maxRows: undefined,
        onSelect: setSelected,
        onSort: () => {},
        // search: {
        //     inputPlaceholder: 'Search data keys',
        // },
        noDataMessage: (
            <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                <div>No data keys saved.</div>
            </div>
        ),
        getRowOptions({ rowIndex }) {
            const s = data.dataKeys[rowIndex];
            return !s ? {} : {
                className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
            };
        },
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
                cellClassName: cn('w-10'),
                cellRenderer({ rowIndex }) {
                    const dataKey = data.dataKeys[rowIndex];

                    if (!dataKey) return null;

                    const children = props.dataKeys.filter(k => k.parentKeys.includes(dataKey.name));

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
                                            {disabled ? 'View' : 'Edit'}
                                        </Link>
                                    </ddMenu.DropdownMenuItem>

                                    <ddMenu.DropdownMenuItem
                                        className="text-destructive w-full hover:bg-destructive hover:text-destructive-foreground gap-x-2"
                                        onClick={() => setTimeout(() => {
                                            confirm(() => onDelete([{ ...dataKey, children, }]), {
                                                title: 'Delete data key',
                                                message: `Are you sure you want to delete data key: <b>${dataKey.name}</b>?`,
                                                danger: true,
                                                positiveLabel: 'Yes',
                                            });
                                        }, 0)}
                                    >
                                        <>
                                            <TrashIcon className="text-destructive size-4" />
                                            Delete
                                        </>
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
            {loading && <Loader overlay />}

            {!!selected.length && (
                <ActionsBar>
                    <ExportModal 
                        uuids={data.dataKeys.filter((_, i) => selected.includes(i)).map(k => k.uuid)}
                    />

                    <Button
                        variant="destructive"
                        className="h-auto w-auto"
                        onClick={() => {
                            let keys = data.dataKeys.filter((_, i) => selected.includes(i)).map(k => ({
                                ...k,
                                children: [] as typeof k[],
                            }));

                            if (!keys.length) return;

                            keys = keys.map(k => {
                                const children = props.dataKeys.filter(k => k.parentKeys.includes(k.name)).filter(child => {
                                    return !keys.map(k => k.name).includes(child.name);
                                });
                                return { ...k, children, };
                            });

                            confirm(() => onDelete(keys), {
                                title: 'Delete data key',
                                message: `Are you sure you want to delete selected key${keys.length > 1 ? 's' : ''} (${keys.length})?`,
                                danger: true,
                                positiveLabel: 'Yes',
                            });
                        }}
                    >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Delete ${selected.length}` : 'Delete'}</span>
                    </Button>
                </ActionsBar>
            )}

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
                <div className="flex flex-col sm:flex-row sm:flex-wrap py-6 px-4 gap-2">
                    <div>
                        <h1 className="text-2xl">Data keys</h1>
                    </div>

                    <div className="sm:ml-auto flex flex-col sm:flex-row gap-2">
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

                        {disabled ? null : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>

                <Separator />

                {refresh ? <DataTable {...tableProps} /> : <DataTable {...tableProps} />}
            </div>
        </>
    );
}
