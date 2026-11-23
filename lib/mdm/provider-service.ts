import { HeadwindMdmProvider } from "./headwind-provider"
import type { MdmProvider, MdmProviderConfig } from "./types"

export function createMdmProvider(config: MdmProviderConfig): MdmProvider {
  if (config.provider === "headwind") return new HeadwindMdmProvider(config)
  throw new Error(`Unsupported MDM provider: ${config.provider}`)
}

export function maskSecret(value?: string | null) {
  if (!value) return ""
  if (value.length <= 8) return "********"
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}
