'use client';

import { useMemo } from 'react';
import { useQueryState } from 'nuqs';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { DataTable, DataTableProps } from "@/components/data-table";
import { useAppContext } from '@/contexts/app';
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
        columns: [
            {
                name: 'Key',
            },
            {
                name: 'Label',
            },
            {
                name: 'Type',
            },
            {
                name: '',
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
