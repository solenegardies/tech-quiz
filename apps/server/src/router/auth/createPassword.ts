import { z } from "zod";
import argon2 from "argon2";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../trpc.js";
import { UserRepository } from "../../repositories/userRepository.js";

export const createPassword = protectedProcedure
  .input(
    z.object({
      password: z.string().min(8),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const userRepo = new UserRepository(ctx.prisma);
    const user = await userRepo.findById(ctx.user.id);

    if (user?.passwordHash) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Password already set. Use password reset instead.",
      });
    }

    const passwordHash = await argon2.hash(input.password);
    await userRepo.update(ctx.user.id, { passwordHash });

    return { success: true };
  });
