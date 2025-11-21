import { NextRequest, NextResponse } from "next/server"

import { getChangeLogSummaries } from "@/app/actions/change-logs"
import logger from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await getChangeLogSummaries(body)
    const status = res.errors?.length ? 400 : 200
    return NextResponse.json(res, { status })
  } catch (e: any) {
    logger.error("/api/changelogs/summary", e?.message)
    return NextResponse.json({ errors: [e?.message || "Internal Error"], data: [] }, { status: 500 })
  }
}
