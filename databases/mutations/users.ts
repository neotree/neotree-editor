import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { v4 } from "uuid";
import bcrypt from 'bcrypt';

import { validEmailRegex } from "@/constants/email";
import db from "../pg/drizzle";
import { users } from "../pg/schema";
import socket from "@/lib/socket";
import { _saveChangeLog } from "./changelogs";
import { _getUser, _getUsers } from '../queries/users';

export async function _resetUsersPasswords(usersIds: string[]) {
    for (const userId of usersIds) {
        await db
            .update(users)
            .set({ 
                password: '',
            })
            .where(eq(users.userId, userId));
    }
    return true;
}

type SetUsersActiveStateParams = {
    userIds: string[];
    /** the administrator making the change; recorded in the change log */
    actorUserId: string;
};

/**
 * Switches accounts off (deactivate) or back on (reactivate) and records who did it:
 * one change-log entry per account that actually changed, with the administrator, the time and the
 * before / after state. It does NOT change the data version: that stays reserved for content
 * releases. Tablets learn about it from the broadcast below and from the sign-out check they run
 * at every sync. Everything happens in one transaction; accounts already in the requested state are
 * skipped. Returns how many accounts changed.
 */
async function _setUsersActiveState(deactivate: boolean, { userIds, actorUserId }: SetUsersActiveStateParams) {
    const ids = [...new Set(userIds || [])];
    if (!ids.length) return { count: 0 };
    if (!actorUserId) throw new Error('Who made this change could not be determined.');

    const result = await db.transaction(async tx => {
        const targets = await tx
            .select({
                userId: users.userId,
                email: users.email,
                displayName: users.displayName,
                role: users.role,
                deactivatedAt: users.deactivatedAt,
            })
            .from(users)
            .where(and(
                inArray(users.userId, ids),
                isNull(users.deletedAt),
                deactivate ? isNull(users.deactivatedAt) : isNotNull(users.deactivatedAt),
            ));

        if (!targets.length) return { count: 0 };

        const nextState = deactivate ? new Date() : null;

        await tx
            .update(users)
            .set({ deactivatedAt: nextState })
            .where(inArray(users.userId, targets.map(t => t.userId)));

        const verb = deactivate ? 'deactivated' : 'reactivated';

        for (const t of targets) {
            const snapshot = (deactivatedAt: Date | null) => ({
                userId: t.userId,
                email: t.email,
                displayName: t.displayName,
                role: t.role,
                deactivatedAt: deactivatedAt ? deactivatedAt.toISOString() : null,
            });
            const description = `User ${t.displayName} (${t.email}) ${verb}`;

            const log = await _saveChangeLog({
                client: tx,
                data: {
                    entityId: t.userId,
                    entityType: 'user',
                    action: 'update',
                    dataVersion: null,
                    changes: [{
                        field: 'deactivatedAt',
                        previousValue: t.deactivatedAt ? t.deactivatedAt.toISOString() : null,
                        newValue: nextState ? nextState.toISOString() : null,
                        dataType: 'date',
                    }],
                    previousSnapshot: snapshot(t.deactivatedAt),
                    fullSnapshot: snapshot(nextState),
                    description,
                    changeReason: description,
                    userId: actorUserId,
                },
            });
            if (!log.success) throw new Error(log.errors?.join(', ') || 'Failed to save the change log');
        }

        return { count: targets.length };
    });

    // connected tablets sync now and sign a deactivated user out; no new data version is involved
    if (result.count) socket.emit('data_changed', 'user_access_changed');

    return result;
}

export const _deactivateUsers = (params: SetUsersActiveStateParams) => _setUsersActiveState(true, params);

export const _reactivateUsers = (params: SetUsersActiveStateParams) => _setUsersActiveState(false, params);

export async function _deleteUsers(usersIds: string[]) {
    // clear user's personal information, but keep the user as it is linked to some actions they performed
    for (const userId of usersIds) {
        const deletedAt = new Date();
        await db
            .update(users)
            .set({ 
                deletedAt, 
                email: userId,
                displayName: 'Former user',
                firstName: null,
                lastName: null,
                // TODO: delete user's images
                avatar: null,
                avatar_md: null,
                avatar_sm: null,
            })
            .where(eq(users.userId, userId));
    }
    return true;
}

export async function _createUsers(
    data: (Omit<typeof users.$inferInsert, 'password'> & {
        userId: string;
        password?: string;
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    }
) {
    const insertData: typeof users.$inferInsert[] = [];
    
    for(const u of data) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(u.password || v4(), salt);
        insertData.push({
            ...u,
            password,
            userId: u.userId || v4(),
        });
    }

    let results: {
        success: boolean;
        error?: string;
        inserted: Awaited<ReturnType<typeof _getUsers>>['data'];
    } = { inserted: [], success: false, };

    try {
        await db.insert(users).values(insertData);
        if (opts?.returnInserted) {
            const inserted = await _getUsers({ userIds: insertData.map(u => u.userId!), });
            results.inserted = inserted.data;
        }
        results.success = true;
    } catch(e: any) {
        results.error = e.message;
    } finally {
        return results;
    }
}

export async function _updateUsers(
    data: ({
        userId: string;
        data: Partial<typeof users.$inferSelect>;
    })[], 
    opts?: {
        returnUpdated?: boolean;
        broadcastAction?: boolean;
    }
) {
    const results: ({ 
        userId: string;
        user?: Awaited<ReturnType<typeof _getUser>>;
        error?: string; 
    })[] = [];

    for(const { userId, data: { userId: _userId, deletedAt, deactivatedAt, id, createdAt, updatedAt, email, ...u },  } of data) {
        try {
            const where = validEmailRegex.test(userId) ? eq(users.email, userId) : eq(users.userId, userId);

            await db.update(users).set(u).where(where);
            const user = !opts?.returnUpdated ? undefined : await _getUser(userId);
            results.push({ userId, user, });
        } catch(e: any) {
            results.push({ userId, error: e.message, });
        }
    }

    return results;
}
