import { router } from "./trpc.js";
import { authRouter } from "./auth/index.js";
import { backofficeRouter } from "./backoffice/index.js";

export const appRouter = router({
  auth: authRouter,
  backoffice: backofficeRouter,
});

export type AppRouter = typeof appRouter;
