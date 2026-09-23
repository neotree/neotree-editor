import { broadcastImportJobComplete } from "@/lib/in-progress";
import { _countDrafts } from "@/databases/queries/ops";
import logger from "@/lib/logger";

// In-memory job registry for long-running script imports. The app runs as a
// single, persistent Node process (see server/index.js — no cluster mode),
// so this is safe without a shared/external store.
//
// Two things live here:
// - Coalescing: a retried/duplicated request for the same logical import
//   (same user + remote site + scripts + overwrite target) while one is
//   already running joins the in-flight job instead of starting another one,
//   so retries can't create duplicate scripts.
// - A short-lived cache of the last result per logical import, so a
//   near-duplicate request landing just after completion gets the same
//   answer instead of re-running the import.

type ImportJobStatus = "pending" | "done" | "error";

type ImportJob<T = any> = {
    status: ImportJobStatus;
    requestKeys: Set<string>;
    result?: T;
    settledAt?: number;
};

// How long a finished job's result stays cached after it settles. This is a
// dedup window, not an import time limit — it lets a duplicate/retried
// request that lands shortly after completion get the same answer instantly
// instead of re-running the import. It has no effect on jobs still pending.
//
// This MUST comfortably exceed the frontend's fallback re-POST delay
// (scripts-import-modal.tsx's waitForImportCompletion) — otherwise, whenever
// the socket completion event is dropped, the fallback's retry lands after
// this window has already closed and triggers a full duplicate import
// instead of harmlessly reusing the cached result. (Confirmed in production
// logs: a 4-minute fallback + a 2-minute TTL here caused exactly that.)
const COMPLETED_JOB_TTL_MS = 10 * 60 * 1000;

// How long after a job settles we keep its entry in the registry before
// deleting it. Pure memory housekeeping for this in-memory Map (so it
// doesn't grow forever across every import ever run) — unrelated to
// COMPLETED_JOB_TTL_MS above (that's the dedup window; this is cleanup) and
// unrelated to import duration. Must stay comfortably larger than
// COMPLETED_JOB_TTL_MS, or the entry (and the cached result it holds) could
// be deleted before the TTL window it's supposed to serve has even closed.
const JOB_CLEANUP_DELAY_MS = 15 * 60 * 1000;

const parsePositiveInt = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    const normalized = Math.floor(parsed);
    return normalized > 0 ? normalized : fallback;
};

// Safety net: if a job never settles (a genuine hang — not just a slow but
// active step), stop telling the frontend it's still fine after this long.
// Unlike an nginx/proxy timeout, this does NOT kill or cancel the underlying
// work — the import keeps running server-side regardless. It only stops the
// UI from silently waiting forever with no signal that something's wrong; if
// the real result shows up later, it's discarded (see `settled` below).
const MAX_JOB_DURATION_MS = parsePositiveInt(process.env.IMPORT_JOB_MAX_DURATION_MS, 20 * 60 * 1000);

// In Next.js dev mode, server-side modules can be re-evaluated between
// requests (Fast Refresh / module invalidation), which would silently reset
// a plain module-level Map — losing track of an import that's still running
// and causing a later duplicate/retried request to start a second one
// instead of coalescing into the first (see databases/pg/drizzle.ts for the
// same workaround, applied there for the DB client singleton for the same
// reason).
declare global {
    var importJobsByContentKey: Map<string, ImportJob> | undefined;
}

const jobsByContentKey: Map<string, ImportJob> = globalThis.importJobsByContentKey || new Map();

if (process.env.NODE_ENV !== 'production') globalThis.importJobsByContentKey = jobsByContentKey;

export function buildImportContentKey(params: {
    userId?: string | null;
    fromRemoteSiteId?: string | null;
    scriptsIds?: (string | null | undefined)[];
    overWriteScriptWithId?: string | null;
}): string {
    const scriptsIds = Array.from(new Set((params.scriptsIds || []).filter((id): id is string => !!id))).sort();
    return [
        params.userId || "",
        params.fromRemoteSiteId || "",
        scriptsIds.join(","),
        params.overWriteScriptWithId || "",
    ].join("::");
}

function scheduleCleanup(contentKey: string, job: ImportJob) {
    setTimeout(() => {
        if (jobsByContentKey.get(contentKey) === job) jobsByContentKey.delete(contentKey);
    }, JOB_CLEANUP_DELAY_MS);
}

// Diagnostic only (for tracing whether a "restart" is actually a second
// independent run vs. the frontend re-polling an in-flight one, and whether
// draft rows are genuinely accumulating): logs the same counts the
// publish/discard banner is driven by (databases/queries/ops/_countDrafts,
// via app/actions/ops.ts's getEditorDetails). Fire-and-forget — never awaited,
// so it can't slow down or block the import itself.
function logDraftCounts(label: string, contentKey: string, requestKey: string) {
    _countDrafts()
        .then((drafts) => {
            logger.log('importJob draft counts', {
                label,
                contentKey,
                requestKey,
                total: drafts.total,
                scripts: drafts.scripts,
                screens: drafts.screens,
                diagnoses: drafts.diagnoses,
                problems: drafts.problems,
            });
        })
        .catch((e: any) => logger.error('importJob draft counts ERROR', e?.message));
}

export function startOrJoinImportJob<T>({
    requestKey,
    contentKey,
    run,
}: {
    requestKey: string;
    contentKey: string;
    run: () => Promise<T>;
}): { status: ImportJobStatus; result?: T } {
    const existing = jobsByContentKey.get(contentKey);

    if (existing && (existing.status === "pending" || (Date.now() - (existing.settledAt || 0)) < COMPLETED_JOB_TTL_MS)) {
        existing.requestKeys.add(requestKey);
        logger.log('importJob joined existing job (not a restart)', { contentKey, requestKey, status: existing.status });
        return { status: existing.status, result: existing.result };
    }

    // This is a genuinely new run — no matching in-flight or recently-settled
    // job was found for this contentKey. Log the draft counts *before* any
    // work starts, so repeated "restarts" can be compared against each other.
    logDraftCounts('new run starting', contentKey, requestKey);

    const job: ImportJob<T> = {
        status: "pending",
        requestKeys: new Set([requestKey]),
    };
    jobsByContentKey.set(contentKey, job);

    let settled = false;
    const finalize = (status: "done" | "error", result: T) => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        job.status = status;
        job.result = result;
        job.settledAt = Date.now();
        job.requestKeys.forEach((key) => {
            broadcastImportJobComplete(key, job.result);
        });
        logDraftCounts(`run settled (${status})`, contentKey, requestKey);
        scheduleCleanup(contentKey, job);
    };

    const watchdog = setTimeout(() => {
        finalize("error", {
            success: false,
            errors: [
                `Import is taking longer than expected (over ${Math.round(MAX_JOB_DURATION_MS / 60000)} minutes) and may need manual investigation. It may still be running on the server — check with an admin before retrying.`,
            ],
        } as T);
    }, MAX_JOB_DURATION_MS);

    run()
        .then((result) => finalize("done", result))
        .catch((e: any) => finalize("error", { success: false, errors: [e?.message || "Import failed"] } as T));

    return { status: "pending" };
}
