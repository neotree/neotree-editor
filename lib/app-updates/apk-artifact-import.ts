import { createHash } from "crypto"
import { execFileSync } from "child_process"
import fs from "fs"
import os from "os"
import path from "path"
import { v4 as uuidv4 } from "uuid"

import { _saveFile } from "@/databases/mutations/files"

const APK_CONTENT_TYPE = "application/vnd.android.package-archive"
const MAX_APK_BYTES = 300 * 1024 * 1024

function filenameFromUrl(url: string) {
  try {
    const parsed = new URL(url)
    const name = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "")
    return name.toLowerCase().endsWith(".apk") ? name : "neotree-eas-build.apk"
  } catch {
    return "neotree-eas-build.apk"
  }
}

function signatureSha256FromApk(buffer: Buffer, fileId: string) {
  const tmpFile = path.join(os.tmpdir(), `${fileId}.apk`)
  try {
    fs.writeFileSync(tmpFile, buffer)
    const output = execFileSync("apksigner", ["verify", "--print-certs", tmpFile], { encoding: "utf-8" })
    const match = output.match(/SHA-256 digest:\s*([A-Fa-f0-9:]+)/)
    return match?.[1] ? match[1].replace(/:/g, "").toLowerCase() : null
  } catch {
    return null
  } finally {
    try {
      fs.unlinkSync(tmpFile)
    } catch {
      // ignore cleanup errors
    }
  }
}

export async function importApkArtifactFromUrl({
  artifactUrl,
  source = "eas",
  metadata,
}: {
  artifactUrl: string
  source?: "eas" | "url"
  metadata?: Record<string, any>
}) {
  const normalizedUrl = artifactUrl.trim()
  if (!normalizedUrl) throw new Error("Paste the EAS APK download link first")
  if (!/^https?:\/\//i.test(normalizedUrl)) throw new Error("APK link must start with http:// or https://")

  const response = await fetch(normalizedUrl, {
    cache: "no-store",
    redirect: "follow",
    headers: {
      "User-Agent": "NeoTree-App-Updates/1.0",
    },
  })

  if (!response.ok) {
    throw new Error(`NeoTree could not download the APK from this link (${response.status})`)
  }

  const contentLength = Number(response.headers.get("content-length") || 0)
  if (contentLength && contentLength > MAX_APK_BYTES) {
    throw new Error("APK file is too large to import")
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (!buffer.length) throw new Error("Downloaded APK file was empty")
  if (buffer.length > MAX_APK_BYTES) throw new Error("APK file is too large to import")

  const filename = filenameFromUrl(normalizedUrl)
  const contentType = response.headers.get("content-type")?.split(";")[0] || APK_CONTENT_TYPE
  const fileId = uuidv4()
  const checksumSha256 = createHash("sha256").update(buffer).digest("hex")
  const signatureSha256 = signatureSha256FromApk(buffer, fileId)

  const saveResult = await _saveFile(
    {
      fileId,
      data: buffer,
      filename: [fileId, filename].join("__"),
      size: buffer.length,
      contentType: contentType || APK_CONTENT_TYPE,
      metadata: {
        ...(metadata || {}),
        artifactSource: source,
        artifactUrl: normalizedUrl,
        importedAt: new Date().toISOString(),
        apkChecksumSha256: checksumSha256,
        ...(signatureSha256
          ? {
              apkSignatureSha256: signatureSha256,
              apkSignatureVerifiedAt: new Date().toISOString(),
            }
          : {}),
      },
    },
    { broadcastAction: false },
  )

  if (!saveResult.success || !saveResult.data) {
    throw new Error(saveResult.errors?.join(", ") || "Could not save imported APK")
  }

  return {
    file: saveResult.data,
    checksumSha256,
    signatureSha256,
    fileSize: buffer.length,
    filename,
    artifactUrl: normalizedUrl,
  }
}
