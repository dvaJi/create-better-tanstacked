import type { ProjectConfig } from "@better-t-stack/types";

interface AllowedDependencyScripts extends Record<string, boolean> {}

export function getAllowedDependencyScripts(config: ProjectConfig): AllowedDependencyScripts {
  const allowed: AllowedDependencyScripts = {};
  const hasCloudflareDeploy =
    config.webDeploy === "cloudflare" || config.serverDeploy === "cloudflare";
  const hasPrismaDeploy = config.webDeploy === "prisma" || config.serverDeploy === "prisma";
  const hasAxiom = config.addons.includes("axiom");

  if (
    config.runtime === "node" ||
    hasCloudflareDeploy ||
    hasPrismaDeploy ||
    config.webDeploy === "docker" ||
    config.serverDeploy === "docker" ||
    config.webDeploy === "vercel" ||
    config.serverDeploy === "vercel" ||
    config.addons.includes("turborepo") ||
    config.addons.includes("vite-plus")
  ) {
    allowed.esbuild = true;
  }

  if (
    hasCloudflareDeploy ||
    hasPrismaDeploy ||
    config.webDeploy === "docker" ||
    config.webDeploy === "vercel" ||
    config.addons.includes("pwa")
  ) {
    allowed.sharp = true;
  }

  if (hasCloudflareDeploy || hasPrismaDeploy || hasAxiom) {
    allowed["msgpackr-extract"] = true;
    allowed.workerd = true;
  }

  if (config.addons.includes("lefthook")) {
    allowed.lefthook = true;
  }

  return allowed;
}
