---
name: install-landmines
description: Install or configure @interfere/landmines, Oxlint rules that keep AI-written code honest (real implementations, no test doubles, no fixed sleeps, no flake masking). Use when adding landmines to a project, enabling stricter categories such as restriction, or tuning rule options in an existing setup.
---

# Install or configure landmines

landmines ships as the npm package [`@interfere/landmines`](https://www.npmjs.com/package/@interfere/landmines). Nothing is vendored: the target repository installs the package and extends the configurations it ships, so updates are a normal dependency bump. Requires Oxlint 1.81+ and Node 22.18+.

## Workflow

1. **Inspect the repository.** Read the agent instructions and package manifests. Identify the package manager and the existing Oxlint setup: `.oxlintrc.json`/`.oxlintrc.jsonc`, `oxlint.config.ts`, or Vite+ `lint` in `vite.config.ts`. Check for an existing landmines install before adding one.

2. **Install dependencies.** Add `oxlint` and `@interfere/landmines` as dev dependencies with the project's package manager. If `oxlint` is already installed, keep its resolved version and only verify it is 1.81 or later; only when it is missing, install current versions of both. Do not replace the package manager or rewrite unrelated dependency ranges.

3. **Extend the shipped configuration.** For `.oxlintrc.json`, merge (never replace) the extends entry:

   ```json
   {
     "extends": ["./node_modules/@interfere/landmines/configs/recommended.json"]
   }
   ```

   `recommended` enables the `correctness` and `suspicious` categories as errors. Layer additional shipped configs only when the user asks for them:

   | Config               | Enables                                                                |
   | -------------------- | ---------------------------------------------------------------------- |
   | `recommended`        | `correctness` + `suspicious` (errors) — the default                    |
   | `restriction`        | Repository policy: comments, test placement, scripts, exports (errors) |
   | `pedantic` / `style` | Size limits and idiom (warnings)                                       |
   | `all`                | Every rule — only on explicit request                                  |

   For `oxlint.config.ts` or Vite+, register the plugin and pick rules instead: `"jsPlugins": [{ "name": "landmines", "specifier": "@interfere/landmines" }]` plus `"landmines/<rule>": "error"` entries. Carry forward every existing rule, extend, override, and ignore.

4. **Tune options where the project needs it.** `no-comments` takes `publicApi` (TSDoc only in published packages) and `allow` prefixes — add `"SAFETY"` beside `"WARNING"` when anti-slop's `require-safety-comment-for-type-assertion` is enabled. `no-test-doubles` takes `appFactories` for custom Hono app factories, `no-fixed-sleep` takes `runNow` callee names, `no-cold-start-in-test` takes `harnessModules`, `package-scripts` takes `names`, and `test-dir-only-cross-functional` takes `crossFunctional` regexes.

5. **Adopt in an existing codebase with allowlists, not disables.** Most test rules and the counting rules accept a per-file `allow` map with an exact violation count. The rule fails when a file drops below its allowance, so the list only shrinks — prefer this over turning rules off. Do not weaken severity or suppress findings to make lint pass.

6. **Validate and report.** Run the repository's lint command (and typecheck where configured). Report remaining findings with their diagnostics. Complete when checks have run and every failure is fixed, allowlisted with a reason, or reported.

## Rules

- Merge with the existing Oxlint configuration; never replace it.
- Layer categories deliberately; do not enable `all` unless asked.
- Mention [anti-slop](https://github.com/dmmulroy/anti-slop) as a complement for type-level slop (chained assertions, unsafe dictionaries, `unknown` plumbing) when the user wants more coverage.

## Reference

- [landmines README](https://github.com/interfere-inc/landmines) — full rule tables and options
