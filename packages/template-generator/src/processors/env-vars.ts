import type { SupportedProjectConfig } from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { isDatabaseConsumedByDocker } from "../utils/docker-database";

export interface EnvVariable {
  key: string;
  value: string | null | undefined;
  condition: boolean;
  comment?: string;
}

type AddEnvVariablesOptions = {
  commentOutEmptyValues?: boolean;
};

function generateRandomString(length: number, charset: string) {
  let result = "";
  const values = new Uint8Array(length);
  globalThis.crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    const value = values[i];
    if (value !== undefined) result += charset[value % charset.length];
  }
  return result;
}

function generateAuthSecret() {
  return generateRandomString(32, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addEnvVariablesToContent(
  currentContent: string,
  variables: EnvVariable[],
  options: AddEnvVariablesOptions = {},
): string {
  let envContent = currentContent || "";
  let contentToAdd = "";

  for (const { key, value, condition, comment } of variables) {
    if (!condition) continue;
    const valueToWrite = value ?? "";
    const shouldComment = options.commentOutEmptyValues === true && valueToWrite.trim() === "";
    const lineToWrite = shouldComment ? `# ${key}=${valueToWrite}` : `${key}=${valueToWrite}`;
    const lineRegex = new RegExp(`^\\s*#?\\s*${escapeRegExp(key)}=.*$`, "m");

    if (lineRegex.test(envContent)) {
      const existingMatch = envContent.match(lineRegex);
      if (existingMatch && existingMatch[0] !== lineToWrite) {
        envContent = envContent.replace(lineRegex, lineToWrite);
      }
    } else {
      if (comment) contentToAdd += `# ${comment}\n`;
      contentToAdd += `${lineToWrite}\n`;
    }
  }

  if (contentToAdd) {
    if (envContent.length > 0 && !envContent.endsWith("\n")) envContent += "\n";
    envContent += contentToAdd;
  }
  return `${envContent.trimEnd()}\n`;
}

function writeEnvFile(
  vfs: VirtualFileSystem,
  envPath: string,
  variables: EnvVariable[],
  options: AddEnvVariablesOptions = {},
): void {
  const currentContent = vfs.exists(envPath) ? vfs.readFile(envPath) || "" : "";
  vfs.writeFile(envPath, addEnvVariablesToContent(currentContent, variables, options));
}

function buildClientVars(
  frontend: SupportedProjectConfig["frontend"],
  backend: SupportedProjectConfig["backend"],
  auth: SupportedProjectConfig["auth"],
  apiPrefix: string,
): EnvVariable[] {
  const vars: EnvVariable[] = [
    {
      key: "VITE_SERVER_URL",
      value: `http://localhost:3000${apiPrefix}`,
      condition: backend !== "none" && backend !== "self",
    },
  ];

  if (auth === "clerk") {
    vars.push({ key: "VITE_CLERK_PUBLISHABLE_KEY", value: "", condition: true });
    if (frontend.includes("tanstack-start")) {
      vars.push({ key: "CLERK_SECRET_KEY", value: "", condition: true });
    }
  }
  return vars;
}

function buildNativeVars(
  frontend: SupportedProjectConfig["frontend"],
  backend: SupportedProjectConfig["backend"],
  auth: SupportedProjectConfig["auth"],
): EnvVariable[] {
  const vars: EnvVariable[] = [
    {
      key: "EXPO_PUBLIC_SERVER_URL",
      value: backend === "self" ? "http://localhost:3001" : "http://localhost:3000",
      condition: true,
    },
  ];
  if (auth === "clerk" && frontend.some((value) => value.startsWith("native-"))) {
    vars.push({ key: "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY", value: "", condition: true });
  }
  return vars;
}

function buildServerVars(config: SupportedProjectConfig): EnvVariable[] {
  const {
    backend,
    frontend,
    auth,
    api,
    database,
    dbSetup,
    runtime,
    webDeploy,
    serverDeploy,
    payments,
    examples,
  } = config;
  const hasNative = frontend.some((value) => value.startsWith("native-"));
  const hasWeb = frontend.some((value) => ["tanstack-router", "tanstack-start"].includes(value));
  const corsOrigin = "http://localhost:3001";
  const betterAuthUrl = backend === "self" ? "http://localhost:3001" : "http://localhost:3000";
  const polarSuccessUrl =
    hasNative && !hasWeb
      ? `${betterAuthUrl}/polar/success`
      : `${corsOrigin}/success?checkout_id={CHECKOUT_ID}`;

  let databaseUrl: string | null = null;
  if (database !== "none" && dbSetup === "none") {
    if (database === "postgres") {
      databaseUrl = "postgresql://postgres:password@localhost:5432/postgres";
    } else if (
      runtime === "workers" ||
      webDeploy === "cloudflare" ||
      serverDeploy === "cloudflare"
    ) {
      databaseUrl = "http://127.0.0.1:8080";
    } else if (isDatabaseConsumedByDocker({ backend, serverDeploy, webDeploy })) {
      databaseUrl = "file:../../.data/local.db";
    } else {
      databaseUrl = "file:../../local.db";
    }
  }

  const hasBetterAuth = auth === "better-auth";
  const hasClerk = auth === "clerk";
  const needsClerkPublishableKey = hasClerk && api !== "none" && backend !== "none";
  return [
    { key: "BETTER_AUTH_SECRET", value: generateAuthSecret(), condition: hasBetterAuth },
    { key: "BETTER_AUTH_URL", value: betterAuthUrl, condition: hasBetterAuth },
    { key: "CLERK_SECRET_KEY", value: "", condition: hasClerk },
    { key: "CLERK_PUBLISHABLE_KEY", value: "", condition: needsClerkPublishableKey },
    { key: "POLAR_ACCESS_TOKEN", value: "", condition: payments === "polar" },
    { key: "POLAR_SUCCESS_URL", value: polarSuccessUrl, condition: payments === "polar" },
    { key: "CORS_ORIGIN", value: corsOrigin, condition: backend !== "self" || hasClerk },
    {
      key: "GOOGLE_GENERATIVE_AI_API_KEY",
      value: "",
      condition: examples.includes("ai"),
    },
    {
      key: "DATABASE_URL",
      value: databaseUrl,
      condition: database !== "none" && dbSetup === "none",
    },
  ];
}

export function processEnvVariables(vfs: VirtualFileSystem, config: SupportedProjectConfig): void {
  const { backend, frontend, auth, webDeploy, serverDeploy } = config;
  const hasWebFrontend = frontend.some((value) =>
    ["tanstack-router", "tanstack-start"].includes(value),
  );

  if (hasWebFrontend && vfs.directoryExists("apps/web")) {
    const apiPrefix = webDeploy === "vercel" && serverDeploy === "vercel" ? "/api" : "";
    writeEnvFile(vfs, "apps/web/.env", buildClientVars(frontend, backend, auth, apiPrefix));
  }

  if (webDeploy === "docker" && hasWebFrontend && auth === "clerk") {
    writeEnvFile(vfs, ".env", [
      {
        key: "VITE_CLERK_PUBLISHABLE_KEY",
        value: "",
        condition: true,
        comment: "Baked into the web image at docker compose build time",
      },
    ]);
  }

  if (frontend.some((value) => value.startsWith("native-")) && vfs.directoryExists("apps/native")) {
    writeEnvFile(vfs, "apps/native/.env", buildNativeVars(frontend, backend, auth));
  }

  const serverVars = buildServerVars(config);
  if (backend === "self") {
    if (vfs.directoryExists("apps/web")) writeEnvFile(vfs, "apps/web/.env", serverVars);
  } else if (vfs.directoryExists("apps/server")) {
    writeEnvFile(vfs, "apps/server/.env", serverVars);
  }
}
