'use client';

import { DataTable } from "@/components/data-table";
import { useConfigKeysContext } from "@/contexts/config-keys";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { BottomActions } from "./bottom-actions";
import { ConfigKeysTableActions } from "./table-actions";
import { Form } from "./form";

export function ConfigKeysTable() {
    const { sys, viewOnly } = useAppContext();

    const {
        disabled,
        loading,
        selected,
        configKeys,
        activeItem,
        setSelected,
        onSort,
    } = useConfigKeysContext();

    return (
        <>
            {loading && <Loader overlay />}

            <div className="">
                <DataTable 
                    selectedIndexes={selected}
                    onSelect={setSelected}
                    title="Configuration"
                    selectable={!disabled}
                    sortable={!disabled}
                    loading={loading}
                    maxRows={25}
                    onSort={onSort}
                    getRowOptions={({ rowIndex }) => {
                        const s = configKeys.data[rowIndex];
                        return !s ? {} : {
                            className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
                        };
                    }}
                    search={{
                        inputPlaceholder: 'Search config keys',
                    }}
                    noDataMessage={(
                        <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                            <div>No config keys saved. To add settings, click:</div>
                            <Form />
                        </div>
                    )}
                    columns={[
                        {
                            name: 'Position',
                            cellRenderer({ rowIndex }) {
                                return rowIndex + 1;
                            },
                        },
                        {
                            name: 'Key',
                        },
                        {
                            name: 'Label',
                        },
                        {
                            name: 'Description',
                        },
                        {
                            name: 'Version',
                            align: 'right',
                            cellClassName: cn('min-w-10', sys.data.hide_data_table_version === 'yes' && 'hidden'),
                            cellRenderer(cell) {
                                const s = configKeys.data[cell.rowIndex];

                                if (!s) return null;

                                const publishedVersion = s.isDraft ? Math.max(0, (s.version - 1)) : s.version;

                                return (
                                    <div className="inline-flex items-center gap-x-[2px]">
                                        <div className={cn('w-2 h-2 rounded-full', publishedVersion ? 'bg-green-400' : 'bg-gray-300')} />
                                        <span>{publishedVersion || s.version}</span>
                                        {(!!publishedVersion && (s.version !== publishedVersion)) && <span>(Draft v{s.version})</span>}
                                    </div>
                                );
                            },
                        },
                        {
                            name: 'Action',
                            align: 'right',
                            cellClassName: 'w-10',
                            cellRenderer({ rowIndex, }) {
                                const s = configKeys.data[rowIndex];
                                if (!s) return null;
                                return (
                                    <ConfigKeysTableActions 
                                        item={s}
                                    />
                                );
                            },
                        },
                    ]}
                    data={configKeys.data.map(s => [
                        s.position,
                        s.key || '',
                        s.label || '',
                        s.summary || '',
                        s.version,
                        '',
                    ])}
                />
            </div>

            {!!configKeys.data.length && (
                <div className="fixed bottom-5 right-10">
                    <Form />
                </div>
            )}

            {!!activeItem && <Form formData={activeItem} open />}

            <BottomActions />
        </>
    )
}
