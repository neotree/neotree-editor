import { NextRequest, NextResponse } from "next/server"

import { _getFileBytesRange } from "@/databases/queries/files"

const APK_CONTENT_TYPE = "application/vnd.android.package-archive"
// Pull the file from Postgres in chunks so a large APK is never fully resident
// in Node memory, and slow (hospital) clients get natural backpressure.
const STREAM_CHUNK_BYTES = 512 * 1024

type ApkFileMeta = {
  fileId: string
  size: number
  contentType?: string | null
  filename?: string | null
}

/** Parses "bytes=start-end". Returns null when absent/unsupported (-> full 200). */
function parseRange(rangeHeader: string | null, size: number): { start: number; end: number } | null {
  if (!rangeHeader) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim())
  if (!match) return null

  const [, startRaw, endRaw] = match
  let start = startRaw ? Number(startRaw) : NaN
  let end = endRaw ? Number(endRaw) : size - 1

  if (startRaw === "" && endRaw !== "") {
    const suffix = Number(endRaw)
    start = Math.max(0, size - suffix)
    end = size - 1
  }

  if (!Number.isFinite(start) || start < 0) return null
  if (!Number.isFinite(end) || end >= size) end = size - 1
  if (start > end) return null

  return { start, end }
}

/** Streams a byte window of the file straight from the DB, chunk by chunk. */
function dbByteStream(fileId: string, start: number, end: number): ReadableStream<Uint8Array> {
  let offset = start
  return new ReadableStream({
    async pull(controller) {
      if (offset > end) {
        controller.close()
        return
      }
      const length = Math.min(STREAM_CHUNK_BYTES, end - offset + 1)
      const chunk = await _getFileBytesRange(fileId, offset, length)
      if (!chunk || chunk.length === 0) {
        controller.close()
        return
      }
      controller.enqueue(chunk)
      offset += chunk.length
    },
  })
}

/**
 * #4/#6 — Returns an APK as a streamed response with Accept-Ranges + Range
 * support, reading only the requested bytes from Postgres so resumable client
 * downloads actually resume and the server never buffers the whole file.
 */
export function apkFileResponse(req: NextRequest, file: ApkFileMeta, apkReleaseId: string): NextResponse {
  const size = file.size
  const contentType = file.contentType || APK_CONTENT_TYPE
  const filename = file.filename || `${apkReleaseId}.apk`

  const commonHeaders: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "X-Apk-Release-Id": apkReleaseId,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
  }

  const range = parseRange(req.headers.get("range"), size)
  if (range) {
    return new NextResponse(dbByteStream(file.fileId, range.start, range.end) as unknown as BodyInit, {
      status: 206,
      headers: {
        ...commonHeaders,
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
        "Content-Length": `${range.end - range.start + 1}`,
      },
    })
  }

  return new NextResponse(dbByteStream(file.fileId, 0, size - 1) as unknown as BodyInit, {
    status: 200,
    headers: {
      ...commonHeaders,
      "Content-Length": `${size}`,
    },
  })
}
