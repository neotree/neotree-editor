'use client';

import { 
    createContext, 
    useCallback, 
    useContext, 
    useEffect, 
    useMemo, 
    useRef, 
    useState 
} from "react";
import axios from 'axios';
import { useQueryState } from "nuqs";

import { _getDataKeys } from "@/databases/queries/data-keys";
import { Loader } from "@/components/loader";
import { Alert } from "@/components/alert";
import { dataKeysSortOpts } from "@/constants";

export type DataKey = Awaited<ReturnType<typeof _getDataKeys>>['data'][0];

export type tDataKeysCtx = {
    currentDataKeyUuid: string;
    loading: boolean;
    dataKeys: DataKey[];
    errors?: string[];
    selected: { index: number; uuid: string; }[];
    sort: string;
    filter: string;
    setSort: (value: string) => void;
    onSort: (value: string) => void;
    setFilter: (value: string) => void;
    setCurrentDataKeyUuid: (uuid: string) => void;
    loadDataKeys: () => Promise<DataKey[]>;
    setSelected: React.Dispatch<tDataKeysCtx['selected']>;
};

export const DataKeysCtx = createContext<tDataKeysCtx>(null!);

export const useDataKeysCtx = () => {
    const ctx = useContext(DataKeysCtx);
    if (!ctx) throw new Error('useChart must be used within a <DataKeysCtxProvider />');
    return ctx;
};

export function DataKeysCtxProvider({ children, }: {
    children: React.ReactNode;
}) {
    const mounted = useRef(false);

    const [currentDataKeyUuid, setCurrentDataKeyUuid] = useQueryState('uuid', {
        clearOnDefault: true,
        shallow: true,
        history: 'push',
        defaultValue: '',
    });

    const [selected, setSelected] = useState<tDataKeysCtx['selected']>([]);
    const [sort, setSort] = useState(dataKeysSortOpts[0].value);
    const [filter, setFilter] = useState('');

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
                res.data.data = sortDataKeys(res.data.data, sort),
                setDataKeys(res.data);
                resolve(res.data.data || []);
            })
            .catch(e => {
                setDataKeys({ data: [], errors: [e.message], });
                reject(e);
            })
            .finally(() => setLoading(false));
    }), [sort]);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            loadDataKeys();
        }
    }, [loadDataKeys]);

    const onSort = useCallback((sortValue = dataKeysSortOpts[0].value) => {
        setSort(sortValue);
        setSelected([]);
        setDataKeys(prev => ({
            ...prev,
            data: sortDataKeys(prev.data, sortValue),
        }))
    }, []);

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
                    currentDataKeyUuid,
                    sort,
                    filter,
                    setCurrentDataKeyUuid,
                    loadDataKeys,
                    setSelected,
                    setSort,
                    onSort,
                    setFilter,
                }}
            >
                {children}
            </DataKeysCtx.Provider>
        </>
    );
}

function sortDataKeys (
    dataKeys: DataKey[], 
    sortValue = dataKeysSortOpts[0].value,
) {
    let sorted = [...dataKeys];

    const sortFn = ({ key1, key2, sortDirection, }: {
        sortDirection: 'asc' | 'desc',
        key1: string;
        key2: string;
    }) => {
        key1 = (key1 || '').trim().toLowerCase();
        key2 = (key2 || '').trim().toLowerCase();

        let returnVal = 0;

        if (sortDirection === 'asc') {
            if(key1 < key2) returnVal = -1;
            if(key1 > key2) returnVal = 1;
        } else {
            if(key1 > key2) returnVal = -1;
            if(key1 < key2) returnVal = 1;
        }

        return returnVal;
    };

    switch(sortValue) {
        case 'key.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: key1.name,
                key2: key2.name,
            }));
            break;

        case 'label.asc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: (key1.label || key1.name || '').trim(),
                key2: (key2.label || key2.name || '').trim(),
            }));
            break;

        case 'label.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: (key1.label || key1.name || '').trim(),
                key2: (key2.label || key2.name || '').trim(),
            }));
            break;

        case 'type.asc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: (key1.dataType || '').trim(),
                key2: (key2.dataType || '').trim(),
            }));
            break;

        case 'type.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: (key1.dataType || '').trim(),
                key2: (key2.dataType || '').trim(),
            }));
            break;

        case 'createdAt.asc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: new Date(key1.createdAt || '').getTime().toString(),
                key2: new Date(key2.createdAt || '').getTime().toString(),
            }));
            break;

        case 'createdAt.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: new Date(key1.createdAt || '').getTime().toString(),
                key2: new Date(key2.createdAt || '').getTime().toString(),
            }));
            break;
            
        default:
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: key1.name,
                key2: key2.name,
            }));
    }

    return sorted;
};
