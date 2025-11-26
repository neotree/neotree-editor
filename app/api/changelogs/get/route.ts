import { type NextRequest, NextResponse } from "next/server"
import { getChangeLogs } from "@/app/actions/change-logs"
import logger from "@/lib/logger"
import { isAuthenticated } from "@/app/actions/is-authenticated"

export async function POST(req: NextRequest) {
  try {
    const isAuthorised = await isAuthenticated()

    if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] }, { status: 401 })

    const body = await req.json()
    const limit = Math.max(1, Math.min(Number(body?.limit) || 500, 2000))
    const offset = Math.max(0, Number(body?.offset) || 0)

    const data = await getChangeLogs({
      ...body,
      limit,
      offset,
    })
    return NextResponse.json(data)
  } catch (e: any) {
    logger.log("/api/changelogs/get", e)
    return NextResponse.json({ errors: [e.message] }, { status: 500 })
  }
}
