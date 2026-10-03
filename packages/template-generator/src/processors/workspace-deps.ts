import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency, type AvailableDependencies } from "../utils/add-deps";

export function processWorkspaceDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { projectName, packageManager, runtime, backend, database, auth, api } = config;
  const workspaceVersion = packageManager === "npm" ? "*" : "workspace:*";
  const packages = {
    config: vfs.exists("packages/config/package.json"),
    infra: vfs.exists("packages/infra/package.json"),
    db: vfs.exists("packages/db/package.json"),
    auth: vfs.exists("packages/auth/package.json"),
    api: vfs.exists("packages/api/package.json"),
    ui: vfs.exists("packages/ui/package.json"),
    server: vfs.exists("apps/server/package.json"),
    web: vfs.exists("apps/web/package.json"),
    native: vfs.exists("apps/native/package.json"),
  };

  const configDep = packages.config ? { [`@${projectName}/config`]: workspaceVersion } : {};
  const uiDep = packages.ui ? { [`@${projectName}/ui`]: workspaceVersion } : {};
  const runtimeDevDeps = getRuntimeDevDeps(runtime);
  const commonDeps: AvailableDependencies[] = ["zod"];
  const commonDevDeps: AvailableDependencies[] = ["typescript", ...runtimeDevDeps];

  addPackageDependency({
    vfs,
    packagePath: "package.json",
    dependencies: commonDeps,
    devDependencies: commonDevDeps,
    customDevDependencies: configDep,
  });

  for (const packageName of ["infra", "db"] as const) {
    if (!packages[packageName]) continue;
    addPackageDependency({
      vfs,
      packagePath: `packages/${packageName}/package.json`,
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDevDependencies: configDep,
    });
  }

  if (packages.auth) {
    const authDeps: Record<string, string> = {};
    if (database !== "none" && packages.db) authDeps[`@${projectName}/db`] = workspaceVersion;
    addPackageDependency({
      vfs,
      packagePath: "packages/auth/package.json",
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: authDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.api) {
    const apiDeps: Record<string, string> = {};
    if (auth !== "none" && packages.auth) apiDeps[`@${projectName}/auth`] = workspaceVersion;
    if (database !== "none" && packages.db) apiDeps[`@${projectName}/db`] = workspaceVersion;
    addPackageDependency({
      vfs,
      packagePath: "packages/api/package.json",
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: apiDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.server) {
    const serverDeps: Record<string, string> = {};
    if (api !== "none" && packages.api) serverDeps[`@${projectName}/api`] = workspaceVersion;
    if (auth !== "none" && packages.auth) serverDeps[`@${projectName}/auth`] = workspaceVersion;
    if (database !== "none" && packages.db) serverDeps[`@${projectName}/db`] = workspaceVersion;
    addPackageDependency({
      vfs,
      packagePath: "apps/server/package.json",
      dependencies: commonDeps,
      devDependencies: ["typescript", "tsdown"],
      customDependencies: serverDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.web) {
    const webDeps = { ...uiDep } satisfies Record<string, string>;
    if (api !== "none" && packages.api) webDeps[`@${projectName}/api`] = workspaceVersion;
    if (backend === "self" && auth !== "none" && packages.auth) {
      webDeps[`@${projectName}/auth`] = workspaceVersion;
    }
    if (backend === "self" && database !== "none" && packages.db) {
      webDeps[`@${projectName}/db`] = workspaceVersion;
    }
    addPackageDependency({
      vfs,
      packagePath: "apps/web/package.json",
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: webDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.ui) {
    addPackageDependency({
      vfs,
      packagePath: "packages/ui/package.json",
      devDependencies: ["typescript"],
      customDevDependencies: configDep,
    });
  }

  if (packages.native) {
    const nativeDeps: Record<string, string> = {};
    if (api !== "none" && packages.api) nativeDeps[`@${projectName}/api`] = workspaceVersion;
    addPackageDependency({
      vfs,
      packagePath: "apps/native/package.json",
      dependencies: commonDeps,
      customDependencies: nativeDeps,
      customDevDependencies: configDep,
    });
  }
}

function getRuntimeDevDeps(runtime: ProjectConfig["runtime"]): AvailableDependencies[] {
  if (runtime === "none" || runtime === "node" || runtime === "workers") return ["@types/node"];
  if (runtime === "bun") return ["@types/bun"];
  return [];
}
