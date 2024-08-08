'use server';

import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { io } from 'socket.io-client';
import { revalidatePath as _revalidatePath } from "next/cache";

import logger from '@/lib/logger';
import { _publishScripts } from '@/databases/mutations/_scripts';
import { _publishConfigKeys } from '@/databases/mutations/_config-keys';
import { isAllowed } from './is-allowed';
import { _publishScreens } from '@/databases/mutations/screens';
import { Mode } from '@/types';
import { _countConfigKeysDrafts,  } from '@/databases/queries/_config-keys-drafts';
import { _countScreensDrafts, } from '@/databases/queries/screens-drafts';
import { _countScriptsDrafts, } from '@/databases/queries/scripts-drafts';
import { _deleteAllConfigKeysDrafts,  } from '@/databases/mutations/_config-keys-drafts';
import { _deleteAllScreensDrafts, } from '@/databases/mutations/screens-drafts';
import { _deleteAllScriptsDrafts, } from '@/databases/mutations/scripts-drafts';
import { _deleteAllDiagnosesDrafts } from '@/databases/mutations/diagnoses-drafts';
import { _publishDiagnoses } from '@/databases/mutations/diagnoses';
import { _countDiagnosesDrafts } from '@/databases/queries/diagnoses-drafts';

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export const revalidatePath = async (
    path: Parameters<typeof _revalidatePath>[0], 
    type?: Parameters<typeof _revalidatePath>[1]
) => _revalidatePath(path, type);

export const countAllDrafts = async () => {
    try {
        const configKeys = await _countConfigKeysDrafts();
        const screens = await _countScreensDrafts();
        const scripts = await _countScriptsDrafts();
        const diagnoses = await _countDiagnosesDrafts();

        return {
            configKeys,
            screens,
            scripts,
            diagnoses,
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

        const publishConfigKeys = await _publishConfigKeys();
        const publishScripts = await _publishScripts();
        const publishScreens = await _publishScreens();
        const publishDiagnoses = await _publishDiagnoses();
        
        if (publishConfigKeys.errors) {
            results.success = false;
            results.errors = [...(results.errors || []), ...publishConfigKeys.errors];
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

         await _deleteAllConfigKeysDrafts();
         await _deleteAllScriptsDrafts();
         await _deleteAllScreensDrafts();
         await _deleteAllDiagnosesDrafts();

        socket.emit('data_changed', 'discard_drafts');
    } catch(e: any) {
        results.success = false;
        results.errors = [e.message];
        logger.error('publishData ERROR', e.message);
    } finally {
        return results;
    }
}

export async function getCookie<ValueType = string>(value: string) {
    const cookieStore = cookies();
    const data = cookieStore.get(value);
    return (data?.value || null) as null | ValueType;
}

export async function setCookie(params: ResponseCookie) {
    cookies().set(params);
}

export async function getMode() {
    let mode: Mode = 'view';
    try {
        const currentMode = await getCookie<Mode>('mode');
        if (!currentMode) {
            await setCookie({ name: 'mode', value: mode, });
        } else {
            mode = currentMode;
        }
    } catch(e: any) {
        logger.error('getMode ERROR', e.message);
    } finally {
        return mode;
    }
}

export async function setMode(mode: Mode) {
    try {
        await setCookie({ name: 'mode', value: mode, });
        socket.emit('mode_changed', mode);
    } catch(e: any) {
        logger.error('setMode ERROR', e.message);
    }
}
