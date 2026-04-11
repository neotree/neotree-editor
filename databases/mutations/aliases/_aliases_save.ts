import { _getLeanScriptIds } from "@/databases/queries/scripts"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { aliases, screens, scripts } from "@/databases/pg/schema"
import { and, eq, isNull } from "drizzle-orm"
import logger from "@/lib/logger"

export type SaveAliasesResponse = {
  success: boolean
  errors?: string[]
}

type AliasCandidate = {
  name: string
  alias: string
  script: string
  oldScript: string | null
}

function getNextAlias(prev: string | null): string {
  if (!prev || prev === "") return "A"

  const match = prev.match(/^([A-Z]+)(\d*)$/)
  if (!match) throw new Error("Invalid alias format")

  const [, letters, numStr] = match
  const num = numStr ? parseInt(numStr, 10) : 0

  const toNumber = (s: string) => s.split("").reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 65), 0)

  const toLetters = (n: number): string => {
    let str = ""
    do {
      str = String.fromCharCode((n % 26) + 65) + str
      n = Math.floor(n / 26) - 1
    } while (n >= 0)
    return str
  }

  let nextLetters = toLetters(toNumber(letters) + 1)
  if (nextLetters.length > letters.length) {
    nextLetters = "A"
    return nextLetters + (num + 1)
  }

  return nextLetters + (numStr || "")
}

function excludedScreenType(type: string) {
  return [
    "management",
    "mwi_edliz_summary_table",
    "progress",
    "zw_edliz_summary_table",
    "diagnosis",
    "drugs",
    "fluids",
    "feeds",
  ].includes(type)
}

function buildAliasCandidates(params: {
  scriptId: string
  screenRows: any[]
  existingNames: Set<string>
  lastAlias: string | null
  oldScript: string | null
}) {
  const candidates: AliasCandidate[] = []
  let currentAlias = params.lastAlias

  const queueAlias = (name: unknown) => {
    if (typeof name !== "string" || !name.trim()) return
    const normalized = name.trim()
    if (params.existingNames.has(normalized)) return

    currentAlias = getNextAlias(currentAlias)
    params.existingNames.add(normalized)
    candidates.push({
      name: normalized,
      alias: currentAlias,
      script: params.scriptId,
      oldScript: params.oldScript,
    })
  }

  for (const screen of params.screenRows) {
    if (excludedScreenType(screen.type)) continue

    if (screen.type === "form" && Array.isArray(screen.fields)) {
      for (const field of screen.fields) {
        if (Array.isArray(field?.prePopulate) && field.prePopulate.length > 0) {
          queueAlias(field.key)
        }
      }
      continue
    }

    if (Array.isArray(screen.prePopulate) && screen.prePopulate.length > 0) {
      queueAlias(screen.key)
    }
  }

  return candidates
}

async function aliasSeeded() {
  const exists = await db.query.aliases.findFirst()
  return !!exists
}

export async function _saveAliases(alls: AliasCandidate[], client?: DbOrTransaction): Promise<SaveAliasesResponse> {
  try {
    if (!alls.length) return { success: true }

    const executor = client ?? db
    await executor.insert(aliases).values(alls)
    return { success: true }
  } catch (e: any) {
    logger.error(e.message)
    return { success: false, errors: [e.message] }
  }
}

export async function _seedAliases() {
  try {
    const leanScripts = await _getLeanScriptIds()
    const alreadySeeded = await aliasSeeded()
    if (!alreadySeeded) {
      await _generateScreenAliases(leanScripts)
    }
  } catch (e: any) {
    logger.error("Error in _seedAliases:", e)
  }
}

export async function _generateScreenAliases(scriptsIds: string[], client?: DbOrTransaction) {
  const executor = client ?? db

  for (const scriptId of scriptsIds) {
    if (!scriptId) continue

    const [scriptRow, existingAliases, screenRows] = await Promise.all([
      executor.query.scripts.findFirst({
        where: eq(scripts.scriptId, scriptId),
        columns: { oldScriptId: true },
      }),
      executor.query.aliases.findMany({
        where: eq(aliases.script, scriptId),
        columns: { name: true, alias: true },
        orderBy: (aliases, { desc }) => [desc(aliases.createdAt)],
      }),
      executor.query.screens.findMany({
        where: and(eq(screens.scriptId, scriptId), isNull(screens.deletedAt)),
        orderBy: (screens, { asc }) => [asc(screens.position)],
      }),
    ])

    const existingNames = new Set(existingAliases.map((entry) => entry.name))
    const lastAlias = existingAliases[0]?.alias ?? null
    const newAliases = buildAliasCandidates({
      scriptId,
      screenRows,
      existingNames,
      lastAlias,
      oldScript: scriptRow?.oldScriptId ?? null,
    })

    if (!newAliases.length) continue

    const saveResult = await _saveAliases(newAliases, executor)
    if (!saveResult.success) {
      throw new Error(saveResult.errors?.join(", ") || `Failed to save aliases for script ${scriptId}`)
    }
  }
}
