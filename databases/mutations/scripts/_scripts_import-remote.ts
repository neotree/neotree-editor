import { eq, inArray } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { scripts, scriptsDrafts, pendingDeletion, } from '@/databases/pg/schema';
import socket from '@/lib/socket';

export type ImportRemoteScriptsData = {
    siteId: string;
    scripts: {
        scriptId: string;
        overWriteExistingScriptWithId?: string;
    }[];
    broadcastAction?: boolean;
};

export type ImportRemoteScriptsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _importRemoteScripts(
    { scripts: scriptsToImport, siteId, broadcastAction, }: ImportRemoteScriptsData,
) {
    const response: ImportRemoteScriptsResponse = { success: false, };

    try {
        // TODO: Implement this
        throw new Error('Functionality not yet implemented!');
        
        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_importRemoteScripts ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'create_scripts');
        return response;
    }
}
