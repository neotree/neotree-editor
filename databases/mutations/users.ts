import { eq, inArray } from "drizzle-orm";
import { v4 } from "uuid";
import bcrypt from 'bcrypt';

import db from "../pg/drizzle";
import { users } from "../pg/schema";
import { _getUser, _getUsers } from '../queries/users';

export async function _deleteUsers(userIds: string[]) {
    // clear user's personal information, but keep the user as it is linked to some actions they performed
    for (const userId of userIds) {
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
    })[], 
    opts?: {
        returnInserted?: boolean;
        broadcastAction?: boolean;
    }
) {
    const insertData: typeof users.$inferInsert[] = [];
    
    for(const u of data) {
        const password = await bcrypt.hash(v4(), 12);
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

    for(const { userId, data: u,  } of data) {
        try {
            delete u.id;
            delete u.createdAt;
            delete u.updatedAt;
            delete u.email;
            delete u.userId;

            await db.update(users).set(u).where(eq(users.userId, userId));
            const user = !opts?.returnUpdated ? undefined : await _getUser(userId);
            results.push({ userId, user, });
        } catch(e: any) {
            results.push({ userId, error: e.message, });
        }
    }

    return results;
}
