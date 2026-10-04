#!/usr/bin/env bun
// Verify create-better-tanstacked installs and runs under npm, pnpm, and bun.
// Catches any regression that breaks the published artifact for consumers —
// unresolved protocol refs, missing files, broken bin entry, import failures
// from missing transitive deps, etc.
//
// Packs the CLI with `npm pack` (matching the release workflow, which uses
// `npm publish`), checks that bundled template assets are present, installs
// the tarball in a temp dir, then verifies and runs the published command.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { $ } from "bun";

interface PackageFixture {
  name: string;
  private: boolean;
  version: string;
  dependencies: Record<string, string>;
}

const ROOT = resolve(import.meta.dir, "..");

type Publishable = {
  name: string;
  dir: string;
  omitDevDependencies?: string[];
};

const PUBLISHABLES: Publishable[] = [
  {
    name: "create-better-tanstacked",
    dir: "apps/cli",
    omitDevDependencies: ["@better-t-stack/template-generator", "@better-t-stack/types"],
  },
];

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

async function pack(pkg: Publishable, outDir: string): Promise<string> {
  const packageJsonPath = join(ROOT, pkg.dir, "package.json");
  const originalPackageJson = readFileSync(packageJsonPath, "utf-8");

  try {
    const packageJson = JSON.parse(originalPackageJson);
    for (const dependency of pkg.omitDevDependencies ?? []) {
      delete packageJson.devDependencies?.[dependency];
    }
    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

    const r = await $`npm pack --pack-destination=${outDir} --json`
      .cwd(join(ROOT, pkg.dir))
      .quiet();
    const packed = JSON.parse(r.stdout.toString()) as
      | Array<{
          filename: string;
          files: Array<{ path: string }>;
        }>
      | Record<string, { filename: string; files: Array<{ path: string }> }>;
    const entry = Array.isArray(packed) ? packed[0] : Object.values(packed)[0];

    const requiredAsset = "dist/templates-binary/frontend/native/base/assets/images/icon.png";
    if (!entry.files.some(({ path }) => path === requiredAsset)) {
      throw new Error(`Packed CLI is missing required template asset: ${requiredAsset}`);
    }

    return join(outDir, entry.filename);
  } finally {
    writeFileSync(packageJsonPath, originalPackageJson);
  }
}

async function installAndRun(
  pm: "npm" | "pnpm" | "bun",
  tarballs: Record<string, string>,
  smokeRoot: string,
) {
  const dir = join(smokeRoot, `install-${pm}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const fixture: PackageFixture = {
    name: `smoke-${pm}`,
    private: true,
    version: "0.0.0",
    dependencies: { "create-better-tanstacked": `file:${tarballs["create-better-tanstacked"]}` },
  };
  writeFileSync(join(dir, "package.json"), JSON.stringify(fixture, null, 2));

  const install = await $`${pm} install --ignore-scripts`.cwd(dir).quiet().nothrow();
  if (install.exitCode !== 0) {
    console.error(red(`✗ ${pm} install failed`));
    const output = `${install.stderr.toString()}${install.stdout.toString()}`.trim();
    console.error(dim(output || "(no install output)"));
    process.exit(1);
  }

  const installedPackageJson = JSON.parse(
    readFileSync(join(dir, "node_modules", "create-better-tanstacked", "package.json"), "utf-8"),
  ) as {
    name: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  if (
    installedPackageJson.name !== "create-better-tanstacked" ||
    installedPackageJson.dependencies?.["@better-t-stack/types"] ||
    installedPackageJson.dependencies?.["@better-t-stack/template-generator"] ||
    installedPackageJson.devDependencies?.["@better-t-stack/types"] ||
    installedPackageJson.devDependencies?.["@better-t-stack/template-generator"]
  ) {
    console.error(red(`✗ ${pm}: package manifest still depends on old workspace packages`));
    process.exit(1);
  }

  // Verify the package manager installed the command shim, then run its target
  // entrypoint directly so this works across Windows and Unix shims.
  const binDir = join(dir, "node_modules", ".bin");
  const binCandidates = [
    "create-better-tanstacked",
    "create-better-tanstacked.cmd",
    "create-better-tanstacked.exe",
    "create-better-tanstacked.bunx",
  ];
  const cliEntrypoint = join(dir, "node_modules", "create-better-tanstacked", "dist", "cli.mjs");
  if (!binCandidates.some((name) => existsSync(join(binDir, name)))) {
    console.error(red(`✗ ${pm}: install did not create the create-better-tanstacked command`));
    process.exit(1);
  }

  const run = await $`node ${cliEntrypoint} --version`.cwd(dir).quiet().nothrow();
  if (run.exitCode !== 0) {
    console.error(red(`✗ ${pm}: create-better-tanstacked --version failed (exit ${run.exitCode})`));
    console.error(dim(run.stderr.toString() + run.stdout.toString()));
    process.exit(1);
  }

  const nativeProjectInput = {
    projectName: "smoke-native",
    api: "orpc",
    frontend: ["native-bare"],
    backend: "hono",
    runtime: "bun",
    database: "none",
    orm: "none",
    auth: "none",
    addons: ["none"],
    examples: ["none"],
    dbSetup: "none",
    webDeploy: "none",
    serverDeploy: "none",
    install: false,
    git: false,
    packageManager: "bun",
    payments: "none",
    disableAnalytics: true,
  };
  const generate =
    await $`node ${cliEntrypoint} create-json --json ${JSON.stringify(nativeProjectInput)}`
      .cwd(dir)
      .quiet()
      .nothrow();
  const generatedProjectPath = join(
    dir,
    "smoke-native",
    "apps",
    "native",
    "assets",
    "images",
    "icon.png",
  );
  if (generate.exitCode !== 0 || !existsSync(generatedProjectPath)) {
    console.error(red(`✗ ${pm}: native project generation failed or omitted bundled icon.png`));
    console.error(dim(generate.stderr.toString() + generate.stdout.toString()));
    process.exit(1);
  }

  console.log(green(`✓ ${pm}`) + dim(`  v${run.stdout.toString().trim()} + native assets`));
}

async function hasPackageManager(pm: string): Promise<boolean> {
  return Bun.which(pm) !== null;
}

const smokeRoot = join(tmpdir(), `bts-publish-smoke-${Date.now()}`);
const tarballDir = join(smokeRoot, "tarballs");
mkdirSync(tarballDir, { recursive: true });

console.log("Packing...");
const tarballs: Record<string, string> = {};
for (const pkg of PUBLISHABLES) {
  tarballs[pkg.name] = await pack(pkg, tarballDir);
  console.log(dim(`  ${pkg.name}`));
}

console.log("\nInstalling and running create-better-tanstacked under each package manager...");
for (const pm of ["npm", "pnpm", "bun"] as const) {
  if (!(await hasPackageManager(pm))) {
    console.log(dim(`  - ${pm} not available, skipping`));
    continue;
  }
  await installAndRun(pm, tarballs, smokeRoot);
}

rmSync(smokeRoot, { recursive: true, force: true });
console.log(green("\n✓ publish smoke test passed"));
