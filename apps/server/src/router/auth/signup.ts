import { z } from "zod";
import argon2 from "argon2";
import { publicProcedure } from "../trpc.js";
import { UserRepository } from "../../repositories/userRepository.js";
import { createSession } from "../../auth/session/index.js";
import { setSessionCookie } from "../../auth/session/cookie.js";
import { normalizeEmail } from "@tech-quiz/shared";

export const signup = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().min(1),
      lastName: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const email = normalizeEmail(input.email);
    const userRepo = new UserRepository(ctx.prisma);

    const existing = await userRepo.findByEmail(email);
    if (existing) {
      // Generic message to prevent email enumeration
      throw new Error("Unable to create account");
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await userRepo.create({
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

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
