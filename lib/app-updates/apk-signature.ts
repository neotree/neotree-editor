import { execFileSync } from "child_process"
import fs from "fs"
import os from "os"
import path from "path"

import logger from "@/lib/logger"

// Local-only: runs Android's `apksigner` against an APK already on disk. Keep network code
// (fetch/axios) out of this module - callers download or receive the bytes, and this file
// only inspects them.

const APKSIGNER_TIMEOUT_MS = 60_000

export function apkSignatureSha256FromFile(filePath: string): string | null {
  try {
    const output = execFileSync("apksigner", ["verify", "--print-certs", filePath], {
      encoding: "utf-8",
      timeout: APKSIGNER_TIMEOUT_MS,
    })
    const match = output.match(/SHA-256 digest:\s*([A-Fa-f0-9:]+)/)
    return match?.[1] ? match[1].replace(/:/g, "").toLowerCase() : null
  } catch (e: any) {
    logger.error("apkSignatureSha256 ERROR", e?.message || `${e}`)
    return null
  }
}

export function apkSignatureSha256FromBuffer(buffer: Buffer): string | null {
  // A private, randomly named directory: the temp path never comes from caller input.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "neotree-apk-"))
  const filePath = path.join(dir, "upload.apk")
  try {
    fs.writeFileSync(filePath, buffer, { flag: "wx" })
    return apkSignatureSha256FromFile(filePath)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}
