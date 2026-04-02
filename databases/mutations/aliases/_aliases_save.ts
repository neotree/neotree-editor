import { and, desc, eq, Query } from "drizzle-orm"

import { _getLeanScriptIds } from "@/databases/queries/scripts"
import db from "@/databases/pg/drizzle"
import type { DbOrTransaction } from "@/databases/pg/db-client"
import { aliases, scripts, screens } from "@/databases/pg/schema"
import logger from "@/lib/logger"

export type SaveAliasesResponse = {
  success: boolean
  errors?: string[]
  info?: { query?: Query }
}

type AliasDraft = {
  alias: string
  name: string
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

  const nextLettersNum = toNumber(letters) + 1
  let nextLetters = toLetters(nextLettersNum)

  if (nextLetters.length > letters.length) {
    nextLetters = "A"
    return nextLetters + (num + 1)
  }

  return nextLetters + (numStr || "")
}

function excludedScreenType(type: string) {
  const excluded = [
    "management",
    "mwi_edliz_summary_table",
    "progress",
    "zw_edliz_summary_table",
    "diagnosis",
    "drugs",
    "fluids",
    "feeds",
  ]
  return excluded.includes(type)
}

async function aliasExists(
  executor: DbOrTransaction,
  opts: { script: string; name: string }
) {
  const duplicate = await executor.query.aliases.findFirst({
    where: and(eq(aliases.script, opts.script), eq(aliases.name, opts.name)),
  })
  return !!duplicate
}

async function aliasSeeded(executor: DbOrTransaction) {
  const exists = await executor.query.aliases.findFirst()
  return !!exists
}

async function getLastAlias(executor: DbOrTransaction, scriptId: string) {
  if (!scriptId) return ""
  const lastAlias = await executor.query.aliases.findFirst({
    where: eq(aliases.script, scriptId),
    orderBy: desc(aliases.createdAt),
  })

  return lastAlias?.alias || ""
}

async function getOldScript(executor: DbOrTransaction, scriptId: string) {
  const oldScript = await executor.query.scripts.findFirst({
    where: eq(scripts.scriptId, scriptId),
    columns: { oldScriptId: true },
  })

  return oldScript?.oldScriptId || null
}

async function getScriptScreens(executor: DbOrTransaction, scriptId: string) {
  return executor.query.screens.findMany({
    where: eq(screens.scriptId, scriptId),
  })
}

async function assignAliases(
  executor: DbOrTransaction,
  scriptId: string,
  scriptScreens: any[],
  lastAlias: string | null,
  oldScript: string | null
): Promise<AliasDraft[]> {
  const updated: AliasDraft[] = []
  let currentAlias = lastAlias

  for (const screen of scriptScreens) {
    if (excludedScreenType(screen.type)) continue

    if (screen.type === "form" && Array.isArray(screen.fields)) {
      for (const field of screen.fields) {
        if (
          Array.isArray(field.prePopulate) &&
          field.prePopulate.length > 0 &&
          !(await aliasExists(executor, { name: field.key, script: scriptId }))
        ) {
          currentAlias = getNextAlias(currentAlias)
          updated.push({
            name: field.key,
            alias: currentAlias,
            script: scriptId,
            oldScript,
          })
        }
      }
      continue
    }

    if (
      Array.isArray(screen.prePopulate) &&
      screen.prePopulate.length > 0 &&
      !(await aliasExists(executor, { name: screen.key, script: scriptId }))
    ) {
      currentAlias = getNextAlias(currentAlias)
      updated.push({
        name: screen.key,
        alias: currentAlias,
        script: scriptId,
        oldScript,
      })
    }
  }

  return updated
}

export async function _saveAliases(
  alls: AliasDraft[],
  opts?: { client?: DbOrTransaction }
): Promise<SaveAliasesResponse> {
  const response: SaveAliasesResponse = { success: false }
  const errors: string[] = []
  const info: SaveAliasesResponse["info"] = {}
  const executor = opts?.client || db

  try {
    for (const al of alls) {
      const duplicate = await executor.query.aliases.findFirst({
        where: and(eq(aliases.script, al.script), eq(aliases.name, al.name)),
        orderBy: desc(aliases.createdAt),
      })

      if (duplicate) continue

      const q = executor.insert(aliases).values({
        alias: al.alias,
        name: al.name,
        script: al.script,
        oldScript: al.oldScript,
      })

      info.query = q.toSQL()
      await q.execute()
    }

    response.success = true
    return response
  } catch (ex: any) {
    logger.error(ex.message)
    errors.push(ex.message)
    response.errors = errors
    response.info = info
    return response
  }
}

export async function _seedAliases() {
  try {
    const leanScripts = await _getLeanScriptIds()
    const alreadySeeded = await aliasSeeded(db)
    if (!alreadySeeded) {
      await _generateScreenAliases(leanScripts)
    }
  } catch (e: any) {
    logger.error("_seedAliases ERROR", e?.message || e)
  }
}

export async function _generateScreenAliases(
  scriptsIds: string[],
  opts?: { client?: DbOrTransaction }
): Promise<SaveAliasesResponse> {
  const executor = opts?.client || db
  const errors: string[] = []

  try {
    for (const scriptId of scriptsIds) {
      if (!scriptId) continue

      const [oldScript, lastAlias, scriptScreens] = await Promise.all([
        getOldScript(executor, scriptId),
        getLastAlias(executor, scriptId),
        getScriptScreens(executor, scriptId),
      ])

      const aliasesToSave = await assignAliases(executor, scriptId, scriptScreens, lastAlias, oldScript)
      if (!aliasesToSave.length) continue

      const res = await _saveAliases(aliasesToSave, { client: executor })
      if (!res.success) {
        errors.push(...(res.errors || ["Failed to save aliases"]))
      }
    }

    return {
      success: !errors.length,
      errors: errors.length ? errors : undefined,
    }
  } catch (e: any) {
    logger.error("Error in _generateScreenAliases:", e)
    return {
      success: false,
      errors: [e?.message || "Failed to generate screen aliases"],
    }
  }
}
