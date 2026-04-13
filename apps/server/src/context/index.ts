import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { prisma } from "../lib/prisma/index.js";
import { getSessionTokenFromRequest } from "../auth/session/token.js";
import { getUserContext } from "./user.js";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const token = getSessionTokenFromRequest(req);
  const { user } = await getUserContext({ token, prisma });

  return { req, res, user, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
