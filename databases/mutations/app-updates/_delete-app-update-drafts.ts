import { eq } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { appUpdatePoliciesDrafts, apkReleasesDrafts } from "@/databases/pg/schema";

export async function _deleteAllAppUpdatePolicyDrafts(opts?: {
    userId?: string | null;
}): Promise<boolean> {
    await db
        .delete(appUpdatePoliciesDrafts)
        .where(!opts?.userId ? undefined : eq(appUpdatePoliciesDrafts.createdByUserId, opts.userId));

    return true;
}

export async function _deleteAllApkReleaseDrafts(opts?: {
    userId?: string | null;
}): Promise<boolean> {
    await db
        .delete(apkReleasesDrafts)
        .where(!opts?.userId ? undefined : eq(apkReleasesDrafts.createdByUserId, opts.userId));

    return true;
}
