import { desktopWebFrontends } from "./constants";
import type {
  Addons,
  API,
  Auth,
  Payments,
  WebDeploy,
  ServerDeploy,
  Backend,
  Database,
  DatabaseSetup,
  Frontend,
  ORM,
  ProjectConfig,
  Runtime,
} from "./types";

export const TASK_RUNNER_ADDONS: readonly Addons[] = ["turborepo", "vite-plus"];
export const OBSERVABILITY_ADDONS: readonly Addons[] = ["evlog", "axiom"];
export const STATIC_DESKTOP_ADDONS: readonly Addons[] = ["tauri", "electrobun"];

// TanStack Start supports built-in server routes for the fullstack backend option.
export const FULLSTACK_FRONTENDS = ["tanstack-start"] as const satisfies readonly Frontend[];
export type FullstackFrontend = (typeof FULLSTACK_FRONTENDS)[number];

export const SERVER_BACKENDS: readonly Backend[] = ["hono", "elysia"];
const CLERK_SUPPORTED_FRONTENDS: readonly Frontend[] = [
  "tanstack-router",
  "tanstack-start",
  "native-bare",
  "native-uniwind",
  "native-unistyles",
];
const evlogCompatibilityMessage =
  "The observability addons support Hono, Elysia, or backend self with TanStack Start. Backend none is not supported.";

export const ADDON_COMPATIBILITY = {
  pwa: ["tanstack-router"],
  tauri: desktopWebFrontends,
  electrobun: desktopWebFrontends,
  lefthook: [],
  turborepo: [],
  "vite-plus": [],
  mcp: [],
  oxlint: [],
  fumadocs: [],
  opentui: [],
  wxt: [],
  skills: [],
  evlog: [],
  axiom: [],
  none: [],
} as const;

export function supportsEvlogAddon(
  frontend: readonly Frontend[] = [],
  backend?: Backend,
  _runtime?: Runtime,
) {
  if (!backend) return true;
  if (SERVER_BACKENDS.some((value) => value === backend)) return true;
  if (backend === "self") {
    return frontend.length === 0 || frontend.some((value) => value === "tanstack-start");
  }
  return false;
}

export function isFrontendAllowedWithBackend(
  _frontend: Frontend,
  _backend?: Backend,
  _auth?: Auth,
) {
  return true;
}

export function allowedApisForFrontends(_frontends: readonly Frontend[] = []): API[] {
  return ["trpc", "orpc", "none"];
}

export function isExampleTodoAllowed(backend?: Backend, database?: Database, api?: API) {
  return backend !== "none" && database !== "none" && api !== "none";
}

export function isExampleAIAllowed(backend?: Backend, _frontends: readonly Frontend[] = []) {
  return backend !== "none";
}

export const PRISMA_COMPUTE_WEB_FRONTENDS: readonly Frontend[] = [
  "tanstack-router",
  "tanstack-start",
];

export function supportsPrismaWebDeploy(frontend: readonly Frontend[]): boolean {
  return frontend.some((value) =>
    PRISMA_COMPUTE_WEB_FRONTENDS.some((candidate) => candidate === value),
  );
}

export type AddonCompatibility = { isCompatible: true } | { isCompatible: false; reason: string };

export function validateAddonCompatibility(
  addon: Addons,
  frontend: readonly Frontend[],
  auth?: Auth,
  backend?: Backend,
  runtime?: Runtime,
): AddonCompatibility {
  if (
    OBSERVABILITY_ADDONS.some((value) => value === addon) &&
    !supportsEvlogAddon(frontend, backend, runtime)
  ) {
    return { isCompatible: false, reason: evlogCompatibilityMessage };
  }

  if (backend === "self" && STATIC_DESKTOP_ADDONS.some((value) => value === addon)) {
    return {
      isCompatible: false,
      reason: `${addon} addon requires a separate backend or no backend because backend 'self' emits server routes that cannot be bundled as static desktop assets.`,
    };
  }

  if (!Object.hasOwn(ADDON_COMPATIBILITY, addon)) {
    return { isCompatible: false, reason: `Unknown addon: ${addon}` };
  }
  const compatibleFrontends = ADDON_COMPATIBILITY[addon as keyof typeof ADDON_COMPATIBILITY];
  if (compatibleFrontends.length > 0) {
    const hasCompatibleFrontend = frontend.some((value) =>
      compatibleFrontends.some((candidate) => candidate === value),
    );
    if (!hasCompatibleFrontend) {
      return {
        isCompatible: false,
        reason: `${addon} addon requires one of these frontends: ${compatibleFrontends.join(", ")}`,
      };
    }
  }

  if (addon === "tauri" && auth === "clerk" && frontend.includes("tanstack-start")) {
    return {
      isCompatible: false,
      reason:
        "Tauri with Clerk is not supported for TanStack Start because Clerk requires server auth routes.",
    };
  }

  return { isCompatible: true };
}

export function supportsClerkFrontend(frontends: readonly Frontend[]) {
  return frontends.every(
    (frontend) =>
      frontend === "none" || CLERK_SUPPORTED_FRONTENDS.some((candidate) => candidate === frontend),
  );
}

export function supportsClerkBackend(
  backend: Backend | undefined,
  frontends: readonly Frontend[] = [],
) {
  if (!backend) return true;
  if (backend === "self") {
    return frontends.length === 0 || frontends.some((frontend) => frontend === "tanstack-start");
  }
  return SERVER_BACKENDS.some((candidate) => candidate === backend);
}

export function getDesktopDeployConflict(
  deploy: WebDeploy | ServerDeploy | undefined,
  addons: readonly Addons[] = [],
  frontends: readonly Frontend[] = [],
  backend?: Backend,
  _auth?: Auth,
) {
  if (deploy !== "docker" && deploy !== "prisma") return null;
  const selectedDesktopAddons = addons.filter((addon) =>
    STATIC_DESKTOP_ADDONS.some((value) => value === addon),
  );
  if (!selectedDesktopAddons.length || backend === "self") return null;
  const affectedFrontend = frontends.find((frontend) => frontend === "tanstack-start");
  return affectedFrontend ? { affectedFrontend, selectedDesktopAddons } : null;
}

const ORM_DATABASES = {
  none: ["none"],
  drizzle: ["sqlite", "postgres"],
} satisfies Partial<Record<ORM, readonly Database[]>>;

export function supportsOrmDatabase(orm: ORM, database: Database) {
  return ORM_DATABASES[orm]?.some((value) => value === database) ?? false;
}

const DATABASE_SETUP_DATABASES = {
  turso: ["sqlite"],
  d1: ["sqlite"],
  neon: ["postgres"],
  supabase: ["postgres"],
  "prisma-postgres": ["postgres"],
  planetscale: ["postgres"],
  docker: ["postgres"],
} satisfies Partial<Record<Exclude<DatabaseSetup, "none">, readonly Database[]>>;

export function supportsDatabaseSetup(dbSetup: DatabaseSetup, database: Database | undefined) {
  return (
    dbSetup === "none" ||
    (!!database &&
      (DATABASE_SETUP_DATABASES[dbSetup]?.some((value) => value === database) ?? false))
  );
}

export function supportsRuntimeBackend(runtime: Runtime | undefined, backend: Backend | undefined) {
  if (!runtime || !backend) return true;
  if (getBackendDisabledOptions(backend).some((key) => key === "runtime"))
    return runtime === "none";
  return runtime !== "none" && (runtime !== "workers" || backend === "hono");
}

export function supportsRuntimeDatabase(
  _runtime: Runtime | undefined,
  _database: Database | undefined,
) {
  return true;
}

export function supportsDatabaseSetupRuntime(
  dbSetup: DatabaseSetup,
  runtime?: Runtime,
  backend?: Backend,
) {
  if (dbSetup === "docker") return runtime !== "workers";
  if (dbSetup === "d1") return runtime === "workers" || backend === "self";
  return true;
}

export function supportsServerDeployRuntime(
  deploy: WebDeploy | ServerDeploy | undefined,
  runtime: Runtime | undefined,
) {
  if (!deploy) return true;
  if (deploy === "none") return runtime !== "workers";
  if (deploy === "cloudflare") return runtime === "workers";
  if (deploy === "vercel") return runtime === "node";
  return runtime === "bun" || runtime === "node";
}

export function supportsPaymentsAuth(payments?: Payments, auth?: Auth) {
  return payments !== "polar" || auth === "better-auth";
}

const BACKEND_DISABLED_OPTIONS = {
  none: ["runtime", "database", "orm", "api", "auth", "payments", "dbSetup", "serverDeploy"],
  self: ["runtime", "serverDeploy"],
} as const satisfies Partial<Record<Backend, readonly (keyof ProjectConfig)[]>>;

export function getBackendDisabledOptions(backend: Backend) {
  return (
    Object.entries(BACKEND_DISABLED_OPTIONS).find(([candidate]) => candidate === backend)?.[1] ?? []
  );
}

export function getDatabaseSetupDatabases(dbSetup: DatabaseSetup) {
  return dbSetup === "none" ? [] : (DATABASE_SETUP_DATABASES[dbSetup] ?? []);
}
