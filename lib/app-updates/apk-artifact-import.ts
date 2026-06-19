import { createHash } from "crypto"
import { execFileSync } from "child_process"
import { once } from "events"
import fs from "fs"
import os from "os"
import path from "path"
import { v4 as uuidv4 } from "uuid"

import { _saveFile } from "@/databases/mutations/files"
import { extractApkMetadataFromFile } from "@/lib/app-updates/apk-metadata"
import logger from "@/lib/logger"

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

function signatureSha256FromApk(filePath: string) {
  try {
    const output = execFileSync("apksigner", ["verify", "--print-certs", filePath], { encoding: "utf-8" })
    const match = output.match(/SHA-256 digest:\s*([A-Fa-f0-9:]+)/)
    return match?.[1] ? match[1].replace(/:/g, "").toLowerCase() : null
  } catch (e: any) {
    logger.error("signatureSha256FromApk ERROR", e.message)
    return null
  }
}

async function downloadApkToTempFile(response: Response, filePath: string) {
  if (!response.body) throw new Error("APK download response was empty")

  const hash = createHash("sha256")
  const writer = fs.createWriteStream(filePath, { flags: "wx" })
  const reader = response.body.getReader()
  let size = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = Buffer.from(value)
      size += chunk.length
      if (size > MAX_APK_BYTES) {
        throw new Error("APK file is too large to import")
      }
      hash.update(chunk)
      if (!writer.write(chunk)) await once(writer, "drain")
    }
    writer.end()
    await once(writer, "finish")
  } catch (e) {
    writer.destroy()
    try {
      reader.cancel().catch(() => null)
    } catch {
      // ignore reader cleanup errors
    }
    throw e
  }

  if (!size) throw new Error("Downloaded APK file was empty")
  return { size, checksumSha256: hash.digest("hex") }
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

  const fileId = uuidv4()
  const tmpFile = path.join(os.tmpdir(), `${fileId}.apk`)
  let buffer: Buffer | null = null

  try {
    const { size, checksumSha256 } = await downloadApkToTempFile(response, tmpFile)
    const filename = filenameFromUrl(normalizedUrl)
    const contentType = response.headers.get("content-type")?.split(";")[0] || APK_CONTENT_TYPE
    const signatureSha256 = signatureSha256FromApk(tmpFile)
    const apkMetadata = await extractApkMetadataFromFile(tmpFile)

    buffer = fs.readFileSync(tmpFile)
    const saveResult = await _saveFile(
      {
        fileId,
        data: buffer,
        filename: [fileId, filename].join("__"),
        size,
        contentType: contentType || APK_CONTENT_TYPE,
        metadata: {
          ...(metadata || {}),
          artifactSource: source,
          artifactUrl: normalizedUrl,
          importedAt: new Date().toISOString(),
          apkChecksumSha256: checksumSha256,
          ...(apkMetadata.packageName ? { apkPackageName: apkMetadata.packageName } : {}),
          ...(apkMetadata.versionName ? { apkVersionName: apkMetadata.versionName } : {}),
          ...(apkMetadata.versionCode != null ? { apkVersionCode: apkMetadata.versionCode } : {}),
          ...(apkMetadata.minSdkVersion != null ? { apkMinSdkVersion: apkMetadata.minSdkVersion } : {}),
          ...(apkMetadata.targetSdkVersion != null ? { apkTargetSdkVersion: apkMetadata.targetSdkVersion } : {}),
          ...(apkMetadata.compileSdkVersion != null ? { apkCompileSdkVersion: apkMetadata.compileSdkVersion } : {}),
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
      fileSize: size,
      filename,
      artifactUrl: normalizedUrl,
      metadata: apkMetadata,
    }
  } finally {
    buffer = null
    try {
      fs.unlinkSync(tmpFile)
    } catch {
      // ignore cleanup errors
    }
  }
}
