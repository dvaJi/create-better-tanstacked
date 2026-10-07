# Create Better Tanstacked

An opinionated, TanStack React-focused fork of [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack). It keeps the useful backend, database, API, and auth choices while limiting web frontends to TanStack Router and TanStack Start.

## How it differs from Better-T-Stack

|                | Create Better Tanstacked                                                                   | Better-T-Stack                                                                     |
| -------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Web frontends  | TanStack Router or TanStack Start                                                          | A wider selection, including Next.js, Nuxt, Svelte, Solid, Astro, and React Native |
| Starting point | Opinionated defaults for a TanStack React app                                              | A general-purpose stack builder with a broader set of choices                      |
| Agent setup    | Skills and MCP recommendations tailored to TanStack React and Cloudflare/Coolify workflows | Agent workflows support its broader framework and stack choices                    |

Use this repo when you want a TanStack React project ready for your preferred tools. Use [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) when you want its wider framework selection.

## Default stack

Accepting the CLI defaults creates a TanStack Start app with:

- Bun, Elysia, and oRPC
- PostgreSQL, Drizzle, and Better Auth
- Tailwind CSS and shadcn/ui
- Turborepo, Oxlint, agent Skills, and MCP configuration
- Docker for the database and server deployment; Cloudflare for web deployment

The CLI still lets you change the backend, database, authentication, API, and deployment choices.

## Quick start

Run the interactive setup:

```bash
# Bun
bun create better-tanstacked@latest

# pnpm
pnpm create better-tanstacked@latest

# npm
npx create-better-tanstacked@latest
```

Use `--yes` to accept the defaults:

```bash
npx create-better-tanstacked@latest my-app --yes
```

## Agent tools

The `skills` and `mcp` addons give coding agents project guidance and stack-aware setup tools. MCP recommendations can include Context7, DeepWiki, Cloudflare, Coolify, shadcn/ui, and services selected for your stack. Services that need credentials, such as Coolify, must be configured in your own agent settings.

This repository also includes Claude Code and Codex plugin instructions in [`plugin/README.md`](plugin/README.md).

## Documentation and development

- Documentation: [better-t-stack.dev](https://better-t-stack.dev)
- CLI options: [`apps/cli/README.md`](apps/cli/README.md)
- Contributing: [guide](.github/CONTRIBUTING.md)

```bash
bun install
bun dev:cli
bun dev:web
```
