'use server';

import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

import { _saveFile, SaveFileOptions } from "@/databases/mutations/files";
import { _getFileByFileId, _getFiles, _getFullFileByFileId, _getReferencedFiles } from "@/databases/queries/files";
import logger from "@/lib/logger";
import { parseJSON } from "@/lib/parse-json";
import { parseNumber } from "@/lib/parseNumber";
import { isAllowed } from "./is-allowed";
import { getSiteAxiosClient } from "@/lib/axios";
import queryString from "query-string";
import { _getSites } from "@/databases/queries/sites";
import { extractApkMetadataFromBuffer } from "@/lib/app-updates/apk-metadata";

export const getFiles: typeof _getFiles = _getFiles;

export const getReferencedFiles: typeof _getReferencedFiles = _getReferencedFiles;

export async function uploadFile(
    formData: FormData,
    opts?: SaveFileOptions,
): Promise<Awaited<ReturnType<typeof _saveFile>>> {
    let response: Awaited<ReturnType<typeof _saveFile>> = { success: false, data: null, };

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
                const submittedContentType = formData.get('contentType')?.toString() || file.type;

                if (metadata.width || metadata.height) {
                    filename = `${filename}?w=${metadata.width}&h=${metadata.height}`;
                }

                const isApk = submittedContentType === 'application/vnd.android.package-archive'
                    || _filename.toLowerCase().endsWith('.apk');
                const contentType = isApk ? 'application/vnd.android.package-archive' : submittedContentType;

                if (isApk) {
                    try {
                        const checksumSha256 = createHash("sha256").update(buffer).digest("hex");
                        metadata.apkChecksumSha256 = checksumSha256;

                        // Extract package/version metadata straight from the APK, like
                        // Headwind does on direct upload (works without Android build-tools).
                        try {
                            const apkMeta = await extractApkMetadataFromBuffer(buffer);
                            if (apkMeta.packageName) metadata.apkPackageName = apkMeta.packageName;
                            if (apkMeta.versionName) metadata.apkVersionName = apkMeta.versionName;
                            if (apkMeta.versionCode != null) metadata.apkVersionCode = apkMeta.versionCode;
                            if (apkMeta.minSdkVersion != null) metadata.apkMinSdkVersion = apkMeta.minSdkVersion;
                            if (apkMeta.targetSdkVersion != null) metadata.apkTargetSdkVersion = apkMeta.targetSdkVersion;
                            if (apkMeta.compileSdkVersion != null) metadata.apkCompileSdkVersion = apkMeta.compileSdkVersion;
                        } catch {
                            // metadata extraction is best-effort
                        }

                        const tmpFile = path.join(os.tmpdir(), `${fileId}.apk`);
                        fs.writeFileSync(tmpFile, buffer);
                        try {
                            const output = execFileSync('apksigner', ['verify', '--print-certs', tmpFile], { encoding: 'utf-8' });
                            const match = output.match(/SHA-256 digest:\s*([A-Fa-f0-9:]+)/);
                            if (match?.[1]) {
                                metadata.apkSignatureSha256 = match[1].replace(/:/g, '').toLowerCase();
                                metadata.apkSignatureVerifiedAt = new Date().toISOString();
                            }
                        } catch (e: any) {
                            logger.error('uploadFile APK signature verification ERROR', e.message || `${e}`);
                        } finally {
                            try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
                        }
                    } catch (e) {
                        // ignore checksum/signature errors; upload should still succeed
                    }
                }

                response = await _saveFile(
                    {
                        fileId,
                        data: buffer,
                        filename,
                        size,
                        contentType,
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
    data: null | { 
        fileURL: string; 
        fileId: string; 
    }; 
    errors?: string[];
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

        if (fileExists?.data) {
            let q = queryString.stringify({ ...fileExists.data.metadata });
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

        if (!downloadedFile.data) return { errors: ['File not found'], data: null, };

        await _saveFile(
            {
                fileId,
                data: downloadedFile.data.data,
                filename: downloadedFile.data.filename,
                size: downloadedFile.data.size,
                contentType: downloadedFile.data.contentType,
                metadata: { ...(downloadedFile.data.metadata as object) },
            },
        );
        let q = queryString.stringify({ ...(downloadedFile.data.metadata as object) });
        q = !q ? '' : `?${q}`;

        return {
            data: {
                fileId,
                fileURL: [site.link, `/files/${fileId}${q}`].join(''),
            },
        };
    } catch(e: any) {
        logger.error('downloadFileFromSite ERROR', e.message);
        return { data: null, errors: [e.message], };
    }
}
