'use server';

import { v4 as uuidv4 } from "uuid";

import { _saveFile, SaveFileOptions } from "@/databases/mutations/files";
import { _getFileByFileId, _getFullFileByFileId } from "@/databases/queries/files";
import logger from "@/lib/logger";
import { parseJSON } from "@/lib/parse-json";
import { parseNumber } from "@/lib/parseNumber";
import { isAllowed } from "./is-allowed";
import { getSiteAxiosClient } from "@/lib/axios";
import queryString from "query-string";
import { _getSites } from "@/databases/queries/sites";

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

export type UploadFileFromSiteResponse = { 
    data: null | { fileURL: string; fileId: string; }; 
    errors?: string[] 
};

export type UploadloadFileFromSiteParams = { 
    siteURL: string; 
    siteApiKey: string;
    fileId: string; 
};

export async function uploadFileFromSite({
    fileId,
    siteURL,
}: UploadloadFileFromSiteParams): Promise<UploadFileFromSiteResponse> {
    try {
        const sites = await _getSites({ links: [siteURL], });

        if (sites.errors) throw new Error(sites.errors.join(', '));

        const { data: [site] } = sites;

        if (!site) throw new Error(`Site (${siteURL}) was not found!`);

        const axios = await getSiteAxiosClient({ baseURL: site.link, apiKey: site.apiKey, });

        const fileExists = await _getFileByFileId(fileId);

        if (fileExists.errors) throw new Error(fileExists.errors.join(', '));

        if (fileExists?.file) {
            let q = queryString.stringify({ ...fileExists.file.metadata });
            q = !q ? '' : `?${q}`;
            return {
                data: {
                    fileId,
                    fileURL: [process.env.NEXT_PUBLIC_APP_URL, `/files/${fileId}${q}`].join(''),
                },
            };
        }

        const downloadedFileRes = await axios.get<Awaited<ReturnType<typeof _getFullFileByFileId>>>(`/api/files/${fileId}/download`);
        const downloadedFile = downloadedFileRes.data;

        if (downloadedFile.errors) throw new Error(downloadedFile.errors.join(', '));

        if (!downloadedFile.file) return { errors: ['File not found'], data: null, };

        await _saveFile(
            {
                fileId,
                data: downloadedFile.file.data,
                filename: downloadedFile.file.filename,
                size: downloadedFile.file.size,
                contentType: downloadedFile.file.contentType,
                metadata: { ...(downloadedFile.file.metadata as object) },
            },
        );
        let q = queryString.stringify({ ...(downloadedFile.file.metadata as object) });
        q = !q ? '' : `?${q}`;

        return {
            data: {
                fileId,
                fileURL: [process.env.NEXT_PUBLIC_APP_URL, `/files/${fileId}${q}`].join(''),
            },
        };
    } catch(e: any) {
        logger.error('downloadFileFromSite ERROR', e.message);
        return { data: null, errors: [e.message], };
    }
}
