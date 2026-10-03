import type { ProjectConfig, Frontend, API, Backend } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency, type AvailableDependencies } from "../utils/add-deps";

type FrontendType = {
  hasWeb: boolean;
  hasNative: boolean;
};

function getFrontendType(frontend: Frontend[]): FrontendType {
  return {
    hasWeb: frontend.some((value) => value === "tanstack-router" || value === "tanstack-start"),
    hasNative: frontend.some(
      (value) =>
        value === "native-bare" || value === "native-uniwind" || value === "native-unistyles",
    ),
  };
}

export function processApiDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (config.api === "none") return;

  const frontendType = getFrontendType(config.frontend);
  addApiPackageDeps(vfs, config.api);
  addServerDeps(vfs, config.api, config.backend);
  addSelfBackendWebDeps(vfs, config.api, config.backend);
  if (frontendType.hasWeb) addWebClientDeps(vfs, config.api, config.frontend);
  if (frontendType.hasNative) addNativeDeps(vfs, config.api);
  addQueryDeps(vfs, frontendType);
}

function addApiPackageDeps(vfs: VirtualFileSystem, api: API): void {
  const packagePath = "packages/api/package.json";
  if (!vfs.exists(packagePath)) return;

  if (api === "trpc") {
    addPackageDependency({
      vfs,
      packagePath,
      dependencies: ["@trpc/server", "@trpc/client", "zod"],
    });
  } else {
    addPackageDependency({
      vfs,
      packagePath,
      dependencies: ["@orpc/server", "@orpc/client", "@orpc/openapi", "@orpc/zod", "zod"],
    });
  }
}

function addServerDeps(vfs: VirtualFileSystem, api: API, backend: Backend): void {
  const packagePath = "apps/server/package.json";
  if (!vfs.exists(packagePath) || (backend !== "hono" && backend !== "elysia")) return;

  if (api === "trpc") {
    addPackageDependency({
      vfs,
      packagePath,
      dependencies: ["@trpc/server", backend === "hono" ? "@hono/trpc-server" : "@elysiajs/trpc"],
    });
  } else {
    addPackageDependency({
      vfs,
      packagePath,
      dependencies: ["@orpc/server", "@orpc/openapi"],
    });
  }
}

function addSelfBackendWebDeps(vfs: VirtualFileSystem, api: API, backend: Backend): void {
  const packagePath = "apps/web/package.json";
  if (backend !== "self" || !vfs.exists(packagePath)) return;

  addPackageDependency({
    vfs,
    packagePath,
    dependencies:
      api === "trpc"
        ? ["@trpc/server", "@trpc/client"]
        : ["@orpc/server", "@orpc/client", "@orpc/openapi", "@orpc/zod"],
  });
}

function addWebClientDeps(vfs: VirtualFileSystem, api: API, frontend: Frontend[]): void {
  const packagePath = "apps/web/package.json";
  if (!vfs.exists(packagePath)) return;

  const dependencies: AvailableDependencies[] =
    api === "trpc"
      ? ["@trpc/tanstack-react-query", "@trpc/client", "@trpc/server"]
      : ["@orpc/tanstack-query", "@orpc/client", "@orpc/server"];
  if (frontend.includes("tanstack-start")) {
    dependencies.push("@tanstack/react-router-ssr-query");
  }
  addPackageDependency({ vfs, packagePath, dependencies });
}

function addNativeDeps(vfs: VirtualFileSystem, api: API): void {
  const packagePath = "apps/native/package.json";
  if (!vfs.exists(packagePath)) return;

  addPackageDependency({
    vfs,
    packagePath,
    dependencies:
      api === "trpc"
        ? ["@trpc/tanstack-react-query", "@trpc/client", "@trpc/server"]
        : ["@orpc/tanstack-query", "@orpc/client"],
  });
}

function addQueryDeps(vfs: VirtualFileSystem, frontendType: FrontendType): void {
  if (frontendType.hasWeb && vfs.exists("apps/web/package.json")) {
    addPackageDependency({
      vfs,
      packagePath: "apps/web/package.json",
      dependencies: ["@tanstack/react-query"],
      devDependencies: ["@tanstack/react-query-devtools"],
    });
  }

  if (frontendType.hasNative && vfs.exists("apps/native/package.json")) {
    addPackageDependency({
      vfs,
      packagePath: "apps/native/package.json",
      dependencies: ["@tanstack/react-query"],
    });
  }
}
