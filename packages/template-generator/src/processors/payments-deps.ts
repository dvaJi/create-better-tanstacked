import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency } from "../utils/add-deps";

export function processPaymentsDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (config.payments !== "polar") return;

  if (vfs.exists("packages/auth/package.json")) {
    addPackageDependency({
      vfs,
      packagePath: "packages/auth/package.json",
      dependencies: ["@polar-sh/better-auth", "@polar-sh/sdk"],
    });
  }

  for (const app of ["apps/native", "apps/web"]) {
    const packagePath = `${app}/package.json`;
    if (!vfs.exists(packagePath)) continue;
    addPackageDependency({
      vfs,
      packagePath,
      dependencies: ["@polar-sh/better-auth"],
    });
  }
}
