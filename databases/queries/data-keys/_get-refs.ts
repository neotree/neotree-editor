import { NextRequest, NextResponse } from "next/server";
import { and, asc, isNull, notInArray, or, sql } from "drizzle-orm";
import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import * as schema from "@/databases/pg/schema";
import { PgColumn } from "drizzle-orm/pg-core";

export type GetDataKeysRefsParams = {
    uniqueKeys: string[];
    client?: DbOrTransaction;
};

const defaultResData = [] as {
    refType: string;
    refId: string;
    data: any;
    dataKeys: {
        key: string;
        dataKey: string;
    }[];
}[];

export const defaultRes: {
    data: typeof defaultResData;
    errors?: string[];
} = {
    data: defaultResData,
};

export async function _getDataKeysRefs({
    uniqueKeys = [],
    client,
}: GetDataKeysRefsParams): Promise<typeof defaultRes> {
    try {
        if (!uniqueKeys.length) return defaultRes;
        const executor = client || db;

        const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, '\\$&');
        const whereUniqueKey = (column: PgColumn) => or(
            ...uniqueKeys.map(k => sql`${column}::text like ${`%${escapeLikePattern(k)}%`}`),
        );

        // Published rows superseded by a draft must always be excluded, whether or
        // not that draft still matches the keys — the draft is the current state.
        const draftedIds = async (rows: PromiseLike<{ id: string | null }[]>) =>
            (await rows).map(r => r.id!).filter(Boolean);

        // diagnoses
        const _diagnosesDrafts = await executor.query.diagnosesDrafts.findMany({
            where: whereUniqueKey(schema.diagnosesDrafts.data),
            orderBy: asc(schema.diagnosesDrafts.position),
        });

        const diagnosesIds = await draftedIds(executor
            .select({ id: schema.diagnosesDrafts.diagnosisId })
            .from(schema.diagnosesDrafts));

        const _diagnoses = await executor.query.diagnoses.findMany({
            where: and(
                or(
                    whereUniqueKey(schema.diagnoses.symptoms),
                    whereUniqueKey(schema.diagnoses.keyId),
                ),
                !diagnosesIds.length ? undefined : notInArray(schema.diagnoses.diagnosisId, diagnosesIds),
                isNull(schema.diagnoses.deletedAt),
            ),
            orderBy: asc(schema.diagnoses.position),
        });

        // problems
        const _problemsDrafts = await executor.query.problemsDrafts.findMany({
            where: whereUniqueKey(schema.problemsDrafts.data),
            orderBy: asc(schema.problemsDrafts.position),
        });

        const problemsIds = await draftedIds(executor
            .select({ id: schema.problemsDrafts.problemId })
            .from(schema.problemsDrafts));

        const _problems = await executor.query.problems.findMany({
            where: and(
                or(
                    whereUniqueKey(schema.problems.symptoms),
                    whereUniqueKey(schema.problems.keyId),
                ),
                !problemsIds.length ? undefined : notInArray(schema.problems.problemId, problemsIds),
                isNull(schema.problems.deletedAt),
            ),
            orderBy: asc(schema.problems.position),
        });

        // screens
        const _screensDrafts = await executor.query.screensDrafts.findMany({
            where: whereUniqueKey(schema.screensDrafts.data),
            orderBy: asc(schema.screensDrafts.position),
        });

        const screensIds = await draftedIds(executor
            .select({ id: schema.screensDrafts.screenId })
            .from(schema.screensDrafts));

        const _screens = await executor.query.screens.findMany({
            where: and(
                or(
                    whereUniqueKey(schema.screens.fields),
                    whereUniqueKey(schema.screens.items),
                    whereUniqueKey(schema.screens.keyId),
                    whereUniqueKey(schema.screens.refIdDataKey),
                ),
                !screensIds.length ? undefined : notInArray(schema.screens.screenId, screensIds),
                isNull(schema.screens.deletedAt),
            ),
            orderBy: asc(schema.screens.position),
        });

        const diagnoses = [
            ..._diagnosesDrafts.map(d => ({
                ...d.data,
                diagnosisId: d.data.diagnosisId || d.diagnosisDraftId,
            })),
            ..._diagnoses,
        ];

        const problems = [
            ..._problemsDrafts.map(d => ({
                ...d.data,
                problemId: d.data.problemId || d.problemDraftId,
            })),
            ..._problems,
        ];

        const screens = [
            ..._screensDrafts.map(d => ({
                ...d.data,
                screenId: d.data.screenId || d.screenDraftId,
            })),
            ..._screens,
        ];

        const extractDataKeys = (o: object, parentKey?: string) => {
            let dataKeys: typeof defaultResData[0]['dataKeys'] = [];

            if (!o || (typeof o !== 'object')) return dataKeys;

            if (Array.isArray(o)) {
                o.forEach((item, index) => {
                    dataKeys = [
                        ...dataKeys, 
                        ...extractDataKeys(item, `${parentKey}.${index}`).map(f => ({
                            ...f,
                        })),
                    ];
                });
            } else {
                Object.keys(o).forEach(k => {
                    const value = (o as { [key: string]: any; })[k];
                    if (value) {
                        if (typeof value === 'string' && uniqueKeys.includes(value)) {
                            dataKeys.push({
                                key: [parentKey, k].filter(s => s).join('.'),
                                dataKey: value,
                            });
                        } 
                        
                        if (typeof value === 'object') {
                            dataKeys = [
                                ...dataKeys, 
                                ...extractDataKeys(value, [parentKey, k].filter(s => s).join('.')),
                            ];
                        }
                    }
                });
            }

            return dataKeys;
        };

        const diagnosesDataKeys: typeof defaultResData = diagnoses.map(s => ({
            data: s,
            refId: s.diagnosisId,
            refType: 'diagnosis',
            dataKeys: extractDataKeys(s),
        }));

        const problemsDataKeys: typeof defaultResData = problems.map(s => ({
            data: s,
            refId: s.problemId,
            refType: 'problem',
            dataKeys: extractDataKeys(s),
        }));

        const screensDataKeys: typeof defaultResData = screens.map(s => ({
            data: s,
            refId: s.screenId,
            refType: 'screen',
            dataKeys: extractDataKeys(s),
        }));

        return { 
            data: [
                ...diagnosesDataKeys,
                ...problemsDataKeys,
                ...screensDataKeys,
            ], 
        };
    } catch(e: any) {
        return {
            data: defaultRes.data,
            errors: [e.message],
        };
    }
}
