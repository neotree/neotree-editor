import { eq, and, count, inArray, desc, isNull, or, } from "drizzle-orm";

import { isEmpty } from "@/lib/isEmpty";
import db from "../pg/drizzle";
import { diagnosesDrafts } from "../pg/schema";
import { ScriptField, ImageTextField, ScriptImage, ScriptItem, DiagnosisSymptom } from "@/types";
import logger from "@/lib/logger";

export async function _countDiagnosesDrafts(opts?: {
    firstVersion?: boolean;
    scriptId?: string;
}) {
    const q = db
        .select({ count: count(), })
        .from(diagnosesDrafts);

    if (opts?.firstVersion) q.where(isNull(diagnosesDrafts.diagnosisId));

    if (opts?.scriptId) q.where(eq(diagnosesDrafts.scriptId, opts.scriptId));

    const res = await q.execute();
    
    return res[0]?.count || 0;
}

export type GetDiagnosisDraftParams = string;

export async function _getDiagnosisDraft(params: GetDiagnosisDraftParams) {
    const where = eq(diagnosesDrafts.diagnosisDraftId, params);
    const res = await db.query.diagnosesDrafts.findFirst({
        where,
        columns: {
            id: true,
            diagnosisDraftId: true,
            scriptDraftId: true,
            diagnosisId: true,
            scriptId: true,
            data: true,
        },
    });
    return !res ? null : {
        ...res,
        data: {
            ...res.data,
            items: res.data.symptoms as DiagnosisSymptom[],
            image1: res.data.image1 as null | ScriptImage,
            image2: res.data.image2 as null | ScriptImage,
            image3: res.data.image3 as null | ScriptImage,
        },
    }; 
}

export async function _getDiagnosisDraftMini(params: GetDiagnosisDraftParams) {
    const where = eq(diagnosesDrafts.diagnosisDraftId, params);
    const res = await db.query.diagnosesDrafts.findFirst({
        where,
        columns: {
            id: true,
            diagnosisDraftId: true,
            diagnosisId: true,
            scriptId: true,
            data: true,
        },
    });

    return !res ? null : {
        ...res,
        data: {
            ...res.data,
            items: res.data.symptoms as DiagnosisSymptom[],
            image1: res.data.image1 as null | ScriptImage,
            image2: res.data.image2 as null | ScriptImage,
            image3: res.data.image3 as null | ScriptImage,
        },
    };
}

export async function _getFullDiagnosisDraft(params: GetDiagnosisDraftParams) {
    const where = eq(diagnosesDrafts.diagnosisDraftId, params);
    const res = await db.query.diagnosesDrafts.findFirst({
        where,
    });
    return !res ? null : {
        ...res,
        data: {
            ...res.data,
            items: res.data.symptoms as DiagnosisSymptom[],
            image1: res.data.image1 as null | ScriptImage,
            image2: res.data.image2 as null | ScriptImage,
            image3: res.data.image3 as null | ScriptImage,
        },
    };
}

export type GetDiagnosesDraftsParams = {
    limit?: number;
    offset?: number;
    page?: number;
    diagnosisDraftIds?: string[];
    scriptsDraftsIds?: string[];
    scriptsIds?: string[];
    searchValue?: string;
    withoutDiagnosisId?: boolean;
};

async function __getDiagnosesDrafts({
    limit,
    page = 1,
    diagnosisDraftIds,
    scriptsDraftsIds,
    searchValue,
    withoutDiagnosisId,
    scriptsIds,
}: GetDiagnosesDraftsParams) {
    page = Math.max(0, page);

    const where = [
        !withoutDiagnosisId ? undefined : isNull(diagnosesDrafts.diagnosisId),
        !scriptsIds?.length && !scriptsDraftsIds?.length ? undefined : or(
            !scriptsDraftsIds?.length ? undefined : inArray(diagnosesDrafts.scriptDraftId, scriptsDraftsIds),
            !scriptsIds?.length ? undefined : inArray(diagnosesDrafts.scriptId, scriptsIds)
        ),
    ].filter(s => s);

    searchValue = `${searchValue || ''}`.trim();
    // if (searchValue) {
    //     const search = ['%', searchValue, '%'].join('');
    //     conditions.push(sql`json_array_elements(content->data) like LOWER(${search})`);
    // }

    const countQuery = db.select({ count: count(), }).from(diagnosesDrafts);
    if (where.length) countQuery.where(and(...where));

    const [{ count: totalRows, }] = await countQuery.execute();

    let totalPages = 1;
    if (totalRows){
        totalPages = isEmpty(limit) ? 1 : Math.ceil(totalRows / limit!);
        page = Math.min(page, totalPages);
    }

    const offset = isEmpty(limit) ? undefined : Math.max(0, (page - 1) * limit!);

    const data = await db.query.diagnosesDrafts.findMany({
        where: where.length ? and(...where) : undefined,
        limit: isEmpty(limit) ? undefined : limit!,
        orderBy: desc(diagnosesDrafts.id),
        offset,
        columns: {
            id: true,
            diagnosisDraftId: true,
            diagnosisId: true,
            scriptId: true,
            data: true,
            scriptDraftId: true,
        },
    });

    return {
        page,
        limit,
        data: data.map(({ data, id, diagnosisId, diagnosisDraftId, scriptId, scriptDraftId, }) => {
            return {
                ...data,
                id,
                scriptId,
                scriptDraftId,
                diagnosisDraftId,
                isDraft: true,
                publishedVersion: !diagnosisId ? null : Math.max(1, data.version - 1),
            };
        }),
        totalRows,
        totalPages,
        searchValue,
        error: undefined as (undefined | string),
    };
}

export const _getDiagnosesDraftsDefaultResults = {
    page: 1,
    limit: undefined,
    totalRows: 0,
    totalPages: 1,
    data: [],
    searchValue: undefined as (undefined | string),
    error: undefined as (undefined | string),
} as Awaited<ReturnType<typeof __getDiagnosesDrafts>>;

export async function _getDiagnosesDrafts(params?: GetDiagnosesDraftsParams) {
    let rslts = _getDiagnosesDraftsDefaultResults;

    try {
        rslts = await __getDiagnosesDrafts({ ...params });
    } catch(e: any) {
        logger.error('_getDiagnosisDrafts ERROR', e);
        rslts.error = e.message;
    } finally {
        return rslts;
    }
}
