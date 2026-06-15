import { lt } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { deviceAuthNonces } from "@/databases/pg/schema";
import logger from "@/lib/logger";

/**
 * Atomically records a (deviceId, nonce) pair. Returns false when the nonce has
 * already been seen for that device (i.e. a replayed request).
 *
 * The unique index on (device_id, nonce) makes this race-safe: a concurrent
 * replay loses the insert and is rejected.
 */
export async function consumeDeviceNonce(params: {
  deviceId: string;
  nonce: string;
  expiresAt: Date;
}): Promise<boolean> {
  try {
    const inserted = await db
      .insert(deviceAuthNonces)
      .values({
        deviceId: params.deviceId,
        nonce: params.nonce,
        expiresAt: params.expiresAt,
      })
      .onConflictDoNothing({
        target: [deviceAuthNonces.deviceId, deviceAuthNonces.nonce],
      })
      .returning({ id: deviceAuthNonces.id });

    return inserted.length > 0;
  } catch (e: any) {
    logger.error("consumeDeviceNonce ERROR", e.message);
    // Fail closed: if we cannot guarantee the nonce is fresh, reject the request.
    return false;
  }
}

/** Opportunistic cleanup of expired nonces; safe to call best-effort. */
export async function pruneExpiredDeviceNonces(): Promise<void> {
  try {
    await db.delete(deviceAuthNonces).where(lt(deviceAuthNonces.expiresAt, new Date()));
  } catch (e: any) {
    logger.error("pruneExpiredDeviceNonces ERROR", e.message);
  }
}
