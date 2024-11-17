import { eq, } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { files } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { GetFullFileResponse, GetFileDetailsResponse, FileDetails } from "./types";

export async function _getFullFileByFileId(fileId: string): Promise<GetFullFileResponse> {
    try {
        const file = await db.query.files.findFirst({
            where: eq(files.fileId, fileId),
        });

        return  { data: file || null, };
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

        return  { file: (file as FileDetails) || null, };
    } catch(e: any) {
        logger.error('_getFiles ERROR', e.message);
        return  { errors: [e.message], file: null, };
    }
}
