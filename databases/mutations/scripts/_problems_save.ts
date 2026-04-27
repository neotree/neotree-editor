import { desc, eq, Query } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { problems, problemsDrafts, scripts, scriptsDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { ProblemType } from '../../queries/scripts/_problems_get';
import { removeHexCharacters } from '../../utils'

export type SaveProblemsData = Partial<ProblemType>;

export type SaveProblemsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _saveProblems({ data, broadcastAction, syncSilently, userId, client }: {
    data: SaveProblemsData[],
    broadcastAction?: boolean;
    userId?: string;
    syncSilently?: boolean;
    client?: DbOrTransaction;
}) {
    const response: SaveProblemsResponse = { success: false, };
    data = removeHexCharacters(data)
    const errors = [];
    let sqlInfo: { [key: string]: Query; } = {};
    const executor = client || db;

    try {
        let index = 0;
        for (const { problemId: itemProblemId, ...item } of data) {
            try {
                index++;

                const problemId = itemProblemId || uuid.v4();

                if (!errors.length) {
                    const getProblemDraftQuery = executor.query.problemsDrafts.findFirst({
                        where: eq(problemsDrafts.problemDraftId, problemId),
                    });

                    sqlInfo[`${problemId} - getProblemDraftQuery`] = getProblemDraftQuery.toSQL();

                    const draft = !itemProblemId ? null : await getProblemDraftQuery.execute();

                    const getPublishedProblemQuery = executor.query.problems.findFirst({
                        where: eq(problems.problemId, problemId),
                    });

                    sqlInfo[`${problemId} - getPublishedProblemQuery`] = getPublishedProblemQuery.toSQL();

                    const published = (draft || !itemProblemId) ? null : await getPublishedProblemQuery.execute();

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        } as typeof draft.data;
                        
                        const q = executor
                            .update(problemsDrafts)
                            .set({
                                data,
                                position: data.position,
                            }).where(eq(problemsDrafts.problemDraftId, problemId));

                        sqlInfo[`${problemId} - updateProblemDraft`] = q.toSQL();

                        await q.execute();
                    } else {
                        let position = item.position || published?.position;
                        if (!position) {
                            const problem = await executor.query.problems.findFirst({
                                columns: { position: true, },
                                orderBy: desc(problems.position),
                            });

                            const problemDraft = await executor.query.problemsDrafts.findFirst({
                                columns: { position: true, },
                                orderBy: desc(problemsDrafts.position),
                            });

                            position = Math.max(0, problem?.position || 0, problemDraft?.position || 0) + 1;
                        }

                        const data = {
                            ...published,
                            ...item,
                            problemId,
                            version: published?.version ? (published.version + 1) : 1,
                            position,
                        } as typeof problemsDrafts.$inferInsert['data'];

                        if (data.scriptId) {
                            const scriptDraft = await executor.query.scriptsDrafts.findFirst({
                                where: eq(scriptsDrafts.scriptDraftId, data.scriptId),
                                columns: { scriptDraftId: true, },
                            });

                            const publishedScript = await executor.query.scripts.findFirst({
                                where: eq(scripts.scriptId, data.scriptId),
                                columns: { scriptId: true, },
                            });

                            if (scriptDraft || publishedScript) {
                                const q = executor.insert(problemsDrafts).values({
                                    data,
                                    scriptId: publishedScript?.scriptId,
                                    scriptDraftId: scriptDraft?.scriptDraftId,
                                    problemDraftId: problemId,
                                    position: data.position,
                                    problemId: published?.problemId,
                                    createdByUserId: userId,
                                });

                                sqlInfo[`${problemId} - createProblemDraft`] = q.toSQL();

                                await q.execute();
                            } else {
                                errors.push(`Could not save problem ${index}: ${data.name}, because script was not found`);
                            }
                        } else {
                            errors.push(`Could not save problem ${index}: ${data.name}, because scriptId was not specified`);
                        }
                    }
                }
            } catch(e: any) {
                errors.push(e.message);
                logger.error('saveProblem SQL (FAILED)', JSON.stringify(sqlInfo));
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveProblems ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction && !syncSilently) socket.emit('data_changed', 'save_problems');
        return response;
    }
}
