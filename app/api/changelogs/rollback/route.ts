import { type NextRequest, NextResponse } from "next/server"

import { isAuthenticated } from "@/app/actions/is-authenticated"
import { rollbackChangeLog } from "@/app/actions/change-logs"
import logger from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const isAuthorised = await isAuthenticated()

    if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] }, { status: 401 })
    if (isAuthorised.user?.role !== "super_user") {
      return NextResponse.json({ errors: ["Forbidden"] }, { status: 403 })
    }

    const body = await req.json()

    const data = await rollbackChangeLog(body)

    return NextResponse.json(data, { status: data?.success ? 200 : 400 })
  } catch (e: any) {
    logger.log("/api/changelogs/rollback", e)
    return NextResponse.json({ success: false, errors: [e.message] }, { status: 500 })
  }
}
