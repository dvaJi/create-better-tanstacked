---
name: add-to-project
description: Add Better-T-Stack addons to an existing project, especially one with a bts.jsonc file. Use for requests to add PWA, docs, linting, task runners, desktop, MCP, or observability tooling; plan through MCP before applying. Use scaffold-project for a new project.
---

# Add addons to an existing Better-T-Stack project

Use the Better-T-Stack MCP server to install addons into an existing project rather than wiring the tooling by hand.

## When this applies

The user already has a Better-T-Stack project (look for a `bts.jsonc` config) and wants to add tooling or features — e.g. "add PWA support", "add a docs site", "add Oxlint", "add Turborepo", "wire up the MCP addon".

For brand-new projects, use the **scaffold-project** skill instead.

## Workflow

1. **Confirm the target project** is a Better-T-Stack project and identify its directory.
2. **Plan.** Call `bts_plan_addons` with the desired addon set (and any nested `addonOptions`). This is a dry run — review the planned changes with the user.
3. **Apply.** Only after the plan succeeds and matches intent, call `bts_add_addons`.
4. **Report** what changed and the follow-up commands to run.

## Available addons

`pwa`, `tauri`, `electrobun`, `lefthook`, `mcp`, `turborepo`, `vite-plus`, `fumadocs`, `oxlint`, `opentui`, `skills`, `evlog`.

Note: `turborepo` and `vite-plus` are mutually exclusive task runners. Use `bts_get_schema` for nested addon options (e.g. Fumadocs templates/search/AI chat, OpenTUI templates).

## Rules

- Always `bts_plan_addons` before `bts_add_addons`.
- Don't add addons the user didn't ask for.
- Surface any conflicts (e.g. two task runners) from the plan before applying.

## Reference

- [Better-T-Stack documentation](https://better-t-stack.dev/docs)
