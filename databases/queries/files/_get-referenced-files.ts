import { isNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import * as schema from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { _getScreens, _getDiagnoses, } from "../scripts";
import { GetReferencedFilesResponse, ReferencedFile } from "./types";

export async function _getReferencedFiles(): Promise<GetReferencedFilesResponse> {
    try {
        const files = await db
            .select({ fileId: schema.files.fileId, })
            .from(schema.files)
            .where(isNull(schema.files.deletedAt));

        const filesAliases = await db
            .select({
                alias: schema.filesAliases.alias,
                fileId: schema.filesAliases.fileId,
            })
            .from(schema.filesAliases);

        const { data: screens, } = await _getScreens({ returnDraftsIfExist: true, });
        const { data: diagnoses, } = await _getDiagnoses({ returnDraftsIfExist: true, });

        const scriptsFiles: ReferencedFile[] = [
            ...screens.reduce((acc: ReferencedFile[], s) => {

                if (s.image1) {
                    acc.push({
                        refId: s.screenId,
                        url: s.image1.data || '',
                        refType: 'screen',
                        refField: 'image1',
                        type: 'image',
                        host: '',
                    });
                }

                if (s.image2) {
                    acc.push({
                        refId: s.screenId,
                        url: s.image2.data || '',
                        refType: 'screen',
                        refField: 'image2',
                        type: 'image',
                        host: '',
                    });
                }

                if (s.image3) {
                    acc.push({
                        refId: s.screenId,
                        url: s.image3.data || '',
                        refType: 'screen',
                        refField: 'image3',
                        type: 'image',
                        host: '',
                    });
                }

                if (s.contentTextImage) {
                    acc.push({
                        refId: s.screenId,
                        url: s.contentTextImage.data || '',
                        refType: 'screen',
                        refField: 'contentTextImage',
                        type: 'image',
                        host: '',
                    });
                }

                return acc;
            }, []),

            ...diagnoses.reduce((acc: ReferencedFile[], d) => {

                if (d.image1) {
                    acc.push({
                        refId: d.diagnosisId,
                        url: d.image1.data || '',
                        refType: 'screen',
                        refField: 'image1',
                        type: 'image',
                        host: '',
                    });
                }

                if (d.image2) {
                    acc.push({
                        refId: d.diagnosisId,
                        url: d.image2.data || '',
                        refType: 'screen',
                        refField: 'image2',
                        type: 'image',
                        host: '',
                    });
                }

                if (d.image3) {
                    acc.push({
                        refId: d.diagnosisId,
                        url: d.image3.data || '',
                        refType: 'screen',
                        refField: 'image3',
                        type: 'image',
                        host: '',
                    });
                }

                return acc;
            }, [])
        ];

        const data = [
            ...scriptsFiles,
        ].map(f => {
            const [url] = f.url.split('?');
            const { origin } = new URL(url);
            const fileId = url.split('/')[url.split('/').length - 1];

            const dbFile = files.find(f => f.fileId === fileId);
            const alias = dbFile ? undefined : filesAliases.find(f => f.alias === fileId);
            const dbFileId = dbFile?.fileId || alias?.fileId || undefined;

            return {
                ...f,
                fileId: dbFileId || fileId,
                alias: alias?.alias,
                isExternal: !dbFileId,
                host: origin,
            };
        });

        return  { data, };
    } catch(e: any) {
        logger.error('_getFiles ERROR', e.message);
        return  { 
            errors: [e.message],
            data: [],
        };
    }
}
