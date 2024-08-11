'use server';

// import * as mutations from "@/databases/mutations/sessions";
import * as queries from "@/databases/queries/sessions";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

// export const deleteSessions: typeof mutations._deleteSessions = async (...args) => {
//     try {
//         await isAllowed();
//         return await mutations._deleteSessions(...args);
//     } catch(e: any) {
//         logger.error('deleteSessions ERROR', e.message);
//         return { errors: [e.message], success: false, };
//     }
// };

export const countSessions: typeof queries._countSessions = async (...args) => {
    try {
        await isAllowed();
        return await queries._countSessions(...args);
    } catch(e: any) {
        logger.error('countSessions ERROR', e.message);
        return { errors: [e.message], total: 0, };
    }
};

export const getSessions: typeof queries._getSessions = async (...args) => {
    try {
        await isAllowed();
        return await queries._getSessions(...args);
    } catch(e: any) {
        logger.error('getSessions ERROR', e.message);
        return { errors: [e.message], data: [], info: queries.defaultSessionsDataInfo, };
    }
};

export const getSession: typeof queries._getSession = async (...args) => {
    try {
        await isAllowed();
        return await queries._getSession(...args);
    } catch(e: any) {
        logger.error('getSession ERROR', e.message);
        return { errors: [e.message], data: null, };
    }
};

// export const getSession: typeof queries._getSession = async (...args) => {
//     await isAllowed();
//     return await queries._getSession(...args);
// };

// export const saveSessions: typeof mutations._saveSessions = async (...args) => {
//     try {
//         await isAllowed();
//         return await mutations._saveSessions(...args);
//     } catch(e: any) {
//         logger.error('getSys ERROR', e.message);
//         return { errors: [e.message], data: undefined, success: false, };
//     }
// };
