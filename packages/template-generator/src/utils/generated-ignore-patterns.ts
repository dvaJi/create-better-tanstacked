import type { ProjectConfig } from "@better-t-stack/types";

const NATIVE_GENERATED_PATTERNS = [
  "apps/native/.expo/**",
  "apps/native/dist/**",
  "apps/native/web-build/**",
  "apps/native/ios/**",
  "apps/native/android/**",
] as const;

const FRONTEND_GENERATED_PATTERNS = {
  "tanstack-router": ["apps/web/dist/**", "apps/web/.tanstack/**", "apps/web/src/routeTree.gen.ts"],
  "tanstack-start": [
    "apps/web/dist/**",
    "apps/web/.vinxi/**",
    "apps/web/.tanstack/**",
    "apps/web/src/routeTree.gen.ts",
  ],
  "native-bare": NATIVE_GENERATED_PATTERNS,
  "native-uniwind": NATIVE_GENERATED_PATTERNS,
  "native-unistyles": NATIVE_GENERATED_PATTERNS,
  none: [],
} as const satisfies Partial<Record<ProjectConfig["frontend"][number], readonly string[]>>;

const SERVER_BUILD_BACKENDS = ["hono", "elysia"] as const;

export function getStackGeneratedIgnorePatterns(config: ProjectConfig): string[] {
  const patterns = new Set<string>();

  for (const frontend of config.frontend) {
    const frontendPatterns = FRONTEND_GENERATED_PATTERNS[frontend];
    if (!frontendPatterns) continue;
    for (const pattern of frontendPatterns) {
      patterns.add(pattern);
    }
  }

  if ((SERVER_BUILD_BACKENDS as readonly string[]).includes(config.backend)) {
    patterns.add("apps/server/dist/**");
  }

  if (config.database !== "none" && config.orm !== "none") {
    patterns.add("packages/db/dist/**");
  }
  if (config.api === "orpc" && config.backend !== "none") {
    patterns.add("packages/api/dist/**");
    if (config.auth === "better-auth") patterns.add("packages/auth/dist/**");
  }

  if (config.database === "sqlite" && config.orm === "drizzle" && config.dbSetup !== "d1") {
    patterns.add("packages/db/local.db*");
  }

  const hasCloudflare =
    config.runtime === "workers" ||
    config.dbSetup === "d1" ||
    config.webDeploy === "cloudflare" ||
    config.serverDeploy === "cloudflare";

  if (hasCloudflare) {
    patterns.add(".alchemy/**");
    patterns.add(".wrangler/**");
    patterns.add("**/.wrangler/**");
  }

  if (config.addons.includes("axiom")) {
    patterns.add(".alchemy/**");
  }

  if (config.webDeploy === "vercel" || config.serverDeploy === "vercel") {
    patterns.add(".vercel/**");
  }

  return [...patterns];
}
