import logger from '@/lib/logger';
import socket from '@/lib/socket';
import { runRemoteScriptImports } from '@/lib/scripts-remote-import';

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
        const { copyScripts } = await import('@/app/actions/scripts');
        const result = await runRemoteScriptImports({
            siteId,
            scriptsToImport,
            copyScript: copyScripts,
        });

        if (result.errors?.length) {
            response.errors = result.errors;
            throw new Error(result.errors.join(', '));
        }
        
        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = response.errors?.length ? response.errors : [e.message];
        logger.error('_importRemoteScripts ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'create_scripts');
        return response;
    }
}
