import { NextRequest, NextResponse } from "next/server"

import { _getApkReleases } from "@/databases/queries/app-updates"
import { _getFullFileByFileId } from "@/databases/queries/files"
import logger from "@/lib/logger"
import { authenticateMobileDevice } from "@/lib/mobile-device-auth"

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

    const fileRes = await _getFullFileByFileId(release.fileId)
    if (fileRes.errors?.length) return NextResponse.json({ errors: fileRes.errors }, { status: 500 })
    if (!fileRes.data?.data) return NextResponse.json({ errors: ["APK file not found"] }, { status: 404 })

    return new NextResponse(fileRes.data.data as BodyInit, {
      headers: {
        "Content-Type": fileRes.data.contentType || "application/vnd.android.package-archive",
        "Content-Length": `${fileRes.data.size || Buffer.byteLength(fileRes.data.data)}`,
        "Content-Disposition": `attachment; filename="${fileRes.data.filename || `${release.apkReleaseId}.apk`}"`,
        "X-Apk-Release-Id": release.apkReleaseId,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (e: any) {
    logger.error("[GET_ERROR] /api/mobile/apk-releases/[apkReleaseId]/download", e.message)
    return NextResponse.json({ errors: ["Internal Error"] }, { status: 500 })
  }
}
