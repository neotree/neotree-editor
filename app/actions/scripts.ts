'use server';

import { v4 } from "uuid";
import queryString from "query-string";
import { and, eq, inArray, isNull, or } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { screens, diagnoses, problems, screensDrafts, diagnosesDrafts, problemsDrafts, pendingDeletion, scripts as scriptsTable } from "@/databases/pg/schema";
import * as mutations from "@/databases/mutations/scripts";
import * as queries from "@/databases/queries/scripts";
import { _saveDrugsLibraryItemsUpdateIfExists, _saveDrugsLibraryItemsIfKeysNotExist } from "@/databases/mutations/drugs-library";
import { _saveDataKeys } from "@/databases/mutations/data-keys";
import { _getSiteApiKey, } from '@/databases/queries/sites';
import logger from "@/lib/logger";
import socket from "@/lib/socket";
import { getSiteAxiosClient } from "@/lib/server/axios";
import { isAllowed } from "./is-allowed";
import { isValidUrl } from "@/lib/urls";
import { processImage } from "@/lib/process-image";
import { _getDataKeys, DataKey } from "@/databases/queries/data-keys";
import { _getDrugsLibraryItems } from "@/databases/queries/drugs-library";
import { dataKeyToJSON, parseImportedDataKeys, scrapDataKeys } from "@/lib/data-keys";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { getIntegrityPolicyState } from "@/lib/integrity-policy";
import { createIntegrityImportSnapshot } from "./integrity-imports";
import { collectScriptConditionFindings, type ScriptConditionEntityRef } from "@/lib/conditional-expression";
import { indexDataKeysById, resolveNuidLibraryKeys } from "@/lib/nuid-search";

export const getScriptsMetadata = queries._getScriptsMetadata;

// DIAGNOSES
export const countScreens: typeof queries._countScreens = async (...args) => {
    try {
        await isAllowed();
        return await queries._countScreens(...args);
    } catch (e: any) {
        logger.error('countScreens ERROR', e.message);
        return { errors: [e.message], data: queries._defaultScreensCount, };
    }
};

export const getScreens: typeof queries._getScreens = async (...args) => {
    try {
        await isAllowed();
        return await queries._getScreens(...args);
    } catch(e: any) {
        logger.error('getScreens ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const listScreens: typeof queries._listScreens = async (...args) => {
    try {
        await isAllowed();
        return await queries._listScreens(...args);
    } catch (e: any) {
        logger.error('listScreens ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getScreen: typeof queries._getScreen = async (...args) => {
    await isAllowed();
    return await queries._getScreen(...args);
};

/**
 * Resolves the script IDs affected by an entity delete so their cached CE report
 * can be refreshed afterwards. Reads scriptId from both the published and draft
 * tables of whichever entity ids were supplied, unioned with any explicit
 * scriptsIds. Must be called BEFORE the delete (entities still resolvable).
 */
async function resolveDeleteAffectedScriptIds(params: any): Promise<string[]> {
    const ids = new Set<string>();
    for (const id of ((params?.scriptsIds || []) as any[])) if (id) ids.add(`${id}`);

    const screensIds = ((params?.screensIds || []) as any[]).filter(Boolean);
    const diagnosesIds = ((params?.diagnosesIds || []) as any[]).filter(Boolean);
    const problemsIds = ((params?.problemsIds || []) as any[]).filter(Boolean);

    const lookups: Promise<{ scriptId: string | null }[]>[] = [];
    if (screensIds.length) {
        lookups.push(db.select({ scriptId: screens.scriptId }).from(screens).where(inArray(screens.screenId, screensIds)));
        lookups.push(db.select({ scriptId: screensDrafts.scriptId }).from(screensDrafts).where(inArray(screensDrafts.screenId, screensIds)));
    }
    if (diagnosesIds.length) {
        lookups.push(db.select({ scriptId: diagnoses.scriptId }).from(diagnoses).where(inArray(diagnoses.diagnosisId, diagnosesIds)));
        lookups.push(db.select({ scriptId: diagnosesDrafts.scriptId }).from(diagnosesDrafts).where(inArray(diagnosesDrafts.diagnosisId, diagnosesIds)));
    }
    if (problemsIds.length) {
        lookups.push(db.select({ scriptId: problems.scriptId }).from(problems).where(inArray(problems.problemId, problemsIds)));
        lookups.push(db.select({ scriptId: problemsDrafts.scriptId }).from(problemsDrafts).where(inArray(problemsDrafts.problemId, problemsIds)));
    }

    try {
        for (const rows of await Promise.all(lookups)) {
            for (const r of rows) if (r?.scriptId) ids.add(`${r.scriptId}`);
        }
    } catch (e: any) {
        logger.error('resolveDeleteAffectedScriptIds ERROR', e?.message);
    }
    return Array.from(ids);
}

export const deleteScreens: typeof mutations._deleteScreens = async params => {
    try {
        const session = await isAllowed();

        const affectedScriptIds = await resolveDeleteAffectedScriptIds(params);
        const res = await mutations._deleteScreens({
            ...params,
            userId: session.user?.userId,
        });
        if (res?.success !== false) void recomputeScriptsConditionErrors(affectedScriptIds);
        return res;
    } catch (e: any) {
        logger.error('deleteScreens ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveScreens: typeof mutations._saveScreens = async params => {
    try {
        const session = await isAllowed();
        const res = await mutations._saveScreens({
            ...params,
            userId: session.user?.userId,
        });
        if (res?.success !== false) void recomputeScriptsConditionErrors(((params as any)?.data || []).map((d: any) => d?.scriptId));
        return res;
    } catch (e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

// DIAGNOSES
export const countDiagnoses: typeof queries._countDiagnoses = async (...args) => {
    try {
        await isAllowed();
        return await queries._countDiagnoses(...args);
    } catch (e: any) {
        logger.error('countDiagnoses ERROR', e.message);
        return { errors: [e.message], data: queries._defaultDiagnosesCount, };
    }
};

export const getDiagnoses: typeof queries._getDiagnoses = async (...args) => {
    try {
        await isAllowed();
        return await queries._getDiagnoses(...args);
    } catch (e: any) {
        logger.error('getDiagnoses ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getDiagnosis: typeof queries._getDiagnosis = async (...args) => {
    await isAllowed();
    return await queries._getDiagnosis(...args);
};

export const deleteDiagnoses: typeof mutations._deleteDiagnoses = async params => {
    try {
        const session = await isAllowed();
        const affectedScriptIds = await resolveDeleteAffectedScriptIds(params);
        const res = await mutations._deleteDiagnoses({
            ...params,
            userId: session.user?.userId,
        });
        if (res?.success !== false) void recomputeScriptsConditionErrors(affectedScriptIds);
        return res;
    } catch (e: any) {
        logger.error('deleteDiagnoses ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

// PROBLEMS
export const countProblems: typeof queries._countProblems = async (...args) => {
    try {
        await isAllowed();
        return await queries._countProblems(...args);
    } catch (e: any) {
        logger.error('countProblems ERROR', e.message);
        return { errors: [e.message], data: queries._defaultProblemsCount, };
    }
};

export const getProblems: typeof queries._getProblems = async (...args) => {
    try {
        await isAllowed();
        return await queries._getProblems(...args);
    } catch (e: any) {
        logger.error('getProblems ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getProblem: typeof queries._getProblem = async (...args) => {
    await isAllowed();
    return await queries._getProblem(...args);
};

export const deleteProblems: typeof mutations._deleteProblems = async params => {
    try {
        const session = await isAllowed();
        const affectedScriptIds = await resolveDeleteAffectedScriptIds(params);
        const res = await mutations._deleteProblems({
            ...params,
            userId: session.user?.userId,
        });
        if (res?.success !== false) void recomputeScriptsConditionErrors(affectedScriptIds);
        return res;
    } catch (e: any) {
        logger.error('deleteProblems ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveDiagnoses: typeof mutations._saveDiagnoses = async params => {
    try {
        const session = await isAllowed();
        const res = await mutations._saveDiagnoses({
            ...params,
            userId: session.user?.userId,
        });
        if (res?.success !== false) void recomputeScriptsConditionErrors(((params as any)?.data || []).map((d: any) => d?.scriptId));
        return res;
    } catch (e: any) {
        logger.error('saveDiagnoses ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

export const saveProblems: typeof mutations._saveProblems = async params => {
    try {
        const session = await isAllowed();
        const res = await mutations._saveProblems({
            ...params,
            userId: session.user?.userId,
        });
        if (res?.success !== false) void recomputeScriptsConditionErrors(((params as any)?.data || []).map((d: any) => d?.scriptId));
        return res;
    } catch (e: any) {
        logger.error('saveProblems ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

// SCRIPTS
export const countScripts: typeof queries._countScripts = async (...args) => {
    try {
        await isAllowed();
        return await queries._countScripts(...args);
    } catch (e: any) {
        logger.error('countScripts ERROR', e.message);
        return { errors: [e.message], data: queries._defaultScriptsCount, };
    }
};

export const getScripts: typeof queries._getScripts = async (...args) => {
    try {
        await isAllowed();
        return await queries._getScripts(...args);
    } catch (e: any) {
        logger.error('getScripts ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getScript: typeof queries._getScript = async (...args) => {
    await isAllowed();
    return await queries._getScript(...args);
};

export const deleteScripts: typeof mutations._deleteScripts = async params => {
    try {
        const session = await isAllowed();
        return await mutations._deleteScripts({
            ...params,
            userId: session.user?.userId,
        });
    } catch (e: any) {
        logger.error('deleteScripts ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const saveScripts: typeof mutations._saveScripts = async params => {
    try {
        const session = await isAllowed();
        const res = await mutations._saveScripts({
            ...params,
            userId: session.user?.userId,
        });
        if (res?.success !== false) void recomputeScriptsConditionErrors(((params as any)?.data || []).map((d: any) => d?.scriptId));
        return res;
    } catch (e: any) {
        logger.error('saveScripts ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};

type GetScriptsWithItemsResponse = {
    errors?: string[];
    data: (Awaited<ReturnType<typeof queries._getScripts>>['data'][0] & {
        screens: Awaited<ReturnType<typeof queries._getScreens>>['data'][0][];
        diagnoses: Awaited<ReturnType<typeof queries._getDiagnoses>>['data'][0][];
        problems: Awaited<ReturnType<typeof queries._getProblems>>['data'][0][];
        drugsLibrary: Awaited<ReturnType<typeof queries._getScriptsDrugsLibrary>>['data'][0][];
        dataKeys: Awaited<ReturnType<typeof scrapDataKeys>>;
    })[];
};

export async function getScriptsWithItems(params: Parameters<typeof queries._getScripts>[0]): Promise<GetScriptsWithItemsResponse> {
    const data: GetScriptsWithItemsResponse['data'] = [];
    const errors: string[] = [];

    try {
        const returnDraftsIfExist = params?.returnDraftsIfExist !== false;
        const scripts = await queries._getScripts({ ...params, returnDraftsIfExist });
        const { data: dataKeys, } = await _getDataKeys();

        scripts.errors?.forEach(e => errors.push(e));

        for (const s of scripts.data) {
            const screens = await queries._getScreens({ scriptsIds: [s.scriptId], returnDraftsIfExist, });
            const diagnoses = await queries._getDiagnoses({ scriptsIds: [s.scriptId], returnDraftsIfExist, });
            const problems = await queries._getProblems({ scriptsIds: [s.scriptId], returnDraftsIfExist, });
            const drugsLibrary = await queries._getScriptsDrugsLibrary({ scriptsIds: [s.scriptId], returnDraftsIfExist, });

            screens.errors?.forEach(e => errors.push(e));
            diagnoses.errors?.forEach(e => errors.push(e));
            problems.errors?.forEach(e => errors.push(e));

            const drugsLibraryItems = drugsLibrary.data
                .filter(d => {
                    const drugScreens = screens.data.filter(s => ['drugs', 'fluids', 'feeds'].includes(s.type));
                    return (
                        !!drugScreens.find(s => (s.drugs || []).map(d => d.key).includes(d.key)) ||
                        !!drugScreens.find(s => (s.fluids || []).map(d => d.key).includes(d.key)) ||
                        !!drugScreens.find(s => (s.feeds || []).map(d => d.key).includes(d.key))
                    );
                });

            const scrappedDataKeys = await scrapDataKeys({
                dataKeys,
                screens: screens.data,
                diagnoses: diagnoses.data,
                problems: problems.data,
                drugsLibrary: drugsLibraryItems,
            });

            data.push({
                ...s,
                screens: screens.data,
                diagnoses: diagnoses.data,
                problems: problems.data,
                dataKeys: scrappedDataKeys,
                drugsLibrary: drugsLibraryItems,
            });
        }

        if (errors.length) return { errors, data: [], };

        return { data, };
    } catch (e: any) {
        logger.error('getScriptsWithItems ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type ScriptConditionErrorInput = {
    scriptId: string;
    nuidSearchFields?: any;
    eligibilityCriteria?: any;
};

export type ScriptConditionReport = {
    count: number;
    findings: { location: string; href?: string; message?: string }[];
};

function hrefForConditionEntity(scriptId: string, entity?: ScriptConditionEntityRef): string {
    if (!entity) return `/script/${scriptId}`;
    switch (entity.kind) {
        case 'screen':
            return entity.screenId ? `/script/${scriptId}/screen/${entity.screenId}` : `/script/${scriptId}?section=screens`;
        case 'diagnosis':
            return entity.diagnosisId ? `/script/${scriptId}/diagnosis/${entity.diagnosisId}` : `/script/${scriptId}?section=diagnoses`;
        case 'problem':
            return entity.problemId ? `/script/${scriptId}/problem/${entity.problemId}` : `/script/${scriptId}?section=diagnoses`;
        default:
            return `/script/${scriptId}`;
    }
}

function buildConditionReport(scriptId: string, script: any): ScriptConditionReport {
    const findings = collectScriptConditionFindings(script);
    return {
        count: findings.length,
        findings: findings.slice(0, 100).map((f) => ({
            location: f.location,
            href: hrefForConditionEntity(scriptId, f.entity),
            message: f.errors[0]?.message,
        })),
    };
}

/**
 * Lean, batched (no N+1) computation of CE reports for the given scripts —
 * one query each for screens/diagnoses/problems + one for the data-key
 * registry, grouped and scrapped in memory. Reflects PUBLISHED content (the
 * persisted per-script report, kept fresh on write, is draft-inclusive).
 */
async function computeConditionReportsLean(
    inputs: ScriptConditionErrorInput[],
): Promise<Record<string, ScriptConditionReport>> {
    const scriptIds = inputs.map((s) => `${s?.scriptId || ''}`).filter(Boolean);
    if (!scriptIds.length) return {};

    const [screenRows, diagnosisRows, problemRows, dataKeysRes] = await Promise.all([
        db
            .select({
                scriptId: screens.scriptId,
                screenId: screens.screenId,
                key: screens.key,
                label: screens.label,
                title: screens.title,
                type: screens.type,
                condition: screens.condition,
                skipToCondition: screens.skipToCondition,
                fields: screens.fields,
                items: screens.items,
                drugs: screens.drugs,
                fluids: screens.fluids,
                feeds: screens.feeds,
            })
            .from(screens)
            .leftJoin(pendingDeletion, eq(pendingDeletion.screenId, screens.screenId))
            .where(and(isNull(screens.deletedAt), isNull(pendingDeletion.id), inArray(screens.scriptId, scriptIds))),
        db
            .select({
                scriptId: diagnoses.scriptId,
                diagnosisId: diagnoses.diagnosisId,
                key: diagnoses.key,
                name: diagnoses.name,
                expression: diagnoses.expression,
                symptoms: diagnoses.symptoms,
            })
            .from(diagnoses)
            .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisId, diagnoses.diagnosisId))
            .where(and(isNull(diagnoses.deletedAt), isNull(pendingDeletion.id), inArray(diagnoses.scriptId, scriptIds))),
        db
            .select({
                scriptId: problems.scriptId,
                problemId: problems.problemId,
                key: problems.key,
                name: problems.name,
                expression: problems.expression,
                symptoms: problems.symptoms,
            })
            .from(problems)
            .leftJoin(pendingDeletion, eq(pendingDeletion.problemId, problems.problemId))
            .where(and(isNull(problems.deletedAt), isNull(pendingDeletion.id), inArray(problems.scriptId, scriptIds))),
        _getDataKeys(),
    ]);

    const globalDataKeys = dataKeysRes.data || [];
    const dataKeyIndex = indexDataKeysById(globalDataKeys as any);

    const groupByScript = <T extends { scriptId?: string | null }>(rows: T[] = []) => {
        const map = new Map<string, T[]>();
        for (const row of rows) {
            const id = `${row?.scriptId || ''}`;
            if (!id) continue;
            const arr = map.get(id);
            if (arr) arr.push(row);
            else map.set(id, [row]);
        }
        return map;
    };

    const screensByScript = groupByScript(screenRows);
    const diagnosesByScript = groupByScript(diagnosisRows);
    const problemsByScript = groupByScript(problemRows);

    const DRUG_SCREEN_TYPES = ['drugs', 'fluids', 'feeds'];
    const drugKeysOf = (scriptScreens: any[]) => {
        const keys = new Set<string>();
        for (const scr of scriptScreens) {
            if (!DRUG_SCREEN_TYPES.includes(`${scr?.type}`)) continue;
            for (const item of [...(scr?.drugs || []), ...(scr?.fluids || []), ...(scr?.feeds || [])]) {
                if (item?.key) keys.add(`${item.key}`);
            }
        }
        return keys;
    };
    const allDrugKeys = drugKeysOf(screenRows as any[]);
    const drugItemsRes = allDrugKeys.size
        ? await _getDrugsLibraryItems({ keys: Array.from(allDrugKeys) })
        : { data: [] as any[] };
    const drugItemsByKey = new Map<string, any>();
    for (const d of drugItemsRes.data || []) if (d?.key) drugItemsByKey.set(`${d.key}`, d);

    const reports: Record<string, ScriptConditionReport> = {};

    await Promise.all(inputs.map(async (s) => {
        const scriptId = `${s?.scriptId || ''}`;
        if (!scriptId) return;

        const scriptScreens = screensByScript.get(scriptId) || [];
        const scriptDiagnoses = diagnosesByScript.get(scriptId) || [];
        const scriptProblems = problemsByScript.get(scriptId) || [];
        const scriptDrugs = Array.from(drugKeysOf(scriptScreens as any[]))
            .map((k) => drugItemsByKey.get(k))
            .filter(Boolean);

        const dataKeys = await scrapDataKeys({
            dataKeys: globalDataKeys,
            screens: scriptScreens as any,
            diagnoses: scriptDiagnoses as any,
            problems: scriptProblems as any,
            drugsLibrary: scriptDrugs as any,
        });

        const nuidSearchFields = (s?.nuidSearchFields || []) as any[];
        reports[scriptId] = buildConditionReport(scriptId, {
            scriptId,
            dataKeys,
            screens: scriptScreens,
            diagnoses: scriptDiagnoses,
            problems: scriptProblems,
            drugsLibrary: scriptDrugs,
            nuidSearchFields,
            nuidDataKeys: resolveNuidLibraryKeys(nuidSearchFields, dataKeyIndex),
            eligibilityCriteria: s?.eligibilityCriteria,
        });
    }));

    return reports;
}

const DRUG_SCREEN_TYPES = ['drugs', 'fluids', 'feeds'];
function collectDrugKeysFromScreens(scriptScreens: any[]): Set<string> {
    const keys = new Set<string>();
    for (const scr of scriptScreens || []) {
        if (!DRUG_SCREEN_TYPES.includes(`${scr?.type}`)) continue;
        for (const item of [...(scr?.drugs || []), ...(scr?.fluids || []), ...(scr?.feeds || [])]) {
            if (item?.key) keys.add(`${item.key}`);
        }
    }
    return keys;
}

/**
 * Lean, draft-inclusive computation of a script's condition keys (the scrapped
 * data keys a conditional expression may reference).
 *
 * This powers the child-entity CE badges (screens/diagnoses/problems rows) and
 * the condition editors' autocomplete. It returns the SAME `scrapDataKeys`
 * output as `getScriptsWithItems`, but selects only the columns scrapping needs
 * and skips the heavy full-item load (image blobs, hospital joins, the extra
 * drugs-library screen pass) — so the keys, and therefore the badges, resolve
 * promptly instead of lagging behind the rows.
 *
 * Draft-inclusive: a draft entity supersedes its published counterpart, and
 * draft-only entities are included, matching `getScriptsWithItems`.
 */
export async function getScriptsConditionKeys(
    scriptIds: string[],
): Promise<{ data: { scriptId: string; dataKeys: any[] }[]; errors?: string[] }> {
    try {
        const ids = Array.from(new Set((scriptIds || []).map((s) => `${s || ''}`).filter(Boolean)));
        if (!ids.length) return { data: [] };

        const draftMatch = (scriptCol: any, scriptDraftCol: any) =>
            or(inArray(scriptCol, ids), inArray(scriptDraftCol, ids));

        const [pubScreens, draftScreens, pubDiag, draftDiag, pubProb, draftProb, dataKeysRes] = await Promise.all([
            db.select({
                scriptId: screens.scriptId, screenId: screens.screenId, key: screens.key,
                label: screens.label, title: screens.title, type: screens.type,
                fields: screens.fields, items: screens.items,
                drugs: screens.drugs, fluids: screens.fluids, feeds: screens.feeds,
            })
                .from(screens)
                .leftJoin(pendingDeletion, eq(pendingDeletion.screenId, screens.screenId))
                .where(and(isNull(screens.deletedAt), isNull(pendingDeletion.id), inArray(screens.scriptId, ids))),
            db.select({ screenId: screensDrafts.screenId, data: screensDrafts.data })
                .from(screensDrafts)
                .where(draftMatch(screensDrafts.scriptId, screensDrafts.scriptDraftId)),
            db.select({
                scriptId: diagnoses.scriptId, diagnosisId: diagnoses.diagnosisId,
                key: diagnoses.key, name: diagnoses.name, symptoms: diagnoses.symptoms,
            })
                .from(diagnoses)
                .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisId, diagnoses.diagnosisId))
                .where(and(isNull(diagnoses.deletedAt), isNull(pendingDeletion.id), inArray(diagnoses.scriptId, ids))),
            db.select({ diagnosisId: diagnosesDrafts.diagnosisId, data: diagnosesDrafts.data })
                .from(diagnosesDrafts)
                .where(draftMatch(diagnosesDrafts.scriptId, diagnosesDrafts.scriptDraftId)),
            db.select({
                scriptId: problems.scriptId, problemId: problems.problemId,
                key: problems.key, name: problems.name, symptoms: problems.symptoms,
            })
                .from(problems)
                .leftJoin(pendingDeletion, eq(pendingDeletion.problemId, problems.problemId))
                .where(and(isNull(problems.deletedAt), isNull(pendingDeletion.id), inArray(problems.scriptId, ids))),
            db.select({ problemId: problemsDrafts.problemId, data: problemsDrafts.data })
                .from(problemsDrafts)
                .where(draftMatch(problemsDrafts.scriptId, problemsDrafts.scriptDraftId)),
            _getDataKeys(),
        ]);

        // A draft supersedes its published counterpart; draft-only entities are added.
        const mergeEntities = <T extends Record<string, any>>(pub: T[], drafts: { data: any }[], idField: string) => {
            const draftedIds = new Set(drafts.map((d: any) => d[idField]).filter(Boolean));
            return [
                ...pub.filter((p) => !draftedIds.has((p as any)[idField])),
                ...drafts.map((d) => d.data),
            ];
        };

        const mergedScreens = mergeEntities(pubScreens as any[], draftScreens as any[], 'screenId');
        const mergedDiagnoses = mergeEntities(pubDiag as any[], draftDiag as any[], 'diagnosisId');
        const mergedProblems = mergeEntities(pubProb as any[], draftProb as any[], 'problemId');

        const drugKeys = collectDrugKeysFromScreens(mergedScreens);
        const drugItems = drugKeys.size
            ? (await _getDrugsLibraryItems({ keys: Array.from(drugKeys) })).data || []
            : [];

        const dataKeys = await scrapDataKeys({
            dataKeys: dataKeysRes.data || [],
            screens: mergedScreens as any,
            diagnoses: mergedDiagnoses as any,
            problems: mergedProblems as any,
            drugsLibrary: drugItems as any,
        });

        // The keys route flattens dataKeys across returned scripts, so one combined
        // entry is enough (the API is always called per-script anyway).
        return { data: [{ scriptId: ids[0], dataKeys }] };
    } catch (e: any) {
        logger.error('getScriptsConditionKeys ERROR', e?.message);
        return { data: [], errors: [e.message] };
    }
}

/**
 * Returns a map of scriptId -> CE error report for scripts that have any error.
 * Called ONCE (not per row) by the scripts list, asynchronously, so it adds no
 * render latency.
 *
 * Prefers the precomputed `conditionErrorReport` column (kept fresh on write,
 * draft-inclusive) and only computes lean for scripts not yet persisted. Any
 * freshly computed report is written back (persist-on-read), so the very first
 * load after migration warms the column and every later load is a plain indexed
 * select — no backfill needed. Resilient if the column doesn't exist yet
 * (pre-migration): it just computes everything lean each time.
 */
export async function getScriptsConditionErrors(
    scripts: ScriptConditionErrorInput[],
): Promise<{ data: Record<string, ScriptConditionReport>; errors: string[] }> {
    try {
        const scriptIds = (scripts || []).map((s) => `${s?.scriptId || ''}`).filter(Boolean);
        if (!scriptIds.length) return { data: {}, errors: [] };

        const persisted = new Map<string, ScriptConditionReport | null>();
        try {
            const rows = await db
                .select({ scriptId: scriptsTable.scriptId, report: scriptsTable.conditionErrorReport })
                .from(scriptsTable)
                .where(inArray(scriptsTable.scriptId, scriptIds));
            for (const row of rows) persisted.set(`${row.scriptId}`, (row.report as ScriptConditionReport | null) || null);
        } catch {
            // Column not migrated yet — fall through to computing everything lean.
        }

        const result: Record<string, ScriptConditionReport> = {};
        const missing: ScriptConditionErrorInput[] = [];
        for (const s of scripts) {
            const id = `${s?.scriptId || ''}`;
            if (!id) continue;
            const report = persisted.get(id);
            if (report) result[id] = report;
            else missing.push(s);
        }

        if (missing.length) {
            const computed = await computeConditionReportsLean(missing);
            Object.assign(result, computed);
            void persistConditionReports(computed);
        }

        const pruned: Record<string, ScriptConditionReport> = {};
        for (const [id, report] of Object.entries(result)) {
            if (report && report.count > 0) pruned[id] = report;
        }
        return { data: pruned, errors: [] };
    } catch (e: any) {
        logger.error('getScriptsConditionErrors ERROR', e.message);
        return { data: {}, errors: [e.message] };
    }
}

/** Does the actual per-script CE report computation + persist. Never throws. */
async function doRecomputeScriptConditionErrors(
    id: string,
    opts?: { dataKeyIndex?: Map<string, any> },
): Promise<void> {
    try {
        const { data, errors } = await getScriptsWithItems({ scriptsIds: [id], returnDraftsIfExist: true } as any);
        if (errors?.length) return;
        const script = (data as any[])[0];
        if (script) {
            const nuidFields = (script.nuidSearchFields || []) as any[];
            if (nuidFields.some((f: any) => f?.keyId)) {
                const index = opts?.dataKeyIndex
                    ?? indexDataKeysById(((await _getDataKeys({ returnDraftsIfExist: true })).data || []) as any);
                script.nuidDataKeys = resolveNuidLibraryKeys(nuidFields, index);
            }
        }
        const report = script ? buildConditionReport(id, script) : { count: 0, findings: [] };
        await db.update(scriptsTable).set({ conditionErrorReport: report }).where(eq(scriptsTable.scriptId, id));
    } catch (e: any) {
        logger.error('recomputeScriptConditionErrors ERROR', e?.message);
    }
}


const recomputeInFlight = new Map<string, { dirty: boolean }>();

/**
 * Recomputes a single script's CE report (draft-inclusive) and persists it.
 * Coalesced per script + fire-and-forget from save paths; never throws.
 *
 * Pass a prebuilt `dataKeyIndex` when recomputing many scripts so the registry
 * is loaded once for the batch instead of once per script.
 */
export async function recomputeScriptConditionErrors(
    scriptId: string,
    opts?: { dataKeyIndex?: Map<string, any> },
): Promise<void> {
    const id = `${scriptId || ''}`;
    if (!id) return;

    const active = recomputeInFlight.get(id);
    if (active) {
        active.dirty = true;
        return;
    }

    const state = { dirty: false };
    recomputeInFlight.set(id, state);
    try {
        do {
            state.dirty = false;
            await doRecomputeScriptConditionErrors(id, opts);
        } while (state.dirty);
    } finally {
        recomputeInFlight.delete(id);
    }
}

/** Runs tasks with a bounded concurrency so batches don't stampede the DB. */
async function runWithConcurrency<T>(items: T[], limit: number, task: (item: T) => Promise<void>): Promise<void> {
    const queue = [...items];
    const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
        while (queue.length) {
            const item = queue.shift();
            if (item === undefined) return;
            await task(item);
        }
    });
    await Promise.all(workers);
}

/** Recomputes several scripts' CE reports. Fire-and-forget; never throws. */
export async function recomputeScriptsConditionErrors(scriptIds: (string | null | undefined)[]): Promise<void> {
    const ids = Array.from(new Set((scriptIds || []).map((s) => `${s || ''}`).filter(Boolean)));
    if (!ids.length) return;
    
    let dataKeyIndex: Map<string, any> | undefined;
    try {
        const registry = await _getDataKeys({ returnDraftsIfExist: true });
        dataKeyIndex = indexDataKeysById((registry.data || []) as any);
    } catch {
        dataKeyIndex = undefined;
    }
    
    await runWithConcurrency(ids, 6, (id) => recomputeScriptConditionErrors(id, { dataKeyIndex }));
}

/**
 * Writes already-computed reports back to the `conditionErrorReport` column so
 * they don't have to be recomputed on the next read. This is what makes the
 * cache self-populate: the first read that computes-lean warms the column, and
 * every subsequent read is a plain indexed select. Fire-and-forget; a failure
 * here (e.g. column not migrated) must never surface to the caller.
 */
async function persistConditionReports(reports: Record<string, ScriptConditionReport>): Promise<void> {
    const entries = Object.entries(reports || {});
    if (!entries.length) return;
    try {
        await Promise.all(
            entries.map(([id, report]) =>
                db
                    .update(scriptsTable)
                    .set({ conditionErrorReport: report })
                    .where(eq(scriptsTable.scriptId, id))
                    .catch((e: any) => logger.error('persistConditionReports row ERROR', e?.message)),
            ),
        );
    } catch (e: any) {
        logger.error('persistConditionReports ERROR', e?.message);
    }
}

/**
 * Summarizes scripts that carry conditional-expression errors, for the
 * publish-time gate.
 *
 * Prefers the precomputed `conditionErrorReport` column (kept fresh on every
 * save) and lazily computes-lean for any script whose report is still `null`
 * (e.g. not saved since the feature shipped) — so the system self-heals with
 * migration only, no backfill required. Never throws: a failure here must not
 * block publishing.
 *
 * Pass `scriptIds` to restrict the check to the scripts actually being published
 * (the publish scope) — an empty array means "no scripts in scope" and returns
 * nothing; omit it to scan every script.
 */
export async function getScriptsWithConditionErrors(opts?: { scriptIds?: string[] }): Promise<{
    scripts: { scriptId: string; title: string; count: number }[];
    totalFindings: number;
}> {
    try {
        const scopeIds = opts?.scriptIds;
        if (scopeIds && !scopeIds.length) return { scripts: [], totalFindings: 0 };

        const rows = await db
            .select({
                scriptId: scriptsTable.scriptId,
                title: scriptsTable.title,
                report: scriptsTable.conditionErrorReport,
                nuidSearchFields: scriptsTable.nuidSearchFields,
                eligibilityCriteria: scriptsTable.eligibilityCriteria,
            })
            .from(scriptsTable)
            .where(
                scopeIds && scopeIds.length
                    ? and(isNull(scriptsTable.deletedAt), inArray(scriptsTable.scriptId, scopeIds))
                    : isNull(scriptsTable.deletedAt),
            );

        const titleById = new Map<string, string>();
        const counts = new Map<string, number>();
        const missing: ScriptConditionErrorInput[] = [];

        for (const row of rows) {
            const id = `${row.scriptId}`;
            titleById.set(id, `${row.title || 'Untitled script'}`);
            const report = (row.report as ScriptConditionReport | null) || null;
            if (report) {
                counts.set(id, report.count || 0);
            } else {
                missing.push({
                    scriptId: id,
                    nuidSearchFields: row.nuidSearchFields,
                    eligibilityCriteria: row.eligibilityCriteria,
                });
            }
        }

        // Lazily fill in never-computed scripts (also self-heals the column
        // for next time — computeConditionReportsLean is a bounded bulk query).
        if (missing.length) {
            const computed = await computeConditionReportsLean(missing);
            for (const [id, report] of Object.entries(computed)) {
                counts.set(id, report?.count || 0);
            }
            void persistConditionReports(computed);
        }

        const scripts: { scriptId: string; title: string; count: number }[] = [];
        let totalFindings = 0;
        counts.forEach((count, id) => {
            if (count > 0) {
                scripts.push({ scriptId: id, title: titleById.get(id) || 'Untitled script', count });
                totalFindings += count;
            }
        });
        // Worst offenders first.
        scripts.sort((a, b) => b.count - a.count);
        return { scripts, totalFindings };
    } catch (e: any) {
        // Column not migrated yet, or a transient DB error — degrade to "no warnings".
        logger.error('getScriptsWithConditionErrors ERROR', e?.message);
        return { scripts: [], totalFindings: 0 };
    }
}

export async function saveScriptScreens({
    screens,
    scriptId,
    preserveScreensIds,
    draftOrigin,
}: {
    preserveScreensIds?: boolean;
    scriptId: string;
    draftOrigin?: "editor" | "data_key_sync" | "import" | "other";
    screens: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['screens'];
}): Promise<{
    errors?: string[];
    success: boolean;
    saved: number;
}> {
    try {
        let saved = 0;
        const errors: string[] = [];

        const script = await queries._getScript({ scriptId, returnDraftIfExists: true, });
        if (script.errors?.length) throw new Error(script.errors.join(', '));
        if (!script.data) throw new Error('Script not found');

        for (const screen of screens) {
            const {
                id,
                publishDate,
                createdAt,
                updatedAt,
                isDraft,
                isDeleted,
                deletedAt,
                version,
                oldScriptId,
                oldScreenId,
                screenId: _ignoreScreenId,
                scriptId: _ignoreScriptId,
                scriptTitle: _ignoreScriptTitle,
                hospitalName: _ignoreHospitalName,
                draftCreatedByUserId: _ignoreDraftCreatedByUserId,
                position,
                ...s
            } = screen;

            let screenId = v4();
            if (preserveScreensIds && _ignoreScreenId) screenId = _ignoreScreenId;

            try {
                if (s.image1) {
                    const res = await processImage(s.image1);
                    s.image1 = res.image;
                }
                if (s.image2) {
                    const res = await processImage(s.image2);
                    s.image2 = res.image;
                }
                if (s.image3) {
                    const res = await processImage(s.image3);
                    s.image3 = res.image;
                }
            } catch (e: any) {
                logger.error('process image', e.message);
            }

            const res = await saveScreens({
                data: [{
                    ...s,
                    scriptId,
                    oldScriptId: script.data.oldScriptId,
                    screenId,
                    version: 1,
                }],
                draftOrigin,
            });

            res.errors?.forEach(e => errors.push(`(screenId=${_ignoreScreenId}) ${e || ''}`));

            if (!res.errors?.length) saved++;
        }

        if (errors.length) return { errors, saved, success: false, };

        void recomputeScriptConditionErrors(scriptId);
        return { saved, success: true, };
    } catch (e: any) {
        logger.error('saveScriptScreens ERROR', e.message);
        return { saved: 0, success: false, errors: [e.message], };
    }
}

export async function saveScriptDiagnoses({
    diagnoses,
    scriptId,
    preserveDiagnosesIds,
    draftOrigin,
}: {
    preserveDiagnosesIds?: boolean;
    scriptId: string;
    draftOrigin?: "editor" | "data_key_sync" | "import" | "other";
    diagnoses: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['diagnoses'];
}): Promise<{
    errors?: string[];
    success: boolean;
    saved: number;
}> {
    try {
        let saved = 0;
        const errors: string[] = [];

        const script = await queries._getScript({ scriptId, returnDraftIfExists: true, });
        if (script.errors?.length) throw new Error(script.errors.join(', '));
        if (!script.data) throw new Error('Script not found');

        for (const diagnosis of diagnoses) {
            const {
                id,
                publishDate,
                createdAt,
                updatedAt,
                isDraft,
                isDeleted,
                deletedAt,
                version,
                oldDiagnosisId,
                diagnosisId: _ignoreDiagnosisId,
                scriptId: _ignoreScriptId,
                scriptTitle: _ignoreScriptTitle,
                hospitalName: _ignoreHospitalName,
                draftCreatedByUserId: _ignoreDraftCreatedByUserId,
                position,
                ...d
            } = diagnosis;

            let diagnosisId = v4();
            if (preserveDiagnosesIds && _ignoreDiagnosisId) diagnosisId = _ignoreDiagnosisId;

            try {
                if (d.image1) {
                    const res = await processImage(d.image1);
                    d.image1 = res.image;
                }
                if (d.image2) {
                    const res = await processImage(d.image2);
                    d.image2 = res.image;
                }
                if (d.image3) {
                    const res = await processImage(d.image3);
                    d.image3 = res.image;
                }
            } catch (e: any) {
                logger.error('process image', e.message);
            }

            const res = await saveDiagnoses({
                data: [{
                    ...d,
                    scriptId,
                    oldScriptId: script.data.oldScriptId,
                    diagnosisId,
                    version: 1,
                }],
                draftOrigin,
            });

            res.errors?.forEach(e => errors.push(`(diagnosisId=${_ignoreDiagnosisId}) ${e || ''}`));

            if (!res.errors?.length) saved++;
        }

        if (errors.length) return { errors, saved, success: false, };

        void recomputeScriptConditionErrors(scriptId);
        return { saved, success: true, };
    } catch (e: any) {
        logger.error('saveScriptDiagnoses ERROR', e.message);
        return { saved: 0, success: false, errors: [e.message], };
    }
}

export async function saveScriptProblems({
    problems,
    scriptId,
    preserveProblemsIds,
    draftOrigin,
}: {
    preserveProblemsIds?: boolean;
    scriptId: string;
    draftOrigin?: "editor" | "data_key_sync" | "import" | "other";
    problems: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['problems'];
}): Promise<{
    errors?: string[];
    success: boolean;
    saved: number;
}> {
    try {
        let saved = 0;
        const errors: string[] = [];

        const script = await queries._getScript({ scriptId, returnDraftIfExists: true, });
        if (script.errors?.length) throw new Error(script.errors.join(', '));
        if (!script.data) throw new Error('Script not found');

        for (const problem of problems) {
            const {
                id,
                publishDate,
                createdAt,
                updatedAt,
                isDraft,
                isDeleted,
                deletedAt,
                version,
                problemId: _ignoreProblemId,
                scriptId: _ignoreScriptId,
                scriptTitle: _ignoreScriptTitle,
                hospitalName: _ignoreHospitalName,
                draftCreatedByUserId: _ignoreDraftCreatedByUserId,
                position,
                ...d
            } = problem;

            let problemId = v4();
            if (preserveProblemsIds && _ignoreProblemId) problemId = _ignoreProblemId;

            try {
                if (d.image1) {
                    const res = await processImage(d.image1);
                    d.image1 = res.image;
                }
                if (d.image2) {
                    const res = await processImage(d.image2);
                    d.image2 = res.image;
                }
                if (d.image3) {
                    const res = await processImage(d.image3);
                    d.image3 = res.image;
                }
            } catch (e: any) {
                logger.error('process image', e.message);
            }

            const res = await saveProblems({
                data: [{
                    ...d,
                    scriptId,
                    oldScriptId: script.data.oldScriptId,
                    problemId,
                    version: 1,
                }],
                draftOrigin,
            });

            res.errors?.forEach(e => errors.push(`(problemId=${_ignoreProblemId}) ${e || ''}`));

            if (!res.errors?.length) saved++;
        }

        if (errors.length) return { errors, saved, success: false, };

        void recomputeScriptConditionErrors(scriptId);
        return { saved, success: true, };
    } catch (e: any) {
        logger.error('saveScriptProblems ERROR', e.message);
        return { saved: 0, success: false, errors: [e.message], };
    }
}

export async function deleteScriptsItems({ scriptsIds, draftOrigin, }: {
    scriptsIds: string[];
    draftOrigin?: "editor" | "data_key_sync" | "import" | "other";
}): Promise<{
    errors?: string[];
    success: boolean;
}> {
    try {
        const errors: string[] = [];

        const delScreens = await deleteScreens({ scriptsIds, draftOrigin });
        delScreens.errors?.forEach(e => errors.push(e));

        const delDiagnoses = await deleteDiagnoses({ scriptsIds, draftOrigin });
        delDiagnoses.errors?.forEach(e => errors.push(e));

        const delProblems = await deleteProblems({ scriptsIds, draftOrigin });
        delProblems.errors?.forEach(e => errors.push(e));

        if (errors.length) return { errors, success: false, };

        return { success: true, };
    } catch (e: any) {
        logger.error('deleteScriptsItems ERROR', e.message);
        return { success: false, errors: [e.message], };
    }
}

const saveScriptsWithItemsInfo = { 
    scripts: 0, 
    screens: 0, 
    diagnoses: 0, 
    problems: 0,
    dffItems: 0,
    dataKeys: 0,
};

export async function saveScriptsWithItems({ data, }: {
    data: (Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0] & {
        overWriteScriptWithId?: string;
        draftOrigin?: "editor" | "data_key_sync" | "import" | "other";
    })[];
}): Promise<{
    errors?: string[];
    success: boolean;
    info: typeof saveScriptsWithItemsInfo,
    savedScriptIds?: string[];
}> {
    const info = { ...saveScriptsWithItemsInfo };
    const savedScriptIds: string[] = [];

    try {
        const errors: string[] = [];

        for (const { overWriteScriptWithId, draftOrigin, ...script } of data) {
            const overWriteScript = !overWriteScriptWithId ? { data: null, } : await getScript({
                scriptId: overWriteScriptWithId,
                returnDraftIfExists: true,
            });

            overWriteScript.errors?.forEach(e => errors.push(e));
            if (errors.length) continue;

            if (overWriteScriptWithId && !overWriteScript?.data) {
                errors.push('Overwrite script was not found');
                continue;
            }

            if (overWriteScript?.data) {
                const res = await deleteScriptsItems({
                    scriptsIds: [overWriteScript.data.scriptId],
                    draftOrigin,
                });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
            }

            const {
                id,
                screens: copiedScreens = [],
                diagnoses: copiedDiagnoses = [],
                problems: copiedProblems = [],
                drugsLibrary = [],
                dataKeys = [],
                publishDate,
                createdAt,
                updatedAt,
                isDraft,
                deletedAt,
                version,
                oldScriptId,
                scriptId: _ignoreScriptId,
                position,
                printSections = [],
                reviewConfigurations = [],
                ...s 
            } = script;

            const oldScreensIdsMap: { [key: string]: string; } = {};
            const oldDiagnosesIdsMap: { [key: string]: string; } = {};

            let screens = copiedScreens.map(s => {
                const screenId = v4();
                oldScreensIdsMap[s.screenId] = screenId;
                if (s.oldScreenId) oldScreensIdsMap[s.oldScreenId] = screenId;
                return { 
                    ...s, 
                    screenId,
                };
            });

            screens = screens.map(s => {
                return {
                    ...s,
                    skipToScreenId: (!s.skipToScreenId ? null : oldScreensIdsMap[s.skipToScreenId]) || null,
                };
            });

            const diagnoses = copiedDiagnoses.map(d => {
                const diagnosisId = v4();
                oldDiagnosesIdsMap[d.diagnosisId] = diagnosisId;
                if (d.oldDiagnosisId) oldDiagnosesIdsMap[d.oldDiagnosisId] = diagnosisId;
                return { ...d, diagnosisId, };
            });

            const problems = copiedProblems.map(d => {
                const diagnosisId = v4();
                return { ...d, diagnosisId, };
            });

            const scriptId = overWriteScript?.data?.scriptId || v4();

            const res = await saveScripts({
                data: [{
                    ...s,
                    scriptId,
                    version: 1,
                    printSections: printSections.map(s => ({
                        ...s,
                        screensIds: s.screensIds.map((id: string) => oldScreensIdsMap[id]).filter((id: string | undefined | null): id is string => !!id),
                    })),
                    reviewConfigurations: reviewConfigurations.map(c => ({
                        ...c,
                        screen: oldScreensIdsMap[c.screen],
                    })).filter((c): c is typeof c & { screen: string } => !!c.screen),
                }],
                draftOrigin,
            });

            res.errors?.forEach(e => errors.push(e));
            if (errors.length) continue;

            const saveScreens = await saveScriptScreens({ preserveScreensIds: true, scriptId, screens, draftOrigin });
            saveScreens.errors?.forEach(e => errors.push(e));
            info.screens += saveScreens.saved;

            const saveDiagnoses = await saveScriptDiagnoses({ preserveDiagnosesIds: true, scriptId, diagnoses, draftOrigin });
            saveDiagnoses.errors?.forEach(e => errors.push(e));
            info.diagnoses += saveDiagnoses.saved;

            const saveProblems = await saveScriptProblems({ preserveProblemsIds: true, scriptId, problems, draftOrigin });
            saveProblems.errors?.forEach(e => errors.push(e));
            info.problems += saveProblems.saved;

            if (errors.length) continue;

            info.scripts++;
            savedScriptIds.push(scriptId);
        }

        if (errors.length) return { success: false, errors, info, savedScriptIds, };

        void recomputeScriptsConditionErrors(savedScriptIds);
        return { success: true, info, savedScriptIds, };
    } catch (e: any) {
        logger.error('saveScriptsWithItems ERROR', e.message);
        return { success: false, errors: [e.message], info, savedScriptIds, };
    }
}

export async function copyScripts(params?: {
    scriptsIds?: string[];
    confirmCopyAll?: boolean;
    toRemoteSiteId?: string;
    fromRemoteSiteId?: string;
    overWriteScriptWithId?: string;
    broadcastAction?: boolean;
    overwriteDataKeys?: boolean;
    overwriteDrugsLibraryItems?: boolean;
}): Promise<Awaited<ReturnType<typeof saveScriptsWithItems>> & {
    warnings?: string[];
    integrityImportReview?: {
        snapshotId: string | null;
        totalBlockingIssues: number;
        totalScripts: number;
        requiresAcceptance: boolean;
        details: Awaited<ReturnType<typeof createIntegrityImportSnapshot>>["reviewDetails"];
    } | null;
}> {
    const { data: localDataKeys, } = await _getDataKeys();
    const info = { ...saveScriptsWithItemsInfo };
    const startedAt = Date.now();
    const timings: Record<string, number> = {};
    const markTiming = (step: string, stepStartedAt: number) => {
        timings[step] = Date.now() - stepStartedAt;
    };

    const {
        scriptsIds = [],
        confirmCopyAll,
        toRemoteSiteId,
        fromRemoteSiteId,
        broadcastAction,
        overWriteScriptWithId,
        overwriteDataKeys,
        overwriteDrugsLibraryItems,
    } = { ...params };

    try {
        const session = await isAllowed();

        let importedDataKeys: Awaited<ReturnType<typeof _getDataKeys>>['data'] = [];
        let scrappedDataKeys: Awaited<ReturnType<typeof scrapDataKeys>> = [];
        let importedDataKeyAffectedScriptIds: string[] = [];

        if (!scriptsIds.length && !confirmCopyAll) throw new Error('You&apos;re about copy all the scripts, please confirm this action!');

        let scripts: GetScriptsWithItemsResponse = fromRemoteSiteId ? { data: [], } : await getScriptsWithItems({ scriptsIds });
        let dataKeysToSave: Awaited<ReturnType<typeof parseImportedDataKeys>>['dataKeys'] = [];
        let dffItemsToSave: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['drugsLibrary'] = [];

        if (scripts.errors) return { success: false, errors: scripts.errors, info, };

        if (fromRemoteSiteId) {
            const remoteFetchStartedAt = Date.now();
            const axiosClient = await getSiteAxiosClient(fromRemoteSiteId);

            const { data: importedDataKeysRes } = await axiosClient.get<Awaited<ReturnType<typeof _getDataKeys>>>('/api/data-keys?' + queryString.stringify({
                returnDraftsIfExist: false,
            }));
            importedDataKeys = importedDataKeysRes.data;

            const res = await axiosClient.get('/api/scripts/with-items?' + queryString.stringify({
                scriptsIds: JSON.stringify(scriptsIds),
                data: JSON.stringify({
                    returnDraftsIfExist: false,
                }),
            }));
            const resData = res.data as Awaited<ReturnType<typeof getScriptsWithItems>>;

            if (resData.errors) return { success: false, errors: resData.errors, info, };

            scripts = resData;
            markTiming('remote_fetch', remoteFetchStartedAt);


            scripts.data.forEach(({ screens, diagnoses, problems, dataKeys, drugsLibrary }, i) => {
                const getImageUrl = (suffix: string) => {
                    let host = res.config.baseURL || '';
                    if (host.substring(host.length - 1, host.length) === '/') host = host.substring(0, host.length - 1);
                    if (suffix[0] === '/') suffix = suffix.substring(1, suffix.length);
                    return [host, suffix].filter(s => s).join('/');
                };

                scrappedDataKeys = [...scrappedDataKeys, ...dataKeys];
                dffItemsToSave = [...dffItemsToSave, ...drugsLibrary];

                screens.forEach((d, j) => {
                    if (d.image1?.data && d.image1?.fileId && !isValidUrl(d.image1.data)) {
                        scripts.data[i].screens[j].image1!.data = getImageUrl(d.image1.data);
                    }
                    if (d.image2?.data && d.image2?.fileId && !isValidUrl(d.image2.data)) {
                        scripts.data[i].screens[j].image2!.data = getImageUrl(d.image2.data);
                    }
                    if (d.image3?.data && d.image3?.fileId && !isValidUrl(d.image3.data)) {
                        scripts.data[i].screens[j].image3!.data = getImageUrl(d.image3.data);
                    }
                });

                diagnoses.forEach((d, j) => {
                    if (d.image1?.data && d.image1?.fileId && !isValidUrl(d.image1.data)) {
                        scripts.data[i].diagnoses[j].image1!.data = getImageUrl(d.image1.data);
                    }
                    if (d.image2?.data && d.image2?.fileId && !isValidUrl(d.image2.data)) {
                        scripts.data[i].diagnoses[j].image2!.data = getImageUrl(d.image2.data);
                    }
                    if (d.image3?.data && d.image3?.fileId && !isValidUrl(d.image3.data)) {
                        scripts.data[i].diagnoses[j].image3!.data = getImageUrl(d.image3.data);
                    }
                });

                problems.forEach((p, j) => {
                    if (p.image1?.data && p.image1?.fileId && !isValidUrl(p.image1.data)) {
                        scripts.data[i].problems[j].image1!.data = getImageUrl(p.image1.data);
                    }
                    if (p.image2?.data && p.image2?.fileId && !isValidUrl(p.image2.data)) {
                        scripts.data[i].problems[j].image2!.data = getImageUrl(p.image2.data);
                    }
                    if (p.image3?.data && p.image3?.fileId && !isValidUrl(p.image3.data)) {
                        scripts.data[i].problems[j].image3!.data = getImageUrl(p.image3.data);
                    }
                });
            });

            let index = -1;
            const parseImportedStartedAt = Date.now();
            for (const s of scripts.data) {
                index++;
                const { dataKeys, screens, diagnoses, problems, drugsLibrary, } = await parseImportedDataKeys({
                    localDataKeys,
                    importedDataKeys,
                    importedScrappedKeys: scrappedDataKeys,
                    importedScreens: s.screens,
                    importedDiagnoses: s.diagnoses,
                    importedProblems: s.problems,
                    importedDrugsLibraryItems: s.drugsLibrary,
                });
                scripts.data[index].screens = screens as unknown as typeof s.screens;
                scripts.data[index].diagnoses = diagnoses as unknown as typeof s.diagnoses;
                scripts.data[index].problems = problems as unknown as typeof s.problems;
                scripts.data[index].drugsLibrary = drugsLibrary as unknown as typeof s.drugsLibrary;
                
                dataKeys.filter(k => k.canSave).forEach(k => dataKeysToSave.push(k));

                dataKeysToSave = dataKeysToSave.filter(k => {
                    return overwriteDataKeys || k.isNew;
                });
            }
            markTiming('parse_imported_data_keys', parseImportedStartedAt);
        }

        let response: Awaited<ReturnType<typeof saveScriptsWithItems>> & {
            warnings?: string[];
            integrityImportReview?: {
                snapshotId: string | null;
                totalBlockingIssues: number;
                totalScripts: number;
                requiresAcceptance: boolean;
                details: Awaited<ReturnType<typeof createIntegrityImportSnapshot>>["reviewDetails"];
            } | null;
        } = { success: true, info, };

        if (scripts.data.length) {
            if (toRemoteSiteId) {
                const remoteSaveStartedAt = Date.now();
                const axiosClient = await getSiteAxiosClient(toRemoteSiteId);

                const res = await axiosClient.post('/api/scripts/with-items?', {
                    data: scripts.data.map(s => ({
                        ...s,
                        hospitalId: undefined!,
                        hospitalName: undefined!,
                    })),
                });

                response = res.data as Awaited<ReturnType<typeof saveScriptsWithItems>>;
                markTiming('remote_save', remoteSaveStartedAt);
            } else {
                const saveScriptsStartedAt = Date.now();
                response = await saveScriptsWithItems({
                    data: scripts.data.map(s => ({
                        ...s,
                        overWriteScriptWithId,
                        draftOrigin: fromRemoteSiteId ? 'import' : 'editor',
                        hospitalId: undefined!,
                        hospitalName: undefined!,
                    })),
                });
                markTiming('save_scripts_with_items', saveScriptsStartedAt);
            }
        }

        if (!response.success || response.errors?.length) {
            return response;
        }

        if (dffItemsToSave.length) {
            const saveDrugsStartedAt = Date.now();
            const res = overwriteDrugsLibraryItems ? 
                await _saveDrugsLibraryItemsUpdateIfExists({ data: dffItemsToSave, userId: session.user?.userId, })
                :
                await _saveDrugsLibraryItemsIfKeysNotExist({ data: dffItemsToSave, userId: session.user?.userId, });
            if (res.success) response.info.dffItems = dffItemsToSave.length;
            markTiming('save_drugs_library_items', saveDrugsStartedAt);
        }

        if (dataKeysToSave.length) {
            const saveDataKeysStartedAt = Date.now();
            const res = await _saveDataKeys({
                data: dataKeysToSave,
                userId: session.user?.userId,
                draftOrigin: fromRemoteSiteId ? 'import' : 'editor',
                propagatedDraftOrigin: fromRemoteSiteId ? 'import' : 'data_key_sync',
            });
            if (res.success) {
                response.info.dataKeys = dataKeysToSave.length;
                importedDataKeyAffectedScriptIds = ((("info" in res) ? res.info?.refs?.affected?.scripts : []) || [])
                    .map((script: { scriptId?: string | null }) => script.scriptId)
                    .filter((value): value is string => !!value);
            }
            markTiming('save_data_keys', saveDataKeysStartedAt);
        }

        if (
            fromRemoteSiteId &&
            !toRemoteSiteId &&
            response.success &&
            !response.errors?.length &&
            response.savedScriptIds?.length
        ) {
            const policyStartedAt = Date.now();
            const editorInfoRes = await _getEditorInfo();
            markTiming('load_integrity_policy', policyStartedAt);
            if (editorInfoRes.errors?.length) {
                response.warnings = [
                    ...(response.warnings || []),
                    ...editorInfoRes.errors.map((error) => `Imported successfully, but integrity review could not be prepared: ${error}`),
                ];
                return response;
            }
            const integrityPolicy = getIntegrityPolicyState(editorInfoRes.data).policy;
            if (integrityPolicy.triggerSources.imports && integrityPolicy.enforcementMode !== "off") {
                const importReviewStartedAt = Date.now();
                const integrityReviewScriptIds = Array.from(new Set([
                    ...(response.savedScriptIds || []),
                    ...importedDataKeyAffectedScriptIds,
                ]));

                const [importedScriptsRes, currentDataKeysRes] = await Promise.all([
                    getScriptsWithItems({
                        scriptsIds: integrityReviewScriptIds,
                        returnDraftsIfExist: true,
                    }),
                    _getDataKeys(),
                ]);

                const importErrors = [
                    ...(importedScriptsRes.errors || []),
                    ...(currentDataKeysRes.errors || []),
                ];

                if (importErrors.length) {
                    response.warnings = [
                        ...(response.warnings || []),
                        ...importErrors.map((error) => `Imported successfully, but integrity review could not be prepared: ${error}`),
                    ];
                    return response;
                }

                const importedScripts = importedScriptsRes.data;
                const directlyImportedScripts = importedScripts.filter((script) => response.savedScriptIds?.includes(script.scriptId));
                const importedDataKeyIds = currentDataKeysRes.data
                    .filter((dataKey) => dataKeysToSave.some((savedKey) => savedKey.uniqueKey === dataKey.uniqueKey))
                    .map((dataKey) => dataKey.uuid)
                    .filter((value): value is string => !!value);

                const importSnapshot = await createIntegrityImportSnapshot({
                    actorUserId: session.user?.userId || null,
                    policy: integrityPolicy,
                    sourceType: "script_import",
                    sourceLabel: directlyImportedScripts.length === 1
                        ? directlyImportedScripts[0]?.title || directlyImportedScripts[0]?.printTitle || "Imported script"
                        : `${directlyImportedScripts.length || response.savedScriptIds?.length || 0} imported scripts`,
                    importedScriptIds: integrityReviewScriptIds,
                    importedDataKeyIds,
                    metadata: {
                        fromRemoteSiteId,
                        overwriteDataKeys: !!overwriteDataKeys,
                        overwriteDrugsLibraryItems: !!overwriteDrugsLibraryItems,
                        overWriteScriptWithId: overWriteScriptWithId || null,
                    },
                    dataKeys: currentDataKeysRes.data,
                    screens: importedScripts.flatMap((script) => script.screens || []),
                    diagnoses: importedScripts.flatMap((script) => script.diagnoses || []),
                    problems: importedScripts.flatMap((script) => script.problems || []),
                    scripts: importedScripts.map((script) => ({
                        scriptId: script.scriptId,
                        title: script.title,
                        nuidSearchFields: script.nuidSearchFields || [],
                    })),
                });

                response.integrityImportReview = {
                    snapshotId: importSnapshot.snapshotId,
                    totalBlockingIssues: importSnapshot.snapshot.totalBlockingIssues,
                    totalScripts: importSnapshot.snapshot.totalScripts,
                    requiresAcceptance: !!importSnapshot.snapshotId,
                    details: importSnapshot.reviewDetails,
                };
                markTiming('build_integrity_import_review', importReviewStartedAt);
            }
        }

        if (broadcastAction && !response?.errors?.length) socket.emit('data_changed', 'copy_scripts');

        logger.log('copyScripts TIMINGS', JSON.stringify({
            fromRemoteSiteId: !!fromRemoteSiteId,
            toRemoteSiteId: !!toRemoteSiteId,
            overwriteDataKeys: !!overwriteDataKeys,
            overwriteDrugsLibraryItems: !!overwriteDrugsLibraryItems,
            overWriteScriptWithId: !!overWriteScriptWithId,
            scriptsRequested: scriptsIds.length,
            savedScriptIds: response.savedScriptIds?.length || 0,
            totalMs: Date.now() - startedAt,
            timings,
        }));

        return response;
    } catch (e: any) {
        logger.error('copyScripts ERROR', e.response?.data?.errors?.join(', ') || e.message);
        return { errors: e.response?.data?.errors || [e.message], success: false, info, };
    }
}

export async function copyScreens(params?: {
    screensIds?: string[];
    fromScriptsIds?: string[];
    toScriptsIds?: string[];
    confirmCopyAll?: boolean;
    broadcastAction?: boolean;
}): Promise<{ success: boolean; errors?: string[]; copied: number; }> {
    let copied = 0;
    const {
        screensIds = [],
        fromScriptsIds = [],
        toScriptsIds = [],
        confirmCopyAll,
        broadcastAction,
    } = { ...params };

    try {
        const errors: string[] = [];

        const shouldConfirmCopyingAll = !fromScriptsIds.length && !screensIds.length;

        if (shouldConfirmCopyingAll && !confirmCopyAll) throw new Error('You&apos;re about to copy all the screens, please confirm this action!');

        const screens = await queries._getScreens({ scriptsIds: fromScriptsIds, screensIds, returnDraftsIfExist: true, });
        if (screens.errors?.length) throw new Error(screens.errors.join(', '));

        if (!toScriptsIds.length) {
            const screensGroupedByScriptId = screens.data.reduce((acc, s) => ({
                ...acc,
                [s.scriptId]: [...(acc[s.scriptId] || []), s],
            }), {} as { [key: string]: typeof screens.data; })

            for (const scriptId of Object.keys(screensGroupedByScriptId)) {
                const res = await saveScriptScreens({ scriptId, screens: screensGroupedByScriptId[scriptId], });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied += res.saved;
            }
        } else {
            for (const scriptId of toScriptsIds) {
                const res = await saveScriptScreens({ scriptId, screens: screens.data, });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied++;
            }
        }

        if (broadcastAction && !errors.length) socket.emit('data_changed', 'copy_scripts');

        return {
            copied,
            success: !errors.length,
            errors: errors.length ? errors : undefined,
        };
    } catch (e: any) {
        logger.error('copyScreens ERROR', e.message);
        return { errors: [e.message], success: false, copied, };
    }
}

export async function copyDiagnoses(params?: {
    diagnosesIds?: string[];
    fromScriptsIds?: string[];
    toScriptsIds?: string[];
    confirmCopyAll?: boolean;
    broadcastAction?: boolean;
}): Promise<{ success: boolean; errors?: string[]; copied: number; }> {
    let copied = 0;
    const {
        diagnosesIds = [],
        fromScriptsIds = [],
        toScriptsIds = [],
        confirmCopyAll,
        broadcastAction,
    } = { ...params };

    try {
        const errors: string[] = [];

        const shouldConfirmCopyingAll = !fromScriptsIds.length && !diagnosesIds.length;

        if (shouldConfirmCopyingAll && !confirmCopyAll) throw new Error('You&apos;re about to copy all the diagnoses, please confirm this action!');

        const diagnoses = await queries._getDiagnoses({ scriptsIds: fromScriptsIds, diagnosesIds, returnDraftsIfExist: true, });
        if (diagnoses.errors?.length) throw new Error(diagnoses.errors.join(', '));

        if (!toScriptsIds.length) {
            const diagnosesGroupedByScriptId = diagnoses.data.reduce((acc, s) => ({
                ...acc,
                [s.scriptId]: [...(acc[s.scriptId] || []), s],
            }), {} as { [key: string]: typeof diagnoses.data; })

            for (const scriptId of Object.keys(diagnosesGroupedByScriptId)) {
                const res = await saveScriptDiagnoses({ scriptId, diagnoses: diagnosesGroupedByScriptId[scriptId], });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied += res.saved;
            }
        } else {
            for (const scriptId of toScriptsIds) {
                const res = await saveScriptDiagnoses({ scriptId, diagnoses: diagnoses.data, });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied++;
            }
        }

        if (broadcastAction && !errors.length) socket.emit('data_changed', 'copy_scripts');

        return {
            copied,
            success: !errors.length,
            errors: errors.length ? errors : undefined,
        };
    } catch (e: any) {
        logger.error('copyDiagnoses ERROR', e.message);
        return { errors: [e.message], success: false, copied, };
    }
}

export async function copyProblems(params?: {
    problemsIds?: string[];
    fromScriptsIds?: string[];
    toScriptsIds?: string[];
    confirmCopyAll?: boolean;
    broadcastAction?: boolean;
}): Promise<{ success: boolean; errors?: string[]; copied: number; }> {
    let copied = 0;
    const {
        problemsIds = [],
        fromScriptsIds = [],
        toScriptsIds = [],
        confirmCopyAll,
        broadcastAction,
    } = { ...params };

    try {
        const errors: string[] = [];

        const shouldConfirmCopyingAll = !fromScriptsIds.length && !problemsIds.length;

        if (shouldConfirmCopyingAll && !confirmCopyAll) throw new Error('You&apos;re about to copy all the problems, please confirm this action!');

        const problems = await queries._getProblems({ scriptsIds: fromScriptsIds, problemsIds, returnDraftsIfExist: true, });
        if (problems.errors?.length) throw new Error(problems.errors.join(', '));

        if (!toScriptsIds.length) {
            const problemsGroupedByScriptId = problems.data.reduce((acc, s) => ({
                ...acc,
                [s.scriptId]: [...(acc[s.scriptId] || []), s],
            }), {} as { [key: string]: typeof problems.data; })

            for (const scriptId of Object.keys(problemsGroupedByScriptId)) {
                const res = await saveScriptProblems({ scriptId, problems: problemsGroupedByScriptId[scriptId], });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied += res.saved;
            }
        } else {
            for (const scriptId of toScriptsIds) {
                const res = await saveScriptProblems({ scriptId, problems: problems.data, });
                res.errors?.forEach(e => errors.push(e));
                if (errors.length) continue;
                copied++;
            }
        }

        if (broadcastAction && !errors.length) socket.emit('data_changed', 'copy_scripts');

        return {
            copied,
            success: !errors.length,
            errors: errors.length ? errors : undefined,
        };
    } catch (e: any) {
        logger.error('copyProblems ERROR', e.message);
        return { errors: [e.message], success: false, copied, };
    }
}
