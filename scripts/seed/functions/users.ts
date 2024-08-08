import 'dotenv/config';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';

import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import logger from '@/lib/logger';
import { axiosClient } from './axios';


export async function seedUsers(site: typeof schema.sites.$inferSelect) {
    try {
        // seed users
        console.log('> seed users');
        const res = await axiosClient(site).get('/get-users');
        const allUsers = res.data.users.filter((s: any) => !s.deletedAt);
        const users: typeof schema.users.$inferInsert[] = [];
        for(const u of allUsers) {
            const [displayName] = u.email.split('@');

            const salt = await bcrypt.genSalt();
            const password = u.password || await bcrypt.hash(v4(), salt);

            users.push({
                displayName,
                email: u.email,
                password,
             } satisfies typeof schema.users.$inferInsert);
        }

        await db.delete(schema.users);
        if (users.length) await db.insert(schema.users).values(users);
    } catch(e: any) {
        logger.error('seedFiles ERROR', e);
    }
}
