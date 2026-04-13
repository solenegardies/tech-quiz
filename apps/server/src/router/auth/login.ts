import { z } from "zod";
import argon2 from "argon2";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc.js";
import { UserRepository } from "../../repositories/userRepository.js";
import { createSession } from "../../auth/session/index.js";
import { setSessionCookie } from "../../auth/session/cookie.js";
import { normalizeEmail } from "@tech-quiz/shared";

export const login = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const email = normalizeEmail(input.email);
    const userRepo = new UserRepository(ctx.prisma);

    const user = await userRepo.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    }

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    }

    if (!user.isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Account is deactivated" });
    }

    const { token } = await createSession(ctx.prisma, user.id);
    setSessionCookie(ctx.res, token);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  });
