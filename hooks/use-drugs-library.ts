'use client';

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import axios from "axios";
import { create } from "zustand";

import { saveScriptsDrugs, getScriptsMetadata } from "@/app/actions/scripts";
import { useAlertModal } from "@/hooks/use-alert-modal";

type Drug = Parameters<typeof saveScriptsDrugs>[0]['data'][0];

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

export function useDrugsLibrary(scriptId: string) {
    const state = useDrugsLibraryState();
    const { drugs, } = state;

    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const { itemId } = searchParamsObj;

    const { alert } = useAlertModal();

    const getScriptKeys = useCallback(async () => {
        try {
            const res = await axios.get<Awaited<ReturnType<typeof getScriptsMetadata>>>('/api/scripts/metadata?data='+JSON.stringify({ scriptsIds: [scriptId], returnDraftsIfExist: true, }));
            const { data, errors } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));

            const keys = data.reduce((acc, item) => {
                item.screens.forEach(s => s.fields.forEach(f => {
                    if (f.key) {
                        acc[f.key.toLowerCase()] = f.key;
                    }
                }));
                return acc;
            }, {} as { [key: string]: string; })

            useDrugsLibraryState.setState({ keys: Object.values(keys), });
        } catch(e: any) {
            alert({
                title: '',
                message: 'Error: ' + e.message,
                variant: 'error',
            });
        }
    }, [scriptId, open, alert]);

    const getDrugs = useCallback(async () => {
        try {
            useDrugsLibraryState.setState({ loading: true, });
            const res = await axios.get<Awaited<ReturnType<typeof saveScriptsDrugs>>>(
                '/api/scripts/drugs-library?data=' + JSON.stringify({ scriptsIds: [scriptId], }),
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
    }, [alert, scriptId]);

    const deleteDrugs = useCallback(async (ids: string[]) => {
        try {
            useDrugsLibraryState.setState(prev => ({ 
                loading: true,
                drugs: prev.drugs.filter(item => !ids.includes(item.itemId!)), 
            }));
            const res = await axios.delete<Awaited<ReturnType<typeof saveScriptsDrugs>>>(
                '/api/scripts/drugs-library?data=' + JSON.stringify({ itemsIds: ids, }),
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

            const payload: Parameters<typeof saveScriptsDrugs>[0] = {
                data: item ? [item] : updated,
                returnSaved: true,
            };
            
            const res = await axios.post<Awaited<ReturnType<typeof saveScriptsDrugs>>>(
                '/api/scripts/drugs-library',
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
            getScriptKeys();
            getDrugs();
            useDrugsLibraryState.setState({ initialised: true, });
        }
    }, [getDrugs, getScriptKeys]);

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
        resetState,
        getScriptKeys,
    };
}
