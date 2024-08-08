import { io } from 'socket.io-client';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { files } from '@/databases/pg/schema';
import { _getFileByFileId } from '@/databases/queries/files';
import { FileDetails } from '@/databases/queries/files/types';

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export type SaveFileOptions = {
    broadcastAction?: boolean;
};

export type SaveFileData = typeof files.$inferInsert & {
    fileId: string;
    data: Buffer;
    metadata: object;
};

export async function _saveFile(
    data: SaveFileData,
    opts?: SaveFileOptions
) {
    const response: { 
        file: null | FileDetails;
        success: boolean; 
        errors?: string[]; 
    } = { success: false, file: null, };

    try {
        if (!data.fileId) throw new Error('Missing fileId');

        if (!data.data) throw new Error('No file uploaded');

        await db.insert(files).values(data);

        const file = await _getFileByFileId(data.fileId);

        if (!file) throw new Error('Failed to upload file');

        response.success = true;
        response.file = file.file;

        if (opts?.broadcastAction) socket.emit('data_changed', 'upload_file');
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_uploadFile ERROR', e.message);
    } finally {
        return response;
    }
}
