import { and, count, eq, gte, inArray, isNull, notInArray, sql } from "drizzle-orm";
import { v4 } from "uuid";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import * as schema from "@/databases/pg/schema";
import { _saveDataKeys } from "./_save";
import { _extractDataKeys } from "./_extract";

export const syncedEmptyResponseData = {
    synced: {
        scripts: 0,
        screens: 0,
        diagnoses: 0,
    },
};

export type SyncDataKeysResponse = {
    data: { 
        synced: typeof syncedEmptyResponseData['synced'],
    };
    errors?: string[];
};

export async function _syncDataKeys(): Promise<SyncDataKeysResponse> {
    try {
        // disable for now
        const disabled = true;
        if (disabled) return { data: syncedEmptyResponseData, };

        const editorInfo = await db.query.editorInfo.findFirst();

        if (!editorInfo) return { data: syncedEmptyResponseData, errors: ['Failed to load `lastSynced`'], };

        const lastSynced = editorInfo.lastDataKeysSyncDate;

        if (!lastSynced) await _extractDataKeys();

        const dataKeys = await db.query.dataKeys.findMany({
            where: !lastSynced ? undefined : gte(schema.dataKeys.updatedAt, lastSynced),
        });

        if (!dataKeys.length) return { data: syncedEmptyResponseData, };

        const scriptsDrafts = await db.query.scriptsDrafts.findMany({
            where: !lastSynced ? undefined : gte(schema.scriptsDrafts.updatedAt, lastSynced),
            limit: 0,  // TODO: scripts data keys???
        });
        const diagnosesDrafts = await db.query.diagnosesDrafts.findMany({
            where: !lastSynced ? undefined : gte(schema.diagnosesDrafts.updatedAt, lastSynced),
            limit: 0,  // TODO: diagnooses data keys???
        });
        const screensDrafts = await db.query.screensDrafts.findMany({
            where: !lastSynced ? undefined : gte(schema.screensDrafts.updatedAt, lastSynced),
        });

        const scriptsIdsNotIn = scriptsDrafts.filter(d => d.scriptId).map(d => d.scriptId!);
        const screensIdsNotIn = screensDrafts.filter(d => d.screenId).map(d => d.screenId!);
        const diagnosesIdsNotIn = diagnosesDrafts.filter(d => d.diagnosisId).map(d => d.diagnosisId!);

        const scripts = await db.select({
            script: schema.scripts,
        })
            .from(schema.scripts)
            .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.scriptId, schema.scripts.scriptId))
            .where(
                !lastSynced ? undefined : and(
                    isNull(schema.scripts.deletedAt),
                    isNull(schema.pendingDeletion),
                    gte(schema.scripts.updatedAt, lastSynced),
                    !scriptsIdsNotIn.length ? undefined : notInArray(schema.scripts.scriptId, scriptsIdsNotIn),
                ),
            )
            .limit(0);  // TODO: scripts data keys???

        const diagnoses = await db.select({
            diagnosis: schema.diagnoses,
        })
            .from(schema.diagnoses)
            .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.diagnosisId, schema.diagnoses.diagnosisId))
            .where(
                !lastSynced ? undefined : and(
                    isNull(schema.diagnoses.deletedAt),
                    isNull(schema.pendingDeletion),
                    gte(schema.diagnoses.updatedAt, lastSynced),
                    !diagnosesIdsNotIn.length ? undefined : notInArray(schema.diagnoses.diagnosisId, diagnosesIdsNotIn),
                ),
            )
            .limit(0);  // TODO: diagnoses data keys???

        const screens = await db.select({
            screen: schema.screens,
        })
            .from(schema.screens)
            .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.screenId, schema.screens.screenId))
            .where(
                !lastSynced ? undefined : and(
                    isNull(schema.screens.deletedAt),
                    isNull(schema.pendingDeletion),
                    gte(schema.screens.updatedAt, lastSynced),
                    !screensIdsNotIn.length ? undefined : notInArray(schema.screens.screenId, screensIdsNotIn),
                ),
            );

        if (!(
            scriptsDrafts.length ||
            screensDrafts.length ||
            diagnosesDrafts.length ||
            scripts.length ||
            screens.length ||
            diagnoses.length
        )) return { data: syncedEmptyResponseData, };

        const scriptsArr = [
            ...scripts.map(d => ({ ...d.script, draftId: null, })), 
            ...scriptsDrafts.map(d => ({ ...d.data, draftId: d.scriptDraftId, })),
        ].filter(() => false); // TODO: scripts data keys???

        const diagnosesArr = [
            ...diagnoses.map(d => ({ ...d.diagnosis, draftId: null, })), 
            ...diagnosesDrafts.map(d => ({ ...d.data, draftId: d.diagnosisDraftId, })),
        ].filter(() => false); // TODO: diagnoses data keys???

        const screensArr = [
            ...screens.map(d => ({ ...d.screen, draftId: null, })), 
            ...screensDrafts.map(d => ({ ...d.data, draftId: d.screenDraftId, })),
        ].map(s => {
            let sync = false;

            const items = s.items || [];
            const fields = s.fields || [];

            const dataKey = dataKeys.find(k => (
                (k.name.toLowerCase() === `${s.key || ''}`.toLowerCase()) &&
                k.label !== s.label
            ));

            const dataKeyChildren = dataKeys.filter(k => k.parentKeys.includes(k.name));

            if (dataKey) {
                sync = true;
                s.label = dataKey.label;
            }

            const updatedItems: NonNullable<typeof items> = [];

            items.forEach(item => {
                const key = item.id || item.key;

                const dataKey = dataKeys.find(k => k.name.toLowerCase() === `${key}`.toLowerCase());
            });

            s.items = !s.items ? undefined : updatedItems;

            return { ...s, sync, };
        })
        .filter(s => s.sync);
        

        return {
            data: {
                synced: {
                    scripts: scriptsArr.length,
                    diagnoses: diagnosesArr.length,
                    screens: screensArr.length,
                },
            },
        };
    } catch(e: any) {
        logger.log('db_sync_data_keys', e.message);
        return {
            data: syncedEmptyResponseData,
            errors: [e.message],
        };
    }
}
