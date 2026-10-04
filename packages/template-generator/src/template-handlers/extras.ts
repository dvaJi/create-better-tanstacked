import type { ProjectConfig } from "@better-t-stack/types";
import { parse, stringify } from "yaml";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { getAllowedDependencyScripts } from "../utils/dependency-scripts";
import { type TemplateData, processSingleTemplate } from "./utils";

export async function processExtrasTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  processPnpmWorkspaceConfig(vfs, config);

  if (
    config.serverDeploy === "cloudflare" ||
    (config.backend === "self" && config.webDeploy === "cloudflare")
  ) {
    processSingleTemplate(
      vfs,
      templates,
      "extras/env.d.ts",
      config.backend === "self"
        ? "apps/web/cloudflare-env.d.ts"
        : "apps/server/cloudflare-env.d.ts",
      config,
    );
  }
}

export function processPnpmWorkspaceConfig(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (config.packageManager !== "pnpm") return;
  const workspace = parse(vfs.readFile("pnpm-workspace.yaml") ?? "") ?? {};
  workspace.packages ??= ["apps/*", "packages/*"];
  const allowBuilds = getAllowedDependencyScripts(config);
  if (Object.keys(allowBuilds).length) {
    workspace.allowBuilds = { ...allowBuilds, ...workspace.allowBuilds };
  }
  vfs.writeFile("pnpm-workspace.yaml", stringify(workspace));
}
