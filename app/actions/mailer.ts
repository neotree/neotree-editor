'use server';

import { _saveMailerSettings, _deleteMailerSettings } from "@/databases/mutations/mailer";
import { _getActiveMailerSettings, _getMailerSettings } from "@/databases/queries/mailer";
import logger from "@/lib/logger";
import { sendMail as _sendMail } from "@/mailer2";
import { isAllowed } from "./is-allowed";

export const deleteMailerSettings: typeof _deleteMailerSettings = async (...args) => {
    try {
        await isAllowed(['delete_mailer_settings']);
        return await _deleteMailerSettings(...args);
    } catch(e: any) {
        logger.error('deleteMailerSettings ERROR', e.message);
        return { errors: [e.message], info: null, success: false, };
    }
};

export const sendMail: typeof _sendMail = async (...args) => {
    try {
        return await _sendMail(...args);
    } catch(e: any) {
        logger.error('sendMail ERROR', e.message);
        return { errors: [e.message], info: null, success: false, };
    }
};

export const getMailerSettings: typeof _getMailerSettings = async (...args) => {
    try {
        await isAllowed(['get_mailer_settings']);
        return await _getMailerSettings(...args);
    } catch(e: any) {
        logger.error('getMailerSettings ERROR', e.message);
        return { errors: [e.message], data: [], };
    }
};

export const getActiveMailerSettings: typeof _getActiveMailerSettings = async (...args) => {
    return await _getActiveMailerSettings(...args);
};

export const saveMailerSettings: typeof _saveMailerSettings = async (...args) => {
    try {
        await isAllowed(['save_mailer_settings']);
        return await _saveMailerSettings(...args);
    } catch(e: any) {
        logger.error('getSys ERROR', e.message);
        return { errors: [e.message], data: undefined, success: false, };
    }
};
