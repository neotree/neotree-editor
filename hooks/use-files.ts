import { create } from "zustand";
import axios from "axios";

import { getFiles as _getFiles } from "@/app/actions/files";
import { getSites as _getSites } from "@/app/actions/sites";

type GetFilesOptions = Parameters<typeof _getFiles>[0] & {
    siteId?: string;
};

export type FilesStore = {
    isModalOpen: boolean;
    loading: boolean;
    latestResults: null | Omit<Awaited<ReturnType<typeof _getFiles>>, 'data' | 'errors'>;
    files: Awaited<ReturnType<typeof _getFiles>>['data'];
    page: number;
    limit: number;
    siteId: string;
    unhandledErrors: string[];
    getFiles: (options?: GetFilesOptions) => Promise<void>;
    openModal: () => void;
    closeModal: () => void;
};

export const useFiles = create<FilesStore>((set, getStore) => {
    const getFiles: FilesStore['getFiles'] = async (options) => {
        try {
            const opts = { ...options };

            if (opts.siteId !== getStore().siteId) {
                opts.page = 1;
            }

            set({ loading: true, unhandledErrors: [], });

            const res = await axios.get<Awaited<ReturnType<typeof _getFiles>>>(`/api/files?data=${JSON.stringify({
                ...opts
            })}`);
            const { data, errors, ...latestResults } = res.data;

            if (errors?.length) {
                set({ unhandledErrors: errors, });
            } else {
                let files = [...getStore().files, ...data];

                if (opts.siteId && (opts.siteId !== getStore().siteId)) files = data;

                set({ 
                    files,
                    siteId: opts.siteId || getStore().siteId, 
                    limit: opts.limit || getStore().limit, 
                    page: opts.page || getStore().page, 
                    latestResults: latestResults,
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
        page: 1,
        limit: 25,
        siteId: '',
        files: [],
        unhandledErrors: [],
        latestResults: null,
        getFiles,
        openModal: () => {
            set({ isModalOpen: true, });
            if (!getStore().latestResults) getFiles();
        },
        closeModal: () => set({ isModalOpen: false, }),
    };
}); 
