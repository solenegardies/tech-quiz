# tech-quiz

A fullstack TypeScript interview preparation platform. Browse a curated bank of 5 000+ technical questions, launch targeted quizzes, and track your revision progress.

## Features

- **Quiz mode** — start short quizzes filtered by difficulty, category, and format; resume paused sessions
- **Browse** — search questions by text, filter by category / difficulty / format, paginated results
- **Question details** — full prompt with code snippets, detailed answer, expected points, common mistakes, and supplementary resources
- **Authentication** — signup, login, email verification, password reset (session-based, secure httpOnly cookies)
- **Backoffice** — admin-only user management (search, activate/deactivate, role changes)

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Monorepo   | Turborepo + pnpm workspaces                       |
| Frontend   | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend    | Express 5, tRPC 11                                |
| Database   | PostgreSQL, Prisma 6                              |
| Auth       | Session-based (argon2 password hashing)           |
| Validation | Zod                                               |
| Language   | TypeScript throughout                             |

## Project Structure

```text
apps/
  server/          Express + tRPC API server (port 3001)
  web/             Next.js frontend (port 3000)
packages/
  shared/          Shared types, enums, and utilities
  ui/              Reusable React component library
  eslint-config/   Shared ESLint config
  typescript-config/ Shared tsconfig
```

Questions are stored as a JSON file loaded at build time by the web app — no database queries needed to browse questions.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9
- PostgreSQL (or use Docker)

### 1. Install dependencies

```sh
pnpm install
```

### 2. Set up the database

**Option A — Docker (easiest):**

```sh
cd apps/server
docker compose up -d
```

This starts a PostgreSQL 15 instance on port 5432.

**Option B — Managed database:**

Use a hosted PostgreSQL provider:

- [Supabase](https://supabase.com) — free tier available
- [Neon](https://neon.tech) — serverless PostgreSQL with a generous free tier

Grab the connection string and set it in your `.env` file (see below).

### 3. Configure environment variables

```sh
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Edit both `.env` files and fill in the required values (database URL, session secret, API URL, etc.).

### 4. Run Prisma migrations

```sh
cd apps/server
npx prisma migrate dev
```

### 5. Start development

From the repo root:

```sh
pnpm dev
```

This starts both the API server (`localhost:3001`) and the Next.js frontend (`localhost:3000`) in parallel via Turborepo.

## Available Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `pnpm dev`              | Start web + server in parallel           |
| `pnpm dev:web`          | Run frontend only                        |
| `pnpm dev:server`       | Run backend only                         |
| `pnpm build`            | Build all packages                       |
| `pnpm lint`             | Lint all code                            |
| `pnpm typecheck`        | Type-check all code                      |
| `pnpm test`             | Run tests                                |
| `pnpm check`            | Full check: build, typecheck, lint, test |
| `pnpm format`           | Format with Prettier                     |
| `pnpm prisma:generate`  | Generate Prisma client                   |

## Deploying to Railway

[Railway](https://railway.com) is the recommended way to deploy both the server and database.

### Deploy the server

1. Create a new project on Railway and connect your GitHub repo.
2. Add a **PostgreSQL** plugin to the project — Railway provisions a database automatically.
3. Add a new service from your repo. Set the following:
   - **Root directory**: `apps/server`
   - **Build command**: `pnpm install && pnpm build`
   - **Start command**: `npx prisma migrate deploy && node dist/main.js`
4. Add environment variables in the Railway dashboard:
   - `DATABASE_URL` — use the reference variable from the PostgreSQL plugin (e.g. `${{Postgres.DATABASE_URL}}`)
   - All other variables from `.env.example` (session secret, frontend URL, email config, etc.)
5. Deploy. Railway will build and start the server automatically.

### Deploy the frontend

1. Add another service in the same Railway project from the same repo.
2. Set the following:
   - **Root directory**: `apps/web`
   - **Build command**: `pnpm install && pnpm build`
   - **Start command**: `pnpm start`
3. Set the `NEXT_PUBLIC_API_URL` environment variable to point to your server service URL.
4. Deploy.

> **Tip:** Railway supports monorepos natively. Each service watches only its own root directory for changes.

### Alternative: Deploy with Dockerfile

The server includes a production-ready multi-stage `Dockerfile`. Railway can detect and use it automatically. Make sure your environment variables are set in the Railway dashboard — the container runs Prisma migrations on startup.
