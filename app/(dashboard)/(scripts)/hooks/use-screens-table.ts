'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { useAppContext } from "@/contexts/app";

export type UseScreensTableParams = {
    screens: Awaited<ReturnType<IScriptsContext['getScreens']>>;
};

export function useScreensTable({
    screens: screensParam,
}: UseScreensTableParams) {
    const [screens, setScreens] = useState(screensParam);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => { setScreens(screensParam); }, [screensParam]);

    const router = useRouter();
    const { viewOnly, isDefaultUser } = useAppContext();
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

    return {
        screens,
        loading,
        selected,
        disabled,
        onDelete,
        onSort,
        onCopy,
        setScreens,
        setLoading,
        setSelected,
    };
}
