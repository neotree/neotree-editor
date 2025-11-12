'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import axios from "axios";
import { create } from "zustand";

import { saveDrugsLibraryItems, getDrugsLibraryItems, deleteDrugsLibraryItems, copyDrugsLibraryItems } from "@/app/actions/drugs-library";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useSocketEventsListener } from "@/hooks/use-socket-events-listener";
import { 
    filterDrugsLibrarySearchResults,
    type DrugsLibrarySearchResultsFilter,
    type DrugsLibrarySearchResultsItem,
} from "@/lib/drugs-library-search";
import { useAppContext } from "@/contexts/app";
import { recordPendingDeletionChange } from "@/lib/change-tracker";

type Drug = Parameters<typeof saveDrugsLibraryItems>[0]['data'][0] & {
    isDraft?: boolean;
    draftCreatedByUserId?: string | null;
};

const defaultSearchState = {
    value: '',
    filter: 'all' as DrugsLibrarySearchResultsFilter,
    searching: false,
    results: [] as DrugsLibrarySearchResultsItem[],
    unfilteredResults: [] as DrugsLibrarySearchResultsItem[],
};

export type DrugsLibrarySearchState = typeof defaultSearchState;

export type DrugsLibraryState = {
    initialised: boolean;
    loading: boolean;
    keys: string[];
    drugs: Drug[];
    typeFilter: string;
    statusFilter: string;
    sortBy: string;
};

const defaultState: DrugsLibraryState = {
    initialised: false,
    loading: false,
    keys: [],
    drugs: [],
    typeFilter: '',
    statusFilter: '',
    sortBy: 'name-asc',
};

const useDrugsLibraryState = create<DrugsLibraryState>(set => {
    return defaultState;
});

export function resetDrugsLibraryState() {
    useDrugsLibraryState.setState(defaultState);
}

export function useDrugsLibrary() {
    const state = useDrugsLibraryState();
    const { drugs: allDrugs, typeFilter, statusFilter, sortBy } = state;
    const { authenticatedUser } = useAppContext();

    const router = useRouter();
    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const { itemId: itemIdParam } = searchParamsObj;

    const itemId = useMemo(() => {
        return allDrugs.filter(d => (d.itemId === itemIdParam) || (d.key === itemIdParam))[0]?.itemId;
    }, [itemIdParam, allDrugs]);

    const { alert } = useAlertModal();

    const [search, setSearch] = useState(defaultSearchState);
    const clearSearch = useCallback(() => setSearch(defaultSearchState), []);

    const filterDrugs = useCallback(() => {
        const filteredDrugs: typeof allDrugs = [];

        const searchResultIds = !search.value
            ? undefined
            : new Set(search.results.map(result => result.itemId));

        let tableData = allDrugs.map(item => [
            item.drug || '',
            item.type || '',
            item.key || '',
            item.dosageText || '',
            item.itemId!,
        ]);

        tableData = tableData.filter((row, index) => {
            const item = allDrugs[index];
            if (!item) return false;

            let matchedFilters = true;

            if (searchResultIds) {
                matchedFilters = searchResultIds.has(item.itemId!);
            }

            if (matchedFilters && typeFilter && typeFilter !== 'all') {
                matchedFilters = (item.type || '').toLowerCase() === typeFilter.toLowerCase();
            }

            if (matchedFilters && statusFilter && statusFilter !== 'all') {
                if (statusFilter === 'draft') {
                    matchedFilters = item.isDraft === true;
                } else if (statusFilter === 'published') {
                    matchedFilters = !item.isDraft;
                }
            }

            if (matchedFilters) filteredDrugs.push(allDrugs[index]);
            return matchedFilters;
        });

        const sortedData = [...tableData];
        const sortedDrugs = [...filteredDrugs];
        const sortPairs = sortedData.map((row, idx) => ({ row, drug: sortedDrugs[idx] }));

        switch (sortBy) {
            case 'name-asc':
                sortPairs.sort((a, b) => (a.drug.drug || '').localeCompare(b.drug.drug || ''));
                break;
            case 'name-desc':
                sortPairs.sort((a, b) => (b.drug.drug || '').localeCompare(a.drug.drug || ''));
                break;
            case 'type-asc':
                sortPairs.sort((a, b) => (a.drug.type || '').localeCompare(b.drug.type || ''));
                break;
            case 'type-desc':
                sortPairs.sort((a, b) => (b.drug.type || '').localeCompare(a.drug.type || ''));
                break;
            case 'key-asc':
                sortPairs.sort((a, b) => (a.drug.key || '').localeCompare(b.drug.key || ''));
                break;
            case 'key-desc':
                sortPairs.sort((a, b) => (b.drug.key || '').localeCompare(a.drug.key || ''));
                break;
        }

        return {
            tableData: sortPairs.map(p => p.row),
            filteredDrugs: sortPairs.map(p => p.drug),
        };
    }, [allDrugs, search, typeFilter, statusFilter, sortBy]);

    const onSearch = useCallback(async (value: string) => {
        try {
            clearSearch();

            const trimmedValue = `${value || ''}`.trim();
            if (!trimmedValue) return;

            setSearch(prev => ({
                ...prev,
                value: trimmedValue,
                searching: true,
            }));

            const { data: res } = await axios.get<{
                data: DrugsLibrarySearchResultsItem[];
                errors?: string[];
            }>(`/api/drugs-library/search?searchValue=${encodeURIComponent(trimmedValue)}`);

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            setSearch(prev => {
                const results = res.data || [];
                return {
                    value: trimmedValue,
                    filter: prev.filter,
                    searching: false,
                    results: filterDrugsLibrarySearchResults({
                        searchValue: trimmedValue,
                        filter: prev.filter,
                        results,
                    }),
                    unfilteredResults: results,
                };
            });
        } catch {
            clearSearch();
        }
    }, [clearSearch]);

    const { tableData, filteredDrugs, } = useMemo(() => filterDrugs(), [filterDrugs]);

    const getDrugs = useCallback(async () => {
        try {
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
        const itemsToDelete = allDrugs.filter(item => item.itemId && ids.includes(item.itemId));

        try {
            useDrugsLibraryState.setState(prev => ({ 
                loading: true,
                drugs: prev.drugs.filter(item => !ids.includes(item.itemId!)), 
            }));

            const res = await axios.delete<Awaited<ReturnType<typeof deleteDrugsLibraryItems>>>(
                '/api/drugs-library?data=' + JSON.stringify({ itemsIds: ids, }),
            );

            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));

            await Promise.all(itemsToDelete.map(async (item) => {
                if (!item?.itemId) return;
                const { isDraft, draftCreatedByUserId, ...snapshot } = item;
                const entityTitle = item.drug || item.key || "Drugs Library Item";

                await recordPendingDeletionChange({
                    entityId: item.itemId,
                    entityType: "drugsLibraryItem",
                    entityTitle,
                    snapshot,
                    userId: authenticatedUser?.userId,
                    userName: authenticatedUser?.displayName,
                    description: `Marked "${entityTitle}" for deletion`,
                });
            }));

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
    }, [alert, router.refresh, allDrugs, authenticatedUser?.userId, authenticatedUser?.displayName]);

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

    // Filter setters
    const setTypeFilter = useCallback((type: string) => {
        useDrugsLibraryState.setState({ typeFilter: type });
    }, []);

    const setStatusFilter = useCallback((status: string) => {
        useDrugsLibraryState.setState({ statusFilter: status });
    }, []);

    const setSortBy = useCallback((sort: string) => {
        useDrugsLibraryState.setState({ sortBy: sort });
    }, []);

    return {
        ...state,
        search,
        filteredDrugs,
        tableData,
        selectedItemId: itemId,
        addLink: (type: string) => `?${queryString.stringify({ ...searchParamsObj, addItem: type, })}`,
        editLink: (itemId: string) => `?${queryString.stringify({ ...searchParamsObj, itemId, })}`,
        getDrugs,
        deleteDrugs,
        saveDrugs,
        copyDrugs,
        setSearch,
        clearSearch,
        onSearch,
        setTypeFilter,
        setStatusFilter,
        setSortBy,
    };
}
