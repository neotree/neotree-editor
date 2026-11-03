import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, isNull, notExists, or, sql } from "drizzle-orm";
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
    /** Set when `data` is a draft: who owns it (null = no owner). */
    draftOwnerId?: string | null;
    isDraft?: boolean;
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

        const whereUniqueKey = (column: PgColumn) => or(
            ...uniqueKeys.map(k => sql`${column}::text like ${`%${k}%`}`),
        );

        // diagnoses
        const _diagnosesDrafts = await executor.query.diagnosesDrafts.findMany({
            where: whereUniqueKey(schema.diagnosesDrafts.data),
            orderBy: asc(schema.diagnosesDrafts.position),
        });

        // Published rows only count when they have no draft at all: the draft is the current version.
        // (The draft exclusion used to sit inside the or(), which returned every published row, and the
        // published copy of an edited entity was then saved over its draft.)
        // (plain select, not the relational query builder: that one aliases the table, and the
        // NOT EXISTS below must reference the real table name)
        const _diagnoses = await executor.select().from(schema.diagnoses)
            .where(and(
                or(
                    whereUniqueKey(schema.diagnoses.symptoms),
                    whereUniqueKey(schema.diagnoses.keyId),
                ),
                isNull(schema.diagnoses.deletedAt),
                notExists(executor.select({ one: sql`1` }).from(schema.diagnosesDrafts).where(eq(schema.diagnosesDrafts.diagnosisId, schema.diagnoses.diagnosisId))),
            ))
            .orderBy(asc(schema.diagnoses.position));

        // problems
        const _problemsDrafts = await executor.query.problemsDrafts.findMany({
            where: whereUniqueKey(schema.problemsDrafts.data),
            orderBy: asc(schema.problemsDrafts.position),
        });

        const _problems = await executor.select().from(schema.problems)
            .where(and(
                or(
                    whereUniqueKey(schema.problems.symptoms),
                    whereUniqueKey(schema.problems.keyId),
                ),
                isNull(schema.problems.deletedAt),
                notExists(executor.select({ one: sql`1` }).from(schema.problemsDrafts).where(eq(schema.problemsDrafts.problemId, schema.problems.problemId))),
            ))
            .orderBy(asc(schema.problems.position));

        // screens
        const _screensDrafts = await executor.query.screensDrafts.findMany({
            where: whereUniqueKey(schema.screensDrafts.data),
            orderBy: asc(schema.screensDrafts.position),
        });

        const _screens = await executor.select().from(schema.screens)
            .where(and(
                or(
                    whereUniqueKey(schema.screens.fields),
                    whereUniqueKey(schema.screens.items),
                    whereUniqueKey(schema.screens.keyId),
                    whereUniqueKey(schema.screens.refIdDataKey),
                ),
                isNull(schema.screens.deletedAt),
                notExists(executor.select({ one: sql`1` }).from(schema.screensDrafts).where(eq(schema.screensDrafts.screenId, schema.screens.screenId))),
            ))
            .orderBy(asc(schema.screens.position));

        // scripts - NUID search fields live on the script record itself
        const _scriptsDrafts = await executor.query.scriptsDrafts.findMany({
            where: whereUniqueKey(schema.scriptsDrafts.data),
            orderBy: asc(schema.scriptsDrafts.position),
        });

        const _scripts = await executor.select().from(schema.scripts)
            .where(and(
                whereUniqueKey(schema.scripts.nuidSearchFields),
                isNull(schema.scripts.deletedAt),
                notExists(executor.select({ one: sql`1` }).from(schema.scriptsDrafts).where(eq(schema.scriptsDrafts.scriptId, schema.scripts.scriptId))),
            ))
            .orderBy(asc(schema.scripts.position));

        const draftOwners = new Map<string, string | null>();
        const asDraft = <T>(id: string, owner: string | null | undefined, data: T) => {
            draftOwners.set(id, owner || null);
            return data;
        };

        const diagnoses = [
            ..._diagnosesDrafts.map(d => asDraft(d.data.diagnosisId || d.diagnosisDraftId, d.createdByUserId, {
                ...d.data,
                diagnosisId: d.data.diagnosisId || d.diagnosisDraftId,
            })),
            ..._diagnoses,
        ];

        const problems = [
            ..._problemsDrafts.map(d => asDraft(d.data.problemId || d.problemDraftId, d.createdByUserId, {
                ...d.data,
                problemId: d.data.problemId || d.problemDraftId,
            })),
            ..._problems,
        ];

        const screens = [
            ..._screensDrafts.map(d => asDraft(d.data.screenId || d.screenDraftId, d.createdByUserId, {
                ...d.data,
                screenId: d.data.screenId || d.screenDraftId,
            })),
            ..._screens,
        ];

        const scripts = [
            ..._scriptsDrafts.map(d => asDraft(d.data.scriptId || d.scriptDraftId, d.createdByUserId, {
                ...d.data,
                scriptId: d.data.scriptId || d.scriptDraftId,
            })),
            ..._scripts,
        ];

        const draftInfo = (id: string) => draftOwners.has(id)
            ? { isDraft: true, draftOwnerId: draftOwners.get(id) ?? null }
            : { isDraft: false };

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
            ...draftInfo(s.diagnosisId),
        }));

        const problemsDataKeys: typeof defaultResData = problems.map(s => ({
            data: s,
            refId: s.problemId,
            refType: 'problem',
            dataKeys: extractDataKeys(s),
            ...draftInfo(s.problemId),
        }));

        const screensDataKeys: typeof defaultResData = screens.map(s => ({
            data: s,
            refId: s.screenId,
            refType: 'screen',
            dataKeys: extractDataKeys(s),
            ...draftInfo(s.screenId),
        }));

        const scriptsDataKeys: typeof defaultResData = scripts.map(s => ({
            data: s,
            refId: s.scriptId,
            refType: 'script',
            dataKeys: extractDataKeys(s),
            ...draftInfo(s.scriptId),
        }));

        return {
            data: [
                ...diagnosesDataKeys,
                ...problemsDataKeys,
                ...screensDataKeys,
                ...scriptsDataKeys,
            ],
        };
    } catch(e: any) {
        return {
            data: defaultRes.data,
            errors: [e.message],
        };
    }
}
