'use server';

import { 
    _deleteDiagnosesDrafts, 
    _createDiagnosesDrafts,
    _updateDiagnosesDrafts,
} from '@/databases/mutations/diagnoses-drafts';
import { 
    _countDiagnosesDrafts,
    _getFullDiagnosisDraft, 
    _getDiagnosisDraft, 
    _getDiagnosesDrafts, 
    _getDiagnosesDraftsDefaultResults, 
    GetDiagnosisDraftParams, 
} from "@/databases/queries/diagnoses-drafts";
import { _getLastDiagnosisPosition } from '@/databases/queries/diagnoses';
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export const countDiagnosesDrafts = _countDiagnosesDrafts;

export async function getDiagnosisDraft(params: GetDiagnosisDraftParams) {
    try {
        await isAllowed('get_diagnoses');

        const diagnosisDraft = await _getDiagnosisDraft(params);
        return diagnosisDraft || null;
    } catch(e) {
        logger.error('getDiagnosisDraft ERROR:', e);
        return null;
    }
}

export async function getFullDiagnosisDraft(params: GetDiagnosisDraftParams) {
    try {
        await isAllowed('get_diagnoses');

        const diagnosisDraft = await _getFullDiagnosisDraft(params);
        return diagnosisDraft || null;
    } catch(e) {
        logger.error('getFullDiagnosisDraft ERROR:', e);
        return null;
    }
}

export const getDiagnosesDrafts: typeof _getDiagnosesDrafts = async (...args) => {
    try {
        await isAllowed('get_diagnoses');

        return await _getDiagnosesDrafts(...args);
    } catch(e: any) {
        return {
            ..._getDiagnosesDraftsDefaultResults,
            error: e.message,
        };
    }
};

export const searchDiagnosesDrafts: typeof _getDiagnosesDrafts = async (...args) => {
    try {
        await isAllowed('search_diagnoses');

        return await _getDiagnosesDrafts(...args);
    } catch(e: any) {
        logger.error(e.message);
        return {
            ..._getDiagnosesDraftsDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteDiagnosesDrafts(diagnosisDraftIds: string[]) {
    try {
        await isAllowed('delete_diagnoses');

        if (diagnosisDraftIds.length) {
            await _deleteDiagnosesDrafts(diagnosisDraftIds);
        }
        return true;
    } catch(e: any) {
        logger.error('deleteDiagnosesDrafts ERROR', e.message);
        throw e;
    }
}

export async function getDiagnosisDraftPosition() {
    const lastPosition = await _getLastDiagnosisPosition();
    const countDiagnosesDrafts = await _countDiagnosesDrafts();
    return lastPosition + countDiagnosesDrafts + 1;
}

export const createDiagnosesDrafts: typeof _createDiagnosesDrafts = async (...args) => {
    try {
        await isAllowed('create_diagnoses');

        const res = await _createDiagnosesDrafts(...args);
        return res;
    } catch(e) {
        logger.error('createDiagnosesDrafts ERROR', e);
        throw e;
    }
};

export const updateDiagnosesDrafts: typeof _updateDiagnosesDrafts = async (...args) => {
    try {
        await isAllowed('update_diagnoses');
        const res = await _updateDiagnosesDrafts(...args);
        return res;
    } catch(e) {
        logger.error('updateDiagnosesDrafts ERROR', e);
        throw e;
    }
};
