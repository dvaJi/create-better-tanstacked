import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";

export async function processAddonTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.addons || config.addons.length === 0) return;

  for (const addon of config.addons) {
    if (addon === "none") continue;

    // Task runners are handled programmatically by generators.
    if (addon === "turborepo" || addon === "vite-plus") continue;

    if (addon === "pwa") {
      if (config.frontend.includes("tanstack-router")) {
        processTemplatesFromPrefix(vfs, templates, "addons/pwa/apps/web/vite", "apps/web", config);
      }
      continue;
    }

    processTemplatesFromPrefix(vfs, templates, `addons/${addon}`, "", config);
  }
}
