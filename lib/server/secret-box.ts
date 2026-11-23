import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const PREFIX = "ntsec:v1"
// Pin the GCM tag to the full 16 bytes. Without this, decipher accepts truncated tags
// (down to 4 bytes), which makes forging a ciphertext far cheaper.
const AUTH_TAG_LENGTH = 16

function getSecretKey() {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET is required to encrypt MDM credentials")
  return crypto.createHash("sha256").update(secret).digest()
}

export function encryptSecret(value?: string | null) {
  if (!value) return null
  if (value.startsWith(`${PREFIX}:`)) return value

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv, { authTagLength: AUTH_TAG_LENGTH })
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [
    PREFIX,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":")
}

export function decryptSecret(value?: string | null) {
  if (!value) return null
  if (!value.startsWith(`${PREFIX}:`)) return value

  const [, , ivRaw, authTagRaw, encryptedRaw] = value.split(":")
  if (!ivRaw || !authTagRaw || !encryptedRaw) throw new Error("Encrypted secret is malformed")

  const authTag = Buffer.from(authTagRaw, "base64url")
  if (authTag.length !== AUTH_TAG_LENGTH) throw new Error("Encrypted secret is malformed")

  const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), Buffer.from(ivRaw, "base64url"), {
    authTagLength: AUTH_TAG_LENGTH,
  })
  decipher.setAuthTag(authTag)

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}
