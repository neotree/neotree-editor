import { NextRequest, NextResponse } from "next/server"

import { restoreDataVersion } from "@/app/actions/change-logs"
import logger from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const targetDataVersion = Number(body?.targetDataVersion)
    const changeReason = body?.changeReason ? String(body.changeReason) : undefined

    const res = await restoreDataVersion({
      targetDataVersion,
      changeReason,
      broadcastAction: true,
    })

    return NextResponse.json(res, { status: res.success ? 200 : 400 })
  } catch (e: any) {
    logger.error("/api/changelogs/restore-data-version", e?.message)
    return NextResponse.json({ success: false, errors: [e?.message || "Internal Error"] }, { status: 500 })
  }
}
