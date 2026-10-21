import { createHash } from "crypto";

import { fileRefIdentity } from "./file-ref";

/**
 * Content fingerprints for content sync (see lib/content-sync.ts). Server-side only (node crypto).
 *
 * The fingerprint is PORTABLE: the same script content gives the same fingerprint on both editors even
 * when its ids differ (scripts imported before ids were kept the same). Ids are left out and references
 * between entities (skip-to screen, print sections, review screens, selection rules) are written as
 * positions instead. Data key links (keyId) are kept: keys keep their uniqueKey across editors.
 */

/**
 * Bumped whenever what counts as content changes. Sync points recorded with another version are not
 * compared (lib/content-sync.ts), so a rule change never shows false drift.
 */
// v2: images are compared by file name and size (v1 used the file id, which differs after an import copy)
export const FINGERPRINT_VERSION = "v2";

// Row bookkeeping and per-editor state: never content.
const IGNORED = new Set([
    "id",
    "createdAt",
    "updatedAt",
    "publishDate",
    "deletedAt",
    "isDraft",
    "isDeleted",
    "version",
    "position",
    "draftCreatedByUserId",
    "scriptTitle",
    "hospitalName",
    "hospitalId",
    "draft",
    "revision",
    "baseRevision",
    "conditionErrorReport",
    "hasChangedItems",
    "hasDeletedItems",
    "hasDraftedScreens",
    "hasDraftedDiagnoses",
    "hasDraftedProblems",
    "itemsChangedByUserId",
    "itemsDeletedByUserId",
    "screensDraftsCreatedByUserId",
    "diagnosesDraftsCreatedByUserId",
    "problemsDraftsCreatedByUserId",
    "aliases",
    "lastAlias",
    // ids (references are rewritten as positions below)
    "scriptId",
    "oldScriptId",
    "screenId",
    "oldScreenId",
    "diagnosisId",
    "oldDiagnosisId",
    "problemId",
    "itemId",
    "fieldId",
    "symptomId",
    "sectionId",
]);
const FILE_KEYS = new Set(["image1", "image2", "image3", "contentTextImage"]);

// Values that mean "not set". Saving fills in defaults (e.g. forbidWith: [] on options, false flags)
// that the other editor's copy may not have yet; they must not read as a difference.
function isEmptyValue(value: unknown) {
    return value === null
        || value === undefined
        || value === ""
        || value === false
        || (Array.isArray(value) && value.length === 0)
        || (!!value && typeof value === "object" && !(value instanceof Date) && !Array.isArray(value) && Object.keys(value).length === 0);
}

function canonical(value: unknown): string {
    if (isEmptyValue(value)) return "null";
    if (value instanceof Date) return "null";
    if (Array.isArray(value)) return `[${value.map(v => canonical(v)).join(",")}]`;
    if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj)
            .filter(k => !IGNORED.has(k))
            .filter(k => !isEmptyValue(obj[k]) && canonical(obj[k]) !== "null")
            .sort();
        return `{${keys.map(k => {
            const v = obj[k];
            // the same file has a different id and URL on each editor: compare what it is (name and size)
            const normalized = FILE_KEYS.has(k) && v && typeof v === "object" ? { file: fileRefIdentity(v) } : v;
            return `${JSON.stringify(k)}:${canonical(normalized)}`;
        }).join(",")}}`;
    }
    return JSON.stringify(value);
}

/** Selection rules (forbidWith) point at item ids: write them as item positions. */
function itemsWithPortableRefs(items: any[] = []) {
    const index = new Map(items.map((item, i) => [`${item?.itemId}`, i]));
    return items.map(item => (Array.isArray(item?.forbidWith)
        ? { ...item, forbidWith: item.forbidWith.map((id: string) => index.has(`${id}`) ? `#${index.get(`${id}`)}` : null).filter(Boolean).sort() }
        : item));
}

/** Fingerprint of one script's published content (comparable between editors). */
export function computeScriptFingerprint({
    script,
    screens = [],
    diagnoses = [],
    problems = [],
}: {
    script: Record<string, any>;
    screens?: Record<string, any>[];
    diagnoses?: Record<string, any>[];
    problems?: Record<string, any>[];
}) {
    const byPosition = (a: Record<string, any>, b: Record<string, any>) => (Number(a.position) || 0) - (Number(b.position) || 0);
    const orderedScreens = [...screens].sort(byPosition);
    const screenIndex = new Map<string, number>();
    orderedScreens.forEach((s, i) => {
        if (s.screenId) screenIndex.set(`${s.screenId}`, i);
        if (s.oldScreenId) screenIndex.set(`${s.oldScreenId}`, i);
    });
    const screenRef = (id: any) => (id && screenIndex.has(`${id}`) ? `#${screenIndex.get(`${id}`)}` : id ? "?" : null);

    const portableScript = {
        ...script,
        printSections: (script.printSections || []).map((p: any) => ({ ...p, screensIds: (p.screensIds || []).map(screenRef) })),
        reviewConfigurations: (script.reviewConfigurations || []).map((c: any) => ({ ...c, screen: screenRef(c.screen) })),
    };
    const portableScreens = orderedScreens.map(s => ({
        ...s,
        skipToScreenId: screenRef(s.skipToScreenId),
        items: itemsWithPortableRefs(s.items || []),
        fields: (s.fields || []).map((f: any) => ({ ...f, items: itemsWithPortableRefs(f.items || []) })),
    }));

    const body = [
        canonical(portableScript),
        canonical(portableScreens),
        canonical([...diagnoses].sort(byPosition)),
        canonical([...problems].sort(byPosition)),
    ].join("|");
    return `${FINGERPRINT_VERSION}:${createHash("sha1").update(body).digest("hex")}`;
}

/** One screen, diagnosis or problem, fingerprinted on its own (to show which ones differ). */
export type EntityFingerprint = {
    id: string;
    /** Matches the same entity on the other editor when ids differ and no import recorded the pairing. */
    natural: string;
    label: string;
    fingerprint: string;
};

export type ScriptEntityFingerprints = {
    screens: EntityFingerprint[];
    diagnoses: EntityFingerprint[];
    problems: EntityFingerprint[];
};

/**
 * Per-entity fingerprints of one script's published content, with the same portable rules as the script
 * fingerprint (ids dropped, references as positions, empty = unset). Position alone is not a difference.
 */
export function computeEntityFingerprints({
    screens = [],
    diagnoses = [],
    problems = [],
}: {
    screens?: Record<string, any>[];
    diagnoses?: Record<string, any>[];
    problems?: Record<string, any>[];
}): ScriptEntityFingerprints {
    const byPosition = (a: Record<string, any>, b: Record<string, any>) => (Number(a.position) || 0) - (Number(b.position) || 0);
    const orderedScreens = [...screens].sort(byPosition);
    const screenIndex = new Map<string, number>();
    orderedScreens.forEach((s, i) => {
        if (s.screenId) screenIndex.set(`${s.screenId}`, i);
        if (s.oldScreenId) screenIndex.set(`${s.oldScreenId}`, i);
    });
    const screenRef = (id: any) => (id && screenIndex.has(`${id}`) ? `#${screenIndex.get(`${id}`)}` : id ? "?" : null);
    const hash = (value: unknown) => createHash("sha1").update(canonical(value)).digest("hex");
    const norm = (...parts: unknown[]) => parts.map(p => `${p || ""}`.trim().toLowerCase()).join("|");

    return {
        screens: orderedScreens.map(s => ({
            id: `${s.screenId}`,
            natural: norm(s.type, s.refId, s.title),
            label: s.title || s.label || s.refId || "",
            fingerprint: hash({
                ...s,
                skipToScreenId: screenRef(s.skipToScreenId),
                items: itemsWithPortableRefs(s.items || []),
                fields: (s.fields || []).map((f: any) => ({ ...f, items: itemsWithPortableRefs(f.items || []) })),
            }),
        })),
        diagnoses: [...diagnoses].sort(byPosition).map(d => ({
            id: `${d.diagnosisId}`,
            natural: norm(d.key, d.name),
            label: d.name || d.key || "",
            fingerprint: hash(d),
        })),
        problems: [...problems].sort(byPosition).map(p => ({
            id: `${p.problemId}`,
            natural: norm(p.key, p.name),
            label: p.name || p.key || "",
            fingerprint: hash(p),
        })),
    };
}
