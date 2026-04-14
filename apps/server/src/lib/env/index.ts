import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.string().default("verbose"),
  DOMAIN: z.string().default("localhost:3000"),
  DATABASE_URL: z.string().optional(),
  SESSION_COOKIE_NAME: z.string().default("session"),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().default("noreply@yourdomain.com"),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
