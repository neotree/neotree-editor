'use server';

import { 
    _deleteDiagnoses, 
    _createDiagnoses,
    _updateDiagnoses,
    _updateDiagnosesWithoutPublishing,
    _copyDiagnoses,
} from '@/databases/mutations/diagnoses';
import { 
    _getFullDiagnosis, 
    _getDiagnosis, 
    _getDiagnosisWithDraft,
    _getDiagnoses, 
    _getDiagnosesDefaultResults, 
    GetDiagnosisParams, 
} from "@/databases/queries/diagnoses";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import { _getDiagnosesDrafts } from '@/databases/queries/diagnoses-drafts';

export async function getDiagnosis(params: GetDiagnosisParams) {
    try {
        await isAllowed('get_diagnosis');

        const diagnosis = await _getDiagnosis(params);
        return diagnosis || null;
    } catch(e) {
        logger.error('getDiagnosis ERROR:', e);
        return null;
    }
}

export async function getDiagnosisWithDraft(params: GetDiagnosisParams) {
    try {
        await isAllowed('get_diagnosis');

        const diagnosis = await _getDiagnosisWithDraft(params);
        return diagnosis || null!;
    } catch(e) {
        logger.error('getDiagnosisWithDraft ERROR:', e);
        return null!;
    }
}

export async function getFullDiagnosis(params: GetDiagnosisParams) {
    try {
        await isAllowed('get_diagnosis');

        const diagnosis = await _getFullDiagnosis(params);
        return diagnosis || null;
    } catch(e) {
        logger.error('getFullDiagnosis ERROR:', e);
        return null;
    }
}

export const getEmptyDiagnoses: typeof _getDiagnoses = async () => {
    return _getDiagnosesDefaultResults;
};

export const getDiagnoses: typeof _getDiagnoses = async (...args) => {
    try {
        await isAllowed('get_diagnoses');

        return await _getDiagnoses(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getDiagnosesDefaultResults,
            error: e.message,
        };
    }
};

export const searchDiagnoses: typeof _getDiagnoses = async (...args) => {
    try {
        await isAllowed('search_diagnoses');

        return await _getDiagnoses(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getDiagnosesDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteDiagnoses(diagnosisIds: string[]) {
    try {
        await isAllowed('delete_diagnoses');
        if (diagnosisIds.length) {
            await _deleteDiagnoses(diagnosisIds);
        }

        return true;
    } catch(e: any) {
        logger.error('deleteDiagnoses ERROR', e.message);
        throw e;
    }
}

export const createDiagnoses: typeof _createDiagnoses = async (...args) => {
    try {
        await isAllowed('create_diagnoses');
        const res = await _createDiagnoses(...args);
        return res;
    } catch(e) {
        logger.error('createDiagnoses ERROR', e);
        throw e;
    }
};

export const updateDiagnoses: typeof _updateDiagnoses = async (...args) => {
    try {
        await isAllowed('update_diagnoses');
        const res = await _updateDiagnoses(...args);
        return res;
    } catch(e) {
        logger.error('updateDiagnoses ERROR', e);
        throw e;
    }
};

export const updateDiagnosesWithoutPublishing: typeof _updateDiagnosesWithoutPublishing = async (...args) => {
    try {
        await isAllowed('update_diagnoses');
        const res = await _updateDiagnosesWithoutPublishing(...args);
        return res;
    } catch(e) {
        logger.error('updateDiagnosesWithoutPublishing ERROR', e);
        throw e;
    }
}

export const copyDiagnoses: typeof _copyDiagnoses = async (...args) => {
    try {
        await isAllowed('create_diagnoses');
        const res = await _copyDiagnoses(...args);
        return res;
    } catch(e) {
        logger.error('copyDiagnoses ERROR', e);
        throw e;
    }
}

export async function getDiagnosesTableData({ scriptsIds = [], scriptsDraftsIds = [], }: {
    scriptsIds?: string[];
    scriptsDraftsIds?: string[];
}) {
    const results: {
        data: Awaited<ReturnType<typeof _getDiagnoses>>['data'];
        error?: string;
    } = {
        data: [],
    }
    
    try {
        const diagnoses = scriptsIds?.length ? await _getDiagnoses({ scriptsIds, }) : { data: [], };
        const drafts = (scriptsDraftsIds?.length || scriptsIds?.length) ? await _getDiagnosesDrafts({ scriptsDraftsIds, scriptsIds, }) : { data: [], };
        results.data = [
            ...diagnoses.data.filter(s => !drafts.data.map(s => s.diagnosisId).includes(s.diagnosisId)).map(s => ({
                ...s,
            })),
            ...(drafts.data as typeof diagnoses.data).map(s => ({
                ...s,
            })),
        ].sort((a, b) => a.position - b.position);
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}
