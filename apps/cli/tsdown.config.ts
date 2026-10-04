import { defineConfig } from "tsdown";

const workspacePackages = [/^@better-t-stack\/(?:template-generator|types)(?:\/.*)?$/];

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts", "src/virtual.ts"],
  format: ["esm"],
  clean: true,
  shims: true,
  deps: {
    alwaysBundle: workspacePackages,
    dts: { alwaysBundle: workspacePackages },
  },
  outDir: "dist",
  dts: true,
  outputOptions: {
    banner: "#!/usr/bin/env node",
  },
  env: {
    BTS_TELEMETRY: process.env.BTS_TELEMETRY || "0",
    CONVEX_INGEST_URL: process.env.CONVEX_INGEST_URL || "",
    UMAMI_HOST_URL: process.env.UMAMI_HOST_URL || "https://umami.amanv.cloud",
    UMAMI_CLI_WEBSITE_ID: process.env.UMAMI_CLI_WEBSITE_ID || "",
  },
});
