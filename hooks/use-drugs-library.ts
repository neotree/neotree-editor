'use client';

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import axios from "axios";
import { create } from "zustand";

import { saveDrugsLibraryItems, getDrugsLibraryItems, deleteDrugsLibraryItems } from "@/app/actions/drugs-library";
import { useAlertModal } from "@/hooks/use-alert-modal";

type Drug = Parameters<typeof saveDrugsLibraryItems>[0]['data'][0] & {
    isDraft?: boolean;
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
    const state = useDrugsLibraryState();
    const { drugs, } = state;

    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const { itemId } = searchParamsObj;

    const { alert } = useAlertModal();

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
    }, [alert]);

    const saveDrugs = useCallback(async (item?: Drug) => {
        try {
            useDrugsLibraryState.setState({ loading: true, });

            let updated = drugs;
            useDrugsLibraryState.setState(prev => {
                if (!itemId && item) {
                    updated = [...prev.drugs, item];
                } else {
                    updated = prev.drugs.map(s => s.itemId !== item?.itemId ? s : {
                        ...s,
                        ...item,
                    });
                }
                return {
                    loading: true,
                    drugs: updated,
                };
            });

            const payload: Parameters<typeof saveDrugsLibraryItems>[0] = {
                data: item ? [item] : updated,
            };
            
            const res = await axios.post<Awaited<ReturnType<typeof saveDrugsLibraryItems>>>(
                '/api/drugs-library/save',
                payload,
            );

            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));

            await getDrugs();

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
    }, [drugs, itemId]);

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
        selectedItemId: itemId,
        addLink: `?${queryString.stringify({ ...searchParamsObj, addDrug: 1, })}`,
        editLink: (itemId: string) => `?${queryString.stringify({ ...searchParamsObj, itemId, })}`,
        getDrugs,
        deleteDrugs,
        saveDrugs,
    };
}
