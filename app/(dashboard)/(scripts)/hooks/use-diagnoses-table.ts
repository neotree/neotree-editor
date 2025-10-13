'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { useAppContext } from "@/contexts/app";
import { 
    type ScriptsSearchResultsItem, 
    type ScriptsSearchResultsFilter, 
    filterScriptsSearchResults, 
    parseScriptsSearchResults,
} from "@/lib/scripts-search";

export type UseDiagnosesTableParams = {
    diagnoses: Awaited<ReturnType<IScriptsContext['getDiagnoses']>>;
};

const defaultSearchState = {
    value: '',
    filter: 'all' as ScriptsSearchResultsFilter,
    searching: false,
    results: [] as ScriptsSearchResultsItem[],
};

export function useDiagnosesTable({
    diagnoses: diagnosesParam,
}: UseDiagnosesTableParams) {
    const [diagnoses, setDiagnoses] = useState(diagnosesParam);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [diagnosesIdsToCopy, setDiagnosesIdsToCopy] = useState<string[]>([]);

    const [search, setSearch] = useState(defaultSearchState);
    const clearSearch = useCallback(() => setSearch(defaultSearchState), []);

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

            // const res = await deleteDiagnoses({ diagnosesIds, broadcastAction: true, });

            // TODO: Replace this with server action
            const response = await axios.delete('/api/diagnoses?data='+JSON.stringify({ diagnosesIds, broadcastAction: true, }));
            const res = response.data as Awaited<ReturnType<typeof deleteDiagnoses>>;

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
                // position = newIndex + 1;
                position = diagnoses.data[newIndex].position;
                payload.push({ diagnosisId: s.diagnosisId, position, });
            }
            return {
                ...s,
                position,
            };
        }).sort((a, b) => a.position - b.position);

        setDiagnoses(prev => ({ ...prev, data: sorted, }));
        
        // await saveDiagnoses({ data: payload, broadcastAction: true, });

        // TODO: Replace this with server action
        await axios.post('/api/diagnoses/save', { data: payload, broadcastAction: true, });

        router.refresh();
    }, [saveDiagnoses, diagnoses, router]);

    const disabled = useMemo(() => viewOnly, [viewOnly]);

    const onSearch = useCallback(async (value: string) => {
        try {
            clearSearch();
            if (value) {
                setSearch(prev => ({ ...prev, searching: true, }));

                const results = parseScriptsSearchResults({
                    searchValue: value,
                    screens: [],
                    scripts: [],
                    diagnoses: diagnoses.data,
                });

                setSearch(prev => ({
                    value,
                    filter: prev.filter,
                    searching: false,
                    results,
                }));
            }
        } catch(e: any) {
            clearSearch();
        }
    }, [clearSearch, diagnoses.data]);

    const diagnosesArr = useMemo(() => {
        return diagnoses.data
            .filter(s => {
                if (!search.value) return true;

                const rslts = filterScriptsSearchResults({
                    searchValue: search.value, 
                    filter: search.filter, 
                    results: search.results
                });

                return rslts.find(r => r.diagnoses.map(s => s.diagnosisId).includes(s.diagnosisId));
            });
    }, [diagnoses.data, search]);

    return {
        diagnoses,
        loading,
        selected,
        disabled,
        diagnosesIdsToCopy, 
        search, 
        diagnosesArr,
        setSearch,
        clearSearch,
        onSearch,
        setDiagnosesIdsToCopy,
        onDelete,
        onSort,
        setDiagnoses,
        setLoading,
        setSelected,
    };
}
