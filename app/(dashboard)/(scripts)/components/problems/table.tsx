'use client';

import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { ProblemsTableBottomActions } from "./table-bottom-actions";
import { ProblemsTableRowActions } from "./table-row-actions";
import { useProblemsTable, UseProblemsTableParams } from '../../hooks/use-problems-table';
import { CopyProblemsModal } from "./copy-modal";
import { ScriptsTableSearch } from "../scripts-table-search";

type Props = UseProblemsTableParams;

export function ProblemsTable(props: Props) {
    const {
        loading,
        selected,
        disabled,
        problemsIdsToCopy,
        isScriptLocked,
        scriptLockedByUserId,
        search,
        problemsArr,
        setSearch,
        onSearch,
        setProblemsIdsToCopy,
        onDelete,
        onSort,
        setSelected,
    } = useProblemsTable(props);

    const { sys, viewOnly } = useAppContext();

    return (
        <>
            {loading && <Loader overlay />}

            {!!problemsIdsToCopy.length && (
                <CopyProblemsModal 
                    open 
                    problemsIds={problemsIdsToCopy}
                    onOpenChange={() => {
                        setProblemsIdsToCopy([]);
                        setSelected([]);
                    }} 
                />
            )}

            <div className="flex flex-col gap-y-4">
                <div className="pt-4 px-4 text-2xl">Problems</div>

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
                        const s = problemsArr[rowIndex];
                        return !s ? {} : {
                            className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
                        };
                    }}
                    noDataMessage={(
                        <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                            <div>{!search.value ? 'No problems saved.' : `No matches for '${search.value}'`}</div>
                        </div>
                    )}
                    columns={[
                        {
                            name: 'Position',
                            cellClassName: 'w-10',
                            align: 'center',
                            cellRenderer({ rowIndex }) {
                                return rowIndex + 1;
                            },
                        },
                        {
                            name: 'Name',
                        },
                        {
                            name: 'Description',
                        },
                        {
                            name: 'Severity order',
                        },
                        {
                            name: 'Version',
                            align: 'right',
                            cellClassName: cn('w-[100px]', sys.data.hide_data_table_version === 'yes' && 'hidden'),
                            cellRenderer(cell) {
                                const s = problemsArr[cell.rowIndex];

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
                            align: 'center',
                            cellClassName: 'w-10',
                            cellRenderer(cell) {
                                const s = problemsArr[cell.rowIndex];
                                if (!s) return null;
                                return (
                                    <ProblemsTableRowActions 
                                        problem={s}
                                        disabled={disabled}
                                        isScriptLocked={isScriptLocked}
                                        scriptLockedByUserId={scriptLockedByUserId}
                                        onDelete={() => onDelete([s.problemId])}
                                        onCopy={() => setProblemsIdsToCopy([s.problemId])}
                                    />
                                );
                            },
                        },
                    ]}
                    data={problemsArr.map(s => [
                        s.position,
                        s.name,
                        s.description,
                        s.severityOrder || '',
                        s.version,
                        '',
                    ])}
                />
            </div>

            <ProblemsTableBottomActions 
                disabled={viewOnly}
                selected={selected}
                onCopy={() => setProblemsIdsToCopy(selected.map(i => problemsArr[i]?.problemId).filter(s => s))}
                onDelete={() => onDelete(selected.map(i => problemsArr[i]?.problemId).filter(s => s))}
            />
        </>
    )
}
