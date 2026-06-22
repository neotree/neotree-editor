// Staged canary rollout resolution. Pure and deterministic so a device's canary
// membership is stable across syncs and ramps monotonically — a device included
// at 10% is still included at 50% — and so the logic is unit-testable without a DB.

// FNV-1a (32-bit) string hash: small, dependency-free and well-distributed enough
// for bucketing. Deterministic across runtimes (no Math.random / no crypto).
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // hash * 16777619 with 32-bit overflow semantics.
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Stable 0-99 bucket for a device against a specific release. Keying on the release
 * id re-buckets every release (a fresh canary each time) while staying constant for
 * a given (device, release) pair.
 */
export function deviceRolloutBucket(deviceId: string, apkReleaseId: string): number {
  return fnv1a(`${deviceId}:${apkReleaseId}`) % 100;
}

export function clampPercentage(value: unknown): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 100;
  return Math.min(100, Math.max(0, n));
}

/**
 * Whether the current APK release should be served to this device. Returns false
 * when the rollout is halted or the device falls outside the canary percentage.
 *
 * Unknown deviceId is treated leniently (served) to match the existing targeting
 * philosophy — devices that cannot be bucketed are not starved of updates — but a
 * halt always wins, since that is an explicit "stop shipping this" signal.
 */
export function shouldServeCanaryRelease(args: {
  deviceId?: string | null;
  apkReleaseId?: string | null;
  percentage: number;
  halted: boolean;
}): boolean {
  if (args.halted) return false;
  const pct = clampPercentage(args.percentage);
  if (pct >= 100) return true;
  if (pct <= 0) return false;
  if (!args.deviceId || !args.apkReleaseId) return true; // cannot bucket → lenient
  return deviceRolloutBucket(args.deviceId, args.apkReleaseId) < pct;
}
