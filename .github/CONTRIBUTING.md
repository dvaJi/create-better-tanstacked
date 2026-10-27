# Contributing to Better-T-Stack

Thank you for your interest in contributing to Better-T-Stack! This document provides guidelines and setup instructions for contributors.

> **⚠️ Important**: Before starting work on any new features or major changes, please open an issue first to discuss your proposal and get approval. We don't want you to waste time on work that might not align with the project's direction or get merged.

## Project Structure

This repository is organized as a monorepo containing:

- **CLI**: [`apps/cli`](apps/cli) - The scaffolding CLI tool (`create-better-tanstacked`)
- **Template generator**: [`packages/template-generator`](packages/template-generator) - The project generation engine
- **Shared types**: [`packages/types`](packages/types) - Schemas and types shared by the CLI packages
- **CLI alias**: [`packages/create-bts`](packages/create-bts) - The shorter `create-bts` package
- **Agent plugin**: [`plugin`](plugin) - Claude Code and Codex skills, commands, and MCP wiring

## Development Setup

### Prerequisites

- Node.js (lts)
- Bun (recommended)
- Git

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/dvaJi/create-better-tanstacked.git
   cd create-better-tanstacked
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

### CLI Development

1. **Navigate to CLI directory**

   ```bash
   cd apps/cli
   ```

2. **Link the CLI globally** (optional, for testing anywhere in your system)

   ```bash
   bun link
   ```

   Now you can use `create-better-tanstacked` from anywhere in your system.

3. **Start development server**

   ```bash
   bun dev
   ```

   This runs tsdown build in watch mode, automatically rebuilding on changes.

4. **Test the CLI**
   Now go to anywhere else in your system (maybe like a test folder) and run:
   ```bash
   create-better-tanstacked
   ```
   This will run the locally installed CLI.

## Contribution Guidelines

### Standard Contribution Steps

1. **Create an issue** (if one doesn't exist)
   - Describe the bug or feature request
   - Include steps to reproduce (for bugs)
   - Discuss the proposed solution

2. **Fork the repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

3. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Make your changes**
   - Follow the existing code style
   - Update documentation as needed

5. **Test and format your changes** (see Testing section below)

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(cli): add your feature description"
   # or
   git commit -m "fix(cli): fix your bug description"
   ```

7. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Link to the related issue
   - Describe your changes

### Testing

**Before committing, make sure to test your changes:**

```bash
# For CLI changes
cd apps/cli
bun dev
bun run test

# Lint and format files (from root, uses oxlint and oxfmt)
bun run check
```

- **Manual testing**: Test your changes manually to ensure everything works as expected
- For CLI changes: Test with different configurations and options

## Commit Conventions

Use conventional commit messages with the appropriate scope:

- `feat(cli): add new CLI feature`
- `fix(cli): fix CLI bug`
- `docs(cli): update CLI documentation`

## Getting Help

- Open an issue for bugs or feature requests
- Join discussions for questions or ideas
- Check existing issues and PRs for similar work
- Join our [Discord](https://discord.gg/ZYsbjpDaM5) if you have any problems

## License

By contributing to Better-T-Stack, you agree that your contributions will be licensed under the MIT License.
