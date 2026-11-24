// MERGE-GATE CANARY - DO NOT MERGE. Exists only to test that the security merge gate blocks this PR.
// Never imported. Trips Semgrep gcm-no-tag-length (AES-GCM decipher without authTagLength).
import crypto from "crypto";

export function canaryDecrypt(key: Buffer, iv: Buffer, tag: Buffer, data: Buffer) {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}
