FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @tech-quiz/server...

FROM base AS build
COPY --from=deps /app ./
COPY . .
RUN pnpm --filter @tech-quiz/server run build

FROM base AS production
COPY --from=build /app/apps/server/dist ./dist
COPY --from=build /app/apps/server/prisma ./prisma
COPY --from=build /app/apps/server/node_modules ./node_modules
COPY --from=build /app/apps/server/package.json ./

EXPOSE 3001

CMD ["node", "dist/main.js"]
