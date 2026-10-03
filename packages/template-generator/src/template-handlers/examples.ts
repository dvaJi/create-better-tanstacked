import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";

export async function processExampleTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.examples.length || config.examples[0] === "none") return;

  const webFrontend = config.frontend.find(
    (frontend) => frontend === "tanstack-router" || frontend === "tanstack-start",
  );
  const nativeFrontend = config.frontend.find(
    (frontend) =>
      frontend === "native-bare" ||
      frontend === "native-uniwind" ||
      frontend === "native-unistyles",
  );

  for (const example of config.examples) {
    if (example === "none") continue;

    if (config.backend !== "none" && config.api !== "none") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `examples/${example}/server/${config.orm}/base`,
        "packages/api",
        config,
      );

      if (config.orm !== "none" && config.database !== "none") {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `examples/${example}/server/${config.orm}/${config.database}`,
          "packages/db",
          config,
        );
      }
    }

    if (webFrontend) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `examples/${example}/web/react/${webFrontend}`,
        "apps/web",
        config,
      );

      if (config.backend === "self" && webFrontend === "tanstack-start") {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `examples/${example}/fullstack/tanstack-start`,
          "apps/web",
          config,
        );
      }
    }

    if (nativeFrontend) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `examples/${example}/native/${nativeFrontend.replace("native-", "")}`,
        "apps/native",
        config,
      );
    }
  }
}
