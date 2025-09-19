'use client';

import { useMemo } from 'react';
import { useQueryState } from 'nuqs';
import { PlusIcon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { DataTable, DataTableProps } from "@/components/data-table";
import { useAppContext } from '@/contexts/app';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DataKeysTableRowActions } from './row-actions';
import { DataKeysTableBottomActions } from './bottom-actions';
import { DataKeyForm } from './form';

export function DataKeysTable({ disabled, }: {
    disabled: boolean;
}) {
    const { viewOnly, } = useAppContext();

    const [currentDataKeyUuid, setCurrentDataKeyUuid] = useQueryState('uuid', {
        clearOnDefault: true,
        shallow: true,
        history: 'push',
        defaultValue: '',
    });

    disabled = disabled || viewOnly;

    const { 
        dataKeys,
        selected,
        setSelected,
    } = useDataKeysCtx();

    const tableData = useMemo(() => dataKeys.map(k => [
        k.name || '',
        k.label || '',
        k.dataType || '',
        '',
    ]), [dataKeys]);

    const tableProps: DataTableProps = {
        data: tableData,
        title: 'Data keys',
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
                    )
                }
            },
        ],
        headerActions: (
            <>
                {disabled ? null : (
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentDataKeyUuid('new')}
                        >
                            <PlusIcon className="size-4 mr-2" />
                            New data key
                        </Button>
                    </>
                )}
            </>
        ),
    };

    return (
        <>
            <DataTable {...tableProps} />

            <DataKeysTableBottomActions disabled={disabled} />

            {!!currentDataKeyUuid && (
                <DataKeyForm 
                    disabled={disabled}
                    dataKey={dataKeys.find(k => k.uuid === currentDataKeyUuid)}
                    onClose={() => setCurrentDataKeyUuid('')}
                />
            )}
        </>
    );
}
