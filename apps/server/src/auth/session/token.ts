import type { Request } from "express";
import { env } from "../../lib/env/index.js";

export function getSessionTokenFromRequest(req: Request): string | null {
  const cookieName = env.SESSION_COOKIE_NAME;
  const token = req.cookies?.[cookieName];
  return typeof token === "string" ? token : null;
}
