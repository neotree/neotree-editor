'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import queryString from "query-string";
import axios from "axios";

import * as serverActions from '@/app/actions/scripts';
import * as filesActions from "@/app/actions/files";
import { getHospitals } from "@/app/actions/hospitals";
import { useSearchParams } from "@/hooks/use-search-params";
import { listScreens, getScriptsWithItems } from "@/app/actions/scripts";
import type { ConditionKey } from "@/lib/conditional-expression";
import socket from "@/lib/socket";

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

export type ProblemFormDataType = Parameters<IScriptsContext['saveProblems']>[0]['data'][0];

function useScriptsContentHook({}: ScriptsContextProviderProps) {
    const router = useRouter();
    const { scriptId, } = useParams();
    const { parsed: searchParams, } = useSearchParams();

    const [screensLoading, setScreensLoading] = useState(false);
    const [screens, setScreens] = useState<Awaited<ReturnType<typeof listScreens>>>({
        data: [],
    });

    const [keysLoading, setKeysLoading] = useState(false);
    const [keys, setKeys] = useState<Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['dataKeys']>([]);
    const [conditionKeys, setConditionKeys] = useState<ConditionKey[]>([]);
    const [conditionScreens, setConditionScreens] = useState<Awaited<ReturnType<typeof serverActions.getScriptsConditionKeys>>['data'][0]['conditionScreens']>([]);
    const [conditionCatalogueReady, setConditionCatalogueReady] = useState(false);

    const keysRequestRef = useRef<Promise<void> | null>(null);

    // Scope the key catalogue to the current script: clear it (and any in-flight
    // request) when the scriptId changes so expressions are never validated
    // against a previous script's keys.
    const keysScriptIdRef = useRef(scriptId);
    useEffect(() => {
        keysScriptIdRef.current = scriptId;
        keysRequestRef.current = null;
        setKeys([]);
        setConditionKeys([]);
        setConditionScreens([]);
        setConditionCatalogueReady(false);
    }, [scriptId]);

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
        // Collapse concurrent calls (multiple condition editors mounting at once)
        // into a single in-flight request.
        if (keysRequestRef.current) return keysRequestRef.current;

        const requestedScriptId = scriptId;

        const run = (async () => {
            try {
                setKeysLoading(true);

                const { data: res, } = await axios.get<Awaited<ReturnType<typeof serverActions.getScriptsConditionKeys>>>('/api/scripts/keys?data='+JSON.stringify({
                    returnDraftsIfExist: true,
                    scriptsIds: [scriptId],
                }));

                if (res?.errors?.length) throw new Error(res.errors.join(', '));

                // Ignore a stale response if we've since navigated to another script.
                if (requestedScriptId !== keysScriptIdRef.current) return;

                const scripts = res.data;

                const _keys = scripts.reduce((acc, s) => [...acc, ...s.dataKeys], [] as typeof keys);
                const _conditionKeys = scripts.reduce(
                    (acc, s) => [...acc, ...(s.conditionKeys || [])],
                    [] as ConditionKey[],
                );
                const _conditionScreens = scripts.reduce(
                    (acc, s) => [...acc, ...(s.conditionScreens || [])],
                    [] as typeof conditionScreens,
                );

                setKeys(_keys);
                setConditionKeys(_conditionKeys);
                setConditionScreens(_conditionScreens);
                setConditionCatalogueReady(true);
            } catch(e: any) {
                alert({
                    title: '',
                    message: 'Error: ' + e.message,
                    variant: 'error',
                });
            } finally {
                setKeysLoading(false);
                keysRequestRef.current = null;
            }
        })();

        keysRequestRef.current = run;
        return run;
    }, [scriptId, open, alert]);

    // A write can land while the initial request is still in flight. Waiting
    // for it and then issuing another request guarantees callers receive the
    // post-write diagnosis/problem catalogue rather than a stale response.
    const reloadKeys = useCallback(async () => {
        if (keysRequestRef.current) await keysRequestRef.current;
        await loadKeys();
    }, [loadKeys]);

    // Keep virtual Diagnoses/Problems options current when another editor saves,
    // deletes, publishes, or reorders CDS content. The root router refresh does
    // not update client context state, so refresh this catalogue explicitly.
    useEffect(() => {
        const relevantActions = new Set([
            "save_diagnoses",
            "delete_diagnoses",
            "save_problems",
            "delete_problems",
            "save_screens",
            "delete_screens",
            "save_data_keys",
            "delete_data_keys",
            "resolve_data_key_integrity_entry",
            "resolve_data_key_integrity_entries_bulk",
            "save_scripts",
            "publish_data",
            "discard_drafts",
            "clear_pending_deletion",
            "rollback_change_log",
            "rollback_data_version",
            "copy_scripts",
        ]);
        let timer: ReturnType<typeof setTimeout> | undefined;
        const onDataChanged = (action?: string) => {
            if (action && !relevantActions.has(action)) return;
            clearTimeout(timer);
            timer = setTimeout(() => void reloadKeys(), 150);
        };
        socket.on("data_changed", onDataChanged);
        return () => {
            clearTimeout(timer);
            socket.off("data_changed", onDataChanged);
        };
    }, [reloadKeys]);

    return {
        screens,
        screensLoading,
        keys,
        conditionKeys,
        conditionScreens,
        conditionCatalogueReady,
        keysLoading,
        loadKeys,
        reloadKeys,
        loadScreens,
        onCancelDiagnosisForm,
        onCancelScreenForm,
        onCancelScriptForm,
    };
}
