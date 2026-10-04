# Better-T-Stack plugin

Make your AI assistant scaffold and extend projects with [Better-T-Stack](https://better-t-stack.dev) instead of hand-rolling boilerplate.

The plugin bundles:

- **MCP server** — the official `create-better-tanstacked mcp` server (stdio, no auth/key). Exposes `bts_get_stack_guidance`, `bts_get_schema`, `bts_plan_project`, `bts_create_project`, `bts_plan_addons`, `bts_add_addons`.
- **Skills** — `scaffold-project` (start a new project) and `add-to-project` (add addons to an existing project). Each is a reusable `SKILL.md` workflow: the assistant loads it when the request matches its description, or when you invoke it directly. The workflow calls the MCP to plan and generate changes.
- **Claude Code commands** — `/better-t-stack:new` and `/better-t-stack:add`.
- **Claude Code agent** — `stack-architect`, which designs a coherent stack from a product description and generates it.

## Requirements

- Node.js with `npx` available (the MCP server runs via `npx -y create-better-tanstacked@latest mcp`).

## Install in Claude Code

```bash
# Add this repo as a plugin marketplace
/plugin marketplace add dvaJi/create-better-tanstacked

# Install the plugin
/plugin install better-t-stack@better-t-stack
```

Then just ask: _"create a fullstack app with TanStack Start, Postgres and Better Auth"_ — the `scaffold-project` skill activates and the assistant plans the stack with the MCP before generating it. Or run `/better-t-stack:new <description>`.

## Install in Codex

The same `SKILL.md` workflows and MCP server are bundled for Codex. Add the GitHub marketplace, open Codex, then install Better-T-Stack from the plugin browser:

```bash
codex plugin marketplace add dvaJi/create-better-tanstacked
codex
```

In Codex, run `/plugins` and install **Better-T-Stack**, then start a new session. Skills can activate automatically from the request, be selected with `/skills`, or be mentioned with `$`. The `/better-t-stack:new` and `/better-t-stack:add` custom commands and `stack-architect` agent are Claude Code features; in Codex, use the two skills.

### Just the MCP server (any MCP client)

Wire the server into Codex (and Cursor, VS Code, Gemini CLI, etc.) with `add-mcp`:

```bash
npx -y add-mcp@latest "npx -y create-better-tanstacked@latest mcp"
```

…and choose `codex` (or your client) when prompted. Or add it to `~/.codex/config.toml` manually:

```toml
[mcp_servers.better-t-stack]
command = "npx"
args = ["-y", "create-better-tanstacked@latest", "mcp"]
```

## How the assistant uses it

1. Resolve intent (ask briefly or pick sensible defaults).
2. `bts_get_stack_guidance` / `bts_get_schema` for valid options.
3. `bts_plan_project` (dry run) — confirm the resolved stack.
4. `bts_create_project` with `install: false` — generate.
5. Report the stack and the exact `install` / `dev` commands.

Plan always precedes create; configs are always sent in full (explicit `"none"`, `[]`, booleans).
