'use server';

import { revalidatePath as _revalidatePath } from "next/cache";

import socket from '@/lib/socket';
import logger from '@/lib/logger';
import { isAllowed } from './is-allowed';
import { Mode } from '@/types';
import { _clearPendingDeletion, _processPendingDeletion } from '@/databases/mutations/ops';
import * as opsQueries from '@/databases/queries/ops';
import * as scriptsQueries from '@/databases/queries/scripts';
import * as scriptsMutations from '@/databases/mutations/scripts';
import * as configKeysMutations from '@/databases/mutations/config-keys';
import * as configKeysQueries from '@/databases/queries/config-keys';
import * as drugsLibraryMutations from '@/databases/mutations/drugs-library';
import * as drugsLibraryQueries from '@/databases/queries/drugs-library';
import * as dataKeysMutations from '@/databases/mutations/data-keys';
import * as dataKeysQueries from '@/databases/queries/data-keys';
import { _saveEditorInfo } from '@/databases/mutations/editor-info';
import { _getEditorInfo, GetEditorInfoResults } from '@/databases/queries/editor-info';

export async function getEditorDetails(): Promise<{
    errors?: string[];
    shouldPublishData: boolean;
    pendingDeletion: number;
    drafts: typeof opsQueries.defaultCountDraftsData;
    info: GetEditorInfoResults['data'];
}> {
    const errors: string[] = [];
    let shouldPublishData = false;
    try {
        const editorInfo = await _getEditorInfo();
        editorInfo.errors?.forEach(e => errors.push(e));

        const pendingDeletion = await opsQueries._countPendingDeletion();
        pendingDeletion.errors?.forEach(e => errors.push(e));

        const { errors: draftsErrors, ...drafts } = await opsQueries._countDrafts();
        draftsErrors?.forEach(e => errors.push(e));

        const mode = 'development';

        shouldPublishData = (mode === 'development') && (!!drafts.total || !!pendingDeletion.total);

        return {
            pendingDeletion: pendingDeletion.total,
            drafts,
            errors: errors.length ? errors : undefined,
            shouldPublishData,
            info: editorInfo.data,
        };
    } catch(e: any) {
        logger.error('getEditorDetails ERROR', e.message);
        return {
            errors: [e.message, ...errors],
            pendingDeletion: 0,
            drafts: opsQueries.defaultCountDraftsData,
            shouldPublishData,
            info: null,
        };
    }
}

export const revalidatePath = async (
    path: Parameters<typeof _revalidatePath>[0], 
    type?: Parameters<typeof _revalidatePath>[1]
) => _revalidatePath(path, type);

export const countAllDrafts = async () => {
    try {
        const configKeys = await configKeysQueries._countConfigKeys();
        const drugsLibraryItems = await drugsLibraryQueries._countDrugsLibraryItems();
        const dataKeys = await dataKeysQueries._countDataKeys();
        const screens = await scriptsQueries._countScreens();
        const scripts = await scriptsQueries._countScripts();
        const diagnoses = await scriptsQueries._countDiagnoses();

        return {
            configKeys: configKeys.data.allDrafts,
            drugsLibrary: drugsLibraryItems.data.allDrafts,
            screens: screens.data.allDrafts,
            scripts: scripts.data.allDrafts,
            diagnoses: diagnoses.data.allDrafts,
            dataKeys: dataKeys.data.allDrafts,
        };
    } catch(e: any) {
        logger.error('countAllDrafts ERROR', e.message);
        return {
            screens: 0,
            scripts: 0,
            configKeys: 0,
            diagnoses: 0,
        };
    }
};

export async function publishData() {
    const results: { success: boolean; errors?: string[]; } = { success: true, };
    try {
        await isAllowed([
            'create_config_keys', 
            'update_config_keys', 
            'create_scripts', 
            'update_scripts',
            'create_diagnoses',
            'update_diagnoses',
            'create_screens',
            'update_screens',
        ]);

        const publishConfigKeys = await configKeysMutations._publishConfigKeys();
        const publishDrugsLibraryItems = await drugsLibraryMutations._publishDrugsLibraryItems();
        const publishDataKeys = await dataKeysMutations._publishDataKeys();
        const publishScripts = await scriptsMutations._publishScripts();
        const publishScreens = await scriptsMutations._publishScreens();
        const publishDiagnoses = await scriptsMutations._publishDiagnoses();
        const processPendingDeletion = await _processPendingDeletion();
        
        if (publishDataKeys.errors) {
            results.success = false;
            results.errors = [...(results.errors || []), ...publishDataKeys.errors];
        }

        if (publishConfigKeys.errors) {
            results.success = false;
            results.errors = [...(results.errors || []), ...publishConfigKeys.errors];
        }

        if (publishDrugsLibraryItems.errors) {
            results.success = false;
            results.errors = [...(results.errors || []), ...publishDrugsLibraryItems.errors];
        }

        if (publishScripts.errors) {
            results.success = false;
            results.errors = [...(results.errors || []), ...publishScripts.errors];
        }

        if (publishScreens.errors) {
            results.success = false;
            results.errors = [...(results.errors || []), ...publishScreens.errors];
        }

        if (publishDiagnoses.errors) {
            results.success = false;
            results.errors = [...(results.errors || []), ...publishDiagnoses.errors];
        }

        if (processPendingDeletion.errors) {
            results.success = false;
            results.errors = [...(results.errors || []), ...processPendingDeletion.errors];
        }

        await _saveEditorInfo({ 
            increaseVersion: results.success, 
            broadcastAction: true, 
            data: { lastPublishDate: new Date(), },
        });

        socket.emit('data_changed', 'publish_data');
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('publishData ERROR', e.message);
    } finally {
        return results;
    }
}

export async function discardDrafts() {
    const results: { success: boolean; errors?: string[]; } = { success: true, };
    try {
        await isAllowed([
            'delete_config_keys', 
            'delete_scripts', 
            'delete_diagnoses',
            'delete_screens',
        ]);

         await configKeysMutations._deleteAllConfigKeysDrafts();
         await drugsLibraryMutations._deleteAllDrugsLibraryItemsDrafts();
         await dataKeysMutations._deleteAllDataKeysDrafts();
         await scriptsMutations._deleteAllScriptsDrafts();
         await scriptsMutations._deleteAllScreensDrafts();
         await scriptsMutations._deleteAllDiagnosesDrafts();
         await _clearPendingDeletion();

        socket.emit('data_changed', 'discard_drafts');
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('publishData ERROR', e.message);
    } finally {
        return results;
    }
}
