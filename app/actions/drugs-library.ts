'use server';

import { getSiteAxiosClient } from "@/lib/server/axios";
import { 
    _saveDrugsLibraryItems, 
    _saveDrugsLibraryItemsIfKeysNotExist,
    _saveDrugsLibraryItemsUpdateIfExists,
    _deleteDrugsLibraryItems,
    _copyDrugsLibraryItems,
    _removeDrugLibraryItemsReferences 
} from "@/databases/mutations/drugs-library";
import { 
    _getDrugsLibraryItem, 
    _getDrugsLibraryItems, 
    _countDrugsLibraryItems, 
    _defaultDrugsLibraryItemsCount 
} from "@/databases/queries/drugs-library";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export const saveDrugsLibraryItemsIfKeysNotExist: typeof _saveDrugsLibraryItemsIfKeysNotExist = async params => {
    try {
        const session = await isAllowed();
        return await _saveDrugsLibraryItemsIfKeysNotExist({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('saveDrugsLibraryItemsIfKeysNotExist ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

export const saveDrugsLibraryItemsUpdateIfExists: typeof _saveDrugsLibraryItemsUpdateIfExists = async params => {
    try {
        const session = await isAllowed();
        return await _saveDrugsLibraryItemsUpdateIfExists({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('saveDrugsLibraryItemsUpdateIfExists ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

export const copyDrugsLibraryItems: typeof _copyDrugsLibraryItems = async params => {
    try {
        const session = await isAllowed();
        return await _copyDrugsLibraryItems({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('copyDrugsLibraryItems ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

export const deleteDrugsLibraryItems: typeof _deleteDrugsLibraryItems = async (...args) => {
    try {
        await isAllowed();
        return await _deleteDrugsLibraryItems(...args);
    } catch(e: any) {
        logger.error('deleteDrugsLibraryItems ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const countDrugsLibraryItems: typeof _countDrugsLibraryItems = async (...args) => {
    try {
        await isAllowed();
        return await _countDrugsLibraryItems(...args);
    } catch(e: any) {
        logger.error('countDrugsLibraryItems ERROR', e.message);
        return { errors: [e.message], data: _defaultDrugsLibraryItemsCount, };
    }
};

export const getDrugsLibraryItems: typeof _getDrugsLibraryItems = async (...args) => {
    try {
        await isAllowed();
        return await _getDrugsLibraryItems(...args);
    } catch(e: any) {
        logger.error('getDrugsLibraryItems ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getDrugsLibraryItem: typeof _getDrugsLibraryItem = async (...args) => {
    await isAllowed();
    return await _getDrugsLibraryItem(...args);
};

export const saveDrugsLibraryItems: typeof _saveDrugsLibraryItems = async params => {
    try {
        const session = await isAllowed();
        return await _saveDrugsLibraryItems({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('saveDrugsLibraryItems ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

export const removeDrugLibraryItemsReferences: typeof _removeDrugLibraryItemsReferences = async params => {
    try {
        const session = await isAllowed();
        return await _removeDrugLibraryItemsReferences({
            ...params,
            userId: session.user?.userId,
        });
    } catch(e: any) {
        logger.error('removeDrugLibraryItemsReferences ERROR', e.message);
        return { errors: [e.message], data: { success: false }, };
    }
};

export const exportDrugLibraryItems = async ({
    uuids,
    siteId,
    overwriteExisting,
}: {
    uuids: string[];
    siteId: string;
    overwriteExisting?: boolean;
}): Promise<{
    success: boolean;
    errors?: string[];
}> => {
    try {
        const axiosClient = await getSiteAxiosClient(siteId);
        
        const drugLibraryItems = await _getDrugsLibraryItems({
            itemsIds: uuids,
            returnDraftsIfExist: true,
        });

        if (drugLibraryItems.errors?.length) {
            return {
                success: false,
                errors: drugLibraryItems.errors,
            };
        }

        let errors: string[] = [];

        if (drugLibraryItems.data.length) {
            if (overwriteExisting) {
                const res = await axiosClient.post<Awaited<ReturnType<typeof saveDrugsLibraryItemsIfKeysNotExist>>>('/api/drugs-library/save-and-update-if-exist', {
                    data: drugLibraryItems.data,
                    broadcastAction: true,
                } satisfies Parameters<typeof saveDrugsLibraryItemsIfKeysNotExist>[0]);

                if (res.data.errors) errors = res.data.errors;
            } else {
                const res = await axiosClient.post<Awaited<ReturnType<typeof saveDrugsLibraryItemsIfKeysNotExist>>>('/api/drugs-library/save-if-not-exist', {
                    data: drugLibraryItems.data,
                    broadcastAction: true,
                } satisfies Parameters<typeof saveDrugsLibraryItemsIfKeysNotExist>[0]);

                if (res.data.errors) errors = res.data.errors;
            }
        }

        return {
            success: !errors.length,
            errors: errors.length ? errors : undefined,
        };
    } catch(e: any) {
        return {
            success: false,
            errors: [e.message],
        };
    }
}
