export type RemoteScriptImportItem = {
  scriptId: string
  overWriteExistingScriptWithId?: string
}

export async function runRemoteScriptImports({
  siteId,
  scriptsToImport,
  copyScript,
}: {
  siteId: string
  scriptsToImport: RemoteScriptImportItem[]
  copyScript: (params: {
    fromRemoteSiteId: string
    scriptsIds: string[]
    overWriteScriptWithId?: string
    broadcastAction?: boolean
  }) => Promise<{ errors?: string[] }>
}) {
  if (!siteId) throw new Error("Missing siteId")
  if (!scriptsToImport?.length) throw new Error("No scripts provided for import")

  const errors: string[] = []

  for (const scriptToImport of scriptsToImport) {
    if (!scriptToImport?.scriptId) {
      errors.push("Missing scriptId for import item")
      continue
    }

    const res = await copyScript({
      fromRemoteSiteId: siteId,
      scriptsIds: [scriptToImport.scriptId],
      overWriteScriptWithId: scriptToImport.overWriteExistingScriptWithId,
      broadcastAction: false,
    })

    if (res.errors?.length) {
      errors.push(...res.errors.map((error) => `[scriptId=${scriptToImport.scriptId}] ${error}`))
    }
  }

  return {
    success: errors.length === 0,
    errors: errors.length ? errors : undefined,
  }
}
