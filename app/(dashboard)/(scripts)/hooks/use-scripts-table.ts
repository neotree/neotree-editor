'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { useAppContext } from "@/contexts/app";

export type UseScriptsTableParams = {
    scripts: Awaited<ReturnType<IScriptsContext['getScripts']>>;
};

export function useScriptsTable({
    scripts: scriptsParam
}: UseScriptsTableParams) {
    const [scripts, setScripts] = useState(scriptsParam);
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [scriptsIdsToExport, setScriptsIdsToExport] = useState<string[]>([]);

    useEffect(() => { setScripts(scriptsParam); }, [scriptsParam]);

    const router = useRouter();
    const { viewOnly, isDefaultUser } = useAppContext();
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    const { deleteScripts, saveScripts } = useScriptsContext();

    const onDelete = useCallback(async (scriptsIds: string[]) => {
        confirm(async () => {
            const _scripts = { ...scripts };

            setScripts(prev => ({ ...prev, data: prev.data.filter(s => !scriptsIds.includes(s.scriptId)) }));
            setSelected([]);

            setLoading(true);

            const res = await deleteScripts({ scriptsIds, broadcastAction: true, });

            if (res.errors?.length) {
                alert({
                    title: 'Error',
                    message: res.errors.join(', '),
                    variant: 'error',
                    onClose: () => setScripts(_scripts),
                });
            } else {
                setSelected([]);
                router.refresh();
                alert({
                    title: 'Success',
                    message: 'Scripts deleted successfully!',
                    variant: 'success',
                });
            }

            setLoading(false);
        }, {
            danger: true,
            title: 'Delete scripts',
            message: 'Are you sure you want to delete scripts?',
            positiveLabel: 'Yes, delete',
        });
    }, [deleteScripts, confirm, alert, router, scripts]);

    const onSort = useCallback(async (oldIndex: number, newIndex: number, sortedIndexes: { oldIndex: number, newIndex: number, }[]) => {
        const payload: { scriptId: string; position: number; }[] = [];
        const sorted = sortedIndexes.map(({ oldIndex, newIndex }) => {
            const s = scripts.data[oldIndex];
            let position = s.position;
            if (oldIndex !== newIndex) {
                position = newIndex + 1;
                payload.push({ scriptId: s.scriptId, position, });
            }
            return {
                ...s,
                position,
            };
        }).sort((a, b) => a.position - b.position);

        setScripts(prev => ({ ...prev, data: sorted, }));
        
        await saveScripts({ data: payload, broadcastAction: true, });

        router.refresh();
    }, [saveScripts, alert, scripts, router]);

    const onDuplicate = useCallback(async (scriptsIds?: string[]) => {
        window.alert('DUPLICATE SCRIPT!!!');
    }, []);

    const disabled = useMemo(() => viewOnly || isDefaultUser, [isDefaultUser]);
    const scriptsToExport = useMemo(() => scripts.data.filter(t => scriptsIdsToExport.includes(t.scriptId)), [scriptsIdsToExport, scripts]);

    return {
        scripts,
        selected,
        loading,
        scriptsIdsToExport,
        disabled,
        scriptsToExport,
        setScripts,
        setSelected,
        setLoading,
        setScriptsIdsToExport,
        onDelete,
        onSort,
        onDuplicate,
    };
}
