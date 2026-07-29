import { eq, ilike, isNotNull, or, sql } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import { _getFileByFileId } from './_get-file-by-file-id';

export type GetFileReferences = {
    fileId: string;
};

export type GetFileReferencesResponse = {
    errors?: string[];
    data: {
        type: 'screen' | 'screenDraft' | 'diagnosis' | 'diagnosisDraft' | 'problem' | 'problemDraft';
        scriptId?: string;
        id: string;
        draftId?: string;
    }[];
};

export async function _getFileReferences({ fileId, }: GetFileReferences): Promise<GetFileReferencesResponse> {
    try {
        // const file = await _getFileByFileId(fileId);
        // const alias = file?.data?.fileId !== fileId ? file.data?.fileId : null;
        const alias: string | null = null;

        const screensDrafts = await db.select({ 
            id: schema.screensDrafts.screenId, 
            draftId: schema.screensDrafts.screenDraftId, 
            scriptId: schema.screensDrafts.scriptId, 
            contentTextImage: sql<string>`${schema.screensDrafts.data}->>'contentTextImage'`,
        }).from(schema.screensDrafts).where(
            or(
                sql`${schema.screensDrafts.data}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.screensDrafts.data}#>>'{image1,data}' ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.screensDrafts.data}#>>'{image2,data}' ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.screensDrafts.data}#>>'{image3,data}' ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.screensDrafts.data}#>>'{contentTextImage,data}' ILIKE ${'%' + fileId + '%'}`,
                ...(!alias ? [] : [
                    sql`${schema.screensDrafts.data}#>>'{image1,data}' ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.screensDrafts.data}#>>'{image2,data}' ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.screensDrafts.data}#>>'{image3,data}' ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.screensDrafts.data}#>>'{contentTextImage,data}' ILIKE ${'%' + alias + '%'}`,
                ]),
            ),
        );

        const problemsDrafts = await db.select({ 
            id: schema.problemsDrafts.problemId, 
            draftId: schema.problemsDrafts.problemDraftId, 
            scriptId: schema.problemsDrafts.scriptId, 
        }).from(schema.problemsDrafts).where(
            or(
                sql`${schema.problemsDrafts.data}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.problemsDrafts.data}#>>'{image1}' ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.problemsDrafts.data}#>>'{image2}' ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.problemsDrafts.data}#>>'{image3}' ILIKE ${'%' + fileId + '%'}`,
                ...(!alias ? [] : [
                    sql`${schema.problemsDrafts.data}#>>'{image1}' ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.problemsDrafts.data}#>>'{image2}' ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.problemsDrafts.data}#>>'{image3}' ILIKE ${'%' + alias + '%'}`,
                ]),
            ),
        );

        const diagnosesDrafts = await db.select({ 
            id: schema.diagnosesDrafts.diagnosisId, 
            draftId: schema.diagnosesDrafts.diagnosisDraftId, 
            scriptId: schema.diagnosesDrafts.scriptId, 
        }).from(schema.diagnosesDrafts).where(
            or(
                sql`${schema.diagnosesDrafts.data}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.diagnosesDrafts.data}#>>'{image1}' ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.diagnosesDrafts.data}#>>'{image2}' ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.diagnosesDrafts.data}#>>'{image3}' ILIKE ${'%' + fileId + '%'}`,
                ...(!alias ? [] : [
                    sql`${schema.diagnosesDrafts.data}#>>'{image1}' ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.diagnosesDrafts.data}#>>'{image2}' ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.diagnosesDrafts.data}#>>'{image3}' ILIKE ${'%' + alias + '%'}`,
                ]),
            ),
        );

        const screens = await db.select({ 
            id: schema.screens.screenId,
            scriptId: schema.screens.scriptId, 
        }).from(schema.screens).where(
            or(
                sql`${schema.screens.image1}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.screens.image2}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.screens.image3}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.screens.contentTextImage}::text ILIKE ${'%' + fileId + '%'}`,
                ...(!alias ? [] : [
                    sql`${schema.screens.image1}::text ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.screens.image2}::text ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.screens.image3}::text ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.screens.contentTextImage}::text ILIKE ${'%' + alias + '%'}`,
                ]),
            ),
        );

        const problems = await db.select({ 
            id: schema.problems.problemId, 
            scriptId: schema.problems.scriptId, 
        }).from(schema.problems).where(
            or(
                sql`${schema.problems.image1}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.problems.image2}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.problems.image3}::text ILIKE ${'%' + fileId + '%'}`,
                ...(!alias ? [] : [
                    sql`${schema.problems.image1}::text ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.problems.image2}::text ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.problems.image3}::text ILIKE ${'%' + alias + '%'}`,
                ]),
            ),
        );

        const diagnoses = await db.select({ 
            id: schema.diagnoses.diagnosisId, 
            scriptId: schema.diagnoses.scriptId, 
        }).from(schema.diagnoses).where(
            or(
                sql`${schema.diagnoses.image1}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.diagnoses.image2}::text ILIKE ${'%' + fileId + '%'}`,
                sql`${schema.diagnoses.image3}::text ILIKE ${'%' + fileId + '%'}`,
                ...(!alias ? [] : [
                    sql`${schema.diagnoses.image1}::text ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.diagnoses.image2}::text ILIKE ${'%' + alias + '%'}`,
                    sql`${schema.diagnoses.image3}::text ILIKE ${'%' + alias + '%'}`,
                ]),
            ),
        );

        const data: GetFileReferencesResponse['data'] = [
            ...screensDrafts.map(item => ({
                type: 'screenDraft',
                id: item.id || '',
                draftId: item.draftId,
                scriptId: item.scriptId || undefined,
            })) satisfies GetFileReferencesResponse['data'],
            ...problemsDrafts.map(item => ({
                type: 'problemDraft',
                id: item.id || '',
                draftId: item.draftId,
                scriptId: item.scriptId || undefined,
            }))  satisfies GetFileReferencesResponse['data'],
            ...diagnosesDrafts.map(item => ({
                type: 'diagnosisDraft',
                id: item.id || '',
                draftId: item.draftId,
                scriptId: item.scriptId || undefined,
            }))  satisfies GetFileReferencesResponse['data'],
            ...screens.map(item => ({
                type: 'screen',
                id: item.id || '',
                scriptId: item.scriptId,
            }))  satisfies GetFileReferencesResponse['data'],
            ...problems.map(item => ({
                type: 'problem',
                id: item.id || '',
                scriptId: item.scriptId,
            }))  satisfies GetFileReferencesResponse['data'],
            ...diagnoses.map(item => ({
                type: 'diagnosis',
                id: item.id || '',
                scriptId: item.scriptId,
            }))  satisfies GetFileReferencesResponse['data'],
        ];

        return { data, };
    } catch(e: any) {
        return {
            data: [],
            errors: [e.message],
        };
    }
}
