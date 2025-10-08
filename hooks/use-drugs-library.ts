'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import axios from "axios";
import { create } from "zustand";

import { saveDrugsLibraryItems, getDrugsLibraryItems, deleteDrugsLibraryItems, copyDrugsLibraryItems } from "@/app/actions/drugs-library";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useSocketEventsListener } from "@/hooks/use-socket-events-listener";
import { useDebounce } from "./use-debounce";

type Drug = Parameters<typeof saveDrugsLibraryItems>[0]['data'][0] & {
    isDraft?: boolean;
    draftCreatedByUserId?: string | null;
};

export type DrugsLibraryState = {
    initialised: boolean;
    loading: boolean;
    keys: string[];
    drugs: Drug[];
};

const defaultState: DrugsLibraryState = {
    initialised: false,
    loading: false,
    keys: [],
    drugs: [],
};

const useDrugsLibraryState = create<DrugsLibraryState>(set => {
    return defaultState;
});

export function resetDrugsLibraryState() {
    useDrugsLibraryState.setState(defaultState);
}

export function useDrugsLibrary() {
    const [searchValueState, setSearchValue] = useState('');
    const searchValue = useDebounce(searchValueState);

    const state = useDrugsLibraryState();
    const { drugs: allDrugs, } = state;

    const router = useRouter();
    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const { itemId: itemIdParam } = searchParamsObj;

    const itemId = useMemo(() => {
        return allDrugs.filter(d => (d.itemId === itemIdParam) || (d.key === itemIdParam))[0]?.itemId;
    }, [itemIdParam, allDrugs]);

    const { alert } = useAlertModal();

    const filterDrugs = useCallback(() => {
        const filteredDrugs: typeof allDrugs = [];

        let tableData = allDrugs.map(item => [
            item.drug || '',
            item.type || '',
            item.key || '',
            item.dosageText || '',
            item.itemId!,
        ]);

        tableData = tableData.filter((row, index) => {
            const matchesSearchValue = !searchValue ? true : (
                JSON.stringify(row).toLowerCase().includes(searchValue.toLowerCase())
            );
            if (matchesSearchValue) filteredDrugs.push(allDrugs[index]);
            return matchesSearchValue;
        });

        return {
            tableData,
            filteredDrugs,
        };
    }, [allDrugs, searchValue]);

    const { tableData, filteredDrugs, } = useMemo(() => filterDrugs(), [filterDrugs]);

    const getDrugs = useCallback(async () => {
        try {
            setSearchValue('');
            useDrugsLibraryState.setState({ loading: true, });
            const res = await axios.get<Awaited<ReturnType<typeof getDrugsLibraryItems>>>(
                '/api/drugs-library?data=' + JSON.stringify({ returnDraftsIfExist: true, }),
            );
            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));
            useDrugsLibraryState.setState({ drugs: res.data.data as Drug[], });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            useDrugsLibraryState.setState({ loading: false, });
        }
    }, [alert]);
    
    useSocketEventsListener({
        events: [
            {
                name: 'data_changed',
                onEvent: {
                    callback: async () => {
                        await getDrugs();
                        router.refresh();
                    },
                },
            },
        ],
    });

    const deleteDrugs = useCallback(async (ids: string[]) => {
        try {
            useDrugsLibraryState.setState(prev => ({ 
                loading: true,
                drugs: prev.drugs.filter(item => !ids.includes(item.itemId!)), 
            }));

            const res = await axios.delete<Awaited<ReturnType<typeof deleteDrugsLibraryItems>>>(
                '/api/drugs-library?data=' + JSON.stringify({ itemsIds: ids, }),
            );

            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));

            router.refresh();

            alert({
                title: '',
                message: 'Drug deleted successfully!',
                variant: 'success',
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            useDrugsLibraryState.setState({ loading: false, });
        }
    }, [alert, router.refresh]);

    const saveDrugs = useCallback(async (item?: Drug) => {
        try {
            useDrugsLibraryState.setState({ loading: true, });

            const removeReferences: string[] = [];
            const updateReferences: { old: string; new: string; }[] = [];

            let updated = allDrugs;
            useDrugsLibraryState.setState(prev => {
                if (!itemId && item) {
                    updated = [...prev.drugs, item];
                } else {
                    updated = prev.drugs.map(s => {
                        if (s.itemId !== item?.itemId) return s;

                        if (item) {
                            if (s.key !== item.key) updateReferences.push({ old: s.key!, new: item.key!, });
                            if (s.type !== item.type) removeReferences.push(s.key!);
                        }

                        return {
                            ...s,
                            ...item,
                        };
                    });
                }
                return {
                    loading: true,
                    drugs: updated,
                };
            });

            // TODO: removeReferences??
            // TODO: updateReferences??

            const payload: Parameters<typeof saveDrugsLibraryItems>[0] = {
                data: item ? [item] : updated,
                broadcastAction: true,
            };
            
            const res = await axios.post<Awaited<ReturnType<typeof saveDrugsLibraryItems>>>(
                '/api/drugs-library/save',
                payload,
            );

            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));

            await getDrugs();

            router.refresh();

            alert({
                title: '',
                message: `Drug${item ? '' : 's'} saved successfully!`,
                variant: 'success',
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            useDrugsLibraryState.setState({ loading: false, });
        }
    }, [allDrugs, itemId, router.refresh]);

    const copyDrugs = useCallback(async (itemsIds: string[]) => {
        try {
            useDrugsLibraryState.setState({ loading: true, });

            const payload: Parameters<typeof copyDrugsLibraryItems>[0] = {
                data: itemsIds.map(itemId => ({ itemId, })),
                broadcastAction: true,
            };
            
            const res = await axios.post<Awaited<ReturnType<typeof saveDrugsLibraryItems>>>(
                '/api/drugs-library/copy',
                payload,
            );

            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));

            await getDrugs();

            router.refresh();

            alert({
                title: '',
                message: `Drug${(itemsIds.length < 2) ? '' : 's'} copied successfully!`,
                variant: 'success',
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            useDrugsLibraryState.setState({ loading: false, });
        }
    }, [router.refresh]);

    useEffect(() => {
        if (!useDrugsLibraryState.getState().initialised) {
            getDrugs();
            useDrugsLibraryState.setState({ initialised: true, });
        }
    }, [getDrugs]);

    const resetState = useCallback(() => {
        useDrugsLibraryState.setState(defaultState);
    }, []);

    return {
        ...state,
        filteredDrugs,
        tableData,
        selectedItemId: itemId,
        searchValue,
        setSearchValue,
        addLink: (type: string) => `?${queryString.stringify({ ...searchParamsObj, addItem: type, })}`,
        editLink: (itemId: string) => `?${queryString.stringify({ ...searchParamsObj, itemId, })}`,
        getDrugs,
        deleteDrugs,
        saveDrugs,
        copyDrugs,
    };
}
