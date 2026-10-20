import type { ProjectConfig } from "@better-t-stack/types";

import type { JsonValue } from "../core/json-types";
import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency } from "../utils/add-deps";

type PackageJson = {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: JsonValue | undefined;
};

export function processAddonsDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (!config.addons || config.addons.length === 0) return;

  const hasPwaCompatibleFrontend = config.frontend.includes("tanstack-router");
  const hasEvlogWebServer = config.frontend.includes("tanstack-start");

  if (config.addons.includes("turborepo")) {
    addPackageDependency({ vfs, packagePath: "package.json", devDependencies: ["turbo"] });
  }

  if (config.addons.includes("vite-plus")) {
    addPackageDependency({
      vfs,
      packagePath: "package.json",
      devDependencies: ["vite-plus", "rolldown"],
    });
  }

  if (config.addons.includes("evlog") || config.addons.includes("axiom")) {
    const serverPkgPath = "apps/server/package.json";
    if (vfs.exists(serverPkgPath) && config.backend !== "self" && config.backend !== "none") {
      addPackageDependency({ vfs, packagePath: serverPkgPath, dependencies: ["evlog"] });
    }

    const webPkgPath = "apps/web/package.json";
    if (vfs.exists(webPkgPath) && hasEvlogWebServer) {
      addPackageDependency({
        vfs,
        packagePath: webPkgPath,
        dependencies: config.frontend.includes("tanstack-start") ? ["evlog", "nitro"] : ["evlog"],
      });
    }
  }

  if (config.addons.includes("pwa") && hasPwaCompatibleFrontend) {
    const webPkgPath = "apps/web/package.json";
    if (vfs.exists(webPkgPath)) {
      addPackageDependency({
        vfs,
        packagePath: webPkgPath,
        dependencies: ["vite-plugin-pwa"],
        devDependencies: ["@vite-pwa/assets-generator"],
      });
      const webPkg = vfs.readJson<PackageJson>(webPkgPath);
      if (webPkg) {
        webPkg.scripts = { ...webPkg.scripts, "generate-pwa-assets": "pwa-assets-generator" };
        vfs.writeJson(webPkgPath, webPkg);
      }
    }
  }

  if (config.addons.includes("tauri")) {
    const webPkgPath = "apps/web/package.json";
    if (vfs.exists(webPkgPath)) {
      addPackageDependency({ vfs, packagePath: webPkgPath, devDependencies: ["@tauri-apps/cli"] });
      const webPkg = vfs.readJson<PackageJson>(webPkgPath);
      if (webPkg) {
        webPkg.scripts = {
          ...webPkg.scripts,
          tauri: "tauri",
          "desktop:dev": "tauri dev",
          "desktop:build": "tauri build",
        };
        vfs.writeJson(webPkgPath, webPkg);
      }
    }
  }

  processTanStackAddonDeps(vfs, config);
}

function processTanStackAddonDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const webPkgPath = "apps/web/package.json";
  if (!vfs.exists(webPkgPath)) return;

  if (config.addons.includes("tanstack-table")) {
    addPackageDependency({
      vfs,
      packagePath: webPkgPath,
      dependencies: ["@tanstack/react-table", "@tanstack/react-virtual"],
    });
  }

  if (config.addons.includes("tanstack-charts")) {
    addPackageDependency({
      vfs,
      packagePath: webPkgPath,
      dependencies: ["@tanstack/charts"],
    });
  }

  if (config.addons.includes("tanstack-db")) {
    addPackageDependency({
      vfs,
      packagePath: webPkgPath,
      dependencies: [
        "@tanstack/react-query",
        "@tanstack/react-db",
        "@tanstack/query-db-collection",
      ],
    });
  }

  if (config.addons.includes("tanstack-ai")) {
    addPackageDependency({
      vfs,
      packagePath: webPkgPath,
      dependencies: ["@tanstack/ai", "@tanstack/ai-react", "@tanstack/ai-openai"],
    });
  }

  if (config.addons.includes("errordx")) {
    addPackageDependency({
      vfs,
      packagePath: webPkgPath,
      dependencies: ["@sentry/browser"],
    });
  }

  if (config.addons.includes("webmcp")) {
    addPackageDependency({
      vfs,
      packagePath: webPkgPath,
      dependencies: ["@mcp-b/webmcp-polyfill", "@mcp-b/react-webmcp"],
    });
  }
}
