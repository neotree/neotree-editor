import { type NextRequest, NextResponse } from "next/server"

import logger from "@/lib/logger"
import { isAuthenticated } from "@/app/actions/is-authenticated"
import { getEntityHistory } from "@/app/actions/change-logs"

export async function GET(req: NextRequest, { params }: { params: { entityId: string } }) {
  try {
    const isAuthorised = await isAuthenticated()

    if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] }, { status: 401 })

    const queryParams = JSON.parse(req.nextUrl.searchParams.get("data") || "{}")

    const res = await getEntityHistory({
      entityId: params.entityId,
      ...queryParams,
    })

    return NextResponse.json(res)
  } catch (e: any) {
    logger.error("[GET] /api/changelogs/history/[entityId]", e.message)
    return NextResponse.json({ errors: ["Internal Error"] })
  }
}
