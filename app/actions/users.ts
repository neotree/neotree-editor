'use server';

import { 
    _deleteUsers, 
    _createUsers,
    _updateUsers,
} from '@/databases/mutations/users';
import { 
    _getFullUser, 
    _getUser, 
    _getUsers, 
    _getUsersDefaultResults, 
    GetUserParams, 
} from "@/databases/queries/users";
import logger from "@/lib/logger";
import { sendMail } from "@/mailer";
import { getUserDeletedEmail } from "@/mailer/get-user-deleted-email";
import { getUserOnboardingEmail } from "@/mailer/get-user-onboarding-email";
import { _addUserToken } from "@/databases/mutations/tokens";
import { isAllowed } from "./is-allowed";

export async function getUser(params: GetUserParams) {
    try {
        await isAllowed('get_user');

        const user = await _getUser(params);
        return user || null;
    } catch(e) {
        logger.error('getUser ERROR:', e);
        return null;
    }
}

export async function getFullUser(params: GetUserParams) {
    try {
        await isAllowed('get_user');

        const user = await _getFullUser(params);
        return user || null;
    } catch(e) {
        logger.error('getFullUser ERROR:', e);
        return null;
    }
}

export const getUsers: typeof _getUsers = async (...args) => {
    try {
        await isAllowed('get_users');

        return await _getUsers(...args);
    } catch(e: any) {
        return {
            ..._getUsersDefaultResults,
            error: e.message,
        };
    }
};

export const searchUsers: typeof _getUsers = async (...args) => {
    try {
        await isAllowed('search_users');

        return await _getUsers(...args);
    } catch(e: any) {
        return {
            ..._getUsersDefaultResults,
            error: e.message,
        };
    }
};

export async function deleteUsers(userIds: string[]) {
    await isAllowed('delete_users');

    if (userIds.length) {
        const { data: users } = await _getUsers({ userIds, });
        await _deleteUsers(userIds);
        await Promise.all(users.filter(u => u.activationDate).map(u => sendMail({
            toEmail: u.email,
            ...getUserDeletedEmail({ name: u.displayName, }),
        })));
    }

    return true;
}

export const createUsers: typeof _createUsers = async (...args) => {
    try {
        await isAllowed('create_users');

        const res = await _createUsers(...args);
        for(const u of args[0]) {
            try {
                const token = await _addUserToken({
                    userId: u.userId,
                    hoursValid: 1,
                });
                await sendMail({
                    toEmail: u.email,
                    ...getUserOnboardingEmail({ name: u.displayName, token: token.token, }),
                });
            } catch(e) {
                // do nothing
            }
        }
        return res;
    } catch(e) {
        logger.error('createUsers ERROR', e);
        throw e;
    }
};

export const updateUsers: typeof _updateUsers = async (...args) => {
    try {
        await isAllowed('update_users');
        return await _updateUsers(...args);
    } catch(e) {
        logger.error('updateUsers ERROR', e);
        throw e;
    }
};
