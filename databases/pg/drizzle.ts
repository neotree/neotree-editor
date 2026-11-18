import { drizzle as postgresDrizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

declare global {
    var drizzle: ReturnType<typeof dbInit> | undefined;
}

const isProd = process.env.NODE_ENV === 'production';

const dbLogging = !isProd && (`${process.env.DEBUG}` === 'true');

const positiveInt = (value: string | undefined, fallback: number) => {
    const n = Math.floor(Number(value));
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function dbInit() {
    const client = postgres(process.env.POSTGRES_DB_URL!, {
        connection: {
            // No statement waits forever for a lock held by another one: it fails with "lock timeout"
            // (55P03), which lib/server/db-errors.ts turns into a message. Content writers queue before
            // they get here (lib/server/content-write-lock.ts), so this only catches the unexpected.
            lock_timeout: positiveInt(process.env.CONTENT_WRITE_DB_LOCK_TIMEOUT_MS, 60 * 1000),
            // A transaction left open and idle (its caller stuck or gone) is ended, releasing its locks.
            idle_in_transaction_session_timeout: positiveInt(process.env.DB_IDLE_IN_TRANSACTION_TIMEOUT_MS, 10 * 60 * 1000),
        },
    });
    const db = postgresDrizzle(client, { 
        schema, 
        logger: dbLogging, 
    });
    return db;
}

const db = globalThis.drizzle || dbInit();

if (process.env.NODE_ENV !== 'production') globalThis.drizzle = db;

export default db;
