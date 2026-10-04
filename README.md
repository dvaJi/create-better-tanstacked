# Better-T-Stack

A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations

<br />

<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>

## Sponsors

<p align="center">
<img src="https://sponsors.better-t-stack.dev/sponsors.png" alt="Sponsors">
</p>

https://github.com/user-attachments/assets/87b541ea-9d4d-4734-b383-00784b0b43ff

## Philosophy

- Roll your own stack: you pick only the parts you need, nothing extra.
- Minimal templates: bare-bones scaffolds with zero bloat.
- Latest dependencies: always use current, stable versions by default.
- Free and open source: forever.

## Quick Start

```bash
# Using bun (recommended)
bun create better-tanstacked@latest

# Using pnpm
pnpm create better-tanstacked@latest

# Using npm
npx create-better-tanstacked@latest
```

## Claude Code plugin

Want your AI assistant to scaffold and extend projects with Better-T-Stack? Install the plugin and it will plan a valid stack and generate it through the bundled MCP server instead of hand-rolling boilerplate.

```bash
/plugin marketplace add dvaJi/create-better-tanstacked
/plugin install better-t-stack@better-t-stack
```

Then ask: _"create a fullstack app with TanStack Start, Postgres and Better Auth"_, or run `/better-t-stack:new <description>`. See [`plugin/`](plugin) and the [Agent Workflows docs](https://better-t-stack.dev/docs/cli/agent-workflows#claude-code-plugin).

## Features

- Frontend: TanStack Router, TanStack Start, or none
- Backend: Hono, Elysia, TanStack Start fullstack, or none
- API: tRPC or oRPC (or none)
- Runtime: Bun, Node.js, or Cloudflare Workers
- Databases: SQLite, PostgreSQL (or none)
- ORM: Drizzle (or none)
- Auth: Better Auth or Clerk (optional)
- Addons: Turborepo, Vite+, PWA, Tauri, Electrobun, Lefthook, Fumadocs, Oxlint, MCP, OpenTUI, Skills
- Examples: Todo, AI
- DB Setup: Turso, Neon, Supabase, Prisma PostgreSQL, PlanetScale, Cloudflare D1, Docker
- Web Deploy: Cloudflare Workers

Type safety end-to-end, clean monorepo layout, and zero lock-in: you choose only what you need.

## Repository Structure

This repository is organized as a monorepo containing:

- **CLI**: [`apps/cli`](apps/cli) - The scaffolding CLI tool
- **Documentation**: [`apps/web`](apps/web) - Official website and documentation
- **Plugin**: [`plugin`](plugin) - Claude Code plugin (MCP server + skills + commands + agent)

## Documentation

Visit [better-t-stack.dev](https://better-t-stack.dev) for full documentation, guides, and examples. You can also use the visual Stack Builder at `https://better-t-stack.dev/new` to generate a command for your stack.

## Development

```bash
# Clone the repository
git clone https://github.com/dvaJi/create-better-tanstacked.git

# Install dependencies
bun install

# Start CLI development
bun dev:cli

# Start website development
bun dev:web
```

## Want to contribute?

Please read the Contribution Guide first and open an issue before starting new features to ensure alignment with project goals.

- Docs: [`./apps/web/content/docs/contributing.mdx`](./apps/web/content/docs/contributing.mdx)
- Repo guide: [`./.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md)

## Star History

<a href="https://www.star-history.com/#dvaJi/create-better-tanstacked&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=dvaJi/create-better-tanstacked&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=dvaJi/create-better-tanstacked&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=dvaJi/create-better-tanstacked&type=Date" />
 </picture>
</a>
