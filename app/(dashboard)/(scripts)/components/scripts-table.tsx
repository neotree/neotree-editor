'use client';

import { Edit, ExternalLink } from "lucide-react";
import Link from "next/link";

import { TableCell, TableRow } from "@/components/ui/table";
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
import { Separator } from "@/components/ui/separator";
import { ScriptsTableSearch } from "./scripts-table-search";

type Props = UseScriptsTableParams;

export function ScriptsTable(props: Props) {
    const {
        selected,
        loading,
        scriptsIdsToExport,
        disabled,
        search,
        scriptsArr,
        setSearch,
        onSearch,
        setSelected,
        setScriptsIdsToExport,
        onDelete,
        onSort,
        onDuplicate,
    } = useScriptsTable(props);

    const { sys, viewOnly } = useAppContext();
    const { hospitals, } = useScriptsContext();

    const displayLoader = loading;

    return (
        <>
            {displayLoader && <Loader overlay />}

            {!!scriptsIdsToExport.length && (
                <ScriptsExportModal 
                    open 
                    scriptsIdsToExport={scriptsIdsToExport}
                    onOpenChange={() => setScriptsIdsToExport([])} 
                    setScriptsIdsToExport={setScriptsIdsToExport}
                />
            )}

            <ScriptsFab disabled={disabled} />

            <div className="flex flex-col gap-y-4">
                <div className="pt-4 px-4 text-2xl">Scripts</div>

                <div className="px-4">
                    <ScriptsTableSearch 
                        onSearch={onSearch}
                        search={search}
                        setSearch={setSearch}
                    />
                </div>

                <DataTable 
                    selectedIndexes={selected}
                    onSelect={setSelected}
                    selectable={!disabled}
                    sortable={!disabled && !search.value}
                    loading={loading}
                    maxRows={25}
                    onSort={onSort}
                    getRowOptions={({ rowIndex }) => {
                        const s = scriptsArr[rowIndex];
                        return !s ? {} : {
                            className: cn(!viewOnly && (s.isDraft || s.hasChangedItems) && 'bg-danger/20 hover:bg-danger/30')
                        };
                    }}
                    rowRenderer={!search.value ? undefined : ({ props, cells, rowIndex, }) => {
                        const s = scriptsArr[rowIndex];
                        const searchResults = search.results.find(r => r?.scriptId === s?.scriptId);

                        const items = !searchResults ? [] : [
                            ...searchResults.screens.map(s => ({
                                id: s.screenId,
                                title: s.title,
                                type: 'screen',
                                link: `/script/${searchResults.scriptId}/screen/${s.screenId}`,
                            })),
                            ...searchResults.diagnoses.map(s => ({
                                id: s.diagnosisId,
                                title: s.title,
                                type: 'diagnosis',
                                link: `/script/${searchResults.scriptId}/diagnosis/${s.diagnosisId}`,
                            })),
                        ];

                        return (
                            <>
                                <TableRow {...props}>
                                    {cells}
                                </TableRow>

                                {!!items.length && (
                                    <TableRow {...props} className={cn(props.className, 'bg-yellow-50 hover:bg-yellow-50 p-0')}>
                                        <TableCell colSpan={cells.length} className="p-0">
                                            <div className="flex flex-col gap-y-2">
                                                {items.map((item, i) => {
                                                    return (
                                                        <div key={item.id} className="text-xs">
                                                            <div className="flex items-center gap-x-2 p-2 px-4">
                                                                <div>{item.title}</div>
                                                                <div className="ml-auto flex gap-x-2">
                                                                    <Link
                                                                        href={item.link}
                                                                        target="_blank"
                                                                        className="flex items-center gap-x-1"
                                                                    >
                                                                        {item.type}
                                                                        <ExternalLink className="h-3 w-3" />
                                                                    </Link>
                                                                </div>
                                                            </div>

                                                            {(i < items.length - 1) && <Separator />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        );
                    }}
                    noDataMessage={(
                        <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                            <div>{!search.value ? 'No scripts saved.' : `No matches for '${search.value}'`}</div>
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
                                const s = scriptsArr[rowIndex];
                                if (!s) return null;
                                return hospitals.data.filter(h => h.hospitalId === s.hospitalId)[0]?.name || '';
                            },
                        },
                        {
                            name: 'Version',
                            align: 'right',
                            cellClassName: cn('w-[100px]', sys.data.hide_data_table_version === 'yes' && 'hidden'),
                            cellRenderer(cell) {
                                const s = scriptsArr[cell.rowIndex];

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
                                const s = scriptsArr[rowIndex];
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
                    data={scriptsArr.map(s => [
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
                onDelete={() => onDelete(selected.map(i => scriptsArr[i].scriptId).filter(s => s))}
                setScriptsIdsToExport={() => setScriptsIdsToExport(selected.map(i => scriptsArr[i].scriptId).filter(s => s))}
            />
        </>
    )
}
