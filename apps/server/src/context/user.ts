import type { PrismaClient } from "../generated/prisma/client.js";
import { validateSessionToken } from "../auth/session/index.js";

export async function getUserContext({
  token,
  prisma,
}: {
  token: string | null;
  prisma: PrismaClient;
}) {
  if (!token) return { user: null };
  return validateSessionToken(prisma, token);
}
