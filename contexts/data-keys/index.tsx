'use client';

import { 
    createContext, 
    useCallback, 
    useContext, 
    useEffect, 
    useRef, 
    useState,
    useMemo,
} from "react";
import axios from 'axios';
import { useQueryState } from "nuqs";
import { useRouter } from 'next/navigation';

import { useAlertModal } from "@/hooks/use-alert-modal";
import { Alert } from "@/components/alert";
import { dataKeysSortOpts } from "@/constants";
import * as actions from '@/app/actions/data-keys';
import { DeleteDataKeysParams, DeleteDataKeysResponse, SaveDataKeysParams } from '@/databases/mutations/data-keys';
import { _getDataKeys, } from "@/databases/queries/data-keys";
import { Pagination } from "@/types";
import { pendingChangesAPI } from "@/lib/indexed-db";
import { useAppContext } from "@/contexts/app";
import { normalizeSearchTerm } from "@/lib/search";


function paginateData<T>(
    data: T[], 
    page: number, 
    limit: number
): { data: T[], pagination: Pagination } {
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
        data: data.slice(startIndex, endIndex),
        pagination: {
            page,
            limit,
            total,
            totalPages,
        }
    };
}

export type DataKey = Awaited<ReturnType<typeof _getDataKeys>>['data'][0];

const getDataKeyTitle = (dataKey?: Partial<DataKey>) => {
    return dataKey?.name || dataKey?.label || dataKey?.uniqueKey || 'Data key';
};

const buildTrackableSnapshot = (dataKey?: Partial<DataKey>) => {
    if (!dataKey) return null;

    return {
        uuid: dataKey.uuid || '',
        uniqueKey: dataKey.uniqueKey || '',
        name: dataKey.name || '',
        refId: dataKey.refId || '',
        dataType: dataKey.dataType || '',
        label: dataKey.label || '',
        options: Array.isArray(dataKey.options) ? dataKey.options : [],
        metadata: dataKey.metadata || {},
        version: typeof dataKey.version === 'number'
            ? dataKey.version
            : Number(dataKey.version || 0) || 0,
    };
};

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

export type GetDataKeysParams = {
    dataKeysIds?: string[];
    names?: string[];
    uniqueKeys?: string[];
    keys?: {
        name: string;
        label: string;
        dataType: string;
    }[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
};

export type tDataKeysCtx = {
    currentDataKeyUuid: string;
    loadingDataKeys: boolean;
    saving: boolean;
    exporting: boolean;
    deleting: boolean;
    dataKeys: DataKey[];
    allDataKeys: DataKey[];
    errors?: string[];
    selected: { index: number; uuid: string; }[];
    sort: string;
    filter: string;
    searchValue: string;
    pagination?: Pagination;
    currentPage: number;
    itemsPerPage: number;
    setCurrentPage: (page: number) => void;
    setSearchValue: (value: string) => void;
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
    const { authenticatedUser } = useAppContext();

    const [currentDataKeyUuid, setCurrentDataKeyUuid] = useQueryState('uuid', {
        clearOnDefault: true,
        shallow: true,
        history: 'push',
        defaultValue: '',
    });

    const [selected, setSelected] = useState<tDataKeysCtx['selected']>([]);
    const [sort, setSort] = useState(dataKeysSortOpts[0].value);
    const [filter, setFilter] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);

    /*****************************************************
     ************ LOAD 
    ******************************************************/
    const [loadingDataKeys, setLoadingDataKeys] = useState(false);
    const [allDataKeys, setAllDataKeys] = useState<DataKey[]>([]);
    const [errors, setErrors] = useState<string[] | undefined>();

    // Fetch ALL data once without pagination
    const loadDataKeys = useCallback(async (params?: GetDataKeysParams) => {
        setLoadingDataKeys(true);

        try {
            // Build query params (without pagination)
            const queryParams = new URLSearchParams();

            // Add filters if needed
            if (params?.names?.length) {
                queryParams.set('names', JSON.stringify(params.names));
            }
            if (params?.uniqueKeys?.length) {
                queryParams.set('uniqueKeys', JSON.stringify(params.uniqueKeys));
            }
            if (params?.dataKeysIds?.length) {
                queryParams.set('dataKeysIds', JSON.stringify(params.dataKeysIds));
            }

            const response = await axios.get<{ data: DataKey[], errors?: string[] }>(`/api/data-keys?${queryParams.toString()}`);

            // Apply sorting on client side using current sort value
            const sortedData = sortDataKeys(response.data.data, sort);

            setAllDataKeys(sortedData);
            setErrors(response.data.errors);
            setCurrentPage(1);
        } catch (e: any) {
            setAllDataKeys([]);
            setErrors([e.message]);
        } finally {
            setLoadingDataKeys(false);
        }
    }, [sort]); // Include sort in dependencies

    // Apply filters and search to get filtered data
    const filteredDataKeys = useMemo(() => {
        let filtered = [...allDataKeys];

        
        if (filter) {
            if (filter === 'published') { 
                filtered = filtered.filter(dataKey => !dataKey?.isDraft);
            } else if (filter === 'draft') { 
                filtered = filtered.filter(dataKey => !!dataKey?.isDraft);
            } else {
                filtered = filtered.filter(dataKey => dataKey?.dataType === filter);
            }
        }

        
        if (searchValue) {
            const { normalizedValue, isExactMatch } = normalizeSearchTerm(searchValue);

            if (normalizedValue) {
                filtered = filtered.filter(dataKey => {
                    const searchableFields = [
                        dataKey.name || '',
                        dataKey.label || '',
                    ].map(field => field.toLowerCase());

                    return searchableFields.some(field =>
                        isExactMatch ? field === normalizedValue : field.includes(normalizedValue)
                    );
                });
            }
        }

        return filtered;
    }, [allDataKeys, filter, searchValue]);

    const { dataKeys, pagination } = useMemo(() => {
        if (!filteredDataKeys.length) {
            return { dataKeys: [], pagination: undefined };
        }

        const paginatedResult = paginateData(filteredDataKeys, currentPage, itemsPerPage);
        
        return {
            dataKeys: paginatedResult.data,
            pagination: paginatedResult.pagination,
        };
    }, [filteredDataKeys, currentPage, itemsPerPage]);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            if (prefetchDataKeys) loadDataKeys();
        }
    }, [prefetchDataKeys, loadDataKeys]);

    // Reset to page 1 when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
        setSelected([]);
    }, [filter, searchValue]);

    // Re-sort data when sort value changes and we have data
    useEffect(() => {
        if (mounted.current && allDataKeys.length > 0) {
            const sortedData = sortDataKeys([...allDataKeys], sort);
            setAllDataKeys(sortedData);
            setCurrentPage(1);
            setSelected([]);
        }
    }, [sort]); // This effect handles sorting when sort state changes

    /*****************************************************
     ************ SAVE 
    ******************************************************/
    const [saving, setSaving] = useState(false);

    const saveDataKeys: tDataKeysCtx['saveDataKeys'] = useCallback(async (data, cb) => {
        try {
            setSaving(true);

            const dataWithNumberVersion = data.map(d => ({
                ...d,
                version: typeof d.version === 'string' ? Number(d.version) : d.version,
            }));

            const response = await axios.post('/api/data-keys/save', { 
                data: dataWithNumberVersion, 
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

    const recordDeletionPendingChanges = useCallback(async (keysToDelete: DataKey[]) => {
        if (!keysToDelete.length) return;

        const userId = authenticatedUser?.userId;
        const userName = authenticatedUser?.displayName;

        for (const key of keysToDelete) {
            if (!key?.uuid) continue;

            const snapshot = buildTrackableSnapshot(key);
            if (!snapshot) continue;

            const entityTitle = getDataKeyTitle(key);

            await pendingChangesAPI.clearEntityChanges(key.uuid, "dataKey");

            await pendingChangesAPI.addChange({
                entityId: key.uuid,
                entityType: "dataKey",
                entityTitle,
                action: "delete",
                fieldPath: "dataKey",
                fieldName: entityTitle,
                oldValue: snapshot,
                newValue: null,
                description: `Marked "${entityTitle}" for deletion`,
                userId,
                userName,
                fullSnapshot: snapshot,
            });
        }
    }, [authenticatedUser?.userId, authenticatedUser?.displayName]);

    const deleteDataKeys: tDataKeysCtx['deleteDataKeys'] = useCallback(async (data) => {
        const keysToDelete = allDataKeys.filter(key => key?.uuid && data.includes(key.uuid));

        try {
            setDeleting(true);

            const response = await axios.delete<DeleteDataKeysResponse>('/api/data-keys?data='+JSON.stringify({ 
                dataKeysIds: data, 
                broadcastAction: true, 
            } satisfies DeleteDataKeysParams));

            const res = response.data;

            if (res.errors?.length) throw new Error(res.errors[0]);

            await recordDeletionPendingChanges(keysToDelete);

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
    }, [router.refresh, alert, loadDataKeys, allDataKeys, recordDeletionPendingChanges]);

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
            
            await loadDataKeys();

            setSelected([]);

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
    }, [loadDataKeys, alert]);
   

    /*****************************************************/

    const onSort = useCallback((sortValue = dataKeysSortOpts[0].value) => {
        setSort(sortValue);
        setSelected([]);
        setCurrentPage(1);
    }, []);

    const extractDataKeys: tDataKeysCtx['extractDataKeys'] = useCallback((uuids, opts) => {
        let keys = uuids
            .map(o => allDataKeys.find(k => (k.uniqueKey === o) || (k.uuid === o))!)
            .filter(k => k);

        if (opts?.withNested) {
            keys.filter(k => k.options.length).forEach(k => {
                const nested = extractDataKeys(k.options, opts);
                keys = [...keys, ...nested];
            });
        }

        return keys.filter((k, i) => keys.map(k => k.uniqueKey).indexOf(k.uniqueKey) === i);
    }, [allDataKeys]);

    if (errors?.length) {
        return (
            <Alert
                title="Error"
                message={"Failed to load data keys: " + errors.join(', ')}
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
                    dataKeys,
                    allDataKeys, 
                    errors,
                    selected,
                    currentDataKeyUuid,
                    sort,
                    filter,
                    searchValue,
                    pagination,
                    currentPage,
                    itemsPerPage,
                    setCurrentPage,
                    setSearchValue,
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

        case 'updatedAt.asc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: new Date(key1.updatedAt || '').getTime().toString(),
                key2: new Date(key2.updatedAt || '').getTime().toString(),
            }));
            break;

        case 'updatedAt.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: new Date(key1.updatedAt || '').getTime().toString(),
                key2: new Date(key2.updatedAt || '').getTime().toString(),
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
}
