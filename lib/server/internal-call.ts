import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Server actions are callable from the browser, so their arguments can't be trusted to say where a change
 * comes from. A `draftOrigin` other than "editor" (an import, a data-key sync) lifts the content-sync lock
 * and the stale-save check, so it only counts when this server itself is running that operation (inside
 * `runAsInternalCall`), or when another editor calls with an API key. Anything else is an editor change.
 */
const internalCall = new AsyncLocalStorage<true>();

export function runAsInternalCall<T>(fn: () => Promise<T>): Promise<T> {
    return internalCall.run(true, fn);
}

export function isInternalCall() {
    return internalCall.getStore() === true;
}

export function trustedDraftOrigin<T extends string>(
    draftOrigin: T | null | undefined,
    session?: { viaApiKey?: boolean } | null,
): T | "editor" | undefined {
    if (!draftOrigin || draftOrigin === "editor") return draftOrigin || undefined;
    return (isInternalCall() || session?.viaApiKey) ? draftOrigin : "editor";
}
