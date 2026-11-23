// Pure aggregation of per-device rollout states into a fleet health summary.
// Side-effect free so the observability + auto-halt thresholds can be unit tested
// without a database.

export type RolloutStateRow = {
  rolloutState: string
  rollbackRequired?: boolean | null
  updatedAt?: Date | string | null
}

export type RolloutHealth = {
  total: number
  byState: Record<string, number>
  downloading: number
  downloaded: number
  installed: number
  failed: number
  rolledBack: number
  stalled: number
  /** (failed + rolled_back) / total, 0..1. The auto-halt signal. */
  failureRate: number
}

const IN_FLIGHT = new Set(["download_started", "install_started"])

const toTime = (value: Date | string | null | undefined) => {
  if (!value) return null
  const t = value instanceof Date ? value.getTime() : new Date(value).getTime()
  return Number.isNaN(t) ? null : t
}

export function summarizeRolloutHealth(
  rows: RolloutStateRow[],
  opts?: { now?: Date; stallHours?: number },
): RolloutHealth {
  const now = (opts?.now || new Date()).getTime()
  const stallMs = Math.max(1, opts?.stallHours ?? 6) * 60 * 60 * 1000

  const byState: Record<string, number> = {}
  let downloading = 0
  let downloaded = 0
  let installed = 0
  let failed = 0
  let rolledBack = 0
  let stalled = 0

  for (const row of rows) {
    const state = `${row.rolloutState || "pending"}`
    byState[state] = (byState[state] || 0) + 1

    if (state === "download_started") downloading += 1
    if (state === "download_completed") downloaded += 1
    if (state === "installed") installed += 1
    if (state === "failed") failed += 1
    if (state === "rolled_back") rolledBack += 1

    // A device that began downloading/installing but hasn't advanced within the
    // stall window is "stuck" — the signal operators most want surfaced.
    if (IN_FLIGHT.has(state)) {
      const updated = toTime(row.updatedAt)
      if (updated !== null && now - updated >= stallMs) stalled += 1
    }
  }

  const total = rows.length
  const failureRate = total > 0 ? (failed + rolledBack) / total : 0

  return { total, byState, downloading, downloaded, installed, failed, rolledBack, stalled, failureRate }
}

/**
 * Auto-halt decision: returns true when the rollout should be frozen. Requires a
 * minimum sample size so a single early failure can't halt a healthy rollout, and
 * a failure rate at/above the configured threshold.
 */
export function shouldAutoHaltRollout(
  health: RolloutHealth,
  opts: { thresholdPercent: number; minDevices: number },
): boolean {
  if (health.total < Math.max(1, opts.minDevices)) return false
  return health.failureRate * 100 >= opts.thresholdPercent
}
