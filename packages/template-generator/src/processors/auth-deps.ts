import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency, type AvailableDependencies } from "../utils/add-deps";

export function processAuthDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { auth, backend, frontend, orm } = config;
  if (auth === "none") return;

  const authPath = "packages/auth/package.json";
  const apiPath = "packages/api/package.json";
  const webPath = "apps/web/package.json";
  const nativePath = "apps/native/package.json";
  const serverPath = "apps/server/package.json";
  const hasNative = frontend.some(
    (value) =>
      value === "native-bare" || value === "native-uniwind" || value === "native-unistyles",
  );
  const webFrontend = frontend.find(
    (value) => value === "tanstack-router" || value === "tanstack-start",
  );

  if (auth === "clerk") {
    if (webFrontend && vfs.exists(webPath)) {
      addPackageDependency({
        vfs,
        packagePath: webPath,
        dependencies:
          webFrontend === "tanstack-start" ? ["@clerk/tanstack-react-start"] : ["@clerk/react"],
      });
    }
    if (hasNative && vfs.exists(nativePath)) {
      addPackageDependency({ vfs, packagePath: nativePath, dependencies: ["@clerk/expo"] });
    }
    if (vfs.exists(apiPath)) {
      addPackageDependency({ vfs, packagePath: apiPath, dependencies: ["@clerk/backend"] });
    }
    const serverOrWebPath = backend === "self" ? webPath : serverPath;
    if (vfs.exists(serverOrWebPath) && backend !== "none") {
      addPackageDependency({
        vfs,
        packagePath: serverOrWebPath,
        dependencies: ["@clerk/backend"],
      });
    }
    return;
  }

  if (vfs.exists(authPath)) {
    const dependencies: AvailableDependencies[] = ["better-auth"];
    if (orm === "drizzle") dependencies.push("@better-auth/drizzle-adapter", "drizzle-orm");
    if (hasNative) dependencies.push("@better-auth/expo");
    addPackageDependency({ vfs, packagePath: authPath, dependencies });
  }

  if (webFrontend && vfs.exists(webPath)) {
    addPackageDependency({
      vfs,
      packagePath: webPath,
      dependencies: ["better-auth", "@tanstack/react-form"],
    });
  }

  if (hasNative && vfs.exists(nativePath)) {
    addPackageDependency({
      vfs,
      packagePath: nativePath,
      dependencies: ["better-auth", "@better-auth/expo", "@tanstack/react-form"],
    });
  }
}
