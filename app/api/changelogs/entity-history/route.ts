import { type NextRequest, NextResponse } from "next/server"
import { getEntityHistory } from "@/app/actions/change-logs"
import logger from "@/lib/logger"
import { isAuthenticated } from "@/app/actions/is-authenticated"

export async function POST(req: NextRequest) {
  try {
    const isAuthorised = await isAuthenticated()

    if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] }, { status: 401 })

    const body = await req.json()
    const data = await getEntityHistory(body)
    return NextResponse.json(data)
  } catch (e: any) {
    logger.log("/api/changelogs/entity-history", e)
    return NextResponse.json({ errors: [e.message] }, { status: 500 })
  }
}
