import crypto from "crypto";
import { generateSecureRandomString } from "../toolbox.js";

export async function hashSecret(secret: string): Promise<Buffer> {
  return Buffer.from(await crypto.subtle.digest("SHA-256", Buffer.from(secret)));
}

export function splitToken(token: string): { id: string; secret: string } | null {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return null;
  const id = token.slice(0, dotIndex);
  const secret = token.slice(dotIndex + 1);
  if (!id || !secret) return null;
  return { id, secret };
}

export async function generateToken(): Promise<{
  id: string;
  token: string;
  secretHash: Buffer;
}> {
  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const secretHash = await hashSecret(secret);
  return { id, token: `${id}.${secret}`, secretHash };
}
