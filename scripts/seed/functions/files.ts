import 'dotenv/config';

import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import logger from '@/lib/logger';
import { axiosClient } from './axios';
import { getRemoteImageSize } from '@/lib/image-size';


export async function seedFiles(site: typeof schema.sites.$inferSelect) {
    try {
        // seed files
        console.log('> seed files');

        console.log('> loading files');
        const res = await axiosClient(site).get('/get-files');
        const remoteFiles = res.data.files as any[];

        console.log(`> ${remoteFiles.length} files found`);

        console.log('> truncating files table...');
        await db.delete(schema.files);

        let index = 0;
        for (const f of remoteFiles)  {
            index++;
            console.log(`> downloading ${index} / ${remoteFiles.length}...`);
            const res = await axiosClient(site).get(`/get-file-data/${f.id}`);
            const file = res.data.file as any;

            file.metadata = file.metadata || {};
            file.filename = [file.id, file.filename].filter(s => s).join('__');
            try {
                const size = await getRemoteImageSize('https://webeditor-dev.neotree.org/file/1be556fa-70c2-48bd-ab8e-1c503400cb93');
                file.metadata.width = size.width;
                file.metadata.height = size.height;
                file.filename = `${file.filename}?w=${file.metadata.width}&h=${file.metadata.height}`;
            } catch(e) { /**/ }

            const allFiles = [file];
            let filesInsertData: typeof schema.files.$inferInsert[] = allFiles
                .filter(f => f.data.data)
                .map((f: any, i: number) => {
                    return {
                        fileId: f.id,
                        contentType: f.content_type || '',
                        metadata: f.metadata || {},
                        size: f.size,
                        filename: f.filename || '',
                        data: Buffer.from(f.data.data),
                    } satisfies typeof schema.files.$inferInsert;
                });
            filesInsertData = filesInsertData.filter(f => f.data);

            console.log(`> saving ${index} / ${remoteFiles.length}...`);    
            if (filesInsertData.length) await db.insert(schema.files).values(filesInsertData);
        }
    } catch(e: any) {
        logger.error('seedFiles ERROR', e);
    }
}
