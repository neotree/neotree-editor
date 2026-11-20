/**
 * Longest wait for one request to another editor (loading scripts, data keys, files). Without it a source
 * editor that stops answering kept an import waiting until the job's 20-minute watchdog.
 */
export const REMOTE_EDITOR_TIMEOUT_MS = (() => {
    const n = Math.floor(Number(process.env.REMOTE_EDITOR_TIMEOUT_MS));
    return Number.isFinite(n) && n > 0 ? n : 5 * 60 * 1000;
})();
