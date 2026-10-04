/**
 * Add dependencies to a package.json in the virtual filesystem
 */

import type { JsonValue } from "../core/json-types";
import type { VirtualFileSystem } from "../core/virtual-fs";

type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: JsonValue | undefined;
};

export const dependencyVersionMap = {
  typescript: "^6.0.3",

  "better-auth": "1.7.7",
  "@better-auth/drizzle-adapter": "1.7.7",

  "@clerk/backend": "^3.22.0",
  "@clerk/react": "^6.17.5",
  "@clerk/tanstack-react-start": "^1.6.4",

  "drizzle-orm": "1.0.0-rc.5-ab785fc",
  "drizzle-kit": "1.0.0-rc.5-ab785fc",
  "@libsql/client": "0.18.0",
  libsql: "0.5.29",

  "@neondatabase/serverless": "^1.2.0",
  pg: "^8.23.0",
  postgres: "^3.4.9",
  "@types/pg": "^8.23.1",
  "@types/ws": "^8.18.2",
  ws: "^8.22.0",

  "vite-plugin-pwa": "^2.0.0",
  "@vite-pwa/assets-generator": "^2.0.0",

  "@tauri-apps/cli": "^2.12.1",

  oxlint: "^1.86.0",
  oxfmt: "^0.71.0",

  lefthook: "^2.1.16",

  tsx: "^4.23.15",
  "@types/node": "^26.6.4",

  "@types/bun": "^1.4.2",

  "@elysiajs/node": "^1.4.5",

  "@elysiajs/cors": "^1.4.2",
  "@elysiajs/trpc": "^1.1.0",
  elysia: "^1.4.30",
  // Peer dep of elysia; Bun isolated linker won't install peers, so Node/tsx fails without it.
  "@sinclair/typebox": "^0.34.52",

  "@hono/node-server": "^2.1.3",
  "@hono/trpc-server": "^0.4.2",
  hono: "^4.13.12",

  turbo: "^2.11.7",
  "vite-plus": "1.0.0",
  rolldown: "1.2.12",

  ai: "^7.0.127",
  "@ai-sdk/google": "^4.0.87",
  "@ai-sdk/react": "^4.0.130",
  "@ai-sdk/devtools": "^1.0.30",
  streamdown: "^2.7.0",
  shiki: "^4.5.0",

  "@orpc/server": "^1.15.4",
  "@orpc/client": "^1.15.4",
  "@orpc/openapi": "^1.15.4",
  "@orpc/zod": "^1.15.4",
  "@orpc/tanstack-query": "^1.15.4",

  "@trpc/tanstack-react-query": "^11.19.0",
  "@trpc/server": "^11.19.0",
  "@trpc/client": "^11.19.0",

  nitro: "3.0.260903-beta",
  "@tanstack/react-query-devtools": "^5.104.1",
  "@tanstack/react-query": "^5.104.1",
  "@tanstack/react-form": "^1.33.5",
  "@tanstack/react-router-ssr-query": "^1.167.3",
  "@cloudflare/workers-types": "^5.20261004.1",
  "@alchemy.run/frontend-frameworks": "2.0.0-beta.80",

  // exact pins: caret ranges on prereleases can resolve to stray npm test tags
  "@vercel/nft": "^1.11.0",
  alchemy: "2.0.0-beta.80",
  effect: "4.0.0",
  "@effect/platform-node": "4.0.0",
  "@effect/platform-bun": "4.0.0",

  varlock: "1.21.1",
  "@varlock/vite-integration": "1.5.2",
  tsdown: "^0.23.0",
  zod: "^4.6.5",

  "@polar-sh/better-auth": "^2.0.1",
  // Peer range required by @polar-sh/better-auth; update together.
  "@polar-sh/sdk": "^1.0.2",
  "@stripe/react-stripe-js": "^7.0.0",
  "@stripe/stripe-js": "^10.0.0",

  evlog: "^2.30.0",
} as const;

export type AvailableDependencies = keyof typeof dependencyVersionMap;

export type AddDepsOptions = {
  vfs: VirtualFileSystem;
  packagePath: string;
  dependencies?: AvailableDependencies[];
  devDependencies?: AvailableDependencies[];
  customDependencies?: Record<string, string>;
  customDevDependencies?: Record<string, string>;
};

/**
 * Add dependencies to a package.json file in the VFS
 */
export function addPackageDependency(options: AddDepsOptions): void {
  const {
    vfs,
    packagePath,
    dependencies = [],
    devDependencies = [],
    customDependencies = {},
    customDevDependencies = {},
  } = options;

  const pkgJson = vfs.readJson<PackageJson>(packagePath);
  if (!pkgJson) return;

  // Initialize if not present
  pkgJson.dependencies = pkgJson.dependencies || {};
  pkgJson.devDependencies = pkgJson.devDependencies || {};

  // Add regular dependencies
  for (const dep of dependencies) {
    if (!pkgJson.dependencies[dep]) {
      const version = dependencyVersionMap[dep as AvailableDependencies];
      if (!version) {
        throw new Error(
          `Missing version for dependency: ${dep}. Add it to dependencyVersionMap in add-deps.ts`,
        );
      }
      pkgJson.dependencies[dep] = version;
      // A package must not appear in both sections; runtime wins
      delete pkgJson.devDependencies[dep];
    }
  }

  // Add dev dependencies
  for (const dep of devDependencies) {
    if (!pkgJson.devDependencies[dep] && !pkgJson.dependencies[dep]) {
      const version = dependencyVersionMap[dep as AvailableDependencies];
      if (!version) {
        throw new Error(
          `Missing version for devDependency: ${dep}. Add it to dependencyVersionMap in add-deps.ts`,
        );
      }
      pkgJson.devDependencies[dep] = version;
    }
  }

  // Add custom dependencies (with specific versions)
  for (const [dep, version] of Object.entries(customDependencies)) {
    pkgJson.dependencies[dep] = version;
  }

  // Add custom dev dependencies (with specific versions)
  for (const [dep, version] of Object.entries(customDevDependencies)) {
    pkgJson.devDependencies[dep] = version;
  }

  vfs.writeJson(packagePath, pkgJson);
}
