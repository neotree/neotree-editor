import queryString from "query-string";

import logger from "@/lib/logger";
import { getSiteAxiosClient } from "@/lib/server/axios";
import { getContentSyncSettings } from "@/lib/server/content-sync";
import { _getSite } from "@/databases/queries/sites/_get-sites";
import { _findDataKeyNameLabelMatches } from "@/databases/queries/data-keys/_find-name-label-matches";
import { checkDataKeyDuplicates, type DataKeyDuplicateReport, type ExistingDataKey } from "@/lib/data-key-duplicate-check";


// The linked library is fetched whole (its API can't filter by label) and kept
// for a short while, so checking as someone types doesn't call it every time.
const LINKED_CACHE_MS = 2 * 60 * 1000;
const linkedCache = new Map<string, { at: number; keys: ExistingDataKey[]; }>();

async function loadLinkedDataKeys(siteId: string): Promise<ExistingDataKey[]> {
    const cached = linkedCache.get(siteId);
    if (cached && Date.now() - cached.at < LINKED_CACHE_MS) return cached.keys;

    const client = await getSiteAxiosClient(siteId);
    // The other editor's published library (as an import reads it).
    const res = await client.get<{ data?: any[]; errors?: string[]; }>('/api/data-keys?' + queryString.stringify({
        returnDraftsIfExist: false,
        data: JSON.stringify({ returnDraftsIfExist: false }),
    }), { timeout: 20 * 1000 });
    if (res.data?.errors?.length) throw new Error(res.data.errors[0]);

    const keys = (res.data?.data || [])
        .filter((key) => key && !key.isDeleted)
        .map((key) => ({ uuid: key.uuid, uniqueKey: key.uniqueKey, name: key.name, label: key.label, dataType: key.dataType }));
    linkedCache.set(siteId, { at: Date.now(), keys });
    return keys;
}

/**
 * Same key / same label checks for a data key being created or renamed, in
 * this library and in the linked editor's. The linked editor being unreachable
 * is reported, never treated as a duplicate.
 */
export async function checkDataKeyDuplicatesEverywhere({
    name,
    label,
    excludeUuid,
}: {
    name?: string | null;
    label?: string | null;
    excludeUuid?: string | null;
}): Promise<DataKeyDuplicateReport> {
    const localMatches = await _findDataKeyNameLabelMatches({ name, label });
    if (localMatches.errors?.length) throw new Error(localMatches.errors[0]);
    const report: DataKeyDuplicateReport = {
        local: checkDataKeyDuplicates({ name, label, existing: localMatches.data, excludeUuid }),
    };

    const settings = await getContentSyncSettings();
    if (settings.role === "off" || !settings.linkedSiteId) return report;

    const site = await _getSite({ siteId: settings.linkedSiteId }).catch(() => null);
    const siteName = (site as any)?.data?.name || "linked editor";
    try {
        const linkedKeys = await loadLinkedDataKeys(settings.linkedSiteId);
        // The same key synced across editors keeps its uuid: it never conflicts with itself.
        report.linked = { siteName, check: checkDataKeyDuplicates({ name, label, existing: linkedKeys, excludeUuid }) };
    } catch (e: any) {
        logger.error("checkDataKeyDuplicatesEverywhere linked editor ERROR", e?.message);
        report.linked = { siteName, error: `Couldn't check the ${siteName} library: ${e?.message || "no response"}.` };
    }
    return report;
}
