'use client';

import { 
    createContext, 
    useCallback, 
    useContext, 
    useEffect, 
    useRef, 
    useState 
} from "react";
import axios from 'axios';

import { _getDataKeys } from "@/databases/queries/data-keys";
import { Loader } from "@/components/loader";
import { Alert } from "@/components/alert";

export type DataKey = Awaited<ReturnType<typeof _getDataKeys>>['data'][0];

export type tDataKeysCtx = {
    loading: boolean;
    dataKeys: DataKey[];
    errors?: string[];
    selected: { index: number; uuid: string; }[];
    loadDataKeys: () => Promise<DataKey[]>;
    setSelected: React.Dispatch<tDataKeysCtx['selected']>;
};

export const DataKeysCtx = createContext<tDataKeysCtx>({
    loading: false,
    dataKeys: [],
    selected: [],
    loadDataKeys: async () => [],
    setSelected: () => {},
});

export const useDataKeysCtx = () => useContext(DataKeysCtx);

export function DataKeysCtxProvider({ children, }: {
    children: React.ReactNode;
}) {
    const mounted = useRef(false);

    /*****************************************************
     ************ LOAD 
    ******************************************************/
    const [loading, setLoading] = useState(false);
    const [dataKeys, setDataKeys] = useState<Awaited<ReturnType<typeof _getDataKeys>>>({
        data: [],
    });

    const loadDataKeys = useCallback(() => new Promise<DataKey[]>((resolve, reject) => {
        setLoading(true);
        axios
            .get<typeof dataKeys>('/api/data-keys')
            .then(res => {
                setDataKeys(res.data);
                resolve(res.data.data || []);
            })
            .catch(e => {
                setDataKeys({ data: [], errors: [e.message], });
                reject(e);
            })
            .finally(() => setLoading(false));
    }), []);

    useEffect(() => {
        if (!mounted.current) {
            loadDataKeys();
        }
    }, [loadDataKeys]);

    /*****************************************************
     ************ SELECT 
    ******************************************************/
    const [selected, setSelected] = useState<tDataKeysCtx['selected']>([]);

    const refreshSelected = useCallback(() => {
        const _selected = dataKeys.data
            .map((k, i) => ({
                index: i,
                uuid: k.uuid,
            }))
            .filter(s => selected.map(s => s.uuid).includes(s.uuid));
        setSelected(_selected);
    }, [dataKeys.data, selected]);

    if (loading) return <Loader overlay />;

    if (dataKeys?.errors?.length) {
        return (
            <Alert
                title="Error"
                message={"Failed to load data keys: " + dataKeys?.errors?.join(', ')}
                buttonLabel="Try again"
                onClose={() => loadDataKeys()}
            />
        );
    }

    return (
        <>
            <DataKeysCtx.Provider
                value={{
                    loading,
                    dataKeys: dataKeys.data,
                    errors: dataKeys.errors,
                    selected,
                    loadDataKeys,
                    setSelected,
                }}
            >
                {children}
            </DataKeysCtx.Provider>
        </>
    );
}
