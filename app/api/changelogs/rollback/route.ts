import { type NextRequest, NextResponse } from "next/server"

import { isAuthenticated } from "@/app/actions/is-authenticated"
import { rollbackChangeLog } from "@/app/actions/change-logs"
import logger from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const isAuthorised = await isAuthenticated()

    if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] }, { status: 200 })

    const body = await req.json()

    const data = await rollbackChangeLog(body)

    return NextResponse.json(data)
  } catch (e: any) {
    logger.log("/api/changelogs/rollback", e)
    return NextResponse.json({ errors: [e.message] })
  }
}
