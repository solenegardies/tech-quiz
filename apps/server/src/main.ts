import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./router/index.js";
import { createContext } from "./context/index.js";
import { env } from "./lib/env/index.js";
import { logger } from "./lib/logger/index.js";

const app = express();

app.use(
  cors({
    origin: env.NODE_ENV === "production" ? `https://${env.DOMAIN}` : `http://${env.DOMAIN}`,
    credentials: true,
  }),
);
app.use(cookieParser());

app.use(
  "/",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
