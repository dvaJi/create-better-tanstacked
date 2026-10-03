import type { DatabaseSetup, ProjectConfig, ServerDeploy, WebDeploy } from "./types";

export const ALCHEMY_DEPLOY_TARGETS = ["cloudflare", "prisma"] as const;

export const ALCHEMY_DATABASE_SETUPS = ["neon", "planetscale", "prisma-postgres"] as const;

export function isAlchemyDeployTarget(
  target: WebDeploy | ServerDeploy | undefined,
): target is (typeof ALCHEMY_DEPLOY_TARGETS)[number] {
  return ALCHEMY_DEPLOY_TARGETS.some((value) => value === target);
}

export function isAlchemyDatabaseSetup(
  setup: DatabaseSetup | undefined,
): setup is (typeof ALCHEMY_DATABASE_SETUPS)[number] {
  return ALCHEMY_DATABASE_SETUPS.some((value) => value === setup);
}

type AlchemyDatabaseConfig = Pick<
  ProjectConfig,
  "backend" | "dbSetup" | "dbSetupOptions" | "webDeploy" | "serverDeploy"
>;

export function supportsAlchemyManagedDatabase(config: AlchemyDatabaseConfig): boolean {
  if (!isAlchemyDatabaseSetup(config.dbSetup)) return false;

  return config.backend === "self"
    ? isAlchemyDeployTarget(config.webDeploy)
    : isAlchemyDeployTarget(config.serverDeploy);
}

export function usesAlchemyManagedDatabase(config: AlchemyDatabaseConfig): boolean {
  if (!supportsAlchemyManagedDatabase(config)) return false;

  const mode = config.dbSetupOptions?.mode;
  return mode === undefined || mode === "alchemy";
}
