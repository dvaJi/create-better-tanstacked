# Create Better-T-Stack CLI

A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations

## Sponsors

<p align="center">
<img src="https://sponsors.better-t-stack.dev/sponsors.png" alt="Sponsors">
</p>

![demo](https://cdn.jsdelivr.net/gh/dvaji/create-better-tanstacked@master/demo.gif)

## Quick Start

Run without installing globally:

```bash
# Using bun (recommended)
bun create better-tanstacked@latest

# Using pnpm
pnpm create better-tanstacked@latest

# Using npm
npx create-better-tanstacked@latest
```

Follow the prompts to configure your project or use the `--yes` flag for defaults.

## Requirements

- Node.js 22 or newer to run the CLI with Node.js. The selected framework may require a newer release; the CLI checks the exact stack before writing files.
- Bun 1.4 or newer is recommended. Bun 1.2.14 remains the minimum because generated workspaces use dependency catalogs.
- pnpm 10.26.0 or newer when using pnpm (catalogs and `allowBuilds`).
- npm 11.16.0 or newer when using npm (`allowScripts`).

Docker Compose 2.24 or newer is required by generated Docker stacks. Git, Rust, Docker,
and platform SDKs otherwise remain optional and are only needed when you use their corresponding
generated commands.

## Features

| Category                 | Options                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **TypeScript**           | End-to-end type safety across the generated application                                                   |
| **Frontend**             | TanStack Router, TanStack Start, Expo Bare, Expo Uniwind, Expo Unistyles, or none                         |
| **Backend**              | Hono, Elysia, TanStack Start fullstack, or none                                                           |
| **API Layer**            | tRPC, oRPC, or none                                                                                       |
| **Runtime**              | Bun, Node.js, Cloudflare Workers, or none                                                                 |
| **Database**             | SQLite, PostgreSQL, or none                                                                               |
| **ORM**                  | Drizzle or none                                                                                           |
| **Database Setup**       | Turso, Cloudflare D1, Neon, Supabase, Prisma Postgres, PlanetScale, Docker, or none                       |
| **Authentication**       | Better Auth, Clerk, or none                                                                               |
| **Styling**              | Tailwind CSS with a shared shadcn/ui package for React web apps                                           |
| **Addons**               | PWA, Tauri, Electrobun, Fumadocs, Oxlint, Lefthook, Turborepo, Vite+, evlog, MCP, Skills, OpenTUI, or WXT |
| **Examples**             | Todo app or AI chat interface (Vercel AI SDK)                                                             |
| **Developer Experience** | Git initialization, package manager choice (npm, pnpm, bun), and automatic dependency installation        |

## Usage

```bash
Usage: create-better-tanstacked [project-directory] [options]

Options:
  -V, --version                   Output the version number
  -y, --yes                       Use default configuration
  --template <type>               Use a template (uniwind, none)
  --database <type>               Database type (none, sqlite, postgres)
  --orm <type>                    ORM type (none, drizzle)
  --dry-run                       Validate configuration without writing files
  --auth <provider>               Authentication (better-auth, clerk, none)
  --payments <provider>           Payments provider (polar, none)
  --frontend <types...>           Frontend types (tanstack-router, tanstack-start, native-bare, native-uniwind, native-unistyles, none)
  --addons <types...>             Additional addons (pwa, tauri, electrobun, lefthook, mcp, turborepo, vite-plus, fumadocs, oxlint, opentui, wxt, skills, evlog, none)
  --examples <types...>           Examples to include (todo, ai, none)
  --git                           Initialize git repository
  --no-git                        Skip git initialization
  --package-manager <pm>          Package manager (npm, pnpm, bun)
  --install                       Install dependencies
  --no-install                    Skip installing dependencies
  --open <target>                 Open in an editor, IDE, or coding agent after creation
  --db-setup <setup>              Database setup (turso, d1, neon, supabase, prisma-postgres, planetscale, docker, none)
  --web-deploy <setup>            Web deployment (cloudflare, docker, vercel, none)
  --server-deploy <setup>         Server deployment (cloudflare, docker, vercel, none)
  --backend <framework>           Backend framework (hono, elysia, self, none)
  --runtime <runtime>             Runtime (bun, node, workers, none)
  --api <type>                    API type (trpc, orpc, none)
  --directory-conflict <strategy> Directory strategy (merge, overwrite, increment, error)
  --manual-db                     Skip automatic database setup prompts
  -h, --help                      Display help
```

### Agent-Focused Commands

```bash
# Raw JSON payload input (agent-friendly)
create-better-tanstacked create-json --input '{"projectName":"my-app","yes":true,"dryRun":true}'
create-better-tanstacked add-json --input '{"projectDir":"./my-app","addons":["wxt"],"addonOptions":{"wxt":{"template":"react"}}}'
create-better-tanstacked create-json --input '{"projectName":"db-app","database":"postgres","orm":"drizzle","dbSetup":"neon","dbSetupOptions":{"mode":"manual"}}'

# Runtime schema/introspection output
create-better-tanstacked schema --name all
create-better-tanstacked schema --name createInput
create-better-tanstacked schema --name addInput
create-better-tanstacked schema --name addonOptions
create-better-tanstacked schema --name dbSetupOptions
create-better-tanstacked schema --name cli

# Local stdio MCP server
npx create-better-tanstacked@latest mcp
```

To install Better T Stack into supported agent configs with `add-mcp` and avoid relying on a global CLI install:

```bash
npx -y add-mcp@latest "npx -y create-better-tanstacked@latest mcp"
```

When you scaffold with the `mcp` addon, Better T Stack itself can also be installed into supported agent configs through `add-mcp` using a package runner command instead of assuming a global CLI install. For Bun projects, the generated config uses the equivalent `bunx create-better-tanstacked@latest mcp` server command inside `add-mcp`.

For MCP project creation, prefer `install: false`. Long dependency installs can exceed common MCP client request timeouts, so the safest flow is to scaffold first and run your package manager install command afterward in the project directory.

## Telemetry

This CLI collects anonymous usage data to help improve the tool. The data collected includes:

- Configuration options selected
- CLI version
- Node.js version
- Platform (OS)
- How the CLI was driven (prompts, flags, `--yes`, JSON, the programmatic API, or the MCP server)

Separately, one anonymous failure event is sent when a scaffold breaks (stage and error class, never full messages or paths). See the [analytics documentation](https://better-t-stack.dev/docs/analytics) for details.

**Telemetry is enabled by default in published versions** to help us understand usage patterns and improve the tool.

### Disabling Telemetry

You can disable telemetry by setting the `BTS_TELEMETRY_DISABLED` environment variable:

```bash
# Disable telemetry for a single run
BTS_TELEMETRY_DISABLED=1 npx create-better-tanstacked

# Disable telemetry globally in your shell profile (.bashrc, .zshrc, etc.)
export BTS_TELEMETRY_DISABLED=1
```

The CLI also honors the cross-tool `DO_NOT_TRACK=1` convention (https://consoledonottrack.com), and `--disable-analytics` skips telemetry for a single run.

## Examples

Create a project with default configuration:

```bash
npx create-better-tanstacked --yes
```

Validate a command without writing files:

```bash
npx create-better-tanstacked --yes --dry-run
```

Create a project with specific options:

```bash
npx create-better-tanstacked --database postgres --orm drizzle --auth better-auth --addons pwa oxlint
```

Create a project with Elysia backend and Node.js runtime:

```bash
npx create-better-tanstacked --backend elysia --runtime node
```

Create a project with multiple frontend options (one web + one native):

```bash
npx create-better-tanstacked --frontend tanstack-router native-bare
```

Create a project with examples:

```bash
npx create-better-tanstacked --examples todo ai
```

Create a project with Turso database setup:

```bash
npx create-better-tanstacked --database sqlite --orm drizzle --db-setup turso
```

Create a project with Supabase PostgreSQL setup:

```bash
npx create-better-tanstacked --database postgres --orm drizzle --db-setup supabase --auth better-auth
```

Create a fullstack project with TanStack Start:

```bash
npx create-better-tanstacked --backend self --frontend tanstack-start
```

Create a project with a Fumadocs site:

```bash
npx create-better-tanstacked --addons fumadocs
```

Create a minimal TypeScript project with no backend:

```bash
npx create-better-tanstacked --backend none --frontend tanstack-router
```

Create a backend-only project with no frontend:

```bash
npx create-better-tanstacked --frontend none --backend hono --database postgres --orm drizzle
```

Create a simple frontend-only project:

```bash
npx create-better-tanstacked --backend none --frontend tanstack-router --addons none --examples none
```

Create a Cloudflare Workers project:

```bash
npx create-better-tanstacked --backend hono --runtime workers --database sqlite --orm drizzle --db-setup d1
```

Create a self-hosted fullstack project on Cloudflare with D1:

```bash
npx create-better-tanstacked --backend self --frontend tanstack-start --runtime none --api trpc --database sqlite --orm drizzle --db-setup d1 --web-deploy cloudflare
```

Create a self-hosted project that ships as Docker containers (web + server + database via Docker Compose):

```bash
npx create-better-tanstacked --frontend tanstack-router --backend hono --runtime bun --database postgres --orm drizzle --db-setup docker --web-deploy docker --server-deploy docker
```

Create a minimal API-only project:

```bash
npx create-better-tanstacked --frontend none --backend hono --api trpc --database none --addons none
```

## Compatibility Notes

- **Backend `self`** uses TanStack Start server routes and requires the TanStack Start frontend.
- **Backend `none`** disables API, ORM, database, authentication, and runtime setup.
- **Frontend `none`** creates a backend-only project. Expo can be selected alongside a TanStack web frontend.
- **API `none`** disables tRPC and oRPC setup.
- **Database `none`** disables database setup and requires ORM `none`.
- **Runtime `none`** is available with backend `none` or `self`.
- **Cloudflare Workers** supports the Hono backend and SQLite databases.
- **Cloudflare D1** requires SQLite and either Workers with Cloudflare server deployment or TanStack Start fullstack with Cloudflare web deployment.
- **PWA** requires TanStack Router. Tauri and Electrobun support TanStack Router and TanStack Start.
- **Addons `none`** skips all addons. **Examples `none`** skips all example implementations.

## Project Structure

The created project follows a clean monorepo structure:

```
my-better-t-app/
├── apps/
│   ├── web/          # Frontend application
│   ├── server/       # Backend API
│   ├── native/       # (optional) Mobile application
│   └── docs/         # (optional) Documentation site
├── packages/         # Shared packages
└── README.md         # Auto-generated project documentation
```

After project creation, you'll receive detailed instructions for next steps and additional setup requirements.
