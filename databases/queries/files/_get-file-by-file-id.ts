import { eq, } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { files } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { GetFullFileResponse, GetFileDetailsResponse, FileDetails } from "./types";
import { getAppUrl } from "@/lib/urls";

export async function _getFullFileByFileId(fileId: string): Promise<GetFullFileResponse> {
    try {
        const file = await db.query.files.findFirst({
            where: eq(files.fileId, fileId),
        });

        const data = !file ? null : {
            ...file,
            url: getAppUrl(`/files/${file.fileId}`),
        };

        return  { data, };
    } catch(e: any) {
        logger.error('_getFiles ERROR', e.message);
        return  { errors: [e.message], data: null, };
    }
}

export async function _getFileByFileId(fileId: string): Promise<GetFileDetailsResponse> {
    try {
        const file = await db.query.files.findFirst({
            where: eq(files.fileId, fileId),
            columns: {
                contentType: true,
                fileId: true,
                filename: true,
                size: true,
                metadata: true,
                createdAt: true,
            },
        });

        const data = !file ? null : {
            ...file,
            url: getAppUrl(`/files/${file.fileId}`),
        } as FileDetails;

        return  { data, };
    } catch(e: any) {
        logger.error('_getFiles ERROR', e.message);
        return  { errors: [e.message], data: null, };
    }
}
