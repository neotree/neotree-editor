'use client';

import { createContext, useCallback, useContext, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import queryString from "query-string";
import axios from "axios";

import * as serverActions from '@/app/actions/scripts';
import * as filesActions from "@/app/actions/files";
import { getHospitals } from "@/app/actions/hospitals";
import { getDataKeys } from "@/app/actions/data-keys";
import { useSearchParams } from "@/hooks/use-search-params";
import { listScreens, getScriptsKeys } from "@/app/actions/scripts";

export interface IScriptsContext extends  
ScriptsContextProviderProps,
ReturnType<typeof useScriptsContentHook>
{}

export const ScriptsContext = createContext<IScriptsContext>(null!);

export const useScriptsContext = () => useContext(ScriptsContext);

type ScriptsContextProviderProps = 
    typeof serverActions & 
    typeof filesActions &
    {
        hospitals: Awaited<ReturnType<typeof getHospitals>>;
        getHospitals: typeof getHospitals;
    };

export function ScriptsContextProvider({ 
    children, 
    ...props
}: ScriptsContextProviderProps & {
    children: React.ReactNode;
}) {
    const hook = useScriptsContentHook(props);

    return (
        <ScriptsContext.Provider
            value={{
                ...props,
                ...hook,
            }}
        >
            {children}
        </ScriptsContext.Provider>
    );
}

export type ScriptFormDataType = Parameters<IScriptsContext['saveScripts']>[0]['data'][0];

export type ScreenFormDataType = Parameters<IScriptsContext['saveScreens']>[0]['data'][0];

export type DiagnosisFormDataType = Parameters<IScriptsContext['saveDiagnoses']>[0]['data'][0];

function useScriptsContentHook({}: ScriptsContextProviderProps) {
    const router = useRouter();
    const { scriptId, } = useParams();
    const { parsed: searchParams, } = useSearchParams();

    const [screensLoading, setScreensLoading] = useState(false);
    const [screens, setScreens] = useState<Awaited<ReturnType<typeof listScreens>>>({
        data: [],
    });

    const [keysLoading, setKeysLoading] = useState(false);
    const [keys, setKeys] = useState<Awaited<ReturnType<typeof getScriptsKeys>>['data'][0]['keys']>([]);

    const onCancelScriptForm = useCallback(() => {
        router.push('/');
    }, [router]);

    const onCancelScreenForm = useCallback(() => {
        router.push(`/script/${scriptId}?${queryString.stringify({ ...searchParams, section: 'screens', })}`);
    }, [router, searchParams, scriptId]);

    const onCancelDiagnosisForm = useCallback(() => {
        router.push(`/script/${scriptId}?${queryString.stringify({ ...searchParams, section: 'diagnoses', })}`);
    }, [router, searchParams, scriptId]);

    const loadScreens = useCallback(async () => {
        try {
            setScreensLoading(true);

            const res = await axios.get<Awaited<ReturnType<typeof listScreens>>>('/api/screens/list?data='+JSON.stringify({ 
                returnDraftsIfExist: true,
                scriptsIds: [scriptId], 
            }));

            if (res.data?.errors?.length) throw new Error(res.data.errors.join(', '));

            setScreens(res.data);
        } catch(e: any) {
            alert({
                title: '',
                message: 'Error: ' + e.message,
                variant: 'error',
            });
        } finally {
            setScreensLoading(false);
        }
    }, [scriptId, open, alert]);

    const loadKeys = useCallback(async () => {
        try {
            setKeysLoading(true);

            const res = await axios.get<Awaited<ReturnType<typeof getScriptsKeys>>>('/api/scripts/keys?data='+JSON.stringify({ 
                returnDraftsIfExist: true,
                scriptsIds: [scriptId], 
            }));

            if (res.data?.errors?.length) throw new Error(res.data.errors.join(', '));

            const _keys = res.data.data.reduce((acc, s) => [...acc, ...s.keys], [] as typeof keys);

            setKeys(_keys);
        } catch(e: any) {
            alert({
                title: '',
                message: 'Error: ' + e.message,
                variant: 'error',
            });
        } finally {
            setKeysLoading(false);
        }
    }, [scriptId, open, alert]);

    return {
        screens,
        screensLoading,
        keys,
        keysLoading,
        loadKeys,
        loadScreens,
        onCancelDiagnosisForm,
        onCancelScreenForm,
        onCancelScriptForm,
    };
}
