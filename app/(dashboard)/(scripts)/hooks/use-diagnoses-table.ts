'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { useAppContext } from "@/contexts/app";

export type UseDiagnosesTableParams = {
    diagnoses: Awaited<ReturnType<IScriptsContext['getDiagnoses']>>;
};

export function useDiagnosesTable({
    diagnoses: diagnosesParam,
}: UseDiagnosesTableParams) {
    const [diagnoses, setDiagnoses] = useState(diagnosesParam);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [diagnosesIdsToCopy, setDiagnosesIdsToCopy] = useState<string[]>([]);

    useEffect(() => { setDiagnoses(diagnosesParam); }, [diagnosesParam]);

    const router = useRouter();
    const { viewOnly } = useAppContext();
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    const { deleteDiagnoses, saveDiagnoses } = useScriptsContext();

    const onDelete = useCallback(async (diagnosesIds: string[]) => {
        confirm(async () => {
            const _diagnoses = { ...diagnoses };

            setDiagnoses(prev => ({ ...prev, data: prev.data.filter(s => !diagnosesIds.includes(s.diagnosisId)) }));
            setSelected([]);

            setLoading(true);

            const res = await deleteDiagnoses({ diagnosesIds, broadcastAction: true, });

            if (res.errors?.length) {
                alert({
                    title: 'Error',
                    message: res.errors.join(', '),
                    variant: 'error',
                    onClose: () => setDiagnoses(_diagnoses),
                });
            } else {
                setSelected([]);
                router.refresh();
                alert({
                    title: 'Success',
                    message: 'Diagnoses deleted successfully!',
                    variant: 'success',
                });
            }

            setLoading(false);
        }, {
            danger: true,
            title: 'Delete diagnoses',
            message: 'Are you sure you want to delete diagnoses?',
            positiveLabel: 'Yes, delete',
        });
    }, [deleteDiagnoses, confirm, alert, router, diagnoses]);

    const onSort = useCallback(async (oldIndex: number, newIndex: number, sortedIndexes: { oldIndex: number, newIndex: number, }[]) => {
        const payload: { diagnosisId: string; position: number; }[] = [];
        const sorted = sortedIndexes.map(({ oldIndex, newIndex }) => {
            const s = diagnoses.data[oldIndex];
            let position = s.position;
            if (oldIndex !== newIndex) {
                position = newIndex + 1;
                payload.push({ diagnosisId: s.diagnosisId, position, });
            }
            return {
                ...s,
                position,
            };
        }).sort((a, b) => a.position - b.position);

        setDiagnoses(prev => ({ ...prev, data: sorted, }));
        
        await saveDiagnoses({ data: payload, broadcastAction: true, });

        router.refresh();
    }, [saveDiagnoses, alert, diagnoses, router]);

    const disabled = useMemo(() => viewOnly, [viewOnly]);

    return {
        diagnoses,
        loading,
        selected,
        disabled,
        diagnosesIdsToCopy, 
        setDiagnosesIdsToCopy,
        onDelete,
        onSort,
        setDiagnoses,
        setLoading,
        setSelected,
    };
}
