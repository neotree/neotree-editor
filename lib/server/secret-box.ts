import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const PREFIX = "ntsec:v1"

function getSecretKey() {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET is required to encrypt MDM credentials")
  return crypto.createHash("sha256").update(secret).digest()
}

export function encryptSecret(value?: string | null) {
  if (!value) return null
  if (value.startsWith(`${PREFIX}:`)) return value

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv)
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

  const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), Buffer.from(ivRaw, "base64url"))
  decipher.setAuthTag(Buffer.from(authTagRaw, "base64url"))

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}
