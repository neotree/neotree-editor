import { and, eq, isNull, notInArray, or, sql } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import * as schema from '@/databases/pg/schema';
import logger from "@/lib/logger";
import { 
    parseScriptsSearchResults, 
    type ParseScriptsSearchResultsParams,
    type ScriptsSearchResultsItem,
} from "@/lib/scripts-search";
import { normalizeSearchTerm } from "@/lib/search";

export type SearchScriptsParams = {
    searchValue: string;
    returnDraftsIfExist?: boolean;
};

export type SearchScriptsResponse = {
    errors?: string[];
    data: ScriptsSearchResultsItem[];
};

export async function _searchScripts({
    searchValue,
    returnDraftsIfExist = true,
}: SearchScriptsParams): Promise<SearchScriptsResponse> {
    try {
        const rawSearchValue = `${searchValue || ''}`;
        const { normalizedValue: normalizedSearchValue } = normalizeSearchTerm(rawSearchValue);

        if (!normalizedSearchValue) return { data: [], };

        const searchTerm = normalizedSearchValue;

        // SCRIPTS
        const scriptsDrafts = !returnDraftsIfExist ? [] : await db.query.scriptsDrafts.findMany({
            where: sql`lower(${schema.scriptsDrafts.data}::text) like ${`%${searchTerm}%`}`,
        });

        const scripts = await db.select({
            pendingDeletion: schema.pendingDeletion,
            script: schema.scripts,
        })
        .from(schema.scripts)
        .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.scriptId, schema.scripts.scriptId))
        .where(and(
            isNull(schema.pendingDeletion),
            isNull(schema.scripts.deletedAt),
            !scriptsDrafts.length ? undefined : notInArray(schema.scripts.scriptId, scriptsDrafts.map(d => d.scriptDraftId)),
            or(
                sql`lower(${schema.scripts.title}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.scripts.printTitle}::text) like ${`%${searchTerm}%`}`,
            ),
        ));

        // SCREENS
        const screensDrafts = !returnDraftsIfExist ? [] : await db.query.screensDrafts.findMany({
            where: sql`lower(${schema.screensDrafts.data}::text) like ${`%${searchTerm}%`}`,
        });

        const screens = await db.select({
            pendingDeletion: schema.pendingDeletion,
            screen: schema.screens,
        })
        .from(schema.screens)
        .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.screenId, schema.screens.screenId))
        .where(and(
            isNull(schema.pendingDeletion),
            isNull(schema.screens.deletedAt),
            !screensDrafts.length ? undefined : notInArray(schema.screens.screenId, screensDrafts.map(d => d.screenDraftId)),
            or(
                sql`lower(${schema.screens.condition}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.sectionTitle}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.previewTitle}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.previewPrintTitle}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.title}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.key}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.refId}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.label}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.fields}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.items}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.drugs}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.fluids}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.screens.feeds}::text) like ${`%${searchTerm}%`}`,
            ),
        ));

        // DIAGNOSES
        const diagnosesDrafts = !returnDraftsIfExist ? [] : await db.query.diagnosesDrafts.findMany({
            where: sql`lower(${schema.diagnosesDrafts.data}::text) like ${`%${searchTerm}%`}`,
        });

        const diagnoses = await db.select({
            pendingDeletion: schema.pendingDeletion,
            diagnosis: schema.diagnoses,
        })
        .from(schema.diagnoses)
        .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.diagnosisId, schema.diagnoses.diagnosisId))
        .where(and(
            isNull(schema.pendingDeletion),
            isNull(schema.diagnoses.deletedAt),
            !diagnosesDrafts.length ? undefined : notInArray(schema.diagnoses.diagnosisId, diagnosesDrafts.map(d => d.diagnosisDraftId)),
            or(
                sql`lower(${schema.diagnoses.name}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.diagnoses.expression}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.diagnoses.symptoms}::text) like ${`%${searchTerm}%`}`,
                sql`lower(${schema.diagnoses.key}::text) like ${`%${searchTerm}%`}`,
            ),
        ));

        const scriptsArr = [
            ...scriptsDrafts.map(d => ({
                ...d.data,
                scriptId: d.scriptId || d.scriptDraftId,
                isDraft: true,
            })),
            ...scripts.map(s => ({
                ...s.script,
                isDraft: false,
            })),
        ].sort((a, b) => a.position - b.position);

        const screensArr = [
            ...screensDrafts.map(d => ({
                ...d.data,
                scriptId: (d.scriptId || d.scriptDraftId)!,
                screenId: d.screenId || d.screenDraftId,
                isDraft: true,
            })),
            ...screens.map(s => ({
                ...s.screen,
                isDraft: false,
            })),
        ].sort((a, b) => a.position - b.position);

        const diagnosesArr = [
            ...diagnosesDrafts.map(d => ({
                ...d.data,
                scriptId: (d.scriptId || d.scriptDraftId)!,
                diagnosisId: d.diagnosisId || d.diagnosisDraftId,
                isDraft: true,
            })),
            ...diagnoses.map(s => ({
                ...s.diagnosis,
                isDraft: false,
            })),
        ].sort((a, b) => a.position - b.position);

        const data = parseScriptsSearchResults({
            searchValue: rawSearchValue,
            screens: screensArr as ParseScriptsSearchResultsParams['screens'],
            diagnoses: diagnosesArr as ParseScriptsSearchResultsParams['diagnoses'],
            scripts: scriptsArr as ParseScriptsSearchResultsParams['scripts'],
        });

        return { data };
    } catch(e: any) {
        logger.error('_searchScripts ERROR', e.message);
        return {
            errors: [e.message],
            data: [],
        };
    }
}
