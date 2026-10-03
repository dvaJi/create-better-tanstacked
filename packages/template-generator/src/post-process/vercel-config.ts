/**
 * Vercel configuration post-processor
 * Builds vercel.json programmatically (Vercel Services: web + server in one project)
 */

import type { ProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";

type VercelRewrite = { source: string; destination: string | { service: string } };

type PackageJson = { varlock?: { loadPath: string } };

type VercelService = {
  root: string;
  framework: string;
  entrypoint?: string;
  installCommand?: string;
  buildCommand?: string;
  outputDirectory?: string;
  functions?: Record<string, { includeFiles: string }>;
  rewrites?: VercelRewrite[];
};

function getWebFramework(frontend: ProjectConfig["frontend"]): string {
  return frontend.includes("tanstack-start") ? "tanstack-start" : "vite";
}

export function processVercelConfig(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { webDeploy, serverDeploy, backend, runtime, frontend, packageManager } = config;
  if (webDeploy !== "vercel" && serverDeploy !== "vercel") return;

  const hasWeb = webDeploy === "vercel";
  const hasServer = serverDeploy === "vercel" && backend !== "self";
  const isStaticSpa = frontend.includes("tanstack-router");
  const installCommand = `cd ../.. && ${packageManager} install`;
  const services: Record<string, VercelService> = {};

  if (hasWeb) {
    const web: VercelService = {
      root: "apps/web",
      framework: getWebFramework(frontend),
      installCommand,
    };
    if (hasServer) {
      web.buildCommand = `VITE_SERVER_URL=/api ${packageManager} run build`;
    }
    if (isStaticSpa) web.rewrites = [{ source: "/(.*)", destination: "/index.html" }];
    services.web = web;
  }

  if (hasServer) {
    services.server = {
      root: "apps/server",
      framework: backend,
      entrypoint: "src/index.ts",
      installCommand,
      // Vercel compiles the entrypoint itself; a dist bundle would be deployed apart
      // from apps/server/node_modules, which bun and pnpm installs rely on.
      buildCommand: `${packageManager} run env:generate && ${packageManager} run check-types`,
      functions: {
        "src/index.ts": {
          includeFiles:
            "{package.json,apps/server/.env.schema,node_modules/.bin/varlock,node_modules/varlock/**}",
        },
      },
    };
    const pkg = vfs.readJson<PackageJson>("package.json");
    if (pkg) vfs.writeJson("package.json", { ...pkg, varlock: { loadPath: "./apps/server/" } });
  }

  const rewrites: VercelRewrite[] = [];
  if (hasWeb && hasServer) {
    rewrites.push(
      { source: "/api/(.*)", destination: { service: "server" } },
      { source: "/(.*)", destination: { service: "web" } },
    );
  } else if (hasWeb) {
    rewrites.push({ source: "/(.*)", destination: { service: "web" } });
  } else if (hasServer) {
    rewrites.push({ source: "/(.*)", destination: { service: "server" } });
  }

  vfs.writeJson("vercel.json", {
    $schema: "https://openapi.vercel.sh/vercel.json",
    bunVersion: runtime === "bun" ? "1.x" : undefined,
    services,
    rewrites,
  });
}
