import socket  from '@/lib/socket';
import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { files } from '@/databases/pg/schema';
import { _getFileByFileId } from '@/databases/queries/files';
import { FileDetails } from '@/databases/queries/files/types';

export type SaveFileOptions = {
    broadcastAction?: boolean;
};

export type SaveFileData = typeof files.$inferInsert & {
    fileId: string;
    data: Buffer;
    metadata: object;
};

export type SaveFileResponse = { 
    data: null | FileDetails;
    success: boolean; 
    errors?: string[]; 
};

export async function _saveFile(
    data: SaveFileData,
    opts?: SaveFileOptions
): Promise<SaveFileResponse> {
    const response: SaveFileResponse= { success: false, data: null, };

    try {
        if (!data.fileId) throw new Error('Missing fileId');

        if (!data.data) throw new Error('No file uploaded');

        await db.insert(files).values(data);

        const file = await _getFileByFileId(data.fileId);

        if (!file) throw new Error('Failed to upload file');

        response.success = true;
        response.data = file.data;

        if (file.data && opts?.broadcastAction !== false) socket.emit('file_uploaded');
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_uploadFile ERROR', e.message);
    } finally {
        return response;
    }
}
