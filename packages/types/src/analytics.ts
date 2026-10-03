import { z } from "zod";

import {
  ADDONS_VALUES,
  APISchema,
  AuthSchema,
  EXAMPLES_VALUES,
  ExamplesSchema,
  PackageManagerSchema,
  PaymentsSchema,
  RuntimeSchema,
  ServerDeploySchema,
  WebDeploySchema,
} from "./schemas";

/** Values emitted by supported CLIs plus retired values kept for historical ingestion. */
export const ANALYTICS_ADDON_VALUES = [
  ...ADDONS_VALUES,
  "starlight",
  "biome",
  "husky",
  "nx",
  "ultracite",
  "ruler",
] as const;

const ANALYTICS_DATABASE_SCHEMA = z.enum(["none", "sqlite", "postgres", "mysql", "mongodb"]);
const ANALYTICS_ORM_SCHEMA = z.enum(["drizzle", "prisma", "mongoose", "none"]);
const ANALYTICS_BACKEND_SCHEMA = z.enum([
  "hono",
  "express",
  "fastify",
  "elysia",
  "convex",
  "self",
  "none",
]);
const ANALYTICS_FRONTEND_VALUES = [
  "tanstack-router",
  "react-router",
  "tanstack-start",
  "next",
  "nuxt",
  "native-bare",
  "native-uniwind",
  "native-unistyles",
  "svelte",
  "solid",
  "astro",
  "none",
] as const;
const ANALYTICS_FRONTEND_SCHEMA = z.enum(ANALYTICS_FRONTEND_VALUES);
const ANALYTICS_DATABASE_SETUP_SCHEMA = z.enum([
  "turso",
  "neon",
  "prisma-postgres",
  "planetscale",
  "mongodb-atlas",
  "supabase",
  "d1",
  "docker",
  "none",
]);

export const ANALYTICS_PLATFORM_VALUES = [
  "aix",
  "android",
  "cygwin",
  "darwin",
  "freebsd",
  "haiku",
  "linux",
  "netbsd",
  "openbsd",
  "sunos",
  "win32",
] as const;

export const ANALYTICS_CLI_MAJOR = 3;
export const ANALYTICS_CLI_MAX_MINOR = 99;
export const ANALYTICS_CLI_MAX_PATCH = 99;
export const ANALYTICS_NODE_MIN_MAJOR = 18;
export const ANALYTICS_NODE_MAX_MAJOR = 30;

/** How the CLI was driven for the run that produced the event. */
export const ANALYTICS_MODE_VALUES = ["interactive", "flags", "yes", "json", "api", "mcp"] as const;

export const AnalyticsAddonSchema = z.enum(ANALYTICS_ADDON_VALUES);
export const AnalyticsPlatformSchema = z.enum(ANALYTICS_PLATFORM_VALUES);
export const AnalyticsModeSchema = z.enum(ANALYTICS_MODE_VALUES);
export type AnalyticsMode = z.infer<typeof AnalyticsModeSchema>;

const CLIVersionSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/)
  .refine((version) => normalizeAnalyticsCLIVersion(version) !== "other");

const NodeVersionSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^v?\d+(?:\.\d+){0,2}(?:-[0-9A-Za-z.-]+)?$/)
  .refine((version) => normalizeAnalyticsNodeVersion(version) !== "other");

function hasUniqueValues(values: string[]): boolean {
  return new Set(values).size === values.length;
}

function hasNoMixedNone(values: string[]): boolean {
  return values.length <= 1 || !values.includes("none");
}

export function normalizeAnalyticsSelection<T extends string>(values: T[] | undefined): T[] {
  return values && values.length > 0 ? values : (["none"] as T[]);
}

const AnalyticsFrontendListSchema = z
  .array(ANALYTICS_FRONTEND_SCHEMA)
  .max(ANALYTICS_FRONTEND_VALUES.length)
  .refine(hasUniqueValues)
  .refine(hasNoMixedNone)
  .transform(normalizeAnalyticsSelection);

const AnalyticsAddonListSchema = z
  .array(AnalyticsAddonSchema)
  .max(ANALYTICS_ADDON_VALUES.length)
  .refine(hasUniqueValues)
  .refine(hasNoMixedNone)
  .transform(normalizeAnalyticsSelection);

const AnalyticsExampleListSchema = z
  .array(ExamplesSchema)
  .max(EXAMPLES_VALUES.length)
  .refine(hasUniqueValues)
  .refine(hasNoMixedNone)
  .transform(normalizeAnalyticsSelection);

export function normalizeAnalyticsCLIVersion(version: string): string {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) return "other";

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (
    major !== ANALYTICS_CLI_MAJOR ||
    minor > ANALYTICS_CLI_MAX_MINOR ||
    patch > ANALYTICS_CLI_MAX_PATCH
  ) {
    return "other";
  }

  return `${major}.${minor}.${patch}`;
}

export function normalizeAnalyticsNodeVersion(version: string): string {
  const match = /^v?(\d+)/.exec(version);
  if (!match) return "other";

  const major = Number(match[1]);
  if (major < ANALYTICS_NODE_MIN_MAJOR || major > ANALYTICS_NODE_MAX_MAJOR) {
    return "other";
  }

  return `v${major}`;
}

/**
 * The public analytics ingestion contract. Project fields stay optional so older
 * CLI releases remain compatible, while every supplied value has bounded
 * cardinality. Unknown properties are intentionally stripped before storage.
 */
export const AnalyticsEventSchema = z.object({
  database: ANALYTICS_DATABASE_SCHEMA.optional(),
  orm: ANALYTICS_ORM_SCHEMA.optional(),
  backend: ANALYTICS_BACKEND_SCHEMA.optional(),
  runtime: RuntimeSchema.optional(),
  frontend: AnalyticsFrontendListSchema.optional(),
  addons: AnalyticsAddonListSchema.optional(),
  examples: AnalyticsExampleListSchema.optional(),
  auth: AuthSchema.optional(),
  payments: PaymentsSchema.optional(),
  git: z.boolean().optional(),
  packageManager: PackageManagerSchema.optional(),
  install: z.boolean().optional(),
  dbSetup: ANALYTICS_DATABASE_SETUP_SCHEMA.optional(),
  api: APISchema.optional(),
  webDeploy: WebDeploySchema.optional(),
  serverDeploy: ServerDeploySchema.optional(),
  cli_version: CLIVersionSchema,
  node_version: NodeVersionSchema,
  platform: AnalyticsPlatformSchema,
  mode: AnalyticsModeSchema.optional(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
