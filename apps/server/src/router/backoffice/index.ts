import { z } from "zod";
import { router, adminProcedure } from "../trpc.js";
import { UserRepository } from "../../repositories/userRepository.js";

export const backofficeRouter = router({
  listUsers: adminProcedure
    .input(
      z.object({
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).max(100).default(20),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userRepo = new UserRepository(ctx.prisma);

      const where = input.search
        ? {
            OR: [
              { email: { contains: input.search, mode: "insensitive" as const } },
              { firstName: { contains: input.search, mode: "insensitive" as const } },
              { lastName: { contains: input.search, mode: "insensitive" as const } },
            ],
          }
        : undefined;

      const [users, total] = await Promise.all([
        userRepo.findMany({
          skip: input.skip,
          take: input.take,
          where,
          orderBy: { createdAt: "desc" },
        }),
        userRepo.count(where),
      ]);

      return { users, total };
    }),

  toggleUserActive: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userRepo = new UserRepository(ctx.prisma);
      await userRepo.update(input.userId, { isActive: input.isActive });
      return { success: true };
    }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["USER", "ADMIN"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userRepo = new UserRepository(ctx.prisma);
      await userRepo.update(input.userId, { role: input.role });
      return { success: true };
    }),
});
