import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc.js";
import { EmailVerificationTokenRepository } from "../../repositories/emailVerificationTokenRepository.js";
import { UserRepository } from "../../repositories/userRepository.js";
import { getClientIp } from "../../http/clientInfo.js";

export const verifyEmail = publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const ip = getClientIp(ctx.req);
    const tokenRepo = new EmailVerificationTokenRepository(ctx.prisma);
    const { userId } = await tokenRepo.consume(input.token, ip);

    if (!userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid or expired verification token",
      });
    }

    const userRepo = new UserRepository(ctx.prisma);
    await userRepo.update(userId, { isEmailVerified: true });

    return { success: true };
  });
