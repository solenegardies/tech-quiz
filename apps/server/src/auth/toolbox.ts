import crypto from "crypto";

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function generateSecureRandomString(length = 24): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
