import { NextRequest, NextResponse } from "next/server"

import { _getApkReleases } from "@/databases/queries/app-updates"
import { _getFileByteMeta } from "@/databases/queries/files"
import logger from "@/lib/logger"
import { verifyApkDownloadToken } from "@/lib/app-updates/download-token"
import { apkFileResponse } from "@/lib/app-updates/apk-file-response"

type Params = {
  params: {
    apkReleaseId: string
  }
}

function isAuthorized(req: NextRequest, apkReleaseId: string) {
  const secret = process.env.MDM_SYNC_SECRET
  if (!secret) return false

  // Admin/server-to-server bearer (full secret) still works for tooling.
  const bearer = req.headers.get("authorization") || ""
  const bearerToken = bearer.toLowerCase().startsWith("bearer ") ? bearer.slice(7).trim() : ""
  if (bearerToken && bearerToken === secret) return true

  // Release-scoped, short-lived signed token (#9) — what we hand to the MDM.
  const queryToken = req.nextUrl.searchParams.get("token") || ""
  return verifyApkDownloadToken(apkReleaseId, queryToken)
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    if (!isAuthorized(req, params.apkReleaseId)) {
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

    const fileRes = await _getFileByteMeta(release.fileId)
    if (fileRes.errors?.length) return NextResponse.json({ errors: fileRes.errors }, { status: 500 })
    if (!fileRes.data || !fileRes.data.size) return NextResponse.json({ errors: ["APK file not found"] }, { status: 404 })

    return apkFileResponse(req, fileRes.data, release.apkReleaseId)
  } catch (e: any) {
    logger.error("[GET_ERROR] /api/mdm/apk-releases/[apkReleaseId]/download", e.message)
    return NextResponse.json({ errors: ["Internal Error"] }, { status: 500 })
  }
}
