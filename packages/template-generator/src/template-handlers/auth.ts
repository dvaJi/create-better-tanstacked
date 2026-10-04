import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";

const WEB_FRONTENDS = ["tanstack-router", "tanstack-start"] as const;

export async function processAuthTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (config.auth === "none") return;

  const authProvider = config.auth;
  const webFrontend = config.frontend.find((frontend) =>
    WEB_FRONTENDS.some((value) => value === frontend),
  );

  if (config.backend !== "none") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `auth/${authProvider}/server/base`,
      "packages/auth",
      config,
    );

    if (config.orm !== "none" && config.database !== "none") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `auth/${authProvider}/server/db/${config.orm}/${config.database}`,
        "packages/db",
        config,
      );
    }
  }

  if (webFrontend) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `auth/${authProvider}/web/react/base`,
      "apps/web",
      config,
    );
    processTemplatesFromPrefix(
      vfs,
      templates,
      `auth/${authProvider}/web/react/${webFrontend}`,
      "apps/web",
      config,
    );

    if (config.backend === "self" && webFrontend === "tanstack-start") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `auth/${authProvider}/fullstack/tanstack-start`,
        "apps/web",
        config,
      );
    }
  }
}
