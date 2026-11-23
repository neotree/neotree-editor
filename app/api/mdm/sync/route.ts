import { NextResponse } from "next/server"

import { syncEnabledMdmProfilesForAutomation } from "@/app/actions/device-management"

export const dynamic = "force-dynamic"

function isAuthorized(req: Request) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) return false

  const auth = req.headers.get("authorization") || ""
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : ""
  return token && token === secret
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 })
  }

  const profiles = await syncEnabledMdmProfilesForAutomation()
  const failed = profiles.filter((profile) => !profile.success)

  return NextResponse.json({
    ok: failed.length === 0,
    profiles,
    failed: failed.length,
  }, { status: failed.length ? 207 : 200 })
}
