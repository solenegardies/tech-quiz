import type { PrismaClient } from "@prisma/client";
import { generateToken, hashSecret, splitToken } from "../token/index.js";
import { constantTimeEqual } from "../toolbox.js";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createSession(prisma: PrismaClient, userId: string) {
  const { id, token, secretHash } = await generateToken();

  await prisma.session.create({
    data: {
      id,
      secretHash: new Uint8Array(secretHash),
      userId,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });

  return { token };
}

export async function validateSessionToken(prisma: PrismaClient, token: string) {
  const parts = splitToken(token);
  if (!parts) return { user: null };

  const session = await prisma.session.findUnique({
    where: { id: parts.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          profilePicture: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) return { user: null };

  // Check expiry
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return { user: null };
  }

  // Constant-time comparison of secret hash
  const providedHash = await hashSecret(parts.secret);
  if (!constantTimeEqual(Buffer.from(session.secretHash), providedHash)) {
    return { user: null };
  }

  return { user: session.user };
}

export async function deleteSession(prisma: PrismaClient, token: string) {
  const parts = splitToken(token);
  if (!parts) return;
  await prisma.session.delete({ where: { id: parts.id } }).catch(() => {});
}
