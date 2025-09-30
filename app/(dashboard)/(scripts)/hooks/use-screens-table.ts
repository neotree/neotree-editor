'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { useAppContext } from "@/contexts/app";

export type UseScreensTableParams = {
    screens: Awaited<ReturnType<IScriptsContext['getScreens']>>;
    locked?:boolean,
}

export function useScreensTable({
    screens: screensParam,
    locked
}: UseScreensTableParams) {
    const [screens, setScreens] = useState(screensParam);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [screensIdsToCopy, setScreensIdsToCopy] = useState<string[]>([]);


    useEffect(() => { setScreens(screensParam); }, [screensParam]);

    const router = useRouter();
    const { viewOnly } = useAppContext();
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    const { deleteScreens, saveScreens } = useScriptsContext();

    const onDelete = useCallback(async (screensIds: string[]) => {
        confirm(async () => {
            const _screens = { ...screens };

            setScreens(prev => ({ ...prev, data: prev.data.filter(s => !screensIds.includes(s.screenId)) }));
            setSelected([]);

            setLoading(true);

            // const res = await deleteScreens({ screensIds, broadcastAction: true, });

            // TODO: Replace this with server action
            const response = await axios.delete('/api/screens?data='+JSON.stringify({ screensIds, broadcastAction: true, }));
            const res = response.data as Awaited<ReturnType<typeof deleteScreens>>;

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
                // position = newIndex + 1;
                position = screens.data[newIndex].position;
                payload.push({ screenId: s.screenId, position, });
            }
            return {
                ...s,
                position,
            };
        }).sort((a, b) => a.position - b.position);

        setScreens(prev => ({ ...prev, data: sorted, }));
        
        // await saveScreens({ data: payload, broadcastAction: true, });

        // TODO: Replace this with server action
        await axios.post('/api/screens/save', { data: payload, broadcastAction: true, });

        router.refresh();
    }, [saveScreens, screens, router]);


    const disabled = useMemo(() => viewOnly || !!locked, [viewOnly,locked]);

    return {
        screens,
        loading,
        selected,
        disabled,
        locked,
        screensIdsToCopy, 
        setScreensIdsToCopy,
        onDelete,
        onSort,
        setScreens,
        setLoading,
        setSelected
    };
}
