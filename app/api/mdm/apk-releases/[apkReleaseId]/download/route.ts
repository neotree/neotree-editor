import { NextRequest, NextResponse } from "next/server"

import { _getApkReleases } from "@/databases/queries/app-updates"
import { _getFullFileByFileId } from "@/databases/queries/files"
import logger from "@/lib/logger"

type Params = {
  params: {
    apkReleaseId: string
  }
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.MDM_SYNC_SECRET
  if (!secret) return false

  const bearer = req.headers.get("authorization") || ""
  const bearerToken = bearer.toLowerCase().startsWith("bearer ") ? bearer.slice(7).trim() : ""
  const queryToken = req.nextUrl.searchParams.get("token") || ""

  return bearerToken === secret || queryToken === secret
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ errors: ["Unauthorized"] }, { status: 401 })
    }

    const releaseRes = await _getApkReleases({
      apkReleaseIds: [params.apkReleaseId],
      statuses: ["available"],
    })
    if (releaseRes.errors?.length) return NextResponse.json({ errors: releaseRes.errors }, { status: 500 })

    const release = releaseRes.data.find((item) => item.apkReleaseId === params.apkReleaseId)
    if (!release?.isAvailable || !release.fileId) {
      return NextResponse.json({ errors: ["APK release is not available for MDM download"] }, { status: 404 })
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
    logger.error("[GET_ERROR] /api/mdm/apk-releases/[apkReleaseId]/download", e.message)
    return NextResponse.json({ errors: ["Internal Error"] }, { status: 500 })
  }
}
