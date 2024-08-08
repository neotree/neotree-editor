import { eq, and, isNull, SQL, count, inArray, desc, sql, isNotNull, notInArray, or } from "drizzle-orm";
import * as uuid from 'uuid';

import { isEmpty } from "@/lib/isEmpty";
import db from "../pg/drizzle";
import { diagnoses, diagnosesDrafts } from "../pg/schema";
import logger from "@/lib/logger";
import { DiagnosisSymptom, ScriptImage } from "@/types";

export async function _listDiagnoses(opts?: {
    diagnosesReferences?: string[]
    scriptsReferences?: string[]
}) {
    const { diagnosesReferences, scriptsReferences } = { ...opts };

    const results: {
        error?: string;
        data: {
            diagnosisReference: string;
            diagnosisId?: string | null;
            diagnosisDraftId?: string | null;
            scriptId?: string | null;
            scriptDraftId?: string | null;
            isDraft: boolean;
            name: string;
            position: number;
        }[];
    } = {
        data: [],
    };

    try {
        const where = !diagnosesReferences?.length ? [] : [or(
            inArray(diagnosesDrafts.diagnosisId, diagnosesReferences),
            inArray(diagnosesDrafts.diagnosisDraftId, diagnosesReferences),
        )];
        if (scriptsReferences?.length) {
            where.push(or(
                inArray(diagnosesDrafts.scriptId, scriptsReferences),
                inArray(diagnosesDrafts.scriptDraftId, scriptsReferences),
            ));
        }

        const drafts = await db.query.diagnosesDrafts.findMany({
            where: !where.length ? undefined : and(...where),
            columns: {
                diagnosisId: true,
                diagnosisDraftId: true,
                scriptDraftId: true,
                scriptId: true,
                data: true,
            },
        });

        const published = await db.query.diagnoses.findMany({
            where: and(...[
                isNull(diagnoses.deletedAt),
                ...(!drafts.length ? [] : [notInArray(diagnoses.diagnosisId, drafts.map(s => s.data.diagnosisId!))])
            ]),
            columns: {
                diagnosisId: true,
                position: true,
                name: true,
                scriptId: true,
            },
        });

        results.data = [...results.data, ...drafts.map(s => ({
            diagnosisReference: s.diagnosisDraftId,
            diagnosisId: s.diagnosisId,
            diagnosisDraftId: s.diagnosisDraftId,
            scriptId: s.scriptId,
            scriptDraftId: s.scriptDraftId,
            isDraft: true,
            name: s.data.name!,
            position: s.data.position,
        }))];

        results.data = [...results.data, ...published.map(s => ({
            diagnosisReference: s.diagnosisId,
            diagnosisId: s.diagnosisId,
            scriptId: s.scriptId,
            isDraft: false,
            name: s.name,
            position: s.position,
        }))].sort((a, b) => a.position - b.position);

        return results;
    } catch(e: any) {
        results.error = e.message;
        logger.error('_listDiagnoses ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _listRawDiagnoses(opts?: {
    diagnosesReferences?: string[];
    scriptsReferences?: string[];
}) {
    const { diagnosesReferences, scriptsReferences } = { ...opts };

    const results: {
        error?: string;
        data: (typeof diagnoses.$inferSelect & {
            diagnosisReference: string;
            diagnosisId?: string;
            diagnosisDraftId?: string;
            scriptId?: string;
            scriptDraftId?: string;
            isDraft: boolean;
        })[];
    } = {
        data: [],
    };

    try {
        const where = !diagnosesReferences?.length ? [] : [or(
            inArray(diagnosesDrafts.diagnosisId, diagnosesReferences),
            inArray(diagnosesDrafts.diagnosisDraftId, diagnosesReferences),
        )];
        if (scriptsReferences?.length) {
            where.push(or(
                inArray(diagnosesDrafts.scriptId, scriptsReferences),
                inArray(diagnosesDrafts.scriptDraftId, scriptsReferences),
            ));
        }

        const drafts = await db.query.diagnosesDrafts.findMany({
            where: !where.length ? undefined : and(...where),
        });

        const published = await db.query.diagnoses.findMany({
            where: and(...[
                isNull(diagnoses.deletedAt),
                ...(!drafts.length ? [] : [notInArray(diagnoses.diagnosisId, drafts.map(s => s.data.diagnosisId!))])
            ]),
        });

        results.data = [...results.data, ...drafts.map(s => {
            return {
                ...s.data,
                diagnosisReference: s.diagnosisDraftId,
                diagnosisId: s.diagnosisId || undefined,
                diagnosisDraftId: s.diagnosisDraftId,
                scriptId: s.scriptId,
                scriptDraftId: s.scriptDraftId,
                isDraft: true,
            } as typeof results.data[0];
        })];

        results.data = [...results.data, ...published.map(s => ({
            ...s,
            diagnosisReference: s.diagnosisId,
            diagnosisId: s.diagnosisId,
            scriptId: s.scriptId,
            isDraft: false,
        }))].sort((a, b) => a.position - b.position);

        return results;
    } catch(e: any) {
        results.error = e.message;
        logger.error('_listRawDiagnoses ERROR', e.message);
    } finally {
        return results;
    }
}

export async function _getLastDiagnosisPosition() {
    const res = await db
        .select({ position: diagnoses.position, })
        .from(diagnoses)
        .where(isNull(diagnoses.deletedAt))
        .limit(1)
        .orderBy(desc(diagnoses.position));
    
    return res[0]?.position || 0;
} 

export async function _countDiagnoses(opts?: {
    withArchived?: boolean;
}) {
    const { withArchived } = { ...opts };

    const q = db
        .select({ count: count(), })
        .from(diagnoses);

    if (!withArchived) q.where(isNull(diagnoses.deletedAt));

    const res = await q.execute();
    
    return res[0]?.count;
} 

export type GetDiagnosisParams = string;

export async function _getDiagnosis(params: GetDiagnosisParams) {
    const where = uuid.validate(params) ? eq(diagnoses.diagnosisId, params) : eq(diagnoses.oldDiagnosisId, params);
    const res = await db.query.diagnoses.findFirst({
        where: and(
            where,
            isNull(diagnoses.deletedAt),
        ),
    });

    return !res ? null : {
        ...res,
        symptoms: res.symptoms as DiagnosisSymptom[],
        image1: res.image1 as null | ScriptImage,
        image2: res.image2 as null | ScriptImage,
        image3: res.image3 as null | ScriptImage,
    };
}

export async function _getDiagnosisWithDraft(params: GetDiagnosisParams) {
    const where = uuid.validate(params) ? eq(diagnoses.diagnosisId, params) : eq(diagnoses.oldDiagnosisId, params);
    const res = await db.query.diagnoses.findFirst({
        where: and(
            where,
            isNull(diagnoses.deletedAt),
        ),
        with: {
            draft: true,
        },
    });
    return !res ? null : {
        ...res,
        symptoms: res.symptoms as DiagnosisSymptom[],
        image1: res.image1 as null | ScriptImage,
        image2: res.image2 as null | ScriptImage,
        image3: res.image3 as null | ScriptImage,
        draft: !res.draft ? null! : {
            ...res.draft,
            data: {
                ...res.draft.data,
                symptoms: res.draft.data.symptoms as DiagnosisSymptom[],
                image1: res.draft.data.image1 as null | ScriptImage,
                image2: res.draft.data.image2 as null | ScriptImage,
                image3: res.draft.data.image3 as null | ScriptImage,
            },
        },
    };
}

export async function _getDiagnosisMini(params: GetDiagnosisParams) {
    const where = uuid.validate(params) ? eq(diagnoses.diagnosisId, params) : eq(diagnoses.oldDiagnosisId, params);
    return await db.query.diagnoses.findFirst({
        where: and(
            where,
            isNull(diagnoses.deletedAt),
        ),
        columns: {
            diagnosisId: true,
            oldDiagnosisId: true,
            version: true,
            name: true,
        },
    });
}

export async function _getFullDiagnosis(params: GetDiagnosisParams) {
    const where = uuid.validate(params) ? eq(diagnoses.diagnosisId, params) : eq(diagnoses.oldDiagnosisId, params);
    return await db.query.diagnoses.findFirst({
        where: and(
            where,
            isNull(diagnoses.deletedAt),
        ),
    });
}

export type GetDiagnosesParams = {
    limit?: number;
    offset?: number;
    page?: number;
    diagnosisIds?: string[];
    searchValue?: string;
    archived?: boolean;
    scriptsIds?: string[];
};

async function __getDiagnoses({
    limit,
    page = 1,
    diagnosisIds,
    searchValue,
    archived,
    scriptsIds,
}: GetDiagnosesParams) {
    page = Math.max(0, page);

    const conditions: SQL[] = [];

    if (archived) {
        conditions.push(isNotNull(diagnoses.deletedAt));
    } else {
        conditions.push(isNull(diagnoses.deletedAt));
    }

    if (diagnosisIds?.length) conditions.push(inArray(diagnoses.diagnosisId, diagnosisIds));

    if (scriptsIds?.length) conditions.push(inArray(diagnoses.scriptId, scriptsIds));

    searchValue = `${searchValue || ''}`.trim();
    if (searchValue) {
        const search = ['%', searchValue, '%'].join('');
        conditions.push(sql`LOWER(diagnoses.name) like LOWER(${search})`);
    }

    const countQuery = db.select({ count: count(), }).from(diagnoses);
    if (conditions.length) countQuery.where(and(...conditions));

    const [{ count: totalRows, }] = await countQuery.execute();

    let totalPages = 1;
    if (totalRows){
        totalPages = isEmpty(limit) ? 1 : Math.ceil(totalRows / limit!);
        page = Math.min(page, totalPages);
    }

    const offset = isEmpty(limit) ? undefined : Math.max(0, (page - 1) * limit!);

    const q = db
        .select({
            id: diagnoses.id,
            diagnosisId: diagnoses.diagnosisId,
            oldDiagnosisId: diagnoses.oldDiagnosisId,
            version: diagnoses.version,
            scriptId: diagnoses.scriptId,
            key: diagnoses.key,
            position: diagnoses.position,
            name: diagnoses.name,
            description: diagnoses.description,
            source: diagnoses.source,
            expression: diagnoses.expression,
            severityOrder: diagnoses.severityOrder,
            expressionMeaning: diagnoses.expressionMeaning,
            text1: diagnoses.text1,
            text2: diagnoses.text2,
            text3: diagnoses.text3,
            image1: diagnoses.image1,
            image2: diagnoses.image2,
            image3: diagnoses.image3,
            symptoms: diagnoses.symptoms,
            publishDate: diagnoses.publishDate,
            createdAt: diagnoses.createdAt,
            updatedAt: diagnoses.updatedAt,
            deletedAt: diagnoses.deletedAt,
            diagnosisDraftId: diagnosesDrafts.diagnosisDraftId,
            scriptDraftId: diagnosesDrafts.scriptDraftId,
        })
        .from(diagnoses)
        .leftJoin(diagnosesDrafts, eq(diagnoses.diagnosisId, diagnosesDrafts.diagnosisId))
        .orderBy(desc(diagnoses.position));

    if (!isEmpty(limit)) q.limit(limit!);

    if (offset) q.offset(offset);

    if (conditions.length) q.where(and(...conditions));

    const data = await q.execute();

    return {
        page,
        limit,
        data: data.map(s => ({
            ...s,
            publishedVersion: s.version,
            isDraft: false,
            diagnosisDraftId: s.diagnosisDraftId as typeof diagnosesDrafts.$inferSelect['diagnosisDraftId'] | undefined,
            scriptDraftId: s.scriptDraftId as typeof diagnosesDrafts.$inferSelect['scriptDraftId'] | undefined,
        })),
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getDiagnosesDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getDiagnoses>>;

export async function _getDiagnoses(params?: GetDiagnosesParams) {
    let rslts = _getDiagnosesDefaultResults;
    
    try {
        rslts = await __getDiagnoses({ ...params });
    } catch(e: any) {
        logger.error('_getDiagnoses ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}
