import crypto from "crypto"
import type { NextRequest } from "next/server"

const SIGNATURE_TOLERANCE_MS = 10 * 60 * 1000

export function createDeviceAuthSecret() {
  return crypto.randomBytes(32).toString("base64url")
}

export function createBodyHash(body: string) {
  return crypto.createHash("sha256").update(body || "").digest("hex")
}

export function getMobileSignaturePath(req: NextRequest) {
  const pathname = req.nextUrl.pathname.replace(/^\/api/, "") || "/"
  return `${pathname}${req.nextUrl.search || ""}`
}

export function createDeviceSignature({
  method,
  path,
  timestamp,
  nonce,
  bodyHash,
  secret,
}: {
  method: string
  path: string
  timestamp: string
  nonce: string
  bodyHash: string
  secret: string
}) {
  const canonical = [
    method.toUpperCase(),
    path,
    timestamp,
    nonce,
    bodyHash,
  ].join("\n")

  return crypto.createHmac("sha256", secret).update(canonical).digest("hex")
}

function timingSafeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "hex")
  const right = Buffer.from(b, "hex")
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function verifyDeviceSignature({
  req,
  body,
  secret,
}: {
  req: NextRequest
  body?: string
  secret?: string | null
}): { ok: true } | { ok: false; error: string } {
  if (!secret) return { ok: false, error: "Device credential is not enrolled" }

  const timestamp = req.headers.get("x-device-timestamp") || ""
  const nonce = req.headers.get("x-device-nonce") || ""
  const signature = req.headers.get("x-device-signature") || ""

  if (!timestamp || !nonce || !signature) {
    return { ok: false, error: "Missing device signature headers" }
  }

  const t = new Date(timestamp).getTime()
  if (!Number.isFinite(t) || Math.abs(Date.now() - t) > SIGNATURE_TOLERANCE_MS) {
    return { ok: false, error: "Device signature timestamp is outside the allowed window" }
  }

  const expected = createDeviceSignature({
    method: req.method,
    path: getMobileSignaturePath(req),
    timestamp,
    nonce,
    bodyHash: createBodyHash(body || ""),
    secret,
  })

  if (!timingSafeEqualHex(signature, expected)) {
    return { ok: false, error: "Invalid device signature" }
  }

  return { ok: true }
}
