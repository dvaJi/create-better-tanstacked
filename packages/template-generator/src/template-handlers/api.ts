import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix, processSingleTemplate } from "./utils";

export async function processApiTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (config.api === "none") return;

  processTemplatesFromPrefix(vfs, templates, `api/${config.api}/server`, "packages/api", config);
  processSingleTemplate(
    vfs,
    templates,
    `api/${config.api}/context.ts`,
    config.backend === "self" ? "apps/web/src/context.ts" : "apps/server/src/context.ts",
    config,
  );

  const webFrontend = config.frontend.find(
    (frontend) => frontend === "tanstack-router" || frontend === "tanstack-start",
  );
  if (webFrontend) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `api/${config.api}/web/react/base`,
      "apps/web",
      config,
    );

    if (config.backend === "self" && webFrontend === "tanstack-start") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `api/${config.api}/fullstack/tanstack-start`,
        "apps/web",
        config,
      );
    }
  }
}
