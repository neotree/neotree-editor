'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { arrayMoveImmutable } from "array-move";

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

export type UseScreensTableParams = {
    disabled?: boolean;
    screens: Awaited<ReturnType<IScriptsContext['getScreens']>>;
    isScriptLocked?: boolean;
    scriptLockedByUserId?: string | null;
    loadScreens: () => Promise<void>;
};

const defaultSearchState = {
    value: '',
    filter: 'all' as ScriptsSearchResultsFilter,
    searching: false,
    results: [] as ScriptsSearchResultsItem[],
};

export function useScreensTable({
    disabled: disabledProp,
    screens: screensParam,
    isScriptLocked,
    scriptLockedByUserId,
    loadScreens,
}: UseScreensTableParams) {
    const [screens, setScreens] = useState(screensParam);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [screensIdsToCopy, setScreensIdsToCopy] = useState<string[]>([]);

    const [search, setSearch] = useState(defaultSearchState);
    const clearSearch = useCallback(() => setSearch(defaultSearchState), []);

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

        const sorted = arrayMoveImmutable([...screens.data], oldIndex, newIndex).map((s, i) => {
            const newPosition = screens.data[i].position;
            if (newPosition !== s.position) payload.push({ screenId: s.screenId, position: newPosition, });
            return {
                ...s,
                position: newPosition,
            };
        });

        // const sorted = sortedIndexes.map(({ oldIndex, newIndex }) => {
        //     const s = screens.data[oldIndex];
        //     let position = s.position;
        //     if (oldIndex !== newIndex) {
        //         // position = newIndex + 1;
        //         position = screens.data[newIndex].position;
        //         payload.push({ screenId: s.screenId, position, });
        //     }
        //     return {
        //         ...s,
        //         position,
        //     };
        // }).sort((a, b) => a.position - b.position);

        setScreens(prev => ({ ...prev, data: sorted, }));
        
        await saveScreens({ data: payload, broadcastAction: true, });

        // TODO: Replace this with server action
        await axios.post('/api/screens/save', { data: payload, broadcastAction: true, });

        await loadScreens();

        router.refresh();
    }, [saveScreens, loadScreens, screens, router]);

    const disabled = useMemo(() => disabledProp || viewOnly, [disabledProp, viewOnly]);

    const onSearch = useCallback(async (value: string) => {
        try {
            clearSearch();
            if (value) {
                setSearch(prev => ({ ...prev, searching: true, }));

                const results = parseScriptsSearchResults({
                    searchValue: value,
                    diagnoses: [],
                    scripts: [],
                    screens: screens.data,
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
    }, [clearSearch, screens.data]);

    const screensArr = useMemo(() => {
        return screens.data
            .filter(s => {
                if (!search.value) return true;

                const rslts = filterScriptsSearchResults(search.filter, search.results);

                return rslts.find(r => r.screens.map(s => s.screenId).includes(s.screenId));
            });
    }, [screens.data, search]);

    return {
        screens,
        loading,
        selected,
        disabled,
        screensIdsToCopy,
        isScriptLocked,
        scriptLockedByUserId,
        search, 
        screensArr,
        setSearch,
        clearSearch,
        onSearch,
        setScreensIdsToCopy,
        onDelete,
        onSort,
        setScreens,
        setLoading,
        setSelected,
    };
}
