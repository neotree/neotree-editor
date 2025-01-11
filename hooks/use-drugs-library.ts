'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import axios from "axios";

import { saveScriptsDrugs } from "@/app/actions/scripts";

type Drug = Parameters<typeof saveScriptsDrugs>[0]['data'][0]

export function useDrugsLibrary(scriptId: string) {
    const initialised = useRef(false);
    const [loading, setLoading] = useState(false);
    const [drugs, setDrugs] = useState<Drug[]>([]);

    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const { itemId } = searchParamsObj;

    const getDrugs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get<Awaited<ReturnType<typeof saveScriptsDrugs>>>(
                '/api/scripts/drugs-library?data=' + JSON.stringify({ scriptsIds: [scriptId], }),
            );
            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));
            setDrugs(res.data.data as Drug[]);
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [alert, scriptId]);

    const deleteDrugs = useCallback(async (ids: string[]) => {
        try {
            setLoading(true);
            setDrugs(prev => prev.filter(item => !ids.includes(item.itemId!)));
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
            setLoading(false);
        }
    }, [alert]);

    const saveDrugs = useCallback(async (item?: Drug) => {
        try {
            setLoading(true);

            let updated = drugs;
            setDrugs(prev => {
                if (!itemId && item) {
                    updated = [...prev, item];
                } else {
                    updated = prev.map(s => s.itemId !== item?.itemId ? s : {
                        ...s,
                        ...item,
                    });
                }
                return updated;
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
            setLoading(false);
        }
    }, [drugs, itemId]);

    useEffect(() => {
        if (!initialised.current) getDrugs();
        initialised.current = true;
    }, [getDrugs]);

    return {
        loading,
        drugs,
        selectedItemId: itemId,
        addLink: `?${queryString.stringify({ ...searchParamsObj, addDrug: 1, })}`,
        editLink: (itemId: string) => `?${queryString.stringify({ ...searchParamsObj, itemId, })}`,
        getDrugs,
        deleteDrugs,
        saveDrugs,
    };
}
