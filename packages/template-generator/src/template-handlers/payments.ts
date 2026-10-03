import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";

export async function processPaymentsTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.payments || config.payments === "none") return;

  if (config.backend !== "none") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${config.payments}/server/base`,
      "packages/auth",
      config,
    );
  }

  const webFrontend = config.frontend.find((frontend) =>
    ["tanstack-router", "tanstack-start"].includes(frontend),
  );
  if (webFrontend) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${config.payments}/web/react/${webFrontend}`,
      "apps/web",
      config,
    );
  }
}
