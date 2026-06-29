import { and, eq, inArray, isNotNull, isNull, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import type { DbOrTransaction } from "@/databases/pg/db-client";
import { problems, problemsDrafts, hospitals, pendingDeletion, scripts, scriptsDrafts } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { Preferences, ScriptImage } from "@/types";

export type GetProblemsParams = {
    problemsIds?: string[];
    scriptsIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
    withImagesOnly?: boolean;
    client?: DbOrTransaction;
};

export type ProblemType = typeof problems.$inferSelect & {
    isDraft: boolean;
    isDeleted: boolean;
    preferences: Preferences;
    image1: null | ScriptImage;
    image2: null | ScriptImage;
    image3: null | ScriptImage;
    scriptTitle?: string;
    hospitalName?: string;
    draftCreatedByUserId?: string | null;
};

export type GetProblemsResults = {
    data: ProblemType[];
    errors?: string[];
};

export async function _getProblems(
    params?: GetProblemsParams
): Promise<GetProblemsResults> {
    try {
        let {
            scriptsIds: scriptsIds = [],
            problemsIds: problemsIds = [],
            returnDraftsIfExist = true,
            withImagesOnly,
            client,
        } = { ...params };
        const executor = client || db;

        problemsIds = problemsIds.filter(s => uuid.validate(s));

        scriptsIds = scriptsIds.filter(s => uuid.validate(s));
        const _oldScriptsIds = scriptsIds.filter(s => !uuid.validate(s));

        if (_oldScriptsIds.length) {
            const res = await executor.query.scripts.findMany({
                where: inArray(scripts.oldScriptId, _oldScriptsIds),
                columns: { scriptId: true, oldScriptId: true, },
            });
            _oldScriptsIds.forEach(oldScriptId => {
                const s = res.filter(s => s.oldScriptId === oldScriptId)[0];
                scriptsIds.push(s?.scriptId || uuid.v4());
            });
        }

        // unpublished problems conditions
        const drafts = !returnDraftsIfExist ? [] : await executor.query.problemsDrafts.findMany({
            where: and(
                !scriptsIds?.length ? undefined : or(
                    inArray(problemsDrafts.scriptId, scriptsIds),
                    inArray(problemsDrafts.scriptDraftId, scriptsIds)
                ),
                !problemsIds?.length ? undefined : inArray(problemsDrafts.problemDraftId, problemsIds)
            ),
            columns: {
                problemId: true,
                problemDraftId: true,
                scriptId: true,
                scriptDraftId: true,
                data: true,
                createdByUserId: true,
            },
        });

        const draftPublishedScriptIds = Array.from(new Set(drafts.map((draft) => draft.scriptId).filter(Boolean))) as string[];
        const draftScriptDraftIds = Array.from(new Set(drafts.map((draft) => draft.scriptDraftId).filter(Boolean))) as string[];

        const [draftPublishedScripts, draftScriptDrafts] = await Promise.all([
            !draftPublishedScriptIds.length
                ? Promise.resolve([])
                : executor.query.scripts.findMany({
                    where: inArray(scripts.scriptId, draftPublishedScriptIds),
                    columns: { scriptId: true, title: true, hospitalId: true, },
                }),
            !draftScriptDraftIds.length
                ? Promise.resolve([])
                : executor.query.scriptsDrafts.findMany({
                    where: inArray(scriptsDrafts.scriptDraftId, draftScriptDraftIds),
                    columns: { scriptDraftId: true, hospitalId: true, data: true, },
                }),
        ]);

        const draftHospitalIds = Array.from(new Set([
            ...draftPublishedScripts.map((script) => script.hospitalId).filter(Boolean),
            ...draftScriptDrafts.map((script) => script.hospitalId).filter(Boolean),
        ])) as string[];

        const draftHospitals = !draftHospitalIds.length ? [] : await executor.query.hospitals.findMany({
            where: inArray(hospitals.hospitalId, draftHospitalIds),
            columns: { hospitalId: true, name: true, },
        });

        const publishedScriptById = new Map(draftPublishedScripts.map((script) => [script.scriptId, script]));
        const scriptDraftById = new Map(draftScriptDrafts.map((script) => [script.scriptDraftId, script]));
        const hospitalNameById = new Map(draftHospitals.map((hospital) => [hospital.hospitalId, hospital.name]));

        // published problems conditions
        const publishedRes = await executor
            .select({
                problem: problems,
                pendingDeletion: pendingDeletion,
                script: {
                    title: scripts.title,
                    hospitalId: scripts.hospitalId,
                },
                hospital: {
                    name: hospitals.name,
                },
            })
            .from(problems)
            .leftJoin(pendingDeletion, eq(pendingDeletion.problemId, problems.problemId))
            .leftJoin(problemsDrafts, eq(problemsDrafts.problemId, problems.problemId))
            .leftJoin(scripts, eq(scripts.scriptId, problems.scriptId))
            .leftJoin(hospitals, and(
                eq(scripts.scriptId, problems.scriptId),
                eq(scripts.hospitalId, hospitals.hospitalId)
            ))
            .where(and(
                isNull(problems.deletedAt),
                isNull(pendingDeletion),
                !returnDraftsIfExist ? undefined : isNull(problemsDrafts.problemId),
                !scriptsIds?.length ? undefined : inArray(problems.scriptId, scriptsIds),
                !problemsIds?.length ? undefined : inArray(problems.problemId, problemsIds),
                !withImagesOnly ? undefined : or(
                    isNotNull(problems.image1),
                    isNotNull(problems.image2),
                    isNotNull(problems.image3)
                ),
            ));

        const published = publishedRes.map(s => ({
            ...s.problem,
            scriptTitle: s.script?.title || '',
            hospitalName: s.hospital?.name || '',
        }));

        const inPendingDeletion = !published.length ? [] : await executor.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.problemId, published.map(s => s.problemId)),
            columns: { problemId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as GetProblemsResults['data'][0])),

            ...drafts.map((s => {
                const publishedScript = s.scriptId ? publishedScriptById.get(s.scriptId) : undefined;
                const scriptDraft = s.scriptDraftId ? scriptDraftById.get(s.scriptDraftId) : undefined;
                const resolvedHospitalId = publishedScript?.hospitalId || scriptDraft?.hospitalId || null;
                const resolvedScriptTitle = publishedScript?.title || scriptDraft?.data?.title || "";

                return ({
                    ...s.data,
                    // Problem drafts can be copied between scripts; resolve the
                    // current owner name from relations so publish blockers and
                    // registries point at the right script.
                    scriptTitle: resolvedScriptTitle,
                    hospitalName: resolvedHospitalId ? (hospitalNameById.get(resolvedHospitalId) || "") : "",
                    isDraft: true,
                    isDeleted: false,
                    draftCreatedByUserId: s.createdByUserId,
                } as GetProblemsResults['data'][0]);
            }))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.problemId).includes(s.problemId))
            .map(s => ({
                ...s,
                scriptTitle: s.scriptTitle || '',
                hospitalName: s.hospitalName || '',
            }));

        return  {
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getProblems ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetProblemResults = {
    data?: null | ProblemType;
    errors?: string[];
};

export async function _getProblem(
    params: {
        problemId: string,
        returnDraftIfExists?: boolean;
    },
): Promise<GetProblemResults> {
    const { problemId, returnDraftIfExists, } = { ...params };

    try {
        if (!problemId) throw new Error('Missing problemId');

        const whereProblemId = uuid.validate(problemId) ? eq(problems.problemId, problemId) : undefined;
        const whereProblemDraftId = !whereProblemId ? undefined : eq(problemsDrafts.problemDraftId, problemId);

        let draft = (returnDraftIfExists && whereProblemDraftId) ? await db.query.problemsDrafts.findFirst({
            where: whereProblemDraftId,
            columns: {
                data: true,
                createdByUserId: true,
            },
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            draftCreatedByUserId: draft.createdByUserId,
            isDraft: true,
            isDeleted: false,
        } as GetProblemResults['data'];

        if (responseData) return { data: responseData, };

        const publishedRes = await db
            .select({
                problem: problems,
                pendingDeletion,
                draft: {
                    data: problemsDrafts.data,
                    createdByUserId: problemsDrafts.createdByUserId,
                },
            })
            .from(problems)
            .leftJoin(pendingDeletion, eq(pendingDeletion.problemId, problems.problemId))
            .leftJoin(problemsDrafts, eq(problems.problemId, problemsDrafts.problemDraftId))
            .where(and(
                isNull(problems.deletedAt),
                isNull(pendingDeletion),
                whereProblemId,
            ));

        const published = !publishedRes[0] ? null : {
            ...publishedRes[0].problem,
            draft: publishedRes[0].draft || undefined,
        };

        draft = returnDraftIfExists ? published?.draft : undefined;

        const data = (draft?.data || published) as GetProblemResults['data'];

        responseData = !data ? null : {
            ...data,
            draftCreatedByUserId: draft?.createdByUserId,
            isDraft: !!draft?.data,
            isDeleted: false,
        };

        if (!responseData) return { data: null, };

        return  {
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getProblem ERROR', e.message);
        return { errors: [e.message], };
    }
}
