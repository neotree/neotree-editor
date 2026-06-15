import type { NextRequest } from "next/server"

import { validateApiKey } from "@/app/actions/authenticate"
import { _getDevice } from "@/databases/queries/devices"
import { verifyDeviceSignature, SIGNATURE_TOLERANCE_MS } from "@/lib/device-credentials"
import { consumeDeviceNonce, pruneExpiredDeviceNonces } from "@/databases/mutations/device-auth-nonces"

const BLOCKED_DEVICE_STATES = new Set(["blocked", "stolen", "revoked"])

export type MobileDeviceAuthResult =
  | {
      ok: true
      device: NonNullable<Awaited<ReturnType<typeof _getDevice>>["data"]>
      apiKeyAuthenticated: boolean
    }
  | {
      ok: false
      errors: string[]
      status: number
    }

function getDeviceTrustState(details: Record<string, any> | null | undefined) {
  const raw = details?.deviceStatus || details?.trustState || details?.status || "active"
  return `${raw}`.trim().toLowerCase()
}

export async function authenticateMobileDevice(
  req: NextRequest,
  deviceId: string,
  opts?: { body?: string; requireSignature?: boolean },
): Promise<MobileDeviceAuthResult> {
  if (!deviceId) return { ok: false, status: 400, errors: ["Missing deviceId"] }

  const apiKey = req.headers.get("x-api-key") || ""
  const apiKeyAuthenticated = await validateApiKey(apiKey)
  if (!apiKeyAuthenticated) return { ok: false, status: 401, errors: ["Unauthorised device API key"] }

  const headerDeviceId = req.headers.get("x-device-id")
  if (headerDeviceId && headerDeviceId !== deviceId) {
    return { ok: false, status: 403, errors: ["Device header does not match request deviceId"] }
  }

  const deviceRes = await _getDevice({ deviceId })
  if (deviceRes.errors?.length) return { ok: false, status: 500, errors: deviceRes.errors }
  if (!deviceRes.data) return { ok: false, status: 404, errors: ["Device not registered"] }

  const trustState = getDeviceTrustState(deviceRes.data.details as Record<string, any>)
  if (BLOCKED_DEVICE_STATES.has(trustState)) {
    return { ok: false, status: 423, errors: [`Device is ${trustState}`] }
  }

  if (opts?.requireSignature !== false) {
    const signature = verifyDeviceSignature({
      req,
      body: opts?.body || "",
      secret: deviceRes.data.deviceAuthSecret,
    })
    if (!signature.ok) return { ok: false, status: 401, errors: [signature.error] }

    // Replay protection (#3): each signed request carries a one-time nonce.
    const nonce = req.headers.get("x-device-nonce") || ""
    if (!nonce) return { ok: false, status: 401, errors: ["Missing device nonce"] }
    const fresh = await consumeDeviceNonce({
      deviceId,
      nonce,
      expiresAt: new Date(Date.now() + SIGNATURE_TOLERANCE_MS),
    })
    if (!fresh) return { ok: false, status: 401, errors: ["Replayed device request rejected"] }
    pruneExpiredDeviceNonces().catch(() => null)
  }

  return { ok: true, device: deviceRes.data, apiKeyAuthenticated }
}
