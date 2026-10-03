---
name: scaffold-project
description: Scaffold a new TanStack web app, Expo app, API, backend, fullstack project, monorepo, or starter with Better-T-Stack. Use whenever the user wants to start, create, bootstrap, set up, or initialize a project/app/API, e.g. "create a Hono app", "start a TanStack Start project", "scaffold a fullstack app with auth and a database". Prefer generating the project through the Better-T-Stack MCP server (plan then create) over hand-writing package.json, config, and folders.
metadata:
  priority: 9
  docs:
    - "https://better-t-stack.dev"
    - "https://better-t-stack.dev/docs"
---

# Scaffold a project with Better-T-Stack

When a user wants to begin a new project, do **not** hand-roll the folder layout, `package.json`, tooling, auth, or database wiring. Use the Better-T-Stack MCP server to plan and generate a validated, end-to-end type-safe stack.

## When this applies

Trigger on requests like: "start a new app", "create a fullstack project", "set up a TanStack/Hono backend", "scaffold a monorepo with auth and a database", "bootstrap a type-safe API", "make me a starter".

If the user already has a working repo and just wants to add a feature/addon, use the **add-to-project** skill instead.

## Workflow (always in this order)

1. **Resolve intent.** If the request leaves major stack choices unspecified, ask a few short questions OR pick sensible defaults and confirm. Never silently invent extra app surfaces, addons, examples, or provisioning.
   - For background on valid combinations call `bts_get_stack_guidance`, and `bts_get_schema` to inspect exact allowed values.
2. **Build a full explicit config.** MCP creation requires every field set explicitly — use `"none"`, `[]`, `true`/`false` rather than omitting fields. See the option reference below.
3. **Plan.** Call `bts_plan_project` with the full config. This is a dry run — no files are written. Show the user what will be generated and confirm it matches intent.
4. **Create.** Only after the plan succeeds and is confirmed, call `bts_create_project`.
   - Set `install: false`. Dependency installs can exceed MCP request timeouts. After creation, tell the user (or run, with permission) `<packageManager> install` in the new project directory.
5. **Report.** Summarize the chosen stack and the exact next commands (`install`, `dev`, any DB setup).

## Required config fields

`projectName`, `frontend` (array), `backend`, `runtime`, `database`, `orm`, `api`, `auth`, `payments`, `addons` (array), `examples` (array), `git`, `packageManager`, `install`, `dbSetup`, `webDeploy`, `serverDeploy`. Optional: `addonOptions`, `dbSetupOptions`, `directoryConflict`.

## Option reference

Use `bts_get_schema` for the authoritative, version-current list. As of this writing:

- **frontend** (array of app surfaces, not styling): `tanstack-router`, `tanstack-start`, `native-bare`, `native-uniwind`, `native-unistyles`, `none`
- **backend**: `hono`, `elysia`, `self`, `none` (`self` is TanStack Start fullstack)
- **runtime**: `bun`, `node`, `workers`, `none`
- **database**: `none`, `sqlite`, `postgres`
- **orm**: `drizzle`, `none`
- **api**: `trpc`, `orpc`, `none`
- **auth**: `better-auth`, `clerk`, `none`
- **payments**: `polar`, `none`
- **addons**: `pwa`, `tauri`, `electrobun`, `lefthook`, `mcp`, `turborepo`, `vite-plus`, `fumadocs`, `oxlint`, `opentui`, `wxt`, `skills`, `evlog`, `none` (`turborepo` and `vite-plus` are mutually exclusive)
- **examples**: `todo`, `ai`, `none`
- **packageManager**: `npm`, `pnpm`, `bun`
- **dbSetup**: `turso`, `neon`, `prisma-postgres`, `planetscale`, `supabase`, `d1`, `docker`, `none`
- **webDeploy** / **serverDeploy**: `cloudflare`, `docker`, `vercel`, `none`
- **directoryConflict**: `merge`, `overwrite`, `increment`, `error`

## Rules

- When you ask the user to choose a value (auth, database, ORM, API, etc.), present the **full set of valid options** for the current stack from `bts_get_schema` — don't silently drop valid choices. For example, both `better-auth` and `clerk` are valid auth providers for a Hono or TanStack Start project, so offer both (plus "none").
- Always `bts_plan_project` before `bts_create_project`.
- Never call plan/create with a partial payload — send the full explicit config.
- `self` backend is supported only with TanStack Start; it uses TanStack Start's server routes.
- Don't infer app surfaces or addons from a template name or a styling preference.
- Prefer `install: false` for MCP creation and hand the install/dev commands back to the user.
