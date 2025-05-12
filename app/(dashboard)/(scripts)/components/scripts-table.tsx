'use client';

import { Edit } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { useScriptsContext } from "@/contexts/scripts";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { ScriptsTableBottomActions } from "./scripts-table-bottom-actions";
import { ScriptsTableActions } from "./scripts-table-row-actions";
import { ScriptsExportModal } from "./scripts-export-modal";
import { ScriptsFab } from "./scripts-fab";
import { UseScriptsTableParams, useScriptsTable } from "../hooks/use-scripts-table";
import { ScriptsTableHeaderActions } from "./scripts-table-header-actions";

type Props = UseScriptsTableParams;

export function ScriptsTable(props: Props) {
    const {
        scripts,
        selected,
        loading,
        scriptsIdsToExport,
        disabled,
        setSelected,
        setScriptsIdsToExport,
        onDelete,
        onSort,
        onDuplicate,
    } = useScriptsTable(props);

    const { sys, viewOnly } = useAppContext();
    const { hospitals, } = useScriptsContext();

    return (
        <>
            {loading && <Loader overlay />}

            {!!scriptsIdsToExport.length && (
                <ScriptsExportModal 
                    open 
                    scriptsIdsToExport={scriptsIdsToExport}
                    onOpenChange={() => setScriptsIdsToExport([])} 
                    setScriptsIdsToExport={setScriptsIdsToExport}
                />
            )}

            <ScriptsFab disabled={disabled} />

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
                    // headerActions={<ScriptsTableHeaderActions />}
                    getRowOptions={({ rowIndex }) => {
                        const s = scripts.data[rowIndex];
                        return !s ? {} : {
                            className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
                        };
                    }}
                    // search={{
                    //     inputPlaceholder: 'Search scripts',
                    // }}
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
                            name: 'Hospital',
                            cellRenderer({ rowIndex }) {
                                const s = scripts.data[rowIndex];
                                if (!s) return null;
                                return hospitals.data.filter(h => h.hospitalId === s.hospitalId)[0]?.name || '';
                            },
                        },
                        {
                            name: 'Version',
                            align: 'right',
                            cellClassName: cn('w-[100px]', sys.data.hide_data_table_version === 'yes' && 'hidden'),
                            cellRenderer(cell) {
                                const s = scripts.data[cell.rowIndex];

                                if (!s) return null;

                                const publishedVersion = s.isDraft ? Math.max(0, (s.version - 1)) : s.version;

                                return (
                                    <div className="inline-flex w-full justify-end items-center gap-x-[2px]">
                                        <div className={cn('w-2 h-2 rounded-full', publishedVersion ? 'bg-green-400' : 'bg-gray-300')} />
                                        <span>{publishedVersion || s.version}</span>
                                        {s.isDraft && <Edit className="h-4 w-4 text-muted-foreground" />}
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
                                        disabled={disabled}
                                        setScriptsIdsToExport={() => setScriptsIdsToExport([s.scriptId])}
                                        onDelete={() => onDelete([s.scriptId])}
                                        onDuplicate={() => onDuplicate([s.scriptId])}
                                    />
                                );
                            },
                        },
                    ]}
                    data={scripts.data.map(s => [
                        s.position,
                        s.title || '',
                        s.description || '',
                        s.hospitalName || '',
                        s.version,
                        '',
                    ])}
                />
            </div>

            <ScriptsTableBottomActions 
                selected={selected}
                onDelete={() => onDelete(selected.map(i => scripts.data[i].scriptId).filter(s => s))}
                setScriptsIdsToExport={() => setScriptsIdsToExport(selected.map(i => scripts.data[i].scriptId).filter(s => s))}
            />
        </>
    )
}
