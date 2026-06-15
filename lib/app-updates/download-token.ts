import crypto from "crypto"

/**
 * #9 — Short-lived, release-scoped download tokens.
 *
 * Previously the global MDM_SYNC_SECRET was embedded directly in the APK
 * download URL handed to Headwind (and thus persisted in MDM device configs and
 * logs). Instead we now mint an HMAC token that is bound to a single
 * apkReleaseId and expires, so a leaked URL cannot be used to authenticate
 * anything else and stops working after the window closes.
 */

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000 // 24h — long enough for an MDM to fetch

function getSecret() {
  const secret = process.env.MDM_SYNC_SECRET
  if (!secret) throw new Error("MDM_SYNC_SECRET is required to sign APK download tokens")
  return secret
}

function sign(apkReleaseId: string, expiresAt: number) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`${apkReleaseId}\n${expiresAt}`)
    .digest("hex")
}

export function createApkDownloadToken(apkReleaseId: string, ttlMs: number = DEFAULT_TTL_MS) {
  const expiresAt = Date.now() + ttlMs
  return `${expiresAt}.${sign(apkReleaseId, expiresAt)}`
}

export function verifyApkDownloadToken(apkReleaseId: string, token: string): boolean {
  if (!token) return false
  const [expiresRaw, signature] = token.split(".")
  const expiresAt = Number(expiresRaw)
  if (!Number.isFinite(expiresAt) || !signature) return false
  if (Date.now() > expiresAt) return false

  const expected = sign(apkReleaseId, expiresAt)
  const a = Buffer.from(signature, "hex")
  const b = Buffer.from(expected, "hex")
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
