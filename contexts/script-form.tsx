"use client"

import { createContext, useContext, useMemo, useState } from "react"

import { getScriptsConditionKeys, getScriptsWithItems } from "@/app/actions/scripts"
import type { ConditionKey } from "@/lib/conditional-expression";
import { useScriptsContext, ScriptFormDataType, IScriptsContext } from "@/contexts/scripts";

const ScriptFormCtx = createContext<null | ReturnType<typeof useScriptFormCtxValue>>(null);

export function useScriptFormCtx() {
    const ctxValue = useContext(ScriptFormCtx);
    if (!ctxValue) throw new Error('`useScriptFormCtx` can only be used inside `<ScriptFormCtxProvider />`');
    return ctxValue;
}

export type ScriptFormCtxProps = {
    children: React.ReactNode;
    conditionKeys?: Awaited<ReturnType<typeof getScriptsConditionKeys>>['data'];
    formData?: ScriptFormDataType;
    hospitals: Awaited<ReturnType<IScriptsContext['getHospitals']>>['data'];
}

export function ScriptFormCtxProvider({ children, ...props }: ScriptFormCtxProps) {
    const ctxValue = useScriptFormCtxValue(props)
    return (
        <ScriptFormCtx.Provider value={ctxValue}>
            {children}
        </ScriptFormCtx.Provider>
    );
}

function useScriptFormCtxValue({ conditionKeys, ...props }: Omit<ScriptFormCtxProps, 'children'>) {
    const [conditionCatalogueReady, setConditionCatalogueReady] = useState(true);

    const conditionKeysParsed = useMemo(() => {
        return {
            keys: !conditionKeys ? [] : conditionKeys.reduce((acc, s) => [...acc, ...s.dataKeys], [] as Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['dataKeys']),
            conditionKeys: !conditionKeys ? [] : conditionKeys.reduce(
            (acc, s) => [...acc, ...(s.conditionKeys || [])],
            [] as ConditionKey[],
            ),
            conditionScreens: !conditionKeys ? [] : conditionKeys.reduce(
            (acc, s) => [...acc, ...(s.conditionScreens || [])],
            [] as typeof conditionKeys[0]['conditionScreens'],
            ),
        };
    }, [conditionKeys]);

    return {
        ...props,
        ...conditionKeysParsed,
        conditionCatalogueReady,
    };
}
