import { z } from "zod";
import { publicProcedure } from "../trpc.js";
import { UserRepository } from "../../repositories/userRepository.js";
import { issuePasswordResetToken } from "../../auth/password-reset/index.js";
import { sendEmail } from "../../lib/email/emailService.js";
import { getClientIp, getUserAgent } from "../../http/clientInfo.js";
import { env } from "../../lib/env/index.js";
import { normalizeEmail } from "@tech-quiz/shared";

export const requestPasswordReset = publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input, ctx }) => {
    const email = normalizeEmail(input.email);
    const userRepo = new UserRepository(ctx.prisma);
    const user = await userRepo.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: "If an account exists, a reset email has been sent." };
    }

    const ip = getClientIp(ctx.req);
    const ua = getUserAgent(ctx.req);
    const { token } = await issuePasswordResetToken(ctx.prisma, user.id, ip, ua);

    const protocol = env.NODE_ENV === "production" ? "https" : "http";
    const resetUrl = `${protocol}://${env.DOMAIN}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    return { message: "If an account exists, a reset email has been sent." };
  });
