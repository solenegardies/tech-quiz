import type { Response } from "express";
import { env } from "../../lib/env/index.js";

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCookieOptions() {
  const isProd = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    path: "/",
    domain: isProd ? env.DOMAIN.replace(/:\d+$/, "") : undefined,
  };
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookie(res: Response): void {
  res.cookie(env.SESSION_COOKIE_NAME, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
}
