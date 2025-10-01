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
import { DataKeyForm } from './form';

export function DataKeysTable({ disabled, }: {
    disabled: boolean;
}) {
    const { viewOnly, } = useAppContext();

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
            <div className="flex flex-col gap-y-4">
                <DataKeysTableHeader />

                <DataTable {...tableProps} />
            </div>

            <DataKeysTableBottomActions disabled={disabled} />

            {displayLoader && <Loader overlay />}
        </>
    );
}
