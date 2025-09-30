'use client';

import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { ScreensTableBottomActions } from "./table-bottom-actions";
import { ScreensTableRowActions } from "./table-row-actions";
import { useScreensTable, UseScreensTableParams } from '../../hooks/use-screens-table';
import { CopyScreensModal } from "./copy-modal";

type Props = UseScreensTableParams;

export function ScreensTable(props: Props) {
    const {
        screens,
        loading,
        selected,
        disabled,
        screensIdsToCopy,
        isScriptLocked,
        scriptLockedByUserId,
        setScreensIdsToCopy,
        onDelete,
        onSort,
        setSelected,
    } = useScreensTable(props);

    const { sys, viewOnly } = useAppContext();

    return (
        <>
            {loading && <Loader overlay />}

            {!!screensIdsToCopy.length && (
                <CopyScreensModal 
                    open 
                    screensIds={screensIdsToCopy}
                    onOpenChange={() => {
                        setScreensIdsToCopy([]);
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
                        const s = screens.data[rowIndex];
                        return !s ? {} : {
                            className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
                        };
                    }}
                    search={{
                        inputPlaceholder: 'Search screens',
                    }}
                    noDataMessage={(
                        <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                            <div>No screens saved.</div>
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
                            name: 'Type',
                        },
                        {
                            name: 'Epic',
                        },
                        {
                            name: 'Story',
                        },
                        {
                            name: 'Ref',
                        },
                        {
                            name: 'Title',
                        },
                        {
                            name: 'Version',
                            align: 'right',
                            cellClassName: cn('w-[100px]', sys.data.hide_data_table_version === 'yes' && 'hidden'),
                            cellRenderer(cell) {
                                const s = screens.data[cell.rowIndex];

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
                                const s = screens.data[cell.rowIndex];
                                if (!s) return null;
                                return (
                                    <ScreensTableRowActions 
                                        screen={s}
                                        disabled={disabled}
                                        isScriptLocked={isScriptLocked}
                                        scriptLockedByUserId={scriptLockedByUserId}
                                        onDelete={() => onDelete([s.screenId])}
                                        onCopy={() => setScreensIdsToCopy([s.screenId])}
                                    />
                                );
                            },
                        },
                    ]}
                    data={screens.data.map(s => [
                        s.position,
                        s.type,
                        s.epicId,
                        s.storyId,
                        s.refId,
                        s.title,
                        s.version,
                        '',
                    ])}
                />
            </div>

            <ScreensTableBottomActions 
                disabled={viewOnly}
                selected={selected}
                screens={screens}
                onCopy={() => setScreensIdsToCopy(selected.map(i => screens.data[i]?.screenId).filter(s => s))}
                onDelete={() => onDelete(selected.map(i => screens.data[i]?.screenId).filter(s => s))}
            />
        </>
    )
}
