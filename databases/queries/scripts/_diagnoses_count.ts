import { and, count, inArray, isNotNull, isNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { diagnoses, diagnosesDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type CountDiagnosesParams = {
    scriptsIds?: string[];
};

export type CountDiagnosesResults = {
    data: {
        allPublished: number;
        publishedWithDrafts: number;
        allDrafts: number;
        newDrafts: number;
        pendingDeletion: number;
    };
    errors?: string[];
};

export const _defaultDiagnosesCount = {
    allPublished: 0,
    publishedWithDrafts: 0,
    allDrafts: 0,
    newDrafts: 0,
    pendingDeletion: 0,
} satisfies CountDiagnosesResults['data'];

export async function _countDiagnoses(opts?: CountDiagnosesParams): Promise<CountDiagnosesResults> {
    const { scriptsIds = [], } = { ...opts };
    try {
        const whereDiagnosesScriptsIds = !scriptsIds.length ? undefined : inArray(diagnoses.scriptId, scriptsIds);
        const whereDiagnosesDraftsScriptsIds = !scriptsIds.length ? undefined : inArray(diagnosesDrafts.scriptId, scriptsIds);

        const [{ count: allDrafts }] = await db.select({ count: count(), }).from(diagnosesDrafts).where(whereDiagnosesDraftsScriptsIds);
        const [{ count: newDrafts }] = await db.select({ count: count(), }).from(diagnosesDrafts).where(
            and(whereDiagnosesDraftsScriptsIds, isNull(diagnosesDrafts.diagnosisId))
        );
        const [{ count: publishedWithDrafts }] = await db.select({ count: count(), }).from(diagnosesDrafts).where(
            and(whereDiagnosesDraftsScriptsIds, isNotNull(diagnosesDrafts.diagnosisId))
        );
        const [{ count: _pendingDeletion }] = await db.select({ count: count(), }).from(pendingDeletion).where(
            and(whereDiagnosesScriptsIds, isNotNull(pendingDeletion.diagnosisId))
        );
        const [{ count: allPublished }] = await db.select({ count: count(), }).from(diagnoses).where(whereDiagnosesScriptsIds);

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
        logger.error('_getDiagnoses ERROR', e.message);
        return { 
            data: _defaultDiagnosesCount, 
            errors: [e.message], 
        };
    }
}
