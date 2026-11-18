import { AsyncLocalStorage } from "node:async_hooks";
import { eq, sql } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { users } from "@/databases/pg/schema";
import type { DbOrTransaction } from "@/databases/pg/db-client";

/**
 * One writer at a time on this editor's content (scripts, screens, diagnoses, problems, data keys, drugs
 * library, config keys, hospitals, their drafts, publishing and discarding them).
 *
 * Why: every draft table uses the published row's id as the draft's unique id, and every writer looks for
 * an existing draft, then inserts one. Two writers working on the same row at once (two imports, an import
 * and a data key save, an import and a publish...) both found no draft, both inserted, and the second one
 * WAITED on the unique index until the first transaction ended, then failed. Imports run for minutes, so
 * the other user saw an import or a save "stuck", then an error about a failed insert.
 *
 * Writers now queue here first, in order, and only wait a bounded time: when the wait is over, they fail
 * with a message that says what is running (e.g. "an import of “Neotree Admission” by Farai"). Nothing
 * waits forever. Inside the transaction, a Postgres advisory lock does the same for writers outside this
 * Node process (CLI scripts, a second process), and `lock_timeout` turns any other row lock wait into an
 * error instead of a hang.
 *
 * Re-entrant: code that already holds the lock (an import calling the data key save) runs straight away.
 * The app runs as one Node process (server/index.js), so this queue sees every writer of the app.
 */

export type ContentWriteHolder = {
    id: number;
    /** What is running, for people: "an import of “Neotree Admission” by Farai Matare". */
    label: string;
    startedAt: number;
};

type Waiter = {
    holder: ContentWriteHolder;
    grant: () => void;
};

type LockState = {
    seq: number;
    current: ContentWriteHolder | null;
    queue: Waiter[];
    store: AsyncLocalStorage<ContentWriteHolder>;
};

// Survives module re-evaluation in development (same reason as databases/pg/drizzle.ts).
declare global {
    var neotreeContentWriteLock: LockState | undefined;
}

const state: LockState = globalThis.neotreeContentWriteLock || {
    seq: 0,
    current: null,
    queue: [],
    store: new AsyncLocalStorage<ContentWriteHolder>(),
};
globalThis.neotreeContentWriteLock = state;

const positiveInt = (value: string | undefined, fallback: number) => {
    const n = Math.floor(Number(value));
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** How long an interactive change (a save, publish, discard) waits for another one to finish. */
export const EDITOR_WRITE_WAIT_MS = positiveInt(process.env.CONTENT_WRITE_WAIT_MS, 2 * 60 * 1000);
/** How long an import (it runs in the background) waits for another change to finish. */
export const IMPORT_WRITE_WAIT_MS = positiveInt(process.env.IMPORT_WRITE_WAIT_MS, 10 * 60 * 1000);
/** Longest wait for any single row or advisory lock inside a content transaction. */
export const DB_LOCK_TIMEOUT_MS = positiveInt(process.env.CONTENT_WRITE_DB_LOCK_TIMEOUT_MS, 60 * 1000);

// Single 64-bit advisory key ("NEOTREE" content writes). The two-int4 keys used for changelog chains
// (databases/mutations/changelogs/_rollback-shared.ts) are a separate key space in Postgres.
const ADVISORY_KEY = BigInt("7310288841");

export function describeElapsed(ms: number) {
    const seconds = Math.max(0, Math.round(ms / 1000));
    if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export class ContentWriteBusyError extends Error {
    readonly holder: ContentWriteHolder;
    readonly waitedMs: number;

    constructor(holder: ContentWriteHolder, waitedMs: number) {
        super(
            `Another change is still being saved on this editor: ${holder.label}, started ${describeElapsed(Date.now() - holder.startedAt)} ago. ` +
            `This one waited ${describeElapsed(waitedMs)} and was not saved. Try again when that has finished.`,
        );
        this.name = "ContentWriteBusyError";
        this.holder = holder;
        this.waitedMs = waitedMs;
    }
}

/** What is holding the lock right now, if anything. */
export function getContentWriteHolder(): ContentWriteHolder | null {
    return state.current ? { ...state.current } : null;
}

export function holdsContentWriteLock() {
    return !!state.store.getStore();
}

function grantNext() {
    const next = state.queue.shift();
    if (next) {
        next.holder.startedAt = Date.now();
        state.current = next.holder;
        next.grant();
    } else {
        state.current = null;
    }
}

/**
 * Run `fn` as this editor's only content writer. Waits (in order) for the current writer to finish, at
 * most `maxWaitMs`; then throws ContentWriteBusyError, which names what is running. `onWait` is called
 * once when the caller has to queue, with what it is waiting for.
 */
export async function withContentWriteLock<T>(
    options: { label: string; maxWaitMs?: number; onWait?: (holder: ContentWriteHolder) => void },
    fn: () => Promise<T>,
): Promise<T> {
    if (state.store.getStore()) return fn();

    const holder: ContentWriteHolder = { id: ++state.seq, label: options.label, startedAt: Date.now() };

    if (!state.current) {
        state.current = holder;
    } else {
        const blocking = { ...state.current };
        const queuedAt = Date.now();
        try { options.onWait?.(blocking); } catch { /* progress only */ }
        await new Promise<void>((resolve, reject) => {
            const waiter: Waiter = { holder, grant: () => { clearTimeout(timer); resolve(); } };
            const timer = setTimeout(() => {
                const index = state.queue.indexOf(waiter);
                if (index < 0) return; // granted at the same moment
                state.queue.splice(index, 1);
                reject(new ContentWriteBusyError(state.current || blocking, Date.now() - queuedAt));
            }, options.maxWaitMs ?? EDITOR_WRITE_WAIT_MS);
            state.queue.push(waiter);
        });
    }

    try {
        return await state.store.run(holder, fn);
    } finally {
        if (state.current?.id === holder.id) grantNext();
    }
}

/**
 * First statements of every content transaction: take the editor-wide advisory lock (for writers outside
 * this process) and bound every lock wait in the transaction, so a blocked statement errors (55P03, see
 * lib/server/db-errors.ts) instead of waiting forever. Both end with the transaction.
 */
export async function lockContentWritesInTransaction(tx: DbOrTransaction, lockTimeoutMs = DB_LOCK_TIMEOUT_MS) {
    await tx.execute(sql`select set_config('lock_timeout', ${`${lockTimeoutMs}ms`}, true)`);
    await tx.execute(sql`select pg_advisory_xact_lock(${ADVISORY_KEY.toString()}::bigint)`);
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * A content transaction: queued behind this editor's other writers, then the DB-side lock and lock
 * timeout, then `fn`. Use it instead of `db.transaction` for anything that writes content or drafts.
 */
export function runContentTransaction<T>(
    options: { label: string; maxWaitMs?: number; onWait?: (holder: ContentWriteHolder) => void },
    fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
    return withContentWriteLock(options, () => db.transaction(async (tx) => {
        await lockContentWritesInTransaction(tx);
        return fn(tx);
    }));
}

/**
 * For a single save outside any transaction (a form save): queue like any writer. When the caller passes
 * its own transaction without holding the lock, it is not queued here (queueing inside an open
 * transaction could wait on a writer that waits on this transaction); the DB lock timeout still bounds it.
 */
export function withContentWriteLockUnlessInTransaction<T>(
    options: { label: string; maxWaitMs?: number },
    client: DbOrTransaction | null | undefined,
    fn: () => Promise<T>,
): Promise<T> {
    if (client || holdsContentWriteLock()) return fn();
    return withContentWriteLock(options, fn);
}

/** "a data key save by Farai Matare": what a writer is, for the message of whoever waits for it. */
export async function describeWriter(what: string, userId?: string | null) {
    if (!userId) return what;
    try {
        const user = await db.query.users.findFirst({ where: eq(users.userId, userId), columns: { displayName: true, email: true } });
        const who = user?.displayName || user?.email;
        return who ? `${what} by ${who}` : what;
    } catch {
        return what;
    }
}

/**
 * Wrap a single save or delete (form saves of scripts, screens, diagnoses...): run as this editor's only
 * writer, unless the caller passed its own transaction or already holds the lock. When the wait runs out,
 * it answers like a failed save ({ success: false, errors: [why] }) instead of throwing.
 */
export async function queueContentWrite<T>(
    what: string,
    params: { userId?: string | null; client?: DbOrTransaction | null } | null | undefined,
    fn: () => Promise<T>,
): Promise<T> {
    if (params?.client || holdsContentWriteLock()) return fn();
    try {
        return await withContentWriteLock({ label: await describeWriter(what, params?.userId) }, fn);
    } catch (e) {
        if (e instanceof ContentWriteBusyError) return { success: false, errors: [e.message] } as unknown as T;
        throw e;
    }
}
