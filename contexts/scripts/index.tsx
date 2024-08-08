'use client';

import { createContext, useCallback, useContext, useState, useMemo, useEffect, } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import * as serverActions from '@/app/actions/scripts';
import { getHospitals } from "@/app/actions/hospitals";
import { useAppContext } from "../app";
import { useSearchParams } from "@/hooks/use-search-params";
import queryString from "query-string";

export interface IScriptsContext extends  
ScriptsContextProviderProps,
ReturnType<typeof useScriptsContentHook>
{}

export const ScriptsContext = createContext<IScriptsContext>(null!);

export const useScriptsContext = () => useContext(ScriptsContext);

type ScriptsContextProviderProps = typeof serverActions & {
    scripts: Awaited<ReturnType<typeof serverActions['getScripts']>>;
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

export type FormDataType = Parameters<IScriptsContext['saveScripts']>[0]['data'][0];

function useScriptsContentHook({
    scripts: scriptsProp,
    saveScripts,
    deleteScripts,
}: ScriptsContextProviderProps) {
    const router = useRouter();
    const { scriptId, } = useParams();
    const { parsed: searchParams, } = useSearchParams();

    const { viewOnly } = useAppContext();
    
    const [scripts, setScripts] = useState(scriptsProp);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [scriptsIdsToExport, setScriptsIdsToExport] = useState<string[]>([]);

    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();

    useEffect(() => { setScripts(scriptsProp); }, [scriptsProp]);

    const onSave = useCallback(async (data: FormDataType[]) => {
        setSaving(true);

        const res = await saveScripts({ data, broadcastAction: true, });

        if (res.errors?.length) {
            alert({
                title: 'Error',
                message: res.errors.join(', '),
                variant: 'error',
            });
        } else {
            router.refresh();
            alert({
                title: 'Success',
                message: 'Scripts saved successfully!',
                variant: 'success',
                onClose: () => router.push('/'),
            });
        }

        setSaving(false);
    }, [saveScripts, alert, router]);

    const onDelete = useCallback(async (scriptsIds: string[]) => {
        confirm(async () => {
            const _scripts = { ...scripts };

            setScripts(prev => ({ ...prev, data: prev.data.filter(s => !scriptsIds.includes(s.scriptId)) }));
            setSelected([]);

            setLoading(true);

            const res = await deleteScripts({ scriptsIds, broadcastAction: true, });

            if (res.errors?.length) {
                alert({
                    title: 'Error',
                    message: res.errors.join(', '),
                    variant: 'error',
                    onClose: () => setScripts(_scripts),
                });
            } else {
                setSelected([]);
                router.refresh();
                alert({
                    title: 'Success',
                    message: 'Scripts deleted successfully!',
                    variant: 'success',
                });
            }

            setLoading(false);
        }, {
            danger: true,
            title: 'Delete scripts',
            message: 'Are you sure you want to delete scripts?',
            positiveLabel: 'Yes, delete',
        });
    }, [deleteScripts, confirm, alert, router, scripts]);

    const onSort = useCallback(async (oldIndex: number, newIndex: number, sortedIndexes: { oldIndex: number, newIndex: number, }[]) => {
        const sorted = scripts.data.map((s, i) => {
            const item = sortedIndexes.filter(s => s.oldIndex === i)[0];
            if (i === item.oldIndex) {
                if (item.oldIndex === item.newIndex) return s;
                return { ...scripts.data[item.newIndex], position: item.newIndex + 1, };
            }
            return s;
        });

        const payload: { scriptId: string; position: number; }[] = [];

        sorted.forEach((s, i) => {
            const old = scripts.data[i];
            if (old.position !== s.position) {
                const position = i + 1;
                payload.push({ scriptId: s.scriptId!, position, });
                // sorted[i].position = position;
            }
        });

        setScripts(prev => ({ ...prev, data: sorted, }));
        
        await saveScripts({ data: payload, broadcastAction: true, });

        router.refresh();
    }, [saveScripts, alert, scripts, router]);

    const onDuplicate = useCallback(async (scriptsIds?: string[]) => {
        window.alert('DUPLICATE SCRIPT!!!');
    }, []);

    const onCancelScriptForm = useCallback(() => {
        router.push('/');
    }, [router]);

    const onCancelScreenForm = useCallback(() => {
        router.push(`/script/${scriptId}?${queryString.stringify({ ...searchParams, section: 'screens', })}`);
    }, [router, searchParams, scriptId]);

    const onCancelDiagnosisForm = useCallback(() => {
        router.push(`/script/${scriptId}?${queryString.stringify({ ...searchParams, section: 'diagnoses', })}`);
    }, [router, searchParams, scriptId]);

    const scriptsToExport = useMemo(() => scripts.data.filter(t => scriptsIdsToExport.includes(t.scriptId)), [scriptsIdsToExport, scripts]);
    const disabled = useMemo(() => viewOnly, [viewOnly]);

    return {
        saving,
        isFormOpen,
        loading, 
        selected,
        scripts,
        scriptsIdsToExport,
        scriptsToExport,
        disabled,
        setScriptsIdsToExport,
        onCancelDiagnosisForm,
        onCancelScreenForm,
        onCancelScriptForm,
        onSort,
        setScripts,
        setSelected,
        setLoading,
        setSaving,
        onSave,
        onDelete,
        onDuplicate,
    };
}
