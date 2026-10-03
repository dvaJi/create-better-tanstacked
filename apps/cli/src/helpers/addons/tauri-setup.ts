import path from "node:path";

import { Result } from "better-result";
import { execa } from "execa";
import fs from "fs-extra";

import type { ProjectConfig } from "../../types";
import { AddonSetupError } from "../../utils/errors";
import { shouldSkipExternalCommands } from "../../utils/external-commands";
import { getPackageRunnerPrefix } from "../../utils/package-runner";
import { createSpinner } from "../../utils/terminal-output";

function getWebFrontend(frontend: Pick<ProjectConfig, "frontend">["frontend"]) {
  return frontend.find((value) => value === "tanstack-router" || value === "tanstack-start");
}

function getTauriDevUrl(_frontend: Pick<ProjectConfig, "frontend">["frontend"]) {
  return "http://localhost:3001";
}

function getTauriFrontendDist(frontend: Pick<ProjectConfig, "frontend">["frontend"]) {
  const webFrontend = getWebFrontend(frontend);

  switch (webFrontend) {
    case "tanstack-start":
      return "../dist/client";
    default:
      return "../dist";
  }
}

function getTauriBeforeBuildCommand(
  packageManager: Pick<ProjectConfig, "packageManager">["packageManager"],
  _frontend: Pick<ProjectConfig, "frontend">["frontend"],
) {
  return `${packageManager} run build`;
}

export function buildTauriInitArgs(
  config: Pick<ProjectConfig, "packageManager" | "frontend" | "projectDir">,
) {
  const { packageManager, frontend, projectDir } = config;

  return [
    ...getPackageRunnerPrefix(packageManager),
    "@tauri-apps/cli@latest",
    "init",
    "--ci",
    "--app-name",
    path.basename(projectDir),
    "--window-title",
    path.basename(projectDir),
    "--frontend-dist",
    getTauriFrontendDist(frontend),
    "--dev-url",
    getTauriDevUrl(frontend),
    "--before-dev-command",
    `${packageManager} run dev`,
    "--before-build-command",
    getTauriBeforeBuildCommand(packageManager, frontend),
  ];
}

export async function setupTauri(config: ProjectConfig): Promise<Result<void, AddonSetupError>> {
  if (shouldSkipExternalCommands()) {
    return Result.ok(undefined);
  }

  const { packageManager, frontend, projectDir } = config;
  const s = createSpinner();
  const clientPackageDir = path.join(projectDir, "apps/web");

  if (!(await fs.pathExists(clientPackageDir))) {
    return Result.ok(undefined);
  }

  s.start("Setting up Tauri desktop app support...");

  const [command, ...args] = buildTauriInitArgs({ packageManager, frontend, projectDir });

  const result = await Result.tryPromise({
    try: async () => {
      await execa(command, args, {
        cwd: clientPackageDir,
        env: { CI: "true" },
      });
    },
    catch: (e) =>
      new AddonSetupError({
        addon: "tauri",
        message: `Failed to set up Tauri: ${e instanceof Error ? e.message : String(e)}`,
        cause: e,
      }),
  });

  if (result.isErr()) {
    s.stop("Failed to set up Tauri");
    return result;
  }

  s.stop("Tauri desktop app support configured successfully!");
  return Result.ok(undefined);
}
