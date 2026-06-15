import { NextRequest, NextResponse } from "next/server"

import { _getApkReleases } from "@/databases/queries/app-updates"
import { _getFileByteMeta } from "@/databases/queries/files"
import logger from "@/lib/logger"
import { authenticateMobileDevice } from "@/lib/mobile-device-auth"
import { apkFileResponse } from "@/lib/app-updates/apk-file-response"

type Params = {
  params: {
    apkReleaseId: string
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const deviceId = req.nextUrl.searchParams.get("deviceId") || req.headers.get("x-device-id") || ""
    const auth = await authenticateMobileDevice(req, deviceId)
    if (!auth.ok) return NextResponse.json({ errors: auth.errors }, { status: auth.status })

    const releaseRes = await _getApkReleases({
      apkReleaseIds: [params.apkReleaseId],
      statuses: ["available"],
    })
    if (releaseRes.errors?.length) return NextResponse.json({ errors: releaseRes.errors }, { status: 500 })

    const release = releaseRes.data.find((item) => item.apkReleaseId === params.apkReleaseId)
    if (!release?.isAvailable || !release.fileId) {
      return NextResponse.json({ errors: ["APK release is not available for download"] }, { status: 404 })
    }

    const fileRes = await _getFileByteMeta(release.fileId)
    if (fileRes.errors?.length) return NextResponse.json({ errors: fileRes.errors }, { status: 500 })
    if (!fileRes.data || !fileRes.data.size) return NextResponse.json({ errors: ["APK file not found"] }, { status: 404 })

    return apkFileResponse(req, fileRes.data, release.apkReleaseId)
  } catch (e: any) {
    logger.error("[GET_ERROR] /api/mobile/apk-releases/[apkReleaseId]/download", e.message)
    return NextResponse.json({ errors: ["Internal Error"] }, { status: 500 })
  }
}
