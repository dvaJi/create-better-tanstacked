import { box, log } from "@clack/prompts";
import pc from "picocolors";

import type {
  Backend,
  Database,
  DatabaseSetup,
  Frontend,
  ORM,
  ProjectConfig,
  DbSetupOptions,
  Runtime,
  ServerDeploy,
  WebDeploy,
} from "../../types";
import { isAlchemyDeployTarget, usesAlchemyManagedDatabase, webFrontends } from "../../types";
import { getDockerStatus } from "../../utils/docker-utils";
import {
  fetchSponsorsQuietly,
  formatPostInstallSpecialSponsorsSection,
} from "../../utils/sponsors";
import { cliLog } from "../../utils/terminal-output";

function getDesktopStaticBuildNote(frontend: Frontend[]): string {
  const staticBuildFrontends = new Map<Frontend, string>([["tanstack-start", "TanStack Start"]]);

  const staticBuildFrontend = frontend.find((value) => staticBuildFrontends.has(value));
  if (!staticBuildFrontend) {
    return "";
  }

  return `${pc.yellow(
    "NOTE:",
  )} Desktop builds package static web assets.\n   ${staticBuildFrontends.get(
    staticBuildFrontend,
  )} needs a static/export web build before desktop packaging will work.`;
}

export async function displayPostInstallInstructions(
  config: ProjectConfig & { depsInstalled: boolean },
) {
  const {
    api,
    database,
    relativePath,
    packageManager,
    depsInstalled,
    orm,
    addons,
    runtime,
    frontend,
    backend,
    dbSetup,
    webDeploy,
    serverDeploy,
    dbSetupOptions,
  } = config;

  const isBackendSelf = backend === "self";
  const runCmd =
    packageManager === "npm" ? "npm run" : packageManager === "pnpm" ? "pnpm run" : "bun run";
  const cdCmd = `cd ${relativePath}`;
  const hasLefthook = addons?.includes("lefthook");
  const hasVitePlus = addons?.includes("vite-plus");
  const hasVitePlusNativeHooks = hasVitePlus && !hasLefthook;
  const hasGitHooksOrLinting =
    addons?.includes("lefthook") || addons?.includes("oxlint") || hasVitePlus;

  const databaseInstructions =
    database !== "none"
      ? await getDatabaseInstructions(
          database,
          orm,
          runCmd,
          runtime,
          dbSetup,
          webDeploy,
          serverDeploy,
          backend,
          dbSetupOptions,
        )
      : "";

  const tauriInstructions = addons?.includes("tauri") ? getTauriInstructions(runCmd, frontend) : "";
  const electrobunInstructions = addons?.includes("electrobun")
    ? getElectrobunInstructions(runCmd, frontend)
    : "";
  const lefthookInstructions = hasLefthook ? getLefthookInstructions(packageManager) : "";
  const vitePlusNativeHooksInstructions = hasVitePlusNativeHooks
    ? getVitePlusNativeHooksInstructions(runCmd)
    : "";
  const lintingInstructions = hasGitHooksOrLinting ? getLintingInstructions(runCmd) : "";
  const nativeInstructions =
    (frontend?.includes("native-bare") ||
      frontend?.includes("native-uniwind") ||
      frontend?.includes("native-unistyles")) &&
    backend !== "none"
      ? getNativeInstructions(isBackendSelf, frontend || [], runCmd)
      : "";
  const pwaInstructions =
    addons?.includes("pwa") && frontend?.includes("tanstack-router") ? getPwaInstructions() : "";
  const clerkInstructions =
    config.auth === "clerk" ? getClerkInstructions(frontend || [], backend, api) : "";
  const alchemyDeployInstructions = getAlchemyDeployInstructions(
    runCmd,
    webDeploy,
    serverDeploy,
    backend,
    config.auth,
    frontend || [],
    addons || [],
  );

  const hasWeb = frontend?.some((f) => (webFrontends as readonly string[]).includes(f));
  const hasNative =
    frontend?.includes("native-bare") ||
    frontend?.includes("native-uniwind") ||
    frontend?.includes("native-unistyles");

  const webPort = "3001";
  const polarInstructions =
    config.payments === "polar" && config.auth === "better-auth"
      ? getPolarInstructions(backend)
      : "";

  const bunWebNativeWarning =
    packageManager === "bun" && hasNative && hasWeb ? getBunWebNativeWarning() : "";
  const noOrmWarning = database !== "none" && orm === "none" ? getNoOrmWarning() : "";

  let output = `${pc.cyan("1.")} ${cdCmd}\n`;
  let stepCounter = 2;

  if (!depsInstalled) {
    output += `${pc.cyan(`${stepCounter++}.`)} ${packageManager} install\n`;
  }

  if (database === "sqlite" && dbSetup !== "d1") {
    output += `${pc.cyan(`${stepCounter++}.`)} ${runCmd} db:local\n${pc.dim(
      "   (optional - starts local SQLite database)",
    )}\n`;
  }

  const hasAlchemyD1 =
    dbSetup === "d1" &&
    (serverDeploy === "cloudflare" || (isBackendSelf && webDeploy === "cloudflare"));
  if (hasAlchemyD1 && orm !== "none") {
    output += `${pc.cyan(`${stepCounter++}.`)} ${runCmd} db:generate\n`;
  }

  if (isBackendSelf) {
    output += `${pc.cyan(`${stepCounter++}.`)} ${runCmd} dev\n`;
  } else {
    if (runtime !== "workers") {
      output += `${pc.cyan(`${stepCounter++}.`)} ${runCmd} dev\n`;
    }

    if (runtime === "workers") {
      output += `${pc.cyan(`${stepCounter++}.`)} ${runCmd} dev\n`;
    }
  }

  const hasStandaloneBackend = backend !== "none";
  const hasAnyService = hasWeb || hasStandaloneBackend || addons?.includes("fumadocs");

  if (hasAnyService) {
    const localServices: Array<{ label: string; url: string }> = [];
    let localDevelopmentNote = "";

    if (hasWeb) {
      localServices.push({ label: "Frontend", url: `http://localhost:${webPort}` });
    } else if (!hasNative) {
      localDevelopmentNote = "Backend-only app — no frontend selected";
    }

    if (!isBackendSelf && hasStandaloneBackend) {
      localServices.push({ label: "API", url: "http://localhost:3000" });

      if (api === "orpc") {
        localServices.push({
          label: "API reference",
          url: "http://localhost:3000/api-reference",
        });
      }
    }

    if (isBackendSelf && api === "orpc") {
      const rpcPath = frontend?.includes("tanstack-start") ? "/api/rpc" : "/rpc";
      localServices.push({
        label: "API reference",
        url: `http://localhost:${webPort}${rpcPath}/api-reference`,
      });
    }

    if (addons?.includes("fumadocs")) {
      localServices.push({ label: "Fumadocs", url: "http://localhost:4000" });
    }

    output += `\n${pc.bold("Local development")}\n`;
    if (localDevelopmentNote) {
      output += `${pc.dim(localDevelopmentNote)}\n`;
    }

    if (localServices.length > 0) {
      const labelWidth = Math.max(...localServices.map(({ label }) => label.length));
      for (const { label, url } of localServices) {
        output += `${pc.dim(label.padEnd(labelWidth))}  ${pc.cyan(url)}\n`;
      }
    }
  }

  if (nativeInstructions) output += `\n${nativeInstructions.trim()}\n`;
  if (databaseInstructions) output += `\n${databaseInstructions.trim()}\n`;
  if (tauriInstructions) output += `\n${tauriInstructions.trim()}\n`;
  if (electrobunInstructions) output += `\n${electrobunInstructions.trim()}\n`;
  if (lefthookInstructions) output += `\n${lefthookInstructions.trim()}\n`;
  if (vitePlusNativeHooksInstructions) output += `\n${vitePlusNativeHooksInstructions.trim()}\n`;
  if (lintingInstructions) output += `\n${lintingInstructions.trim()}\n`;
  if (pwaInstructions) output += `\n${pwaInstructions.trim()}\n`;
  if (clerkInstructions) output += `\n${clerkInstructions.trim()}\n`;
  if (polarInstructions) output += `\n${polarInstructions.trim()}\n`;
  // Deploy steps come last so env sync happens after auth/payment keys exist
  if (alchemyDeployInstructions) output += `\n${alchemyDeployInstructions.trim()}\n`;

  if (noOrmWarning) output += `\n${noOrmWarning.trim()}\n`;
  if (bunWebNativeWarning) output += `\n${bunWebNativeWarning.trim()}\n`;

  const sponsorsResult = await fetchSponsorsQuietly();
  const specialSponsorsSection = sponsorsResult.isOk()
    ? formatPostInstallSpecialSponsorsSection(sponsorsResult.value)
    : "";

  log.message([], { spacing: 1 });
  box(output.trimEnd(), pc.bold("Next steps"), {
    contentPadding: 2,
    formatBorder: pc.dim,
    rounded: true,
    width: "auto",
  });

  if (specialSponsorsSection) {
    cliLog.message(specialSponsorsSection);
  }

  cliLog.message(
    `${pc.bold("Like Better T Stack?")} ${pc.dim("Star the project on GitHub")}\n${pc.cyan(
      "https://github.com/AmanVarshney01/create-better-t-stack",
    )}`,
  );
}

function getNativeInstructions(isBackendSelf: boolean, frontend: Frontend[], runCmd: string) {
  const envVar = "EXPO_PUBLIC_SERVER_URL";
  const exampleUrl = isBackendSelf ? "http://<YOUR_LOCAL_IP>:3001" : "http://<YOUR_LOCAL_IP>:3000";
  const envFileName = ".env";
  const ipNote = "your local IP address";

  let instructions = `${pc.yellow(
    "NOTE:",
  )} For Expo connectivity issues, update\n   apps/native/${envFileName} with ${ipNote}:\n   ${`${envVar}=${exampleUrl}`}\n`;

  if (frontend.includes("native-unistyles")) {
    instructions += `\n${pc.yellow(
      "NOTE:",
    )} Unistyles requires a development build.\n   cd apps/native and run ${runCmd} android or ${runCmd} ios\n`;
  }

  return instructions;
}

function getLintingInstructions(runCmd: string) {
  return `${pc.bold("Linting and formatting:")}\n${pc.cyan(
    "•",
  )} Run checks: ${`${runCmd} check`}\n`;
}

function getLefthookInstructions(packageManager: string) {
  const cmd = packageManager === "npm" ? "npx" : packageManager;
  return `${pc.bold("Git hooks with Lefthook:")}\n${pc.cyan(
    "•",
  )} Install hooks: ${cmd} lefthook install\n`;
}

function getVitePlusNativeHooksInstructions(runCmd: string) {
  return `${pc.bold("Vite+ native Git hooks:")}\n${pc.cyan(
    "•",
  )} Optional hook setup: ${`${runCmd} hooks:setup`}\n${pc.dim(
    "   (runs vp config; hooks install into .vite-hooks and use vp staged)",
  )}\n`;
}

async function getDatabaseInstructions(
  database: Database,
  orm: ORM,
  runCmd: string,
  _runtime: Runtime,
  dbSetup: DatabaseSetup,
  webDeploy: WebDeploy,
  serverDeploy: ServerDeploy,
  backend: Backend,
  dbSetupOptions: DbSetupOptions | undefined,
) {
  const notes: string[] = [];
  const commands: Array<{ label: string; command: string }> = [];
  const isD1Alchemy =
    dbSetup === "d1" &&
    (serverDeploy === "cloudflare" || (backend === "self" && webDeploy === "cloudflare"));
  const isAlchemyManagedDatabase = usesAlchemyManagedDatabase({
    backend,
    dbSetup,
    webDeploy,
    serverDeploy,
    dbSetupOptions,
  });

  if (dbSetup === "docker") {
    const dockerStatus = await getDockerStatus(database);
    if (dockerStatus.message) notes.push(dockerStatus.message);
  }

  if (isAlchemyManagedDatabase) {
    const provider =
      dbSetup === "prisma-postgres"
        ? "Prisma Postgres"
        : dbSetup === "planetscale"
          ? "PlanetScale"
          : "Neon";
    notes.push(
      `${pc.cyan("INFO:")} Alchemy provisions ${provider}, injects its connection credentials, and applies checked-in migrations during deploy.`,
    );
    if (dbSetup === "planetscale") {
      notes.push(
        `${pc.yellow("NOTE:")} The generated PlanetScale database uses the PS_DEV size, which may incur usage charges.`,
      );
    }
  }

  if (orm === "drizzle") {
    if (dbSetup === "docker") {
      commands.push({ label: "Start database", command: `${runCmd} db:start` });
    }
    if (isAlchemyManagedDatabase) {
      commands.push({ label: "Generate migrations", command: `${runCmd} db:generate` });
    } else if (!isD1Alchemy) {
      commands.push({ label: "Apply schema", command: `${runCmd} db:push` });
    }
    if (!isD1Alchemy && !isAlchemyManagedDatabase) {
      commands.push({ label: "Open studio", command: `${runCmd} db:studio` });
    }
  } else if (orm === "none") {
    notes.push(`${pc.yellow("NOTE:")} Manual database schema setup required.`);
  }

  if (notes.length === 0 && commands.length === 0) return "";

  const sections = [pc.bold("Database")];
  if (notes.length > 0) sections.push(notes.join("\n"));
  if (commands.length > 0) {
    const labelWidth = Math.max(...commands.map(({ label }) => label.length));
    sections.push(
      commands
        .map(({ label, command }) => `${pc.dim(label.padEnd(labelWidth))}  ${pc.cyan(command)}`)
        .join("\n"),
    );
  }
  return sections.join("\n");
}
function getTauriInstructions(runCmd: string, frontend: Frontend[]) {
  const staticBuildNote = getDesktopStaticBuildNote(frontend);

  return `\n${pc.bold("Desktop app with Tauri:")}\n${pc.cyan(
    "•",
  )} Start desktop app: ${`cd apps/web && ${runCmd} desktop:dev`}\n${pc.cyan(
    "•",
  )} Build desktop app: ${`cd apps/web && ${runCmd} desktop:build`}\n${pc.yellow(
    "NOTE:",
  )} Tauri requires Rust and platform-specific dependencies.\n   See: ${"https://v2.tauri.app/start/prerequisites/"}${
    staticBuildNote ? `\n${staticBuildNote}` : ""
  }`;
}

function getElectrobunInstructions(runCmd: string, frontend: Frontend[]) {
  const staticBuildNote = getDesktopStaticBuildNote(frontend);

  return `\n${pc.bold("Desktop app with Electrobun:")}\n${pc.cyan(
    "•",
  )} Start desktop app with HMR (runs the whole stack): ${`${runCmd} dev:desktop`}\n${pc.cyan(
    "•",
  )} Build stable desktop app (DMG/App): ${`${runCmd} build:desktop`}\n${pc.cyan(
    "•",
  )} Build canary desktop app: ${`${runCmd} build:desktop:canary`}\n${pc.yellow(
    "NOTE:",
  )} Electrobun wraps your web frontend in a desktop shell.\n   The first desktop command downloads Hutch and the Electrobun toolchain.\n   Packaged builds bake the API URL from apps/web/.env, so point it at a reachable server first.\n   See: ${"https://framework.blackboard.sh/electrobun/"}${
    staticBuildNote ? `\n${staticBuildNote}` : ""
  }`;
}

function getPwaInstructions() {
  return `\n${pc.bold("PWA with TanStack Router:")}\n${pc.yellow(
    "NOTE:",
  )} Verify PWA behavior with a production build on HTTPS or localhost.\n   Offline navigation shows a precached fallback page.\n   Server-rendered pages require a connection.`;
}

function getNoOrmWarning() {
  return `\n${pc.yellow(
    "WARNING:",
  )} Database selected without an ORM. Features requiring\n   database access (e.g., examples, auth) need manual setup.`;
}

function getBunWebNativeWarning() {
  return `\n${pc.yellow(
    "WARNING:",
  )} 'bun' might cause issues with web + native apps in a monorepo.\n   Use 'pnpm' if problems arise.`;
}

function getClerkQuickstartUrl(frontend: Frontend[]) {
  if (frontend.includes("tanstack-start")) {
    return "https://clerk.com/docs/tanstack-react-start/getting-started/quickstart";
  }
  if (frontend.includes("tanstack-router")) {
    return "https://clerk.com/docs/react/getting-started/quickstart";
  }
  if (
    frontend.includes("native-bare") ||
    frontend.includes("native-uniwind") ||
    frontend.includes("native-unistyles")
  ) {
    return "https://clerk.com/docs/expo/getting-started/quickstart";
  }
  return "https://clerk.com/docs";
}

function getClerkInstructionLines(
  frontend: Frontend[],
  backend: Backend,
  api: ProjectConfig["api"],
) {
  const lines: string[] = [];
  const hasNativeFrontend = frontend.some((value) =>
    ["native-bare", "native-uniwind", "native-unistyles"].includes(value),
  );

  if (frontend.some((value) => ["tanstack-router", "tanstack-start"].includes(value))) {
    lines.push("Set VITE_CLERK_PUBLISHABLE_KEY in apps/web/.env");
  }
  if (hasNativeFrontend) {
    lines.push("Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in apps/native/.env");
  }

  const hasClerkServerFrontend = frontend.includes("tanstack-start");
  const serverEnvPath = backend === "self" ? "apps/web/.env" : "apps/server/.env";
  if (hasClerkServerFrontend && backend === "self") {
    lines.push(
      "Set CLERK_SECRET_KEY in apps/web/.env for Clerk server middleware and server-side Clerk auth",
    );
  } else {
    if (hasClerkServerFrontend) {
      lines.push("Set CLERK_SECRET_KEY in apps/web/.env for Clerk server middleware");
    }
    if (backend !== "none") {
      lines.push(`Set CLERK_SECRET_KEY in ${serverEnvPath} for server-side Clerk auth`);
    }
  }
  if (api !== "none" && ["self", "hono", "elysia"].includes(backend)) {
    lines.push(
      `Set CLERK_PUBLISHABLE_KEY in ${serverEnvPath} for server-side Clerk request verification`,
    );
  }
  return lines;
}

function getClerkInstructions(frontend: Frontend[], backend: Backend, api: ProjectConfig["api"]) {
  const lines = [
    `${pc.bold("Clerk Authentication Setup:")}`,
    `${pc.cyan("•")} Follow the guide: ${pc.underline(getClerkQuickstartUrl(frontend))}`,
    ...getClerkInstructionLines(frontend, backend, api).map((line) => `${pc.cyan("•")} ${line}`),
  ];
  return lines.join("\n");
}

function getPolarInstructions(backend: Backend) {
  const envPath = backend === "self" ? "apps/web/.env" : "apps/server/.env";
  return `${pc.bold("Polar Payments Setup:")}\n${pc.cyan("•")} Get access token & product ID from ${pc.underline("https://sandbox.polar.sh/")}\n${pc.cyan("•")} Set POLAR_ACCESS_TOKEN in ${envPath}`;
}
function getAlchemyDeployInstructions(
  runCmd: string,
  webDeploy: WebDeploy,
  serverDeploy: ServerDeploy,
  backend: Backend,
  auth: ProjectConfig["auth"],
  frontend: Frontend[],
  addons: ProjectConfig["addons"],
) {
  const instructions: string[] = [];
  const isBackendSelf = backend === "self";
  const hasAlchemyWeb = isAlchemyDeployTarget(webDeploy);
  const hasAlchemyServer = isAlchemyDeployTarget(serverDeploy);
  const hasAxiom = addons.includes("axiom");
  const alchemyExec = runCmd === "npm run" ? "npx" : runCmd === "pnpm run" ? "pnpm exec" : "bunx";

  if (hasAlchemyWeb || hasAlchemyServer || hasAxiom) {
    const targetParts = [
      ...(hasAlchemyWeb ? [`web on ${webDeploy === "cloudflare" ? "Cloudflare" : "Prisma"}`] : []),
      ...(hasAlchemyServer && !isBackendSelf
        ? [`server on ${serverDeploy === "cloudflare" ? "Cloudflare" : "Prisma"}`]
        : []),
      ...(hasAxiom ? ["Axiom observability"] : []),
    ];
    const hasAlchemyCompute = hasAlchemyWeb || hasAlchemyServer;
    const hasExternalDeploy =
      webDeploy === "vercel" ||
      serverDeploy === "vercel" ||
      webDeploy === "docker" ||
      serverDeploy === "docker";
    const deployScript =
      !hasAlchemyCompute && hasExternalDeploy
        ? "deploy:infra"
        : webDeploy === "vercel"
          ? "deploy:server"
          : serverDeploy === "vercel"
            ? "deploy:web"
            : "deploy";
    const originSteps: string[] = [];
    const hasWeb = frontend.some((value) => (webFrontends as readonly string[]).includes(value));

    if (!isBackendSelf && hasAlchemyServer && hasWeb) {
      originSteps.push(
        `${pc.cyan("•")} Required after the first deploy: set CORS_ORIGIN in apps/server/.env to the deployed web origin, then deploy again`,
      );
    }

    if (auth === "better-auth" && isBackendSelf && webDeploy === "prisma") {
      originSteps.push(
        `${pc.cyan("•")} After the first deploy, set BETTER_AUTH_URL in apps/web/.env to the returned web URL, then deploy again`,
      );
    } else if (auth === "better-auth" && !isBackendSelf && serverDeploy === "prisma") {
      originSteps.push(
        `${pc.cyan("•")} After the first deploy, set BETTER_AUTH_URL in apps/server/.env to the returned server URL, then deploy again`,
      );
    }

    instructions.push(
      `${pc.bold(`Deploy with Alchemy (${targetParts.join(" + ")}):`)}\n${pc.cyan("•")} Configure provider accounts: ${`cd packages/infra && ${alchemyExec} alchemy profile edit`}\n${hasAxiom && (webDeploy === "vercel" || serverDeploy === "vercel") ? `${pc.cyan("•")} For Axiom, deploy from packages/infra with alchemy deploy --stage preview or --stage production. Link Vercel first: ${`${runCmd} deploy:setup`}\n` : ""}${pc.cyan("•")} Dev: ${`${runCmd} dev`}\n${pc.cyan("•")} Deploy: ${`${runCmd} ${deployScript}`}\n${originSteps.join("\n")}${originSteps.length > 0 ? "\n" : ""}${pc.cyan("•")} Destroy: ${`${runCmd} destroy`}`,
    );
  }

  if (webDeploy === "docker" || serverDeploy === "docker") {
    const dockerTargets =
      webDeploy === "docker" && serverDeploy === "docker"
        ? "web + server"
        : webDeploy === "docker"
          ? "web"
          : "server";
    instructions.push(
      `${pc.bold(`Deploy ${dockerTargets} with Docker Compose:`)}\n${pc.cyan("•")} Start: ${`${runCmd} docker:up`}\n${pc.cyan("•")} Logs: ${`${runCmd} docker:logs`}\n${pc.cyan("•")} Stop: ${`${runCmd} docker:down`}\n${pc.cyan("•")} Config: docker-compose.yml`,
    );
  }

  if (webDeploy === "vercel" || serverDeploy === "vercel") {
    const mixedWithCloudflare = hasAlchemyWeb || hasAlchemyServer;
    const vercelSetupScript = "deploy:setup";
    const vercelEnvScript = "env:production";
    const vercelDeployScript = mixedWithCloudflare
      ? webDeploy === "vercel"
        ? "deploy:web:prod"
        : "deploy:server:prod"
      : "deploy:prod";
    const vercelTargets =
      webDeploy === "vercel" && (serverDeploy === "vercel" || isBackendSelf)
        ? "web + server"
        : webDeploy === "vercel"
          ? "web"
          : "server";
    instructions.push(
      `${pc.bold(`Deploy ${vercelTargets} with Vercel Services:`)}\n${pc.cyan("•")} Link project: ${`${runCmd} ${vercelSetupScript}`}\n${pc.cyan("•")} Sync env (before first deploy): ${`${runCmd} ${vercelEnvScript}`}\n${pc.cyan("•")} Deploy: ${`${runCmd} ${vercelDeployScript}`}\n${pc.cyan("•")} Guide: https://www.better-t-stack.dev/docs/guides/vercel`,
    );
  }

  return instructions.length ? `\n${instructions.join("\n")}` : "";
}
