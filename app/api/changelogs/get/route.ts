import { type NextRequest, NextResponse } from "next/server"
import { getChangeLogs } from "@/app/actions/change-logs"
import logger from "@/lib/logger"
import { _getEditorInfo } from "@/databases/queries/editor-info"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const [data, editorInfo] = await Promise.all([getChangeLogs(body), _getEditorInfo()])

    return NextResponse.json({
      ...data,
      activeDataVersion: editorInfo.data?.dataVersion ?? null,
      editorInfoErrors: editorInfo.errors,
    })
  } catch (e: any) {
    logger.log("/api/changelogs/get", e)
    return NextResponse.json({ errors: [e.message] }, { status: 500 })
  }
}
