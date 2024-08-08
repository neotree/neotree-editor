'use server';

import { _saveHospitals, _deleteHospitals } from "@/databases/mutations/hospitals";
import { _getHospital, _getHospitals, _countHospitals } from "@/databases/queries/hospitals";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export const deleteHospitals: typeof _deleteHospitals = async (...args) => {
    try {
        await isAllowed();
        return await _deleteHospitals(...args);
    } catch(e: any) {
        logger.error('deleteHospitals ERROR', e.message);
        return { errors: [e.message], success: false, };
    }
};

export const countHospitals: typeof _countHospitals = async (...args) => {
    try {
        await isAllowed();
        return await _countHospitals(...args);
    } catch(e: any) {
        logger.error('countHospitals ERROR', e.message);
        return { errors: [e.message], data: 0, };
    }
};

export const getHospitals: typeof _getHospitals = async (...args) => {
    try {
        await isAllowed();
        return await _getHospitals(...args);
    } catch(e: any) {
        logger.error('getHospitals ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getHospital: typeof _getHospital = async (...args) => {
    await isAllowed();
    return await _getHospital(...args);
};

export const saveHospitals: typeof _saveHospitals = async (...args) => {
    try {
        await isAllowed();
        return await _saveHospitals(...args);
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};
