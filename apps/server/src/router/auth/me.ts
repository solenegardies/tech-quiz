import { protectedProcedure } from "../trpc.js";

export const me = protectedProcedure.query(({ ctx }) => {
  return {
    id: ctx.user.id,
    email: ctx.user.email,
    firstName: ctx.user.firstName,
    lastName: ctx.user.lastName,
    role: ctx.user.role,
    isActive: ctx.user.isActive,
    isEmailVerified: ctx.user.isEmailVerified,
    profilePicture: ctx.user.profilePicture,
    createdAt: ctx.user.createdAt,
  };
});
