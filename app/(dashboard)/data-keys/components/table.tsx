'use client';

import {useState,useEffect,useCallback} from 'react'
import { useDataKeysCtx } from '@/contexts/data-keys';
import { DataTable, DataTableProps } from "@/components/data-table";
import { createLock } from "@/app/actions/locks";
import { LockStatus } from "../../lock-status"
import { useAppContext } from '@/contexts/app';
import { cn } from '@/lib/utils';
import { dataKeysStatuses } from '@/constants';
import { Loader } from '@/components/loader';
import { DataKeysTableHeader } from './table-header';
import { DataKeysTableRowActions } from './table-row-actions';
import { DataKeysTableBottomActions } from './table-bottom-actions';
import { DataKeyForm } from './form';
import axios from 'axios';

export function DataKeysTable({ disabled,locked }: {
    disabled: boolean;
    locked: boolean;
}) {
    const { viewOnly, } = useAppContext();
    const [lockDataKeys, setLockDataKeys] = useState<boolean>(!!locked);

    disabled = disabled || viewOnly;

    const { 
        dataKeys,
        selected,
        filter: filterValue,
        deleting,
        loadingDataKeys,
        setCurrentDataKeyUuid,
        setSelected,
    } = useDataKeysCtx();

        useEffect(() => {
        (async () => {
            try {
                if (!locked) {
                    await axios.post<Awaited<ReturnType<typeof createLock>>>('/api/locks?data=' + JSON.stringify({ script: null, lockType: 'data_key' }))
                }

            } catch (e: any) {
                alert({
                    title: "",
                    message: e.message,
                });
            }
        })();
    }, [alert, locked]);

    const handleLockStatusChange = useCallback((isLocked: boolean) => {
        setLockDataKeys(prev => {

            if (lockDataKeys !== isLocked) {
                return isLocked;
            }
            return prev;
        });
    }, []);

    const displayLoader = deleting || loadingDataKeys;

    const tableProps: DataTableProps = {
        selectable: !disabled,
        selectedIndexes: selected.map(s => s.index),
        filter: rowIndex => {
            const dataKey = dataKeys[rowIndex];
            if (!filterValue) {
                return true;
            } else if (filterValue === dataKeysStatuses[0].value) {
                return !dataKey?.isDraft;
            } else if (filterValue === dataKeysStatuses[1].value) {
                return !!dataKey?.isDraft;
            } else {
                console.log(dataKey?.dataType, filterValue);
                return dataKey?.dataType === filterValue;
            }
        },
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
        },
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

    return (
        <>
         <div className="sm:ml-auto flex flex-col sm:flex-row gap-2">  
                        <LockStatus
                                key={`data-key`}
                                scriptId={''}
                                lockType={"data_key"}
                                doneLoading={true}
                                onStatusChange={(locked: any) => handleLockStatusChange(locked)}
                            /></div>
            <div className="flex flex-col gap-y-4">
                <DataKeysTableHeader />

                <DataTable {...tableProps} />
            </div>

            <DataKeysTableBottomActions disabled={disabled} />

            {displayLoader && <Loader overlay />}
        </>
    );
}
