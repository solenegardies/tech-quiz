import type { PrismaClient } from "../../generated/prisma/client.js";
import { generateToken, hashSecret, splitToken } from "../token/index.js";
import { constantTimeEqual } from "../toolbox.js";

const RESET_TOKEN_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function issuePasswordResetToken(
  prisma: PrismaClient,
  userId: string,
  requestedIp?: string,
  userAgent?: string,
) {
  const { id, token, secretHash } = await generateToken();

  await prisma.passwordResetToken.create({
    data: {
      id,
      userId,
      secretHash: secretHash.toString("hex"),
      expiresAt: new Date(Date.now() + RESET_TOKEN_DURATION_MS),
      requestedIp,
      userAgent,
    },
  });

  return { token };
}

export async function consumePasswordResetToken(
  prisma: PrismaClient,
  token: string,
  usedIp?: string,
) {
  const parts = splitToken(token);
  if (!parts) return { userId: null };

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { id: parts.id },
  });

  if (!resetToken) return { userId: null };
  if (resetToken.usedAt) return { userId: null };
  if (resetToken.expiresAt < new Date()) return { userId: null };

  const providedHash = await hashSecret(parts.secret);
  const storedHash = Buffer.from(resetToken.secretHash, "hex");
  if (!constantTimeEqual(storedHash, providedHash)) {
    return { userId: null };
  }

  // Mark as used
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date(), usedIp },
  });

  return { userId: resetToken.userId };
}
