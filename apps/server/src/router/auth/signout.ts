import { protectedProcedure } from "../trpc.js";
import { getSessionTokenFromRequest } from "../../auth/session/token.js";
import { deleteSession } from "../../auth/session/index.js";
import { clearSessionCookie } from "../../auth/session/cookie.js";

export const signout = protectedProcedure.mutation(async ({ ctx }) => {
  const token = getSessionTokenFromRequest(ctx.req);
  if (token) {
    await deleteSession(ctx.prisma, token);
  }
  clearSessionCookie(ctx.res);
  return { success: true };
});
