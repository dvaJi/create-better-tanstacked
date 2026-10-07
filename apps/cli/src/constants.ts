import path from "node:path";
import { fileURLToPath } from "node:url";

import { getUserPkgManager } from "./utils/get-package-manager";

// Re-export from template-generator (single source of truth)
export {
  dependencyVersionMap,
  type AvailableDependencies,
} from "@better-t-stack/template-generator";

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");

export const DEFAULT_CONFIG_BASE = {
  projectName: "my-better-t-app",
  relativePath: "my-better-t-app",
  frontend: ["tanstack-start"],
  database: "postgres",
  orm: "drizzle",
  auth: "better-auth",
  payments: "none",
  addons: ["turborepo", "oxlint", "skills", "mcp"],
  examples: [],
  git: true,
  install: true,
  dbSetup: "docker",
  backend: "elysia",
  runtime: "bun",
  api: "orpc",
  webDeploy: "cloudflare",
  serverDeploy: "docker",
} as const;

export function getDefaultConfig() {
  return {
    ...DEFAULT_CONFIG_BASE,
    projectDir: path.resolve(process.cwd(), DEFAULT_CONFIG_BASE.projectName),
    packageManager: getUserPkgManager(),
    frontend: [...DEFAULT_CONFIG_BASE.frontend],
    addons: [...DEFAULT_CONFIG_BASE.addons],
    examples: [...DEFAULT_CONFIG_BASE.examples],
  };
}

export const DEFAULT_CONFIG = getDefaultConfig();

export { desktopWebFrontends } from "@better-t-stack/types";

export { ADDON_COMPATIBILITY } from "@better-t-stack/types";
