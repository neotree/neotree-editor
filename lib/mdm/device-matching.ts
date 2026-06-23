const invalidHardwareSerials = new Set([
  "unknown",
  "null",
  "none",
  "na",
  "0123456789abcdef",
  "0000000000000000",
])

export function normalizeHardwareSerial(value: unknown) {
  const serial = `${value || ""}`.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
  if (serial.length < 6 || invalidHardwareSerials.has(serial)) return ""
  if (/^(.)\1+$/.test(serial)) return ""
  return serial
}

export function hardwareSerialsMatchForReview(left: unknown, right: unknown) {
  const normalizedLeft = normalizeHardwareSerial(left)
  return !!normalizedLeft && normalizedLeft === normalizeHardwareSerial(right)
}
