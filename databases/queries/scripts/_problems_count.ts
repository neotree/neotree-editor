import { and, count, inArray, isNotNull, isNull, or } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { problems, problemsDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountProblemsParams = {
    scriptsIds?: string[];
};

export type CountProblemsResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
        pendingDeletion: number;
    };
    errors?: string[];
};

export const _defaultProblemsCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
    pendingDeletion: 0,
} satisfies CountProblemsResults['data'];

export async function _countProblems(opts?: CountProblemsParams): Promise<CountProblemsResults> {
    const { scriptsIds = [], } = { ...opts };
    try {
        const whereProblemsScriptsIds = !scriptsIds.length ? undefined : inArray(problems.scriptId, scriptsIds);
        const whereProblemsDraftsScriptsIds = !scriptsIds.length ? undefined : inArray(problemsDrafts.scriptId, scriptsIds);

        const [{ count: allDrafts }] = await db.select({ count: count(), }).from(problemsDrafts).where(whereProblemsDraftsScriptsIds);
        const [{ count: newDrafts }] = await db.select({ count: count(), }).from(problemsDrafts).where(
            and(whereProblemsDraftsScriptsIds, isNull(problemsDrafts.problemId))
        );
        const [{ count: publishedWithDrafts }] = await db.select({ count: count(), }).from(problemsDrafts).where(
            and(whereProblemsDraftsScriptsIds, isNotNull(problemsDrafts.problemId))
        );
        const [{ count: _pendingDeletion }] = await db.select({ count: count(), }).from(pendingDeletion).where(
            and(
                !scriptsIds.length ? undefined : or(
                    // inArray(pendingDeletion.scriptId, scriptsIds),
                    inArray(pendingDeletion.problemScriptId, scriptsIds)
                ),
                isNotNull(pendingDeletion.problemId)
            )
        );
        const [{ count: allPublished }] = await db.select({ count: count(), }).from(problems).where(whereProblemsScriptsIds);

        return  { 
            data: {
                allPublished,
                publishedWithDrafts,
                allDrafts,
                newDrafts,
                pendingDeletion: _pendingDeletion,
            },
        };
    } catch(e: any) {
        logger.error('_getProblems ERROR', e.message);
        return { 
            data: _defaultProblemsCount, 
            errors: [e.message], 
        };
    }
}
