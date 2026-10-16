import path from "node:path";

import { Result } from "better-result";
import fs from "fs-extra";

import { addPackageDependency } from "../../utils/add-package-deps";
import { AddonSetupError } from "../../utils/errors";
import { OXFMT_CONFIG, OXLINT_CONFIG } from "../../utils/ox-config-defaults";
import { createSpinner } from "../../utils/terminal-output";

async function writeConfigIfMissing(
  filePath: string,
  config: typeof OXLINT_CONFIG | typeof OXFMT_CONFIG,
): Promise<void> {
  if (await fs.pathExists(filePath)) return;
  await fs.writeFile(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export async function setupOxlint(projectDir: string): Promise<Result<void, AddonSetupError>> {
  return Result.tryPromise({
    try: async () => {
      await addPackageDependency({
        devDependencies: ["oxlint", "oxfmt"],
        projectDir,
      });

      const packageJsonPath = path.join(projectDir, "package.json");
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);

        packageJson.scripts = {
          ...packageJson.scripts,
          check: "oxlint && oxfmt --write",
        };

        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      }

      const s = createSpinner();

      try {
        s.start("Writing oxlint and oxfmt defaults...");

        await writeConfigIfMissing(path.join(projectDir, ".oxlintrc.json"), OXLINT_CONFIG);
        await writeConfigIfMissing(path.join(projectDir, ".oxfmtrc.json"), OXFMT_CONFIG);

        s.stop("oxlint and oxfmt configured");
      } catch (error) {
        s.stop("Failed to write oxlint and oxfmt defaults");
        throw error;
      }
    },
    catch: (error) =>
      new AddonSetupError({
        addon: "oxlint",
        message: `Failed to set up oxlint: ${error instanceof Error ? error.message : String(error)}`,
        cause: error,
      }),
  });
}
