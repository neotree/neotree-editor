const UUID_LOOSE_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuidLike(value: unknown): value is string {
  return typeof value === "string" && UUID_LOOSE_REGEX.test(value)
}
