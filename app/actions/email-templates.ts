'use server';

import { _saveEmailTemplates, _deleteEmailTemplates } from "@/databases/mutations/email-templates";
import { _getEmailTemplate, _getEmailTemplates } from "@/databases/queries/email-templates";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

export const deleteEmailTemplates: typeof _deleteEmailTemplates = async (...args) => {
    try {
        await isAllowed();
        return await _deleteEmailTemplates(...args);
    } catch(e: any) {
        logger.error('deleteEmailTemplates ERROR', e.message);
        return { errors: [e.message], info: null, success: false, };
    }
};

export const getEmailTemplates: typeof _getEmailTemplates = async (...args) => {
    try {
        await isAllowed();
        return await _getEmailTemplates(...args);
    } catch(e: any) {
        logger.error('getEmailTemplates ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getEmailTemplate: typeof _getEmailTemplate = async (...args) => {
    await isAllowed();
    return await _getEmailTemplate(...args);
};

export const saveEmailTemplates: typeof _saveEmailTemplates = async (...args) => {
    try {
        await isAllowed();
        return await _saveEmailTemplates(...args);
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};
