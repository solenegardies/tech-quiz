import { z } from "zod";
import argon2 from "argon2";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc.js";
import { consumePasswordResetToken } from "../../auth/password-reset/index.js";
import { UserRepository } from "../../repositories/userRepository.js";
import { createSession } from "../../auth/session/index.js";
import { setSessionCookie } from "../../auth/session/cookie.js";
import { getClientIp } from "../../http/clientInfo.js";

export const resetPassword = publicProcedure
  .input(
    z.object({
      token: z.string(),
      password: z.string().min(8),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const ip = getClientIp(ctx.req);
    const { userId } = await consumePasswordResetToken(ctx.prisma, input.token, ip);

    if (!userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid or expired reset token",
      });
    }

    const passwordHash = await argon2.hash(input.password);
    const userRepo = new UserRepository(ctx.prisma);
    await userRepo.update(userId, { passwordHash });

    // Auto-login after reset
    const { token } = await createSession(ctx.prisma, userId);
    setSessionCookie(ctx.res, token);

    return { success: true };
  });
