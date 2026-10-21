/**
 * Content sync between two editors (e.g. DEV and LIVE).
 *
 * One editor is the SOURCE: scripts, data keys and the drugs library are edited there. The other is the
 * TARGET: it receives that content by importing it, and its content is locked for editing. An admin can
 * open a hotfix on one target script for an emergency change; the change then has to be brought back to
 * the source (the source imports it from the target), which the sync status keeps visible.
 *
 * Sync is per script. Each script is compared only with its counterpart on the other editor: nothing
 * editor-wide (data versions, how often either editor publishes, other scripts) is part of it. DEV
 * publishing far more often than LIVE is expected and never shows as drift by itself.
 *
 * Sync status is computed from content fingerprints that are comparable between the two editors
 * (lib/content-sync-fingerprint.ts). Equal fingerprints mean the published scripts are the same. When they
 * differ, the most recent "sync point" says which side moved: every import, once published, records the
 * fingerprint of the content it imported and of the importing editor's published content right after.
 *
 * Everything in this file is pure (no database or network access) and shared by server and client.
 */

/* ------------------------------------------------------------------------------------------------ */
/* Settings                                                                                         */
/* ------------------------------------------------------------------------------------------------ */

export type ContentSyncRole = "off" | "source" | "target";

export type ContentSyncSettings = {
    /** off: no syncing rules (as before). source: content is edited here. target: content comes from the source. */
    role: ContentSyncRole;
    /** The other editor (a row in Sites): the target when this is the source, the source when this is the target. */
    linkedSiteId: string | null;
    /** On the target: which content can only be changed by importing from the source. */
    lock: {
        scripts: boolean;
        dataKeys: boolean;
        drugsLibrary: boolean;
    };
    /** On the target: admins may open a hotfix on one script to change it here in an emergency. */
    hotfixes: {
        enabled: boolean;
        /** While a hotfix is open, admins may also change data keys and the drugs library. */
        allowLibraryEdits: boolean;
    };
    /** Promote with the same ids on both editors (scripts, screens, diagnoses, problems) when they are free. */
    keepSameIds: boolean;
    /** Show sync status badges and the out-of-sync indicator. */
    showStatus: boolean;
};

export const DEFAULT_CONTENT_SYNC_SETTINGS: ContentSyncSettings = {
    role: "off",
    linkedSiteId: null,
    lock: { scripts: true, dataKeys: true, drugsLibrary: true },
    hotfixes: { enabled: true, allowLibraryEdits: true },
    keepSameIds: true,
    showStatus: true,
};

export function normalizeContentSyncSettings(input?: Partial<ContentSyncSettings> | null): ContentSyncSettings {
    const value = (input || {}) as Partial<ContentSyncSettings>;
    const role: ContentSyncRole = value.role === "source" || value.role === "target" ? value.role : "off";
    const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
    return {
        role,
        linkedSiteId: typeof value.linkedSiteId === "string" && value.linkedSiteId.trim() ? value.linkedSiteId.trim() : null,
        lock: {
            scripts: bool(value.lock?.scripts, DEFAULT_CONTENT_SYNC_SETTINGS.lock.scripts),
            dataKeys: bool(value.lock?.dataKeys, DEFAULT_CONTENT_SYNC_SETTINGS.lock.dataKeys),
            drugsLibrary: bool(value.lock?.drugsLibrary, DEFAULT_CONTENT_SYNC_SETTINGS.lock.drugsLibrary),
        },
        hotfixes: {
            enabled: bool(value.hotfixes?.enabled, DEFAULT_CONTENT_SYNC_SETTINGS.hotfixes.enabled),
            allowLibraryEdits: bool(value.hotfixes?.allowLibraryEdits, DEFAULT_CONTENT_SYNC_SETTINGS.hotfixes.allowLibraryEdits),
        },
        keepSameIds: bool(value.keepSameIds, DEFAULT_CONTENT_SYNC_SETTINGS.keepSameIds),
        showStatus: bool(value.showStatus, DEFAULT_CONTENT_SYNC_SETTINGS.showStatus),
    };
}

/* ------------------------------------------------------------------------------------------------ */
/* Editing lock                                                                                     */
/* ------------------------------------------------------------------------------------------------ */

export type ContentArea = "scripts" | "dataKeys" | "drugsLibrary";

export type OpenHotfix = {
    scriptId: string;
    reason?: string | null;
    openedAt?: string | null;
    openedByUserId?: string | null;
    openedByName?: string | null;
};

const AREA_LABELS: Record<ContentArea, string> = {
    scripts: "Scripts",
    dataKeys: "Data keys",
    drugsLibrary: "The drugs, fluids & feeds library",
};

/**
 * Whether a change to content is allowed on this editor. Returns null when allowed, or the reason it is
 * not. `scriptIds` are the scripts the change touches (for the scripts area).
 */
export function getContentLockReason({
    settings,
    area,
    scriptIds = [],
    hotfixes = [],
    userRole,
}: {
    settings: ContentSyncSettings;
    area: ContentArea;
    scriptIds?: string[];
    hotfixes?: OpenHotfix[];
    userRole?: string | null;
}): string | null {
    if (settings.role !== "target" || !settings.lock[area]) return null;

    const isAdmin = userRole === "admin" || userRole === "super_user";
    const open = new Set(hotfixes.map(h => h.scriptId));

    if (settings.hotfixes.enabled) {
        if (area === "scripts") {
            const ids = scriptIds.filter(Boolean);
            if (ids.length && ids.every(id => open.has(id))) return null;
        } else if (settings.hotfixes.allowLibraryEdits && isAdmin && open.size) {
            return null;
        }
    }

    const how = settings.hotfixes.enabled
        ? (area === "scripts"
            ? " Make the change on the source editor and import it here, or ask an admin to open a hotfix on the script."
            : " Make the change on the source editor and import it here.")
        : " Make the change on the source editor and import it here.";
    return `${AREA_LABELS[area]} on this editor come from the source editor and cannot be edited here.${how}`;
}

/* ------------------------------------------------------------------------------------------------ */
/* Sync status                                                                                      */
/* ------------------------------------------------------------------------------------------------ */

/** What one editor reports about its scripts and the imports it has made. */
export type ContentSyncState = {
    role: ContentSyncRole;
    scripts: { scriptId: string; title: string; fingerprint: string; hasDrafts: boolean }[];
    /** Imports into this editor: target = a script here, source = a script on the other editor. */
    records: {
        targetScriptId: string;
        sourceScriptId: string;
        /** Fingerprint of the source content at the last published import (null for old records). */
        sourceFingerprint: string | null;
        /** Fingerprint of this editor's published content right after that import was published. */
        targetFingerprint: string | null;
        syncedAt: string | null;
        /** An import saved as drafts here that is not published yet. */
        pending: boolean;
    }[];
    hotfixes: OpenHotfix[];
};

export type ContentSyncStatus =
    | "in_sync"
    | "source_ahead"
    | "target_ahead"
    | "diverged"
    | "pending"
    | "never_synced"
    | "only_on_source"
    | "only_on_target"
    /**
     * The two editors run different builds of the editor software, which fingerprint content differently
     * (e.g. one was deployed before the other). Not about data versions: those never match between editors
     * and play no part in content sync.
     */
    | "cannot_compare";

export type ContentSyncPair = {
    status: ContentSyncStatus;
    sourceScriptId: string | null;
    targetScriptId: string | null;
    sourceTitle: string | null;
    targetTitle: string | null;
    /** Where an import is waiting to be published, when status is pending. */
    pendingOn?: "source" | "target";
    hotfix?: OpenHotfix | null;
    syncedAt?: string | null;
    /** How the pair was linked: a recorded import, or (never synced) the same id / title on both. */
    linkedBy: "import" | "same_id" | "same_title" | "none";
};

export const CONTENT_SYNC_STATUS_LABELS: Record<ContentSyncStatus, string> = {
    in_sync: "In sync",
    source_ahead: "Source ahead",
    target_ahead: "Target ahead",
    diverged: "Diverged",
    pending: "Import not published",
    never_synced: "Not synced yet",
    only_on_source: "Only on source",
    only_on_target: "Only on target",
    cannot_compare: "Can't compare yet: update both editors",
};

/**
 * Pair the source's and the target's scripts and say how each pair stands.
 * Sync points come from both editors: imports into the target (source -> target) and back-ports into the
 * source (target -> source). The most recent one is the reference.
 */
const fingerprintVersion = (fp?: string | null) => (`${fp || ""}`.includes(":") ? `${fp}`.split(":")[0] : "");

export function computeContentSyncPairs({ source, target }: { source: ContentSyncState; target: ContentSyncState; }): ContentSyncPair[] {
    const sourceScripts = new Map(source.scripts.map(s => [s.scriptId, s]));
    const targetScripts = new Map(target.scripts.map(s => [s.scriptId, s]));
    const hotfixes = new Map(target.hotfixes.map(h => [h.scriptId, h]));

    // direction: "to_target" = the target imported from the source; "to_source" = a back-port
    type Point = { sourceFp: string | null; targetFp: string | null; at: number; pending: boolean; pendingOn: "source" | "target"; direction: "to_target" | "to_source" };
    const points = new Map<string, Point[]>(); // key: sourceId|targetId
    const add = (sourceId: string, targetId: string, point: Point) => {
        const key = `${sourceId}|${targetId}`;
        points.set(key, [...(points.get(key) || []), point]);
    };
    // imports into the target: their "source" is the source editor
    target.records.forEach(r => add(r.sourceScriptId, r.targetScriptId, {
        sourceFp: r.sourceFingerprint,
        targetFp: r.targetFingerprint,
        at: r.syncedAt ? new Date(r.syncedAt).getTime() : 0,
        pending: r.pending,
        pendingOn: "target",
        direction: "to_target",
    }));
    // back-ports into the source: their "source" is the target editor
    source.records.forEach(r => add(r.targetScriptId, r.sourceScriptId, {
        sourceFp: r.targetFingerprint,
        targetFp: r.sourceFingerprint,
        at: r.syncedAt ? new Date(r.syncedAt).getTime() : 0,
        pending: r.pending,
        pendingOn: "source",
        direction: "to_source",
    }));

    const pairs: ContentSyncPair[] = [];
    const pairedSource = new Set<string>();
    const pairedTarget = new Set<string>();

    // A script can be linked to only one script on the other side; the most recent link wins. Links are
    // visited newest first: an import still in drafts is the newest, then by the latest sync time.
    const recency = (list: Point[]) => Math.max(...list.map(p => (p.pending ? Number.MAX_SAFE_INTEGER : p.at)));
    const links = Array.from(points.entries()).sort((a, b) => recency(b[1]) - recency(a[1]));

    links.forEach(([key, list]) => {
        const [sourceId, targetId] = key.split("|");
        const s = sourceScripts.get(sourceId);
        const t = targetScripts.get(targetId);
        if (!s && !t) return;
        if (pairedSource.has(sourceId) || pairedTarget.has(targetId)) return;
        pairedSource.add(sourceId);
        pairedTarget.add(targetId);

        // sync points from another fingerprint version cannot be compared (lib/content-sync-fingerprint.ts)
        const version = (fp?: string | null) => (`${fp || ""}`.includes(":") ? `${fp}`.split(":")[0] : "");
        const synced = list
            .filter(p => p.at > 0 && p.sourceFp && p.targetFp)
            .filter(p => version(p.sourceFp) === version(s?.fingerprint) && version(p.targetFp) === version(t?.fingerprint))
            .sort((a, b) => b.at - a.at)[0];
        const pending = list.find(p => p.pending);
        const base = {
            sourceScriptId: s ? sourceId : null,
            targetScriptId: t ? targetId : null,
            sourceTitle: s?.title ?? null,
            targetTitle: t?.title ?? null,
            hotfix: hotfixes.get(targetId) || null,
            syncedAt: synced ? new Date(synced.at).toISOString() : null,
            linkedBy: "import" as const,
        };
        if (!s) { pairs.push({ ...base, status: "only_on_target" }); return; }
        if (!t) { pairs.push({ ...base, status: "only_on_source" }); return; }
        if (pending) { pairs.push({ ...base, status: "pending", pendingOn: pending.pendingOn }); return; }
        if (version(s.fingerprint) !== version(t.fingerprint)) { pairs.push({ ...base, status: "cannot_compare" }); return; }
        if (s.fingerprint === t.fingerprint) { pairs.push({ ...base, status: "in_sync" }); return; }
        if (!synced) { pairs.push({ ...base, status: "never_synced" }); return; }
        const sourceChanged = s.fingerprint !== synced.sourceFp;
        const targetChanged = t.fingerprint !== synced.targetFp;
        // Neither changed since the last sync, yet they differ: the importing side kept something of its
        // own (e.g. options that only LIVE had, or an unreleased DEV change during a back-port).
        const status: ContentSyncStatus = sourceChanged && targetChanged ? "diverged"
            : sourceChanged ? "source_ahead"
                : targetChanged ? "target_ahead"
                    : synced.direction === "to_target" ? "target_ahead" : "source_ahead";
        pairs.push({ ...base, status });
    });

    // Scripts never imported either way: link by identical id, then by a unique identical title.
    const normalizeTitle = (t?: string | null) => `${t || ""}`.trim().toLowerCase();
    const unpairedTarget = target.scripts.filter(t => !pairedTarget.has(t.scriptId));
    const targetsByTitle = new Map<string, typeof unpairedTarget>();
    unpairedTarget.forEach(t => targetsByTitle.set(normalizeTitle(t.title), [...(targetsByTitle.get(normalizeTitle(t.title)) || []), t]));

    source.scripts.filter(s => !pairedSource.has(s.scriptId)).forEach(s => {
        let t = targetScripts.get(s.scriptId);
        let linkedBy: ContentSyncPair["linkedBy"] = "same_id";
        if (!t || pairedTarget.has(t.scriptId)) {
            const sameTitle = (targetsByTitle.get(normalizeTitle(s.title)) || []).filter(x => !pairedTarget.has(x.scriptId));
            t = sameTitle.length === 1 ? sameTitle[0] : undefined;
            linkedBy = "same_title";
        }
        if (!t) {
            pairedSource.add(s.scriptId);
            pairs.push({ status: "only_on_source", sourceScriptId: s.scriptId, targetScriptId: null, sourceTitle: s.title, targetTitle: null, linkedBy: "none" });
            return;
        }
        pairedSource.add(s.scriptId);
        pairedTarget.add(t.scriptId);
        pairs.push({
            status: fingerprintVersion(s.fingerprint) !== fingerprintVersion(t.fingerprint) ? "cannot_compare"
                : s.fingerprint === t.fingerprint ? "in_sync" : "never_synced",
            sourceScriptId: s.scriptId,
            targetScriptId: t.scriptId,
            sourceTitle: s.title,
            targetTitle: t.title,
            hotfix: hotfixes.get(t.scriptId) || null,
            linkedBy,
        });
    });
    target.scripts.filter(t => !pairedTarget.has(t.scriptId)).forEach(t => {
        pairs.push({ status: "only_on_target", sourceScriptId: null, targetScriptId: t.scriptId, sourceTitle: null, targetTitle: t.title, hotfix: hotfixes.get(t.scriptId) || null, linkedBy: "none" });
    });

    const order: ContentSyncStatus[] = ["diverged", "target_ahead", "pending", "source_ahead", "never_synced", "only_on_target", "only_on_source", "cannot_compare", "in_sync"];
    return pairs.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status)
        || `${a.sourceTitle || a.targetTitle}`.localeCompare(`${b.sourceTitle || b.targetTitle}`));
}

/** Statuses that need someone to act. */
export function isOutOfSync(status: ContentSyncStatus) {
    return status === "source_ahead" || status === "target_ahead" || status === "diverged" || status === "pending" || status === "never_synced";
}

/* ------------------------------------------------------------------------------------------------ */
/* Which screens, diagnoses and problems of a script differ from its counterpart                    */
/* ------------------------------------------------------------------------------------------------ */

type EntityLike = { id: string; natural: string; label: string; fingerprint: string; };
type ScriptEntitiesLike = {
    scriptId: string;
    screens: EntityLike[];
    diagnoses: EntityLike[];
    problems: EntityLike[];
    importIdMap: { sourceScriptId: string; screens: Record<string, string>; diagnoses: Record<string, string>; problems: Record<string, string>; } | null;
};

export type EntityKindDiff = {
    /** Ids here whose content differs from their counterpart. */
    changed: string[];
    /** Ids here with no counterpart on the other editor. */
    onlyHere: string[];
    /** Titles of entities the other editor has and this one doesn't. */
    onlyThere: string[];
    /** Titles of `changed` and `onlyHere`, for listing them. */
    changedLabels: string[];
    onlyHereLabels: string[];
};

export type ScriptEntitiesDiff = {
    screens: EntityKindDiff;
    diagnoses: EntityKindDiff;
    problems: EntityKindDiff;
    /** Number of entities here that differ or exist only here. */
    total: number;
};

/**
 * Pairs a script's entities with its counterpart's and lists those that differ. Pairing uses, in order,
 * the id map of the import between the two scripts (whichever editor recorded it), identical ids, then
 * type/ref/title (screens) or key/name (diagnoses, problems) when that is unambiguous.
 */
export function diffScriptEntities({ local, remote }: { local: ScriptEntitiesLike; remote: ScriptEntitiesLike; }): ScriptEntitiesDiff {
    // remote id -> local id
    const mapFor = (kind: "screens" | "diagnoses" | "problems"): Map<string, string> => {
        if (local.importIdMap?.sourceScriptId === remote.scriptId) return new Map(Object.entries(local.importIdMap[kind] || {}));
        if (remote.importIdMap?.sourceScriptId === local.scriptId) {
            return new Map(Object.entries(remote.importIdMap[kind] || {}).map(([localId, remoteId]) => [remoteId, localId] as [string, string]));
        }
        return new Map();
    };
    const diffKind = (kind: "screens" | "diagnoses" | "problems"): EntityKindDiff => {
        const idMap = mapFor(kind);
        const localById = new Map(local[kind].map(e => [e.id, e]));
        const localByNatural = new Map<string, EntityLike[]>();
        local[kind].forEach(e => localByNatural.set(e.natural, [...(localByNatural.get(e.natural) || []), e]));
        const paired = new Set<string>();
        const changed: string[] = [];
        const onlyThere: string[] = [];
        const take = (e?: EntityLike) => (e && !paired.has(e.id) ? e : undefined);
        // the most reliable pairings first, so heuristics never claim an entity a recorded pairing needs
        const pairs = new Map<EntityLike, EntityLike>();
        remote[kind].forEach(r => { const l = take(localById.get(idMap.get(r.id) || "")); if (l) { paired.add(l.id); pairs.set(r, l); } });
        remote[kind].forEach(r => { if (pairs.has(r)) return; const l = take(localById.get(r.id)); if (l) { paired.add(l.id); pairs.set(r, l); } });
        remote[kind].forEach(r => {
            if (pairs.has(r)) return;
            const candidates = (localByNatural.get(r.natural) || []).filter(e => !paired.has(e.id));
            if (r.natural.replace(/\|/g, "") && candidates.length === 1) { paired.add(candidates[0].id); pairs.set(r, candidates[0]); }
        });
        remote[kind].forEach(r => {
            const l = pairs.get(r);
            if (!l) onlyThere.push(r.label || r.natural);
            else if (l.fingerprint !== r.fingerprint) changed.push(l.id);
        });
        const onlyHereEntities = local[kind].filter(e => !paired.has(e.id));
        const labelOf = (id: string) => localById.get(id)?.label || localById.get(id)?.natural || id;
        return {
            changed,
            onlyHere: onlyHereEntities.map(e => e.id),
            onlyThere,
            changedLabels: changed.map(labelOf),
            onlyHereLabels: onlyHereEntities.map(e => e.label || e.natural || e.id),
        };
    };
    const screens = diffKind("screens");
    const diagnoses = diffKind("diagnoses");
    const problems = diffKind("problems");
    const count = (d: EntityKindDiff) => d.changed.length + d.onlyHere.length;
    return { screens, diagnoses, problems, total: count(screens) + count(diagnoses) + count(problems) };
}
