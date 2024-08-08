'use server';

import { 
    _deleteHospitals, 
    _createHospitals,
    _updateHospitals,
} from '@/databases/mutations/_hospitals';
import { 
    _getFullHospital, 
    _getHospital, 
    _getHospitals, 
    _getHospitalsDefaultResults, 
    GetHospitalParams, 
} from "@/databases/queries/_hospitals";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export async function getHospital(params: GetHospitalParams) {
    try {
        await isAllowed('get_hospital');

        const hospital = await _getHospital(params);
        return hospital || null;
    } catch(e) {
        logger.error('getHospital ERROR:', e);
        return null;
    }
}

export async function getFullHospital(params: GetHospitalParams) {
    try {
        await isAllowed('get_hospital');

        const hospital = await _getFullHospital(params);
        return hospital || null;
    } catch(e) {
        logger.error('getFullHospital ERROR:', e);
        return null;
    }
}

export const getHospitals: typeof _getHospitals = async (...args) => {
    try {
        await isAllowed('get_hospitals');

        return await _getHospitals(...args);
    } catch(e: any) {
        return {
            ..._getHospitalsDefaultResults,
            error: e.message,
        };
    }
};

export const searchHospitals: typeof _getHospitals = async (...args) => {
    try {
        await isAllowed('search_hospitals');

        return await _getHospitals(...args);
    } catch(e: any) {
        return {
            ..._getHospitalsDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteHospitals(hospitalIds: string[]) {
    await isAllowed('delete_hospitals');

    if (hospitalIds.length) {
        await _deleteHospitals(hospitalIds);
    }

    return true;
}

export const createHospitals: typeof _createHospitals = async (...args) => {
    try {
        await isAllowed('create_hospitals');

        const res = await _createHospitals(...args);
        return res;
    } catch(e) {
        logger.error('createHospitals ERROR', e);
        throw e;
    }
};

export const updateHospitals: typeof _updateHospitals = async (...args) => {
    try {
        await isAllowed('update_hospitals');
        return await _updateHospitals(...args);
    } catch(e) {
        logger.error('updateHospitals ERROR', e);
        throw e;
    }
};
