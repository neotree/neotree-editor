'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { DataTable } from "@/components/data-table";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { ScreensTableBottomActions } from "./table-bottom-actions";
import { ScreensTableRowActions } from "./table-row-actions";


type Props = {
    screens: Awaited<ReturnType<IScriptsContext['getScreens']>>;
};

export function ScreensTable({
    screens: screensProp,
}: Props) {
    const [screens, setScreens] = useState(screensProp);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => { setScreens(screensProp); }, [screensProp]);

    const router = useRouter();
    const { sys, viewOnly, isDefaultUser } = useAppContext();
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    const { deleteScreens, saveScreens } = useScriptsContext();

    const onDelete = useCallback(async (screensIds: string[]) => {
        confirm(async () => {
            const _screens = { ...screens };

            setScreens(prev => ({ ...prev, data: prev.data.filter(s => !screensIds.includes(s.screenId)) }));
            setSelected([]);

            setLoading(true);

            const res = await deleteScreens({ screensIds, broadcastAction: true, });

            if (res.errors?.length) {
                alert({
                    title: 'Error',
                    message: res.errors.join(', '),
                    variant: 'error',
                    onClose: () => setScreens(_screens),
                });
            } else {
                setSelected([]);
                router.refresh();
                alert({
                    title: 'Success',
                    message: 'Screens deleted successfully!',
                    variant: 'success',
                });
            }

            setLoading(false);
        }, {
            danger: true,
            title: 'Delete screens',
            message: 'Are you sure you want to delete screens?',
            positiveLabel: 'Yes, delete',
        });
    }, [deleteScreens, confirm, alert, router, screens]);

    const onSort = useCallback(async (oldIndex: number, newIndex: number, sortedIndexes: { oldIndex: number, newIndex: number, }[]) => {
        const payload: { screenId: string; position: number; }[] = [];
        const sorted = sortedIndexes.map(({ oldIndex, newIndex }) => {
            const s = screens.data[oldIndex];
            let position = s.position;
            if (oldIndex !== newIndex) {
                position = newIndex + 1;
                payload.push({ screenId: s.screenId, position, });
            }
            return {
                ...s,
                position,
            };
        }).sort((a, b) => a.position - b.position);

        setScreens(prev => ({ ...prev, data: sorted, }));
        
        await saveScreens({ data: payload, broadcastAction: true, });

        router.refresh();
    }, [saveScreens, alert, screens, router]);

    const onCopy = useCallback(async (screensIds: string[]) => {
        window.alert('DUPLICATE SCRIPT!!!');
    }, []);

    const disabled = useMemo(() => viewOnly || isDefaultUser, [isDefaultUser]);

    return (
        <>
            {loading && <Loader overlay />}

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
                            cellClassName: cn('w-[100px]', sys.hide_data_table_version === 'yes' && 'hidden'),
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
                                        onDelete={() => onDelete([s.screenId])}
                                        onCopy={() => onCopy([s.screenId])}
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
                onCopy={() => onCopy(selected.map(i => screens.data[i]?.screenId).filter(s => s))}
                onDelete={() => onDelete(selected.map(i => screens.data[i]?.screenId).filter(s => s))}
            />
        </>
    )
}
