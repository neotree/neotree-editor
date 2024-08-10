'use client';

import { createContext, useCallback, useContext, useState, useMemo, } from "react";
import { useParams, useRouter } from "next/navigation";
import queryString from "query-string";

import { useAlertModal } from "@/hooks/use-alert-modal";
import * as serverActions from '@/app/actions/scripts';
import { getHospitals } from "@/app/actions/hospitals";
import { useSearchParams } from "@/hooks/use-search-params";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAppContext } from "../app";

export interface IScriptsContext extends  
ScriptsContextProviderProps,
ReturnType<typeof useScriptsContentHook>
{}

export const ScriptsContext = createContext<IScriptsContext>(null!);

export const useScriptsContext = () => useContext(ScriptsContext);

type ScriptsContextProviderProps = typeof serverActions & {
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

function useScriptsContentHook({}: ScriptsContextProviderProps) {
    const router = useRouter();
    const { scriptId, } = useParams();
    const { parsed: searchParams, } = useSearchParams();

    const { viewOnly } = useAppContext();
    
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [scriptsIdsToExport, setScriptsIdsToExport] = useState<string[]>([]);

    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();

    const onCancelScriptForm = useCallback(() => {
        router.push('/');
    }, [router]);

    const onCancelScreenForm = useCallback(() => {
        router.push(`/script/${scriptId}?${queryString.stringify({ ...searchParams, section: 'screens', })}`);
    }, [router, searchParams, scriptId]);

    const onCancelDiagnosisForm = useCallback(() => {
        router.push(`/script/${scriptId}?${queryString.stringify({ ...searchParams, section: 'diagnoses', })}`);
    }, [router, searchParams, scriptId]);

    const disabled = useMemo(() => viewOnly, [viewOnly]);

    return {
        saving,
        loading, 
        selected,
        scriptsIdsToExport,
        disabled,
        setScriptsIdsToExport,
        onCancelDiagnosisForm,
        onCancelScreenForm,
        onCancelScriptForm,
        setSelected,
        setLoading,
        setSaving,
        alert,
        confirm,
    };
}
