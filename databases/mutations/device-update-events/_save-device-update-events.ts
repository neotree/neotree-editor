import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { deviceRolloutStates, deviceUpdateEvents } from "@/databases/pg/schema";

export type SaveDeviceUpdateEventsData = typeof deviceUpdateEvents.$inferInsert;

export type SaveDeviceUpdateEventsResponse = {
    success: boolean;
    inserted: (typeof deviceUpdateEvents.$inferSelect)[];
    errors?: string[];
};

export async function _saveDeviceUpdateEvents({ data, returnSaved }: {
    data: SaveDeviceUpdateEventsData[];
    returnSaved?: boolean;
}): Promise<SaveDeviceUpdateEventsResponse> {
    const response: SaveDeviceUpdateEventsResponse = { success: false, inserted: [] };

    try {
        const q = db.insert(deviceUpdateEvents).values(data).onConflictDoNothing({
            target: deviceUpdateEvents.eventId,
        });

        if (returnSaved) {
            const inserted = await q.returning();
            response.inserted = inserted;
        } else {
            await q.execute();
        }

        response.success = true;
    } catch (e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveDeviceUpdateEvents ERROR', e.message);
    }

    return response;
}

type RolloutState = typeof deviceRolloutStates.$inferInsert["rolloutState"];

function mapEventToRolloutState(eventType: string): RolloutState | null {
    const normalized = eventType.toLowerCase();
    if (normalized.includes("policy") && normalized.includes("seen")) return "policy_seen";
    if (normalized.includes("mdm") && normalized.includes("push") && normalized.includes("ack")) return "mdm_push_acknowledged";
    if (normalized.includes("mdm") && normalized.includes("push")) return "mdm_push_requested";
    if (normalized === "apk_downloaded" || normalized.includes("downloaded")) return "download_completed";
    if (normalized.includes("download") && normalized.includes("complete")) return "download_completed";
    if (normalized.includes("download") && normalized.includes("start")) return "download_started";
    if (normalized === "apk_installed" || normalized.includes("installed")) return "installed";
    if (normalized.includes("install") && (normalized.includes("complete") || normalized.includes("success"))) return "installed";
    if (normalized.includes("install") && normalized.includes("start")) return "install_started";
    if (normalized.includes("rollback")) return "rolled_back";
    if (normalized.includes("fail") || normalized.includes("error")) return "failed";
    return null;
}

export async function _upsertDeviceRolloutStateFromEvent(event: SaveDeviceUpdateEventsData) {
    if (!event.deviceId || !event.apkReleaseId) return;

    const rolloutState = mapEventToRolloutState(event.eventType);
    if (!rolloutState) return;

    const now = new Date();
    const payload: typeof deviceRolloutStates.$inferInsert = {
        deviceId: event.deviceId,
        apkReleaseId: event.apkReleaseId,
        countryISO: event.countryISO || null,
        rolloutState,
        rollbackRequired: rolloutState === "failed" || rolloutState === "rolled_back",
        lastErrorCode: event.errorCode || null,
        lastErrorMessage: event.errorMessage || null,
        ...(rolloutState === "policy_seen" ? { updatedAt: now } : {}),
        ...(rolloutState === "mdm_push_requested" ? { mdmPushRequestedAt: now } : {}),
        ...(rolloutState === "mdm_push_acknowledged" ? { mdmPushAcknowledgedAt: now } : {}),
        ...(rolloutState === "download_started" ? { downloadStartedAt: now } : {}),
        ...(rolloutState === "download_completed" ? { downloadCompletedAt: now, downloadProgress: 100 } : {}),
        ...(rolloutState === "install_started" ? { installStartedAt: now } : {}),
        ...(rolloutState === "installed" || rolloutState === "rolled_back" ? { installCompletedAt: now, downloadProgress: 100 } : {}),
    };

    await db
        .insert(deviceRolloutStates)
        .values(payload)
        .onConflictDoUpdate({
            target: [deviceRolloutStates.deviceId, deviceRolloutStates.apkReleaseId],
            set: {
                countryISO: payload.countryISO,
                rolloutState: payload.rolloutState,
                downloadProgress: payload.downloadProgress,
                mdmPushRequestedAt: payload.mdmPushRequestedAt,
                mdmPushAcknowledgedAt: payload.mdmPushAcknowledgedAt,
                downloadStartedAt: payload.downloadStartedAt,
                downloadCompletedAt: payload.downloadCompletedAt,
                installStartedAt: payload.installStartedAt,
                installCompletedAt: payload.installCompletedAt,
                rollbackRequired: payload.rollbackRequired,
                lastErrorCode: payload.lastErrorCode,
                lastErrorMessage: payload.lastErrorMessage,
                updatedAt: now,
            },
        });
}
