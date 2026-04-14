import type { PrismaClient } from "@prisma/client";
import { generateToken, hashSecret, splitToken } from "../auth/token/index.js";
import { constantTimeEqual } from "../auth/toolbox.js";

const VERIFICATION_TOKEN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class EmailVerificationTokenRepository {
  constructor(private prisma: PrismaClient) {}

  async issue(userId: string, requestedIp?: string, userAgent?: string) {
    const { id, token, secretHash } = await generateToken();

    await this.prisma.emailVerificationToken.create({
      data: {
        id,
        userId,
        secretHash: secretHash.toString("hex"),
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_DURATION_MS),
        requestedIp,
        userAgent,
      },
    });

    return { token };
  }

  async consume(token: string, usedIp?: string) {
    const parts = splitToken(token);
    if (!parts) return { userId: null };

    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { id: parts.id },
    });

    if (!verificationToken) return { userId: null };
    if (verificationToken.usedAt) return { userId: null };
    if (verificationToken.expiresAt < new Date()) return { userId: null };

    const providedHash = await hashSecret(parts.secret);
    const storedHash = Buffer.from(verificationToken.secretHash, "hex");
    if (!constantTimeEqual(storedHash, providedHash)) {
      return { userId: null };
    }

    // Mark as used and delete other tokens for same user
    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date(), usedIp },
      }),
      this.prisma.emailVerificationToken.deleteMany({
        where: {
          userId: verificationToken.userId,
          id: { not: verificationToken.id },
        },
      }),
    ]);

    return { userId: verificationToken.userId };
  }
}
