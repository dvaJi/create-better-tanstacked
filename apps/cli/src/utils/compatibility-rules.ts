import {
  supportsRuntimeBackend,
  supportsPaymentsAuth,
  supportsServerDeployRuntime,
  SERVER_BACKENDS,
} from "@better-t-stack/types";
import {
  TASK_RUNNER_ADDONS,
  OBSERVABILITY_ADDONS,
  FULLSTACK_FRONTENDS,
  validateAddonCompatibility,
  supportsPrismaWebDeploy,
  getDesktopDeployConflict,
  isExampleTodoAllowed,
} from "@better-t-stack/types";
export {
  TASK_RUNNER_ADDONS,
  OBSERVABILITY_ADDONS,
  supportsEvlogAddon,
  isFrontendAllowedWithBackend,
  allowedApisForFrontends,
  isExampleTodoAllowed,
  isExampleAIAllowed,
  PRISMA_COMPUTE_WEB_FRONTENDS,
  supportsPrismaWebDeploy,
  validateAddonCompatibility,
  type AddonCompatibility,
} from "@better-t-stack/types";
import { Result } from "better-result";

import type {
  Addons,
  API,
  Auth,
  Backend,
  CLIInput,
  Frontend,
  Payments,
  ProjectConfig,
  Runtime,
  ServerDeploy,
  WebDeploy,
} from "../types";
import { WEB_FRAMEWORKS } from "./compatibility";
import { ValidationError } from "./errors";

type ValidationResult = Result<void, ValidationError>;
type AddonCompatibilityConfig = Pick<
  ProjectConfig,
  "frontend" | "auth" | "backend" | "runtime" | "webDeploy" | "database" | "orm" | "dbSetup"
>;
function validationErr(message: string): ValidationResult {
  return Result.err(new ValidationError({ message }));
}

export function isWebFrontend(value: Frontend) {
  return WEB_FRAMEWORKS.includes(value);
}

export function ensureSingleFrontend(frontends: Frontend[]): ValidationResult {
  const web = frontends.filter((frontend) => isWebFrontend(frontend));
  if (web.length > 1) {
    return validationErr(
      "Cannot select multiple web frameworks. Choose only one of: tanstack-router, tanstack-start",
    );
  }
  return Result.ok(undefined);
}

export function validateSelfBackendCompatibility(
  _providedFlags: Set<string>,
  options: CLIInput,
  config: Partial<ProjectConfig>,
): ValidationResult {
  const backend = config.backend || options.backend;
  const frontends = config.frontend || options.frontend || [];

  if (backend === "self") {
    const web = frontends.filter((frontend) => isWebFrontend(frontend));
    const hasSupportedWeb =
      web.length === 1 && FULLSTACK_FRONTENDS.some((frontend) => frontend === web[0]);

    if (!hasSupportedWeb) {
      return validationErr(
        "Backend 'self' (fullstack) requires the TanStack Start frontend. Please use --frontend tanstack-start.",
      );
    }
  }

  return Result.ok(undefined);
}

export function validateWorkersCompatibility(
  providedFlags: Set<string>,
  options: CLIInput,
  config: Partial<ProjectConfig>,
): ValidationResult {
  if (
    providedFlags.has("runtime") &&
    options.runtime === "workers" &&
    config.backend &&
    !supportsRuntimeBackend("workers", config.backend)
  ) {
    return validationErr(
      `Cloudflare Workers runtime (--runtime workers) is only supported with Hono backend (--backend hono). Current backend: ${config.backend}. Please use '--backend hono' or choose a different runtime.`,
    );
  }

  if (
    providedFlags.has("backend") &&
    config.backend &&
    !supportsRuntimeBackend("workers", config.backend) &&
    config.runtime === "workers"
  ) {
    return validationErr(
      `Backend '${config.backend}' is not compatible with Cloudflare Workers runtime. Cloudflare Workers runtime is only supported with Hono backend. Please use '--backend hono' or choose a different runtime.`,
    );
  }

  return Result.ok(undefined);
}

export function validateApiFrontendCompatibility(
  _api: API | undefined,
  _frontends: Frontend[] = [],
): ValidationResult {
  return Result.ok(undefined);
}

export function validateWebDeployRequiresWebFrontend(
  webDeploy: WebDeploy | undefined,
  hasWebFrontendFlag: boolean,
): ValidationResult {
  if (webDeploy && webDeploy !== "none" && !hasWebFrontendFlag) {
    return validationErr(
      "'--web-deploy' requires a web frontend. Please select a web frontend or set '--web-deploy none'.",
    );
  }
  return Result.ok(undefined);
}

export function validateServerDeployRequiresBackend(
  serverDeploy: ServerDeploy | undefined,
  backend: Backend | undefined,
): ValidationResult {
  if (serverDeploy && serverDeploy !== "none" && (!backend || backend === "none")) {
    return validationErr(
      "'--server-deploy' requires a backend. Please select a backend or set '--server-deploy none'.",
    );
  }
  return Result.ok(undefined);
}

export function validateDockerServerDeploy(
  serverDeploy: ServerDeploy | undefined,
  backend: Backend | undefined,
  runtime: Runtime | undefined,
): ValidationResult {
  if (serverDeploy !== "docker") return Result.ok(undefined);

  if (backend && backend !== "none" && !SERVER_BACKENDS.includes(backend)) {
    return validationErr(
      "'--server-deploy docker' requires a separate Hono or Elysia backend. For a fullstack 'self' backend, use '--web-deploy docker' instead.",
    );
  }

  if (runtime && !supportsServerDeployRuntime(serverDeploy, runtime)) {
    return validationErr(
      "'--server-deploy docker' is not compatible with '--runtime workers'. Use '--runtime bun' or '--runtime node', or choose '--server-deploy cloudflare'.",
    );
  }

  return Result.ok(undefined);
}

export function validateVercelServerDeploy(
  serverDeploy: ServerDeploy | undefined,
  backend: Backend | undefined,
  runtime: Runtime | undefined,
): ValidationResult {
  if (serverDeploy !== "vercel") return Result.ok(undefined);

  if (backend && backend !== "none" && !SERVER_BACKENDS.includes(backend)) {
    return validationErr(
      "'--server-deploy vercel' requires a separate Hono or Elysia backend. For a fullstack 'self' backend, use '--web-deploy vercel' instead.",
    );
  }

  if (runtime && !supportsServerDeployRuntime(serverDeploy, runtime)) {
    return validationErr(
      `'--server-deploy vercel' is not compatible with '--runtime ${runtime}'. Use '--runtime node'. Bun remains supported as a package manager.`,
    );
  }

  return Result.ok(undefined);
}

export function validatePrismaServerDeploy(
  serverDeploy: ServerDeploy | undefined,
  backend: Backend | undefined,
  runtime: Runtime | undefined,
): ValidationResult {
  if (serverDeploy !== "prisma") return Result.ok(undefined);

  if (backend && backend !== "none" && !SERVER_BACKENDS.includes(backend)) {
    return validationErr(
      "'--server-deploy prisma' requires a separate Hono or Elysia backend. For a fullstack 'self' backend, use '--web-deploy prisma' instead.",
    );
  }

  if (!supportsServerDeployRuntime(serverDeploy, runtime)) {
    return validationErr(
      "'--server-deploy prisma' requires '--runtime bun' or '--runtime node'. Use '--server-deploy cloudflare' for Workers.",
    );
  }

  return Result.ok(undefined);
}

export function validatePrismaWebDeploy(
  webDeploy: WebDeploy | undefined,
  frontend: Frontend[] | undefined,
): ValidationResult {
  if (webDeploy !== "prisma" || !frontend) return Result.ok(undefined);

  if (!supportsPrismaWebDeploy(frontend)) {
    return validationErr("'--web-deploy prisma' requires TanStack Router or TanStack Start.");
  }

  return Result.ok(undefined);
}

export function validateDockerWebDeployDesktopAddons(
  webDeploy: WebDeploy | undefined,
  addons: Addons[] | undefined,
  frontend: Frontend[] | undefined,
  backend: Backend | undefined,
  auth: Auth | undefined,
): ValidationResult {
  const conflict = getDesktopDeployConflict(webDeploy, addons, frontend, backend, auth);
  if (webDeploy !== "docker" || !conflict) return Result.ok(undefined);
  const { selectedDesktopAddons: desktopAddons, affectedFrontend: affected } = conflict;

  return validationErr(
    `'--web-deploy docker' is not compatible with the ${desktopAddons.join(", ")} addon on '${affected}' because desktop addons switch the web build to a static export, which the docker image cannot serve. Remove the addon or use the static-serving tanstack-router frontend.`,
  );
}

export function validatePrismaWebDeployDesktopAddons(
  webDeploy: WebDeploy | undefined,
  addons: Addons[] | undefined,
  frontend: Frontend[] | undefined,
): ValidationResult {
  const conflict = getDesktopDeployConflict(webDeploy, addons, frontend);
  if (webDeploy !== "prisma" || !conflict) return Result.ok(undefined);
  const { selectedDesktopAddons: desktopAddons, affectedFrontend: affected } = conflict;

  return validationErr(
    `'--web-deploy prisma' is not compatible with the ${desktopAddons.join(", ")} addon on '${affected}' because desktop addons replace its executable server output with a static export, while Prisma Compute requires an executable server artifact. Remove the addon or choose a server deployment that supports this desktop build.`,
  );
}

export function getCompatibleAddons(
  allAddons: Addons[],
  frontend: Frontend[],
  existingAddons: Addons[] = [],
  auth?: Auth,
  backend?: Backend,
  runtime?: Runtime,
) {
  return allAddons.filter((addon) => {
    if (existingAddons.includes(addon)) return false;

    if (addon === "none") return false;
    if (
      OBSERVABILITY_ADDONS.includes(addon) &&
      existingAddons.some((existing) => OBSERVABILITY_ADDONS.includes(existing))
    )
      return false;

    if (
      (TASK_RUNNER_ADDONS as readonly Addons[]).includes(addon) &&
      existingAddons.some((existingAddon) =>
        (TASK_RUNNER_ADDONS as readonly Addons[]).includes(existingAddon),
      )
    ) {
      return false;
    }

    const { isCompatible } = validateAddonCompatibility(addon, frontend, auth, backend, runtime);
    return isCompatible;
  });
}

export function validateAddonsAgainstFrontends(
  addons: Addons[] = [],
  frontends: Frontend[] = [],
  auth?: Auth,
  backend?: Backend,
  runtime?: Runtime,
): ValidationResult {
  const selectedTaskRunners = addons.filter((addon) =>
    (TASK_RUNNER_ADDONS as readonly Addons[]).includes(addon),
  );
  if (selectedTaskRunners.length > 1) {
    return validationErr(
      "Cannot combine 'turborepo' and 'vite-plus' addons. Choose one task runner.",
    );
  }

  for (const addon of addons) {
    if (addon === "none") continue;
    const compatibility = validateAddonCompatibility(addon, frontends, auth, backend, runtime);
    if (!compatibility.isCompatible) {
      return validationErr(`Incompatible addon/frontend combination: ${compatibility.reason}`);
    }
  }
  return Result.ok(undefined);
}

export function validateAddonsAgainstConfig(
  addons: Addons[] = [],
  config: Partial<AddonCompatibilityConfig>,
): ValidationResult {
  const addonResult = validateAddonsAgainstFrontends(
    addons,
    config.frontend ?? [],
    config.auth,
    config.backend,
    config.runtime,
  );
  if (addonResult.isErr()) return addonResult;

  const dockerResult = validateDockerWebDeployDesktopAddons(
    config.webDeploy,
    addons,
    config.frontend,
    config.backend,
    config.auth,
  );
  if (dockerResult.isErr()) return dockerResult;

  return validatePrismaWebDeployDesktopAddons(config.webDeploy, addons, config.frontend);
}

export function validatePaymentsCompatibility(
  payments: Payments | undefined,
  auth: Auth | undefined,
  _backend: Backend | undefined,
  _frontends: Frontend[] = [],
): ValidationResult {
  if (!payments || payments === "none") return Result.ok(undefined);

  if (payments === "polar") {
    if (!supportsPaymentsAuth(payments, auth)) {
      return validationErr(
        "Polar payments requires Better Auth. Please use '--auth better-auth' or choose a different payments provider.",
      );
    }
  }

  return Result.ok(undefined);
}

export function validateExamplesCompatibility(
  examples: string[] | undefined,
  backend: ProjectConfig["backend"] | undefined,
  database: ProjectConfig["database"] | undefined,
  frontend?: Frontend[],
  api?: API,
): ValidationResult {
  const examplesArr = examples ?? [];
  if (examplesArr.length === 0 || examplesArr.includes("none")) return Result.ok(undefined);

  if (examplesArr.includes("todo") && !isExampleTodoAllowed(backend, database, api)) {
    if (database === "none") {
      return validationErr(
        "The 'todo' example requires a database. Cannot use --examples todo when database is 'none'.",
      );
    }
    if (api === "none") {
      return validationErr(
        "The 'todo' example requires an API layer (tRPC or oRPC). Cannot use --examples todo when api is 'none'.",
      );
    }
  }

  if (examplesArr.includes("ai") && backend === "none") {
    return validationErr("The 'ai' example requires a backend.");
  }

  return Result.ok(undefined);
}
