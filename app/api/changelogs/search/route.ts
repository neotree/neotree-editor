import { type NextRequest, NextResponse } from "next/server"

import logger from "@/lib/logger"
import { isAuthenticated } from "@/app/actions/is-authenticated"
import { searchChangeLogs } from "@/app/actions/change-logs"

export async function GET(req: NextRequest) {
  try {
    const isAuthorised = await isAuthenticated()

    if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] })

    const params = JSON.parse(req.nextUrl.searchParams.get("data") || "{}") as Parameters<typeof searchChangeLogs>[0]

    const res = await searchChangeLogs(params)

    return NextResponse.json(res)
  } catch (e: any) {
    logger.error("[GET] /api/changelogs/search", e.message)
    return NextResponse.json({ errors: ["Internal Error"] })
  }
}
