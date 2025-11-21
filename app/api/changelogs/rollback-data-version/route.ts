import { NextRequest, NextResponse } from "next/server"

import { rollbackDataVersion } from "@/app/actions/change-logs"
import logger from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const dataVersion = Number(body?.dataVersion)
    const changeReason = body?.changeReason ? String(body.changeReason) : undefined
    const dryRun = Boolean(body?.dryRun)
    const auditNote = body?.auditNote ? String(body.auditNote) : undefined

    const res = await rollbackDataVersion({
      dataVersion,
      changeReason,
      broadcastAction: true,
      dryRun,
      auditNote,
    })

    return NextResponse.json(res, { status: res.success ? 200 : 400 })
  } catch (e: any) {
    logger.error("/api/changelogs/rollback-data-version", e?.message)
    return NextResponse.json({ success: false, errors: [e?.message || "Internal Error"] }, { status: 500 })
  }
}
