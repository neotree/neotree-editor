import socket from "./socket";

export const BROADCAST_ACTIONS_IN_PROGRESS = {
    loading_local_data: '1',
    loading_remote_datakeys: '2',
    loading_remote_scripts: '3',
    loading_remote_screens: '4',
    loading_remote_diagnoses: '5',
    loading_remote_problems: '6',
    loading_remote_dff: '7',
    uploading_remote_files: '8',
    saving_scripts: '9',
    saving_dff: '10',
    saving_data_keys: '11',
} as const;

export async function broadcastActionInProgress(
    requestKey: string,
    action: string,
    loading: boolean
) {
    // Created by server/index.js; plain `next dev` has no custom server.
    globalThis.socketEvents = globalThis.socketEvents || {};
    globalThis.socketEvents[requestKey] = globalThis.socketEvents[requestKey] || [];
    globalThis.socketEvents[requestKey].push([action, loading].join('__'));
    await new Promise(resolve => setTimeout(resolve, 0));
    socket.emit('in_progress', requestKey, action, loading);
}

// A dedicated event name (distinct from the boolean-valued keys above) used
// to signal that a background import job has settled, over the same
// per-requestKey socket channel used for progress.
//
// This intentionally carries NO import data — the socket.io server relays
// every event via an unauthenticated, global `io.emit(...)` (see
// server/index.js), so anything broadcast here is readable by any connected
// client, not just the requester. The signal only tells the frontend to go
// fetch the real result over the existing authenticated HTTP endpoint
// (POST /api/scripts/copy, gated by session auth), the same way the
// fallback poll in scripts-import-modal.tsx already does.
export const IMPORT_JOB_COMPLETE_EVENT = 'import_job_complete';

export async function broadcastImportJobComplete(requestKey: string) {
    await new Promise(resolve => setTimeout(resolve, 0));
    socket.emit('in_progress', requestKey, IMPORT_JOB_COMPLETE_EVENT, true);
}

// Stages of a data key save (and its preview), reported on the same channel as
// import progress. Like import, only stage names and counts are sent — never data.
export const DATA_KEY_SAVE_PROGRESS = {
    checking: 'dks_checking',
    unlinking: 'dks_unlinking',
    finding: 'dks_finding',
    loading: 'dks_loading',
    updating: 'dks_updating',
    conditions: 'dks_conditions',
    recording: 'dks_recording',
} as const;

export type DataKeySaveProgressStep = keyof typeof DATA_KEY_SAVE_PROGRESS;

/** A step's count rides in the action name: "<step>#<done>/<total>". */
export function parseProgressAction(action: string) {
    const [key, count] = `${action || ''}`.split('#');
    const [done, total] = `${count || ''}`.split('/').map(Number);
    return { key, done: Number.isFinite(done) ? done : undefined, total: Number.isFinite(total) ? total : undefined };
}

/**
 * Reports the stages of a long operation to the client that started it.
 * Without a requestKey it does nothing, so callers can always use it.
 */
export function createProgressReporter(requestKey?: string | null) {
    let current: string | null = null;
    let lastCountAt = 0;
    const send = (action: string, active: boolean) => {
        if (!requestKey) return;
        void broadcastActionInProgress(requestKey, action, active).catch(() => {});
    };
    return {
        step(step: DataKeySaveProgressStep) {
            const key = DATA_KEY_SAVE_PROGRESS[step];
            if (current === key) return;
            if (current) send(current, false);
            current = key;
            send(key, true);
        },
        /** "12 of 40" for the current step; throttled, but the last count always goes out. */
        count(step: DataKeySaveProgressStep, done: number, total: number) {
            const now = Date.now();
            if (done < total && now - lastCountAt < 400) return;
            lastCountAt = now;
            send(`${DATA_KEY_SAVE_PROGRESS[step]}#${done}/${total}`, true);
        },
        finish() {
            if (current) send(current, false);
            current = null;
            // Keep the record a little longer for the client's last poll, then drop it.
            if (requestKey) {
                setTimeout(() => {
                    if (globalThis.socketEvents) delete globalThis.socketEvents[requestKey];
                }, 60 * 1000).unref?.();
            }
        },
    };
}
