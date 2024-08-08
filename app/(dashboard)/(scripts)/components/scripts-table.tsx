'use client';

import { DataTable } from "@/components/data-table";
import { useScriptsContext } from "@/contexts/scripts";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { BottomActions } from "./scripts-bottom-actions";
import { ScriptsTableActions } from "./scripts-table-actions";

export function ScriptsTable() {
    const { sys, viewOnly } = useAppContext();

    const {
        disabled,
        loading,
        selected,
        scripts,
        setSelected,
        onSort,
    } = useScriptsContext();

    return (
        <>
            {loading && <Loader overlay />}

            <div className="">
                <DataTable 
                    selectedIndexes={selected}
                    onSelect={setSelected}
                    title="Scripts"
                    selectable={!disabled}
                    sortable={!disabled}
                    loading={loading}
                    maxRows={25}
                    onSort={onSort}
                    getRowOptions={({ rowIndex }) => {
                        const s = scripts.data[rowIndex];
                        return !s ? {} : {
                            className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
                        };
                    }}
                    search={{
                        inputPlaceholder: 'Search scripts',
                    }}
                    noDataMessage={(
                        <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                            <div>No scripts saved.</div>
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
                            name: 'Title',
                        },
                        {
                            name: 'Description',
                        },
                        {
                            name: 'Version',
                            align: 'right',
                            cellClassName: cn('min-w-10', sys.hide_data_table_version === 'yes' && 'hidden'),
                            cellRenderer(cell) {
                                const s = scripts.data[cell.rowIndex];

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
                                const s = scripts.data[rowIndex];
                                if (!s) return null;
                                return (
                                    <ScriptsTableActions 
                                        item={s}
                                    />
                                );
                            },
                        },
                    ]}
                    data={scripts.data.map(s => [
                        s.position,
                        s.title || '',
                        s.description || '',
                        s.version,
                        '',
                    ])}
                />
            </div>

            <BottomActions />
        </>
    )
}
