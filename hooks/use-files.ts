import { create } from "zustand";
import axios from "axios";

import { getFiles as _getFiles } from "@/app/actions/files";
import { getSites as _getSites } from "@/app/actions/sites";

type SelectOptions = {
    selectMultiple: boolean;
    onSelectFiles: null | ((files: Awaited<ReturnType<typeof _getFiles>>['data']) => void);
};

type GetFilesOptions = Parameters<typeof _getFiles>[0] & {
    siteId?: string;
    reset?: boolean;
};

type OpenModalOptions = Partial<SelectOptions> & {
    
};

export type FilesStore = SelectOptions & {
    isModalOpen: boolean;
    loading: boolean;
    files: Awaited<ReturnType<typeof _getFiles>>['data'];
    siteId: string;
    unhandledErrors: string[];
    lastFilesQueryDate: null | Date;
    page: number;
    limit: number;
    totalPages: number;
    totalRows: number;
    getFiles: (options?: GetFilesOptions) => Promise<void>;
    openModal: (options?: OpenModalOptions) => void;
    closeModal: () => void;
};

export const useFiles = create<FilesStore>((set, getStore) => {
    const getFiles: FilesStore['getFiles'] = async (options) => {
        try {
            const { reset, ...opts } = { ...options };

            if (reset) {
                opts.page = 1;
            }

            set({ loading: true, unhandledErrors: [], });

            const res = await axios.get<Awaited<ReturnType<typeof _getFiles>>>(`/api/files?data=${JSON.stringify({
                ...opts,
                limit: opts.limit || getStore().limit,
                page: opts.page || getStore().page,
            })}`);
            const { data, errors, totalPages, totalRows, page } = res.data;

            if (errors?.length) {
                set({ unhandledErrors: errors, });
            } else {
                let files = reset ? data : [...getStore().files, ...data];
                files = files.filter((f, i) => i === files.map(f => f.fileId).indexOf(f.fileId));

                if (opts.siteId && (opts.siteId !== getStore().siteId)) files = data;

                set({ 
                    files,
                    totalPages, 
                    totalRows, 
                    page,
                    siteId: opts.siteId || getStore().siteId, 
                    lastFilesQueryDate: data.length ? new Date() : null,
                });
            }
        } catch(e: any) {
            set({ unhandledErrors: [e.message], });
        } finally {
            set({ loading: false, });
        }
    };

    return {
        isModalOpen: false,
        loading: false,
        siteId: '',
        files: [],
        unhandledErrors: [],
        lastFilesQueryDate: null,
        page: 1,
        limit: 15,
        totalPages: 1,
        totalRows: 0,
        onSelectFiles: null,
        selectMultiple: false,
        getFiles,
        openModal(options) {
            set({ 
                onSelectFiles: options?.onSelectFiles || null, 
                isModalOpen: true, 
            });
            if (!getStore().lastFilesQueryDate) getFiles();
        },
        closeModal: () => set({ isModalOpen: false, }),
    };
}); 
