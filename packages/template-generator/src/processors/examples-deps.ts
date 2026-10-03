import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency, type AvailableDependencies } from "../utils/add-deps";

export function processExamplesDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (!config.examples.length || config.examples[0] === "none") return;

  if (config.examples.includes("todo") && config.backend !== "none") {
    setupTodoDependencies(vfs, config);
  }

  if (config.examples.includes("ai")) {
    setupAIDependencies(vfs, config);
  }
}

function setupTodoDependencies(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (!vfs.exists("packages/api/package.json") || config.orm !== "drizzle") return;

  const dependencies: AvailableDependencies[] = ["drizzle-orm"];
  if (config.database === "postgres") dependencies.push("@types/pg");
  addPackageDependency({ vfs, packagePath: "packages/api/package.json", dependencies });
}

function setupAIDependencies(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { frontend, backend } = config;
  const webPackagePath = "apps/web/package.json";
  const nativePackagePath = "apps/native/package.json";
  const serverPackagePath = "apps/server/package.json";

  const hasWeb = frontend.some(
    (value) => value === "tanstack-router" || value === "tanstack-start",
  );
  const hasNative = frontend.some(
    (value) =>
      value === "native-bare" || value === "native-uniwind" || value === "native-unistyles",
  );

  if (backend === "self" && vfs.exists(webPackagePath)) {
    addPackageDependency({
      vfs,
      packagePath: webPackagePath,
      dependencies: ["ai", "@ai-sdk/google", "@ai-sdk/devtools"],
    });
  } else if (backend !== "none" && vfs.exists(serverPackagePath)) {
    addPackageDependency({
      vfs,
      packagePath: serverPackagePath,
      dependencies: ["ai", "@ai-sdk/google", "@ai-sdk/devtools"],
    });
  }

  if (hasWeb && vfs.exists(webPackagePath)) {
    addPackageDependency({
      vfs,
      packagePath: webPackagePath,
      dependencies: ["ai", "@ai-sdk/react", "streamdown"],
    });
  }

  if (hasNative && vfs.exists(nativePackagePath)) {
    addPackageDependency({
      vfs,
      packagePath: nativePackagePath,
      dependencies: ["ai", "@ai-sdk/react"],
    });
  }
}
