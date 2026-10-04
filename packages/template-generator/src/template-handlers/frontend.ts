import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";

const WEB_FRONTENDS = ["tanstack-router", "tanstack-start"] as const;

export async function processFrontendTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  const webFrontend = config.frontend.find((frontend) =>
    WEB_FRONTENDS.some((value) => value === frontend),
  );

  if (webFrontend) {
    processTemplatesFromPrefix(vfs, templates, "frontend/react/web-base", "apps/web", config);
    processTemplatesFromPrefix(vfs, templates, `frontend/react/${webFrontend}`, "apps/web", config);
  }
}
