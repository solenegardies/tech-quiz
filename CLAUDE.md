# CLAUDE.md

## Workflow rules

- **Never commit**: The user handles all commits manually.
- **Never act on Prisma DB**: No migrate, push, seed, reset, etc.
- **Never modify or read .env files**.
- **Never delete or overwrite untracked files without asking**.

## Naming conventions

- **Files in camelCase** (PascalCase acceptable for React components).
- **Folders in kebab-case**.
- **Single-function files**: If a file has one main exported function, the file name must match that function name exactly (e.g., `createSession.ts` exports `createSession`).

## Code quality rules

- **Max 500 lines per file** — split into smaller modules.
- **No code duplication** — extract shared utility functions.
- **Error logger format**: Single string argument starting with function name: `` `[functionName] Error doing something... ${data}` ``. One argument only, no separate objects.
- **No hardcoded secrets** — use `env` from `lib/env`, never `process.env`. Add new vars to the Zod schema in `apps/server/src/lib/env/index.ts`.
- **No raw literals in comparisons** — use named constants or enums.
- **Limit `any` types to minimum** — use `unknown`, proper types, or generics.
- **No direct Prisma calls outside repositories** — all `prisma.model.method()` calls must go through repository classes in `apps/server/src/repositories/`. Router handlers, auth modules, and lib files must instantiate and use repos instead. For `$transaction`, either use repo methods that return `PrismaPromise` or add a dedicated repo method that encapsulates the transaction.
