import {
  isAlchemyDeployTarget,
  usesAlchemyManagedDatabase,
  type SupportedProjectConfig,
} from "@better-t-stack/types";

export type DeployedWebFramework = "tanstack-router" | "tanstack-start";

export type ManagedDatabasePlan =
  | { kind: "none" }
  | { kind: "neon" }
  | { kind: "planetscale-postgres" }
  | { kind: "prisma-postgres" };

export type AlchemyWebPlan =
  | { target: "none" }
  | {
      target: "cloudflare" | "prisma";
      framework: DeployedWebFramework;
      topology: "self" | "split";
    };

export type AlchemyServerPlan = { target: "none" } | { target: "cloudflare" | "prisma" };

export type AlchemyDeploymentPlan = {
  config: SupportedProjectConfig;
  managedDatabase: ManagedDatabasePlan;
  web: AlchemyWebPlan;
  server: AlchemyServerPlan;
  hasCloudflare: boolean;
  hasPrismaDeploy: boolean;
  hasAlchemyManagedDatabase: boolean;
  hasD1Resource: boolean;
  hasAxiom: boolean;
  hasAxiomServerRuntime: boolean;
  hasAxiomWebRuntime: boolean;
  hasAxiomVercelRuntime: boolean;
  needsStandaloneServerDev: boolean;
  needsStandaloneWebDev: boolean;
};

const AXIOM_SERVER_BACKENDS: readonly SupportedProjectConfig["backend"][] = ["hono", "elysia"];
const AXIOM_WEB_FRONTENDS: readonly DeployedWebFramework[] = ["tanstack-start"];

function getDeployedWebFramework(config: SupportedProjectConfig): DeployedWebFramework {
  const framework = config.frontend.find(
    (frontend): frontend is DeployedWebFramework =>
      frontend === "tanstack-router" || frontend === "tanstack-start",
  );
  if (!framework) {
    throw new Error(
      `Alchemy web deployment requires a TanStack web app, received: ${config.frontend}`,
    );
  }
  return framework;
}

function createManagedDatabasePlan(config: SupportedProjectConfig): ManagedDatabasePlan {
  if (!usesAlchemyManagedDatabase(config)) return { kind: "none" };
  if (config.dbSetup === "neon") return { kind: "neon" };
  if (config.dbSetup === "prisma-postgres") return { kind: "prisma-postgres" };
  if (config.dbSetup === "planetscale" && config.database === "postgres") {
    return { kind: "planetscale-postgres" };
  }
  throw new Error(
    `Unsupported Alchemy managed database combination: ${config.dbSetup}/${config.database}`,
  );
}

export function createAlchemyDeploymentPlan(config: SupportedProjectConfig): AlchemyDeploymentPlan {
  const hasCloudflare = config.webDeploy === "cloudflare" || config.serverDeploy === "cloudflare";
  const hasPrismaDeploy = config.webDeploy === "prisma" || config.serverDeploy === "prisma";
  const hasAlchemyManagedDatabase = usesAlchemyManagedDatabase(config);
  const hasAxiom = config.addons.includes("axiom");
  const hasAxiomServerRuntime = hasAxiom && AXIOM_SERVER_BACKENDS.includes(config.backend);
  const hasAxiomWebRuntime =
    hasAxiom && config.frontend.some((frontend) => AXIOM_WEB_FRONTENDS.includes(frontend));
  const hasAxiomVercelRuntime =
    (hasAxiomWebRuntime && config.webDeploy === "vercel") ||
    (hasAxiomServerRuntime && config.serverDeploy === "vercel");

  const web: AlchemyWebPlan = isAlchemyDeployTarget(config.webDeploy)
    ? {
        target: config.webDeploy,
        framework: getDeployedWebFramework(config),
        topology: config.backend === "self" ? "self" : "split",
      }
    : { target: "none" };
  const server: AlchemyServerPlan = isAlchemyDeployTarget(config.serverDeploy)
    ? { target: config.serverDeploy }
    : { target: "none" };

  return {
    config,
    managedDatabase: createManagedDatabasePlan(config),
    web,
    server,
    hasCloudflare,
    hasPrismaDeploy,
    hasAlchemyManagedDatabase,
    hasD1Resource:
      config.dbSetup === "d1" &&
      (config.serverDeploy === "cloudflare" ||
        (config.backend === "self" && config.webDeploy === "cloudflare")),
    hasAxiom,
    hasAxiomServerRuntime,
    hasAxiomWebRuntime,
    hasAxiomVercelRuntime,
    needsStandaloneServerDev: hasAxiomServerRuntime && server.target === "none",
    needsStandaloneWebDev: hasAxiomWebRuntime && web.target === "none",
  };
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled Alchemy plan variant: ${JSON.stringify(value)}`);
}

export function getPrismaWebsiteFramework(config: SupportedProjectConfig): string | undefined {
  if (config.webDeploy !== "prisma" || config.backend !== "none") return;
  if (config.frontend.includes("tanstack-start")) return "TanStackStart";
  if (config.frontend.includes("tanstack-router")) return "Vite";
}
