---
name: migrate-oxlint-config
description: Migrate an existing JavaScript or TypeScript project to @cloudflare/oxlint-config with a passing baseline and one reviewable commit per rule.
---

# Migrate to @cloudflare/oxlint-config

## Commit a passing baseline

1. Run the project's current lint command to establish its baseline. Adopt
   the preset using the setup for the project's lint command in the package
   README. Use `@cloudflare/oxlint-config` with standalone Oxlint or
   `@cloudflare/oxlint-config/vite-plus` with `vp lint`. Update the project's
   lint command and CI where needed.
   Carry forward applicable project rules, ignore patterns, environments,
   and file overrides. Keep the project's type-check command. If the old preset
   ran the compiler in CI, preserve that coverage with a separate type-check
   command or `options.typeCheck: true`.
2. Run the project's lint command with the new preset across the same files
   checked in CI. Temporarily set each newly failing rule to `'off'` in the
   project config. This may disable most of the preset in a large migration.
   Keep the rest enabled. For example, add
   `'typescript/no-unsafe-assignment': 'off'` to `rules` in `oxlint.config.ts`
   or to `lint.rules` in a Vite+ project's `vite.config.ts`.

   If a matching file override re-enables a rule, append a scoped override
   after the inherited and project overrides to disable it there as well.

3. Rerun lint and commit the dependency, config, and lint command changes as
   one passing baseline. Save the rule fixes for the subsequent commits.

## Evaluate one rule per commit

For existing projects, including those migrating from an internal preset,
decide case by case whether each new rule fits the project. It's acceptable
to keep individual rules disabled in the project config.

1. Remove one rule's temporary disables and rerun lint. If the rule fits,
   fix its findings, rerun lint, and commit the config and fixes together.
   Run the relevant tests and type checks for changes that affect code behavior
   or types.
2. If a rule should stay off, record the reason beside its configuration in
   a commit for that rule. Scope the exception to the files that need it when
   possible. Follow the project's existing exception process for required rules
   and flag any decisions that need maintainer review.
3. Repeat for each temporary disable. Keep the commits focused so reviewers
   can assess each rule and its fixes together.

## Review and squash

Open a single pull request or merge request with the baseline commit and
all the rule commits. Summarize any rules that remain disabled and why, and
include the validation results. Keep the individual commits through review
and squash them when merging.
