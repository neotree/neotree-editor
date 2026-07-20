import { and, eq, isNull, notInArray } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';

export type GetUnusedDataKeys = {

};

export type GetUnusedDataKeysResponse = {
    errors?: string[];
    data: (typeof schema.dataKeys.$inferSelect & {
        isDraft: boolean;
        isDeleted: boolean;
        draftCreatedByUserId?: string | null;
    })[];
};

export async function _getUnusedDataKeys(_?: GetUnusedDataKeys): Promise<GetUnusedDataKeysResponse> {
    try {
        let dataKeysDrafts = await db.query.dataKeysDrafts.findMany();
        const scriptsDrafts = await db.query.scriptsDrafts.findMany();
        const screensDrafts = await db.query.screensDrafts.findMany();
        const problemsDrafts = await db.query.problemsDrafts.findMany();
        const diagnosesDrafts = await db.query.diagnosesDrafts.findMany();

        const dataKeysIdsFromDrafts = dataKeysDrafts.map(s => s.dataKeyId!).filter(s => s);
        const scriptsIdsFromDrafts = scriptsDrafts.map(s => s.scriptId!).filter(s => s);
        const screensIdsFromDrafts = screensDrafts.map(s => s.screenId!).filter(s => s);
        const problemsIdsFromDrafts = problemsDrafts.map(s => s.problemId!).filter(s => s);
        const diagnosesIdsFromDrafts = diagnosesDrafts.map(s => s.diagnosisId!).filter(s => s);

        let dataKeys = await db
            .select({
                dataKey: schema.dataKeys,
                pendingDeletion: schema.pendingDeletion,
            })
            .from(schema.dataKeys)
            .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.dataKeyId, schema.dataKeys.uuid))
            .where(and(
                isNull(schema.dataKeys.deletedAt),
                isNull(schema.pendingDeletion),
                !dataKeysIdsFromDrafts.length ? 
                    undefined : notInArray(schema.dataKeys.uuid, dataKeysIdsFromDrafts)
            ));

        const scripts = await db
            .select({
                script: schema.scripts,
                pendingDeletion: schema.pendingDeletion,
            })
            .from(schema.scripts)
            .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.scriptId, schema.scripts.scriptId))
            .where(and(
                isNull(schema.scripts.deletedAt),
                isNull(schema.pendingDeletion),
                !scriptsIdsFromDrafts.length ? 
                    undefined : notInArray(schema.scripts.scriptId, scriptsIdsFromDrafts)
            ));

        const screens = await db
            .select({
                screen: schema.screens,
                pendingDeletion: schema.pendingDeletion,
            })
            .from(schema.screens)
            .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.screenId, schema.screens.screenId))
            .where(and(
                isNull(schema.screens.deletedAt),
                isNull(schema.pendingDeletion),
                !screensIdsFromDrafts.length ? 
                    undefined : notInArray(schema.screens.screenId, screensIdsFromDrafts)
            ));

        const problems = await db
            .select({
                problem: schema.problems,
                pendingDeletion: schema.pendingDeletion,
            })
            .from(schema.problems)
            .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.problemId, schema.problems.problemId))
            .where(and(
                isNull(schema.problems.deletedAt),
                isNull(schema.pendingDeletion),
                !problemsIdsFromDrafts.length ? 
                    undefined : notInArray(schema.problems.problemId, problemsIdsFromDrafts)
            ));

        const diagnoses = await db
            .select({
                diagnosis: schema.diagnoses,
                pendingDeletion: schema.pendingDeletion,
            })
            .from(schema.diagnoses)
            .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.diagnosisId, schema.diagnoses.diagnosisId))
            .where(and(
                isNull(schema.diagnoses.deletedAt),
                isNull(schema.pendingDeletion),
                !diagnosesIdsFromDrafts.length ? 
                    undefined : notInArray(schema.diagnoses.diagnosisId, diagnosesIdsFromDrafts)
            ));

        const json = JSON.stringify({
            scriptsDrafts,
            screensDrafts,
            problemsDrafts,
            diagnosesDrafts,
            scripts,
            screens,
            problems,
            diagnoses,
        });

        dataKeysDrafts = dataKeysDrafts.filter(dk => {
            const isReferenced = json.includes(dk.uniqueKey);
            return !isReferenced;
        });

        dataKeys = dataKeys.filter(dk => {
            const isReferenced = json.includes(dk.dataKey.uniqueKey);
            return !isReferenced;
        });

        const data = [
            ...dataKeys.map(s => ({
                ...s.dataKey,
                isDraft: false,
                isDeleted: false,
            } as GetUnusedDataKeysResponse['data'][0])),

            ...dataKeysDrafts.map((s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
                draftCreatedByUserId: s.createdByUserId,
            } as GetUnusedDataKeysResponse['data'][0])))
        ]
            .sort((a, b) => {
                let returnVal = 0;
                if(a.label < b.label) returnVal = -1;
                if(a.label > b.label) returnVal = 1;
                return returnVal;
            });
        

        return { data, };
    } catch(e: any) {
        return {
            errors: [e.message],
            data: [],
        };
    }
}
