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
import { useQueryState } from "nuqs";
import { useRouter } from 'next/navigation';

import { useAlertModal } from "@/hooks/use-alert-modal";
import { _getDataKeys, } from "@/databases/queries/data-keys";
import { Alert } from "@/components/alert";
import { dataKeysSortOpts } from "@/constants";
import * as actions from '@/app/actions/data-keys';
import { DeleteDataKeysParams, DeleteDataKeysResponse, SaveDataKeysParams } from '@/databases/mutations/data-keys';

export type DataKey = Awaited<ReturnType<typeof _getDataKeys>>['data'][0];

export type DataKeyFormData = {
    name: DataKey['name'];
    refId: DataKey['refId'];
    dataType: DataKey['dataType'];
    label: DataKey['label'];
    options: DataKey['options'];
    metadata: DataKey['metadata'];
    version: DataKey['version'];
};

export type ExportDataKeysFormData = {
    overwriteExisting: boolean;
    uuids: string[];
    siteId: string;
};

export type tDataKeysCtx = {
    currentDataKeyUuid: string;
    loadingDataKeys: boolean;
    saving: boolean;
    exporting: boolean;
    deleting: boolean;
    dataKeys: DataKey[];
    errors?: string[];
    selected: { index: number; uuid: string; }[];
    sort: string;
    filter: string;
    saveDataKeys: (data: DataKeyFormData[], cb?: ((error?: string) => void)) => Promise<void>;
    deleteDataKeys: (data: string[]) => Promise<void>;
    exportDataKeys: (data: ExportDataKeysFormData) => Promise<void>;
    setSort: (value: string) => void;
    onSort: (value: string) => void;
    setFilter: (value: string) => void;
    setCurrentDataKeyUuid: (uuid: string) => void;
    loadDataKeys: () => Promise<void>;
    setSelected: React.Dispatch<tDataKeysCtx['selected']>;
    extractDataKeys: (uuids: string[], opts?: {
        withNested?: boolean;
    }) => DataKey[];
};

export const DataKeysCtx = createContext<tDataKeysCtx>(null!);

export const useDataKeysCtx = () => {
    const ctx = useContext(DataKeysCtx);
    if (!ctx) throw new Error('useChart must be used within a <DataKeysCtxProvider />');
    return ctx;
};

export function DataKeysCtxProvider({ 
    children,  
    prefetchDataKeys = true,
}: {
    children: React.ReactNode;
    prefetchDataKeys?: boolean;
}) {
    const mounted = useRef(false);
    const router = useRouter();
    const { alert } = useAlertModal();

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
    const [loadingDataKeys, setLoadingDataKeys] = useState(false);
    const [dataKeys, setDataKeys] = useState<Awaited<ReturnType<typeof _getDataKeys>>>({
        data: [],
    });
    const [loadingSelectOptions, setLoadingSelectOptions] = useState(false);

    const loadDataKeys = useCallback(async () => {
        setLoadingDataKeys(true);
        axios
            .get<typeof dataKeys>('/api/data-keys')
            .then(res => {
                res.data.data = sortDataKeys(res.data.data, sort),
                setDataKeys(res.data);
            })
            .catch(e => {
                setDataKeys({ data: [], errors: [e.message], });
            })
            .finally(() => setLoadingDataKeys(false));
    }, [sort]);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            if (prefetchDataKeys) loadDataKeys();
        }
    }, [prefetchDataKeys, loadDataKeys]);

    /*****************************************************
     ************ SAVE 
    ******************************************************/
    const [saving, setSaving] = useState(false);

    const saveDataKeys: tDataKeysCtx['saveDataKeys'] = useCallback(async (data, cb) => {
        try {
            setSaving(true);

            const response = await axios.post('/api/data-keys/save', { 
                data, 
                broadcastAction: true, 
            } satisfies SaveDataKeysParams);
            const res = response.data as Awaited<ReturnType<typeof actions.saveDataKeys>>;

            if (res.errors?.length) {
                alert({
                    title: 'Error',
                    message: res.errors.join(', '),
                    variant: 'error',
                });
            } else {
                await loadDataKeys();
                router.refresh();
                alert({
                    message: "Data key saved!",
                    variant: 'success',
                    onClose: () => cb?.(),
                });
            }
        } catch(e: any) {
            alert({
                title: 'Error',
                message: 'Failed to save data key: ' + e.message,
                onClose: () => cb?.(e.message),
            });
        } finally {
            setSaving(false);
        }
    }, [alert, router.refresh, loadDataKeys]);

    /*****************************************************
     ************ DELETE 
    ******************************************************/
    const [deleting, setDeleting] = useState(false);

    const deleteDataKeys: tDataKeysCtx['deleteDataKeys'] = useCallback(async (data) => {
        try {
            setDeleting(true);

            // TODO: Replace this with server action
            const response = await axios.delete<DeleteDataKeysResponse>('/api/data-keys?data='+JSON.stringify({ 
                dataKeysIds: data, 
                broadcastAction: true, 
            } satisfies DeleteDataKeysParams));

            const res = response.data;

            if (res.errors?.length) throw new Error(res.errors[0]);

            setSelected([]);

            await loadDataKeys();

            router.refresh();

            alert({
                title: 'Success',
                message: 'Data keys deleted successfully!',
                variant: 'success',
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            setDeleting(false);
        }
    }, [router.refresh, alert, loadDataKeys]);

    /*****************************************************
     ************ EXPORT 
    ******************************************************/
    const [exporting, setExporting] = useState(false);

    const exportDataKeys: tDataKeysCtx['exportDataKeys'] = useCallback(async (data) => {
        try {
            setExporting(true);

            const response = await axios.post<Awaited<ReturnType<typeof actions.exportDataKeys>>>(`/api/data-keys/export`, data);
            const res = response.data;

            if (res.errors?.length) throw new Error(res.errors[0]);
            router.refresh();

            alert({
                title: 'Success',
                message: 'Data exported successfully!',
                variant: 'success',
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            setExporting(false);
        }
    }, [dataKeys.data, router.refresh, alert]);
   

    /*****************************************************/

    const onSort = useCallback((sortValue = dataKeysSortOpts[0].value) => {
        setSort(sortValue);
        setSelected([]);
        setDataKeys(prev => ({
            ...prev,
            data: sortDataKeys(prev.data, sortValue),
        }))
    }, []);

    const extractDataKeys: tDataKeysCtx['extractDataKeys'] = useCallback((uuids, opts) => {
        let keys = uuids
            .map(o => dataKeys.data.find(k => (k.uniqueKey === o) || (k.uuid === o))!)
            .filter(k => k);

        if (opts?.withNested) {
            keys.filter(k => k.options.length).forEach(k => {
                const nested = extractDataKeys(k.options, opts);
                keys = [...keys, ...nested];
            });
        }

        return keys.filter((k, i) => keys.map(k => k.uniqueKey).indexOf(k.uniqueKey) === i);
    }, [dataKeys]);

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
                    loadingDataKeys,
                    saving,
                    exporting,
                    deleting,
                    dataKeys: dataKeys.data,
                    errors: dataKeys.errors,
                    selected,
                    currentDataKeyUuid,
                    sort,
                    filter,
                    extractDataKeys,
                    deleteDataKeys,
                    saveDataKeys,
                    exportDataKeys,
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
        case 'refId.asc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: (key1.refId || '').trim(),
                key2: (key2.refId || '').trim(),
            }));
            break;

        case 'refId.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: (key1.refId || '').trim(),
                key2: (key2.refId || '').trim(),
            }));
            break;

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
