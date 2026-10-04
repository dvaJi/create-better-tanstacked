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

  if (vfs.exists("apps/web/package.json")) {
    addPackageDependency({
      vfs,
      packagePath: "apps/web/package.json",
      dependencies: ["@polar-sh/better-auth"],
    });
  }
}
