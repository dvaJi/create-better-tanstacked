import type { SupportedProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency } from "../utils/add-deps";

export function processDeployDeps(vfs: VirtualFileSystem, config: SupportedProjectConfig): void {
  const { webDeploy, serverDeploy, frontend, backend } = config;

  const isCloudflareWeb = webDeploy === "cloudflare";
  const isCloudflareServer = serverDeploy === "cloudflare";
  const isPrismaWeb = webDeploy === "prisma";
  const isDockerWeb = webDeploy === "docker";
  const isVercelWeb = webDeploy === "vercel";
  const isVercelServer = serverDeploy === "vercel";
  const hasTanstackStart = frontend.includes("tanstack-start");

  if (isPrismaWeb) {
    addPackageDependency({
      vfs,
      packagePath: "apps/web/package.json",
      devDependencies: ["@alchemy.run/frontend-frameworks"],
    });
  }

  if (isVercelWeb || isVercelServer) {
    // Env file parsing uses node:util; the Vercel CLI runs through the package runner.
    addPackageDependency({
      vfs,
      packagePath: "package.json",
      devDependencies: ["@types/node", "tsx"],
    });
  }

  if ((isVercelWeb || (isPrismaWeb && backend !== "none")) && hasTanstackStart) {
    // Nitro emits the standalone server artifact consumed by Compute and Vercel.
    const webPkgPath = "apps/web/package.json";
    if (vfs.exists(webPkgPath)) {
      addPackageDependency({ vfs, packagePath: webPkgPath, dependencies: ["nitro"] });
    }
  }

  if (isDockerWeb && hasTanstackStart) {
    const webPkgPath = "apps/web/package.json";
    if (vfs.exists(webPkgPath)) {
      addPackageDependency({ vfs, packagePath: webPkgPath, dependencies: ["nitro"] });
    }
  }

  if (isCloudflareWeb || isCloudflareServer) {
    addPackageDependency({
      vfs,
      packagePath: "package.json",
      devDependencies: ["@cloudflare/workers-types"],
    });
  }

  if (isCloudflareServer && backend !== "self") {
    const serverPkgPath = "apps/server/package.json";
    if (vfs.exists(serverPkgPath)) {
      addPackageDependency({
        vfs,
        packagePath: serverPkgPath,
        devDependencies: ["@types/node", "@cloudflare/workers-types"],
      });
    }
  }
}
