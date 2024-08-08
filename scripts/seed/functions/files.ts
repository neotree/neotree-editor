import 'dotenv/config';

import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import logger from '@/lib/logger';
import { axiosClient } from './axios';


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
            const allFiles = [file];
            let filesInsertData: typeof schema.files.$inferInsert[] = allFiles
                .filter(f => f.data.data)
                .map((f: any, i: number) => {
                    return {
                        fileId: f.id,
                        contentType: f.content_type || '',
                        metadata: f.metadata || '',
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
