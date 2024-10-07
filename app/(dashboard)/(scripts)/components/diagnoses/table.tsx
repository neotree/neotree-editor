'use client';

import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { DiagnosesTableBottomActions } from "./table-bottom-actions";
import { DiagnosesTableRowActions } from "./table-row-actions";
import { useDiagnosesTable, UseDiagnosesTableParams } from '../../hooks/use-diagnoses-table';
import { CopyDiagnosesModal } from "./copy-modal";

type Props = UseDiagnosesTableParams;

export function DiagnosesTable(props: Props) {
    const {
        diagnoses,
        loading,
        selected,
        disabled,
        diagnosesIdsToCopy,
        setDiagnosesIdsToCopy,
        onDelete,
        onSort,
        setSelected,
    } = useDiagnosesTable(props);

    const { sys, viewOnly } = useAppContext();

    return (
        <>
            {loading && <Loader overlay />}

            {!!diagnosesIdsToCopy.length && (
                <CopyDiagnosesModal 
                    open 
                    diagnosesIds={diagnosesIdsToCopy}
                    onOpenChange={() => {
                        setDiagnosesIdsToCopy([]);
                        setSelected([]);
                    }} 
                />
            )}

            <div className="">
                <DataTable 
                    selectedIndexes={selected}
                    onSelect={setSelected}
                    title=""
                    selectable={!disabled}
                    sortable={!disabled}
                    loading={loading}
                    maxRows={25}
                    onSort={onSort}
                    getRowOptions={({ rowIndex }) => {
                        const s = diagnoses.data[rowIndex];
                        return !s ? {} : {
                            className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
                        };
                    }}
                    search={{
                        inputPlaceholder: 'Search diagnoses',
                    }}
                    noDataMessage={(
                        <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                            <div>No diagnoses saved.</div>
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
                                const s = diagnoses.data[cell.rowIndex];

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
                                const s = diagnoses.data[cell.rowIndex];
                                if (!s) return null;
                                return (
                                    <DiagnosesTableRowActions 
                                        diagnosis={s}
                                        disabled={disabled}
                                        onDelete={() => onDelete([s.diagnosisId])}
                                        onCopy={() => setDiagnosesIdsToCopy([s.diagnosisId])}
                                    />
                                );
                            },
                        },
                    ]}
                    data={diagnoses.data.map(s => [
                        s.position,
                        s.name,
                        s.description,
                        s.severityOrder || '',
                        s.version,
                        '',
                    ])}
                />
            </div>

            <DiagnosesTableBottomActions 
                disabled={viewOnly}
                selected={selected}
                diagnoses={diagnoses}
                onCopy={() => setDiagnosesIdsToCopy(selected.map(i => diagnoses.data[i]?.diagnosisId).filter(s => s))}
                onDelete={() => onDelete(selected.map(i => diagnoses.data[i]?.diagnosisId).filter(s => s))}
            />
        </>
    )
}
