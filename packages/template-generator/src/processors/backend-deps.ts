import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency, type AvailableDependencies } from "../utils/add-deps";

export function processBackendDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { backend, runtime, api, auth } = config;
  const serverPath = "apps/server/package.json";
  if (!vfs.exists(serverPath) || (backend !== "hono" && backend !== "elysia")) return;

  const dependencies: AvailableDependencies[] = [];
  const devDependencies: AvailableDependencies[] = [];

  if (backend === "hono") {
    dependencies.push("hono");
    if (runtime === "node") dependencies.push("@hono/node-server");
  } else {
    dependencies.push("elysia", "@elysiajs/cors", "@sinclair/typebox");
    if (runtime === "node") dependencies.push("@elysiajs/node");
  }

  if (api === "trpc") {
    dependencies.push("@trpc/server");
    if (backend === "hono") dependencies.push("@hono/trpc-server");
    else dependencies.push("@elysiajs/trpc");
  } else if (api === "orpc") {
    dependencies.push("@orpc/server", "@orpc/openapi", "@orpc/zod");
  }

  if (auth === "better-auth") dependencies.push("better-auth");
  if (runtime === "node") devDependencies.push("tsx", "@types/node");
  else if (runtime === "bun") devDependencies.push("@types/bun");

  addPackageDependency({ vfs, packagePath: serverPath, dependencies, devDependencies });
}
