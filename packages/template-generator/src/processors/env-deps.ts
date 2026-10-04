import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency } from "../utils/add-deps";

export function processEnvDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  addPackageDependency({ vfs, packagePath: "package.json", devDependencies: ["varlock"] });

  if (vfs.exists("apps/web/package.json")) {
    addPackageDependency({
      vfs,
      packagePath: "apps/web/package.json",
      dependencies: [
        "varlock",
        ...(config.webDeploy === "cloudflare" ? [] : ["@varlock/vite-integration"]),
      ],
    });
  }

  if (vfs.exists("apps/server/package.json")) {
    addPackageDependency({
      vfs,
      packagePath: "apps/server/package.json",
      dependencies: ["varlock"],
    });
  }
}
