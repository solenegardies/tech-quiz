import { protectedProcedure } from "../trpc.js";
import { EmailVerificationTokenRepository } from "../../repositories/emailVerificationTokenRepository.js";
import { sendEmail } from "../../lib/email/emailService.js";
import { getClientIp, getUserAgent } from "../../http/clientInfo.js";
import { env } from "../../lib/env/index.js";

export const requestEmailVerification = protectedProcedure.mutation(async ({ ctx }) => {
  const tokenRepo = new EmailVerificationTokenRepository(ctx.prisma);
  const ip = getClientIp(ctx.req);
  const ua = getUserAgent(ctx.req);

  const { token } = await tokenRepo.issue(ctx.user.id, ip, ua);

  const protocol = env.NODE_ENV === "production" ? "https" : "http";
  const verifyUrl = `${protocol}://${env.DOMAIN}/verify-email?token=${token}`;

  await sendEmail({
    to: ctx.user.email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email address.</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `,
  });

  return { message: "Verification email sent" };
});
