import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one with: openssl rand -base64 32",
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must decode to 32 bytes (got ${key.length}). Use: openssl rand -base64 32`,
    );
  }
  return key;
}

/**
 * Encrypts plaintext with AES-256-GCM.
 * Returns `base64(iv):base64(ciphertext):base64(authTag)`.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), ciphertext.toString("base64"), authTag.toString("base64")].join(":");
}

export function decrypt(payload: string): string {
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Malformed encrypted payload");
  }
  const [ivB64, ctB64, tagB64] = parts as [string, string, string];
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Malformed encrypted payload");
  }
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/** Mask an API key for UI display: sk-ant-****...abcd */
export function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••";
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}
