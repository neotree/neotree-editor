'use client';

import { createContext, useCallback, useContext, } from "react";
import { useParams, useRouter } from "next/navigation";
import queryString from "query-string";

import * as serverActions from '@/app/actions/scripts';
import * as filesActions from "@/app/actions/files";
import { getHospitals } from "@/app/actions/hospitals";
import { useSearchParams } from "@/hooks/use-search-params";

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
        hospitals: Awaited<ReturnType<typeof getHospitals>>
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

    const onCancelScriptForm = useCallback(() => {
        router.push('/');
    }, [router]);

    const onCancelScreenForm = useCallback(() => {
        router.push(`/script/${scriptId}?${queryString.stringify({ ...searchParams, section: 'screens', })}`);
    }, [router, searchParams, scriptId]);

    const onCancelDiagnosisForm = useCallback(() => {
        router.push(`/script/${scriptId}?${queryString.stringify({ ...searchParams, section: 'diagnoses', })}`);
    }, [router, searchParams, scriptId]);

    return {
        onCancelDiagnosisForm,
        onCancelScreenForm,
        onCancelScriptForm,
    };
}
