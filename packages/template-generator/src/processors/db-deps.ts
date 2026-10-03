import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency, type AvailableDependencies } from "../utils/add-deps";

export function processDatabaseDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { database, orm, backend, dbSetup, webDeploy, serverDeploy } = config;
  if (backend === "none" || database === "none" || orm !== "drizzle") return;

  const dbPkgPath = "packages/db/package.json";
  const webPkgPath = "apps/web/package.json";
  const serverPkgPath = "apps/server/package.json";
  if (!vfs.exists(dbPkgPath)) return;

  const webNeedsDbRuntime = backend === "self" && vfs.exists(webPkgPath);
  const databaseRunsOnCloudflare =
    backend === "self" ? webDeploy === "cloudflare" : serverDeploy === "cloudflare";

  if (database === "sqlite") {
    addPackageDependency({
      vfs,
      packagePath: dbPkgPath,
      dependencies: ["drizzle-orm", "@libsql/client", "libsql"],
      devDependencies: ["drizzle-kit"],
    });
    if (webNeedsDbRuntime) {
      addPackageDependency({
        vfs,
        packagePath: webPkgPath,
        dependencies: ["@libsql/client", "libsql"],
      });
    }
    if (backend !== "self" && dbSetup !== "d1" && vfs.exists(serverPkgPath)) {
      addPackageDependency({ vfs, packagePath: serverPkgPath, dependencies: ["libsql"] });
    }
    return;
  }

  const dependencies: AvailableDependencies[] = ["drizzle-orm"];
  const devDependencies: AvailableDependencies[] = ["drizzle-kit"];

  if (dbSetup === "neon") {
    dependencies.push("@neondatabase/serverless");
  } else if (databaseRunsOnCloudflare) {
    dependencies.push("postgres");
  } else {
    dependencies.push("pg");
    devDependencies.push("@types/pg");
  }

  addPackageDependency({ vfs, packagePath: dbPkgPath, dependencies, devDependencies });
}
