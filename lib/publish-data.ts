import type { DataKeyIntegrityPublishDetails } from "@/lib/data-key-integrity"

export type PublishDataResponse = {
  success: boolean
  errors?: string[]
  warnings?: string[]
  blockingDetails?: unknown
}

export function isDataKeyIntegrityPublishDetails(
  value: unknown,
): value is DataKeyIntegrityPublishDetails {
  if (!value || typeof value !== "object") return false

  const details = value as Partial<DataKeyIntegrityPublishDetails>
  if (
    typeof details.totalIssues !== "number"
    || typeof details.totalScripts !== "number"
    || !Array.isArray(details.summary)
    || !details.summary.every((line) => typeof line === "string")
    || !Array.isArray(details.scripts)
  ) {
    return false
  }

  return details.scripts.every((script) => (
    !!script
    && typeof script === "object"
    && typeof script.scriptId === "string"
    && typeof script.scriptTitle === "string"
    && typeof script.totalIssues === "number"
    && typeof script.registryHref === "string"
    && typeof script.scriptHref === "string"
    && Array.isArray(script.issues)
    && script.issues.every((issue) => (
      !!issue
      && typeof issue === "object"
      && typeof issue.scriptId === "string"
      && typeof issue.scriptTitle === "string"
      && typeof issue.ruleLabel === "string"
      && typeof issue.displayName === "string"
      && typeof issue.reason === "string"
      && typeof issue.location === "string"
      && typeof issue.usageHref === "string"
      && typeof issue.registryHref === "string"
      && typeof issue.scriptHref === "string"
    ))
  ))
}
