'use server';

import { v4 as uuidv4 } from "uuid";

import { _saveFile, SaveFileOptions } from "@/databases/mutations/files";
import logger from "@/lib/logger";
import { parseJSON } from "@/lib/parse-json";
import { parseNumber } from "@/lib/parseNumber";
import { isAllowed } from "./is-allowed";

export async function uploadFile(
    formData: FormData,
    opts?: SaveFileOptions,
): Promise<Awaited<ReturnType<typeof _saveFile>>> {
    let response: Awaited<ReturnType<typeof _saveFile>> = { success: false, file: null, };

    try {
        await isAllowed(['upload_files']);

        for (const entry of Array.from(formData.entries())) {
            const [_, value] = entry;
    
            const isFile = typeof value === 'object';
    
            if (isFile) {
                const file = value as File;
                const buffer = Buffer.from(await file.arrayBuffer());

                const fileId = formData.get('fileId')?.toString() || uuidv4();
                const metadata = { ...parseJSON(formData.get('metadata')?.toString() || '{}') };

                const _size = formData.get('size') ? parseNumber(parseJSON(formData.get('size')?.toString()!)) : 0;
                const size = _size || file.size;

                const _filename = formData.get('filename')?.toString() ||  file.name;
                let filename = [fileId, _filename].filter(s => s).join('__');

                if (metadata.width || metadata.height) {
                    filename = `${filename}?w=${metadata.width}&h=${metadata.height}`;
                }

                response = await _saveFile(
                    {
                        fileId,
                        data: buffer,
                        filename,
                        size,
                        contentType: formData.get('contentType')?.toString() || file.type,
                        metadata,
                    }, 
                    opts
                );
            }
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('uploadFile ERROR', e.message);
    } finally {
        return response;
    }
}
