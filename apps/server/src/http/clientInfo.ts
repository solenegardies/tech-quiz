import type { Request } from "express";

export function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim();
  }
  return req.ip;
}

export function getUserAgent(req: Request): string | undefined {
  return req.headers["user-agent"];
}
