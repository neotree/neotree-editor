import { execFileSync } from "child_process"
import fs from "fs"
import os from "os"
import path from "path"
import { v4 as uuidv4 } from "uuid"

import ApkReader from "@devicefarmer/adbkit-apkreader"
import logger from "@/lib/logger"

export type ApkMetadata = {
  packageName: string | null
  versionName: string | null
  versionCode: number | null
  minSdkVersion: number | null
  targetSdkVersion: number | null
  compileSdkVersion: number | null
  /** How the metadata was obtained, for diagnostics. */
  source: "manifest" | "aapt" | null
}

const EMPTY: ApkMetadata = {
  packageName: null,
  versionName: null,
  versionCode: null,
  minSdkVersion: null,
  targetSdkVersion: null,
  compileSdkVersion: null,
  source: null,
}

function toInt(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

/**
 * Reads the APK's binary AndroidManifest.xml directly (no Android build-tools
 * required), mirroring what Headwind extracts when you upload an APK in its UI.
 */
async function readFromManifest(filePath: string): Promise<ApkMetadata | null> {
  try {
    const reader = await ApkReader.open(filePath)
    const manifest = await reader.readManifest()
    if (!manifest) return null

    return {
      packageName: manifest.package ? `${manifest.package}` : null,
      versionName: manifest.versionName != null ? `${manifest.versionName}` : null,
      versionCode: toInt(manifest.versionCode),
      minSdkVersion: toInt(manifest.usesSdk?.minSdkVersion),
      targetSdkVersion: toInt(manifest.usesSdk?.targetSdkVersion),
      compileSdkVersion: toInt(manifest.compileSdkVersion),
      source: "manifest",
    }
  } catch (e: any) {
    logger.error("apk-metadata readFromManifest ERROR", e.message)
    return null
  }
}

/** Fallback to `aapt`/`aapt2 dump badging` when present (optional). */
function readFromAapt(filePath: string): ApkMetadata | null {
  for (const tool of ["aapt2", "aapt"]) {
    try {
      const output = execFileSync(tool, ["dump", "badging", filePath], { encoding: "utf-8" })
      const pkg = /package: name='([^']+)' versionCode='([^']*)' versionName='([^']*)'/.exec(output)
      const sdk = /sdkVersion:'([^']*)'/.exec(output)
      const target = /targetSdkVersion:'([^']*)'/.exec(output)
      if (!pkg) continue
      return {
        packageName: pkg[1] || null,
        versionCode: toInt(pkg[2]),
        versionName: pkg[3] || null,
        minSdkVersion: toInt(sdk?.[1]),
        targetSdkVersion: toInt(target?.[1]),
        compileSdkVersion: null,
        source: "aapt",
      }
    } catch {
      // try next tool
    }
  }
  return null
}

/** Extracts APK metadata from a local APK file. Never throws. */
export async function extractApkMetadataFromFile(filePath: string): Promise<ApkMetadata> {
  try {
    const fromManifest = await readFromManifest(filePath)
    if (fromManifest?.packageName) return fromManifest
    return readFromAapt(filePath) || fromManifest || EMPTY
  } catch (e: any) {
    logger.error("extractApkMetadataFromFile ERROR", e.message)
    return EMPTY
  }
}

/** Extracts APK metadata from an in-memory buffer. Never throws. */
export async function extractApkMetadataFromBuffer(buffer: Buffer): Promise<ApkMetadata> {
  const tmpFile = path.join(os.tmpdir(), `${uuidv4()}.apk`)
  try {
    fs.writeFileSync(tmpFile, buffer)
    return await extractApkMetadataFromFile(tmpFile)
  } catch (e: any) {
    logger.error("extractApkMetadataFromBuffer ERROR", e.message)
    return EMPTY
  } finally {
    try {
      fs.unlinkSync(tmpFile)
    } catch {
      // ignore cleanup errors
    }
  }
}
