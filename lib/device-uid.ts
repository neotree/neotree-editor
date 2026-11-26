// Rules that keep UIDs unique per tablet. Pure (no database) so they can be unit tested.
//
// A tablet's UID is its 4-character device hash plus a counter (total sessions recorded). The counter
// lives in the app's own database, which a reinstall or restore can wipe or roll back. The server keeps
// the highest count each tablet has reported and, when a tablet's own counter is behind it, tells the
// tablet to resume from that count plus a safety margin, so numbers are skipped but never reused.

/** Sessions a tablet may have recorded since its last upload without any number being reused. */
export const DEFAULT_UID_COUNTER_MARGIN = 500;

export function getUidCounterMargin(raw: string | undefined = process.env.UID_COUNTER_MARGIN): number {
    const n = Number(raw);
    return Number.isInteger(n) && n >= 0 ? n : DEFAULT_UID_COUNTER_MARGIN;
}

const count = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

/**
 * Details to store after a tablet reports. Other keys are merged, and the session count never goes
 * down: a late or stale upload cannot lower what the server already knows.
 */
export function mergeDeviceDetails<T extends { scripts_count?: number }>(
    existing: Partial<T> | null | undefined,
    incoming: Partial<T> | null | undefined,
): T {
    const merged = { ...(existing || {}), ...(incoming || {}) } as T;
    merged.scripts_count = Math.max(count(existing?.scripts_count), count(incoming?.scripts_count));
    return merged;
}

/**
 * Where a tablet whose own counter is behind the server's must resume. 0 when the server has not heard
 * of any session from this tablet, so a brand new tablet starts at 1 like it always did.
 */
export function getUidCounterFloor(scriptsCount: unknown, margin = getUidCounterMargin()): number {
    const n = count(scriptsCount);
    return n ? n + margin : 0;
}

// Device hashes are hex only (the app validates the prefix as hex), and never the shared "FB8E" the
// app used to fall back to.
export const DEVICE_HASH_ALPHABET = "0123456789ABCDEF";
export const RESERVED_DEVICE_HASHES = ["FB8E"];

function pick(chars: string, length: number, random: () => number) {
    let out = "";
    for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(random() * chars.length));
    return out;
}

/**
 * A device hash that `isTaken` says is free. First tries the tablet's own id characters (what the
 * hash has always been made from), then the full hex alphabet. Throws rather than return a taken hash.
 */
export async function generateUniqueDeviceHash(
    deviceId: string,
    isTaken: (hash: string) => Promise<boolean>,
    { length = 4, attempts = 100, random = Math.random }: { length?: number; attempts?: number; random?: () => number } = {},
): Promise<string> {
    const own = `${deviceId || ""}`.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
    for (let i = 0; i < attempts; i++) {
        const source = i < attempts / 4 && own.length ? own : DEVICE_HASH_ALPHABET;
        const hash = pick(source, length, random);
        if (RESERVED_DEVICE_HASHES.includes(hash)) continue;
        if (!(await isTaken(hash))) return hash;
    }
    throw new Error("Could not generate a unique device hash");
}
