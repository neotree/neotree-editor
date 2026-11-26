'use server';

import bcrypt from 'bcrypt';

import { 
    _deactivateUsers,
    _reactivateUsers,
    _createUsers,
    _updateUsers,
    _resetUsersPasswords,
} from '@/databases/mutations/users';
import { 
    _getFullUser, 
    _getUser, 
    _getUserMini,
    _getUsers, 
    _getUsersDefaultResults, 
    GetUserParams, 
} from "@/databases/queries/users";
import logger from "@/lib/logger";
import { DEACTIVATED_ACCOUNT_MESSAGE, isUserDeactivated } from "@/lib/user-status";
// import { sendMail } from "@/mailer";
// import { getUserDeletedEmail } from "@/mailer/get-user-deleted-email";
// import { getUserOnboardingEmail } from "@/mailer/get-user-onboarding-email";
import { _addUserToken } from "@/databases/mutations/tokens";
import { isAllowed } from "./is-allowed";

export const resetUsersPasswords = _resetUsersPasswords;

export async function isEmailRegistered(email: string): Promise<{ errors?: string[]; yes: boolean; isActive?: boolean; }>  {
    try {
        const user = await _getUser(email);
        return { yes: !!user, isActive: !!user?.isActive, }
    } catch(e: any) {
        logger.error('getUser ERROR:', e);
        return { errors: [e.message], yes: false, };
    }
}

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

export async function getUserMini(params: GetUserParams) {
    try {
        await isAllowed('get_user');

        const user = await _getUserMini(params);
        return user || null;
    } catch(e) {
        logger.error('getUserMini ERROR:', e);
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

const DELETE_USERS_DISABLED_MESSAGE = 'Deleting users is disabled because their work is linked across the system. Deactivate the user instead.';

async function requireUserAdmin() {
    const auth = await isAllowed('users_page');
    if (!auth.yes) throw new Error('You are not allowed to manage users.');
    return auth;
}

export async function deactivateUsers(userIds: string[]) {
    const auth = await requireUserAdmin();

    const ids = (userIds || []).filter(id => id !== auth.user?.userId);
    if (!ids.length) throw new Error('You cannot deactivate your own account.');

    return await _deactivateUsers({ userIds: ids, actorUserId: auth.user!.userId, });
}

export async function reactivateUsers(userIds: string[]) {
    const auth = await requireUserAdmin();
    return await _reactivateUsers({ userIds: userIds || [], actorUserId: auth.user!.userId, });
}

/** Deleting is switched off: users are deactivated instead (see deactivateUsers). */
export async function deleteUsers(_userIds: string[]): Promise<boolean> {
    await isAllowed('delete_users');
    throw new Error(DELETE_USERS_DISABLED_MESSAGE);
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
                // await sendMail({
                //     toEmail: u.email,
                //     ...getUserOnboardingEmail({ name: u.displayName, token: token.token, }),
                // });
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

export const setPassword = async (params: { 
    email: string, 
    password: string; 
    passwordConfirm: string; 
}): Promise<{
    errors?: string[];
    success: boolean;
}> => {
    try {
        if (!params.password) throw new Error('Missing: password');
        if (!params.email) throw new Error('Missing: email');

        const existing = await _getUser(params.email);
        if (isUserDeactivated(existing)) throw new Error(DEACTIVATED_ACCOUNT_MESSAGE);

        if (params.password.length < 6) throw new Error('Password is too short: min 6 characters');

        if (params.password !== params.passwordConfirm) throw new Error('Password confirmation does not match!');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(params.password, salt);

        const res = await _updateUsers([{ userId: params.email, data: { password, } }]);

        if (res.filter(u => u.error).length) throw new Error(res.filter(u => u.error).map(u => u.error).join(', '));

        return { success: true, };
    } catch(e: any) {
        logger.error('setPassword ERROR', e);
        return { success: false, errors: [e.message], };
    }
};
