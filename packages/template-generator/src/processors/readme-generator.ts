import {
  isAlchemyDeployTarget,
  usesAlchemyManagedDatabase,
  type SupportedProjectConfig,
} from "@better-t-stack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { getDbScriptSupport } from "../utils/db-scripts";
import { isDatabaseConsumedByDocker } from "../utils/docker-database";

function getDesktopStaticBuildNote(frontend: SupportedProjectConfig["frontend"]): string {
  if (!frontend.includes("tanstack-start")) return "";
  return "Desktop builds package static web assets. TanStack Start needs a static build configuration before desktop packaging will work.";
}

function getClerkQuickstartUrl(frontend: SupportedProjectConfig["frontend"]): string {
  if (frontend.includes("tanstack-start")) {
    return "https://clerk.com/docs/tanstack-react-start/getting-started/quickstart";
  }
  if (frontend.includes("tanstack-router")) {
    return "https://clerk.com/docs/react/getting-started/quickstart";
  }
  return "https://clerk.com/docs";
}

function getClerkSetupLines(
  frontend: SupportedProjectConfig["frontend"],
  backend: SupportedProjectConfig["backend"],
  api: SupportedProjectConfig["api"],
): string[] {
  const lines: string[] = [];
  if (hasWebFrontend(frontend)) {
    lines.push("- Set `VITE_CLERK_PUBLISHABLE_KEY` in `apps/web/.env`");
  }

  const hasClerkServerFrontend = frontend.includes("tanstack-start");
  const serverEnvPath = backend === "self" ? "apps/web/.env" : "apps/server/.env";
  if (hasClerkServerFrontend && backend === "self") {
    lines.push(
      "- Set `CLERK_SECRET_KEY` in `apps/web/.env` for Clerk server middleware and server-side Clerk auth",
    );
  } else {
    if (hasClerkServerFrontend) {
      lines.push("- Set `CLERK_SECRET_KEY` in `apps/web/.env` for Clerk server middleware");
    }
    if (backend !== "none") {
      lines.push(`- Set \`CLERK_SECRET_KEY\` in \`${serverEnvPath}\` for server-side Clerk auth`);
    }
  }
  if (api !== "none" && ["self", "hono", "elysia"].includes(backend)) {
    lines.push(
      `- Set \`CLERK_PUBLISHABLE_KEY\` in \`${serverEnvPath}\` for server-side Clerk request verification`,
    );
  }
  return lines;
}

function hasWebFrontend(frontend: SupportedProjectConfig["frontend"]): boolean {
  return frontend.some((value) => ["tanstack-router", "tanstack-start"].includes(value));
}
export function processReadme(vfs: VirtualFileSystem, config: SupportedProjectConfig): void {
  let content = generateReadmeContent(config);
  if (
    vfs.readJson<{ scripts?: Record<string, string> }>("package.json")?.scripts?.["auth:generate"]
  ) {
    content += `\n## Better Auth Schema Generation\n\nAfter changing auth plugins or schema options, run \`${config.packageManager} run auth:generate\` from the project root. Review the schema changes, then use Drizzle's migration workflow to apply them.\n`;
  }
  vfs.writeFile("README.md", content);
}

function generateReadmeContent(options: SupportedProjectConfig): string {
  const {
    projectName,
    packageManager,
    database,
    auth,
    addons,
    frontend,
    backend,
    api,
    dbSetup,
    webDeploy,
    serverDeploy,
  } = options;
  const hasWeb = hasWebFrontend(frontend);
  const webPort = "3001";
  const packageManagerRunCmd = `${packageManager} run`;
  const stackDescription = generateStackDescription(frontend, backend, api);

  return `# ${projectName}

This project was created with [Better-T-Stack](https://github.com/dvaJi/create-better-tanstacked), a modern TypeScript stack${stackDescription ? ` that combines ${stackDescription}` : ""}.

## Features

${generateFeaturesList(options)}

## Getting Started

Install the dependencies:

\`\`\`bash
${packageManager} install
\`\`\`
${generateDatabaseSetup(options, packageManagerRunCmd)}
${auth === "clerk" ? `\n## Clerk Authentication Setup\n\n- Follow the guide: [Clerk Quickstart](${getClerkQuickstartUrl(frontend)})\n${getClerkSetupLines(frontend, backend, api).join("\n")}\n` : ""}
Run the development server:

\`\`\`bash
${packageManagerRunCmd} dev
\`\`\`

${generateRunningInstructions(frontend, backend, webPort)}
${generateReactUiSection(hasWeb, projectName)}
## Environment Configuration

Each app owns its environment schema in \`.env.schema\`. Varlock generates \`src/env.ts\` during installation; run \`${packageManagerRunCmd} env:generate\` after changing a schema. Commit schemas, and keep secrets in ignored env files or your deployment platform.

Import the generated \`ENV\` accessor in application code. Shared database and auth packages receive configuration or initialized clients from the application. See [Varlock's monorepo guide](https://varlock.dev/guides/monorepos/).

${webDeploy === "cloudflare" || serverDeploy === "cloudflare" ? "For Cloudflare, Alchemy loads and validates deployment inputs with `varlock/auto-load` in its Node/Bun deployment process. Worker code reads native bindings; web clients use the framework's public env API through `src/env.public.ts` where needed. Alchemy supplies resource URLs and managed database credentials. In-Worker Varlock protections are deferred until an official Alchemy integration is available; see [the non-Wrangler deployment guidance](https://varlock.dev/integrations/cloudflare/#non-wrangler-deploy-tools-alchemy-sst-pulumi).\n" : ""}
Bun's automatic env loading is disabled in \`bunfig.toml\`; the framework integration or server bootstrap loads Varlock. Node deployments must include Varlock and its dependencies alongside the app schema.

Run standalone Node/Bun tools that use Varlock from the owning app directory so they load that app's schema and env files. \`env:generate\` only generates TypeScript files; it does not initialize environment values in a subsequent command.

${addons.includes("pwa") && frontend.includes("tanstack-router") ? "\n## PWA Support with TanStack Router\n\nVerify PWA behavior with a production build on HTTPS or localhost. Offline navigation shows a precached fallback page; authenticated HTML and API responses are not runtime-cached.\n" : ""}
${generateDeploymentCommands(packageManagerRunCmd, webDeploy, serverDeploy, backend, auth, frontend, database, dbSetup, addons)}
${generateGitHooksSection(packageManagerRunCmd, addons)}
## Project Structure

\`\`\`
${generateProjectStructure(options)}
\`\`\`

## Available Scripts

${generateScriptsList(packageManagerRunCmd, options)}
`;
}

function generateStackDescription(
  frontend: SupportedProjectConfig["frontend"],
  backend: SupportedProjectConfig["backend"],
  api: SupportedProjectConfig["api"],
): string {
  const frontendName = frontend.includes("tanstack-router")
    ? "React, TanStack Router"
    : frontend.includes("tanstack-start")
      ? "React, TanStack Start"
      : "";
  const parts = frontendName ? [frontendName] : [];
  if (backend !== "none") parts.push(backend === "self" ? "TanStack Start" : backend.toUpperCase());
  if (api !== "none") parts.push(api.toUpperCase());
  return parts.length > 0 ? `${parts.join(", ")}, and more` : "";
}

function generateRunningInstructions(
  frontend: SupportedProjectConfig["frontend"],
  backend: SupportedProjectConfig["backend"],
  webPort: string,
): string {
  const instructions: string[] = [];
  if (hasWebFrontend(frontend)) {
    const desc = backend === "self" ? "fullstack application" : "web application";
    instructions.push(
      `Open [http://localhost:${webPort}](http://localhost:${webPort}) in your browser to see the ${desc}.`,
    );
  }
  if (backend !== "none" && backend !== "self") {
    instructions.push("The API is running at [http://localhost:3000](http://localhost:3000).");
  }
  return instructions.join("\n");
}
function generateReactUiSection(hasReactWeb: boolean, projectName: string): string {
  if (!hasReactWeb) return "";

  return `
## UI Customization

React web apps in this stack share shadcn/ui primitives through \`packages/ui\`.

- Change design tokens and global styles in \`packages/ui/src/styles/globals.css\`
- Update shared primitives in \`packages/ui/src/components/*\`
- Adjust shadcn aliases or style config in \`packages/ui/components.json\` and \`apps/web/components.json\`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

\`\`\`bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
\`\`\`

Import shared components like this:

\`\`\`tsx
import { Button } from "@${projectName}/ui/components/button"
\`\`\`

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from \`apps/web\`.
`;
}

function generateProjectStructure(config: SupportedProjectConfig): string {
  const { projectName, frontend, backend, addons, api, auth, database, orm } = config;
  const structure: string[] = [`${projectName}/`, "├── apps/"];
  const isBackendSelf = backend === "self";
  const hasWeb = hasWebFrontend(frontend);
  const hasSharedUi = hasWeb;
  const hasDbPackage = database !== "none" && orm !== "none";

  if (hasWeb) {
    const frontendType = frontend.includes("tanstack-start") ? "TanStack Start" : "TanStack Router";
    structure.push(
      `│   ${isBackendSelf ? "└──" : "├──"} web/         # ${isBackendSelf ? "Fullstack" : "Frontend"} application (${frontendType})`,
    );
  }
  if (addons.includes("fumadocs"))
    structure.push("│   ├── docs/        # Fumadocs documentation site");
  if (!isBackendSelf && backend !== "none") {
    const apiName = api === "none" ? "" : `, ${api.toUpperCase()}`;
    structure.push(`│   └── server/      # Backend API (${backend.toUpperCase()}${apiName})`);
  }

  if (
    backend !== "none" ||
    hasSharedUi ||
    hasDbPackage ||
    api !== "none" ||
    auth === "better-auth"
  ) {
    structure.push("├── packages/");
    if (hasSharedUi)
      structure.push("│   ├── ui/          # Shared shadcn/ui components and styles");
    if (api !== "none") structure.push("│   ├── api/         # API layer / business logic");
    if (auth === "better-auth")
      structure.push("│   ├── auth/        # Authentication configuration & logic");
    if (hasDbPackage) structure.push("│   └── db/          # Database schema & queries");
  }
  return structure.join("\n");
}

function generateFeaturesList(config: SupportedProjectConfig): string {
  const { database, auth, addons, orm, runtime, frontend, backend, api, dbSetup } = config;
  const hasWeb = hasWebFrontend(frontend);
  const features = ["- **TypeScript** - For type safety and improved developer experience"];

  if (frontend.includes("tanstack-router"))
    features.push("- **TanStack Router** - File-based routing with full type safety");
  if (frontend.includes("tanstack-start"))
    features.push("- **TanStack Start** - SSR framework with TanStack Router");
  if (hasWeb) features.push("- **TailwindCSS** - Utility-first CSS for rapid UI development");
  if (hasWeb) features.push("- **Shared UI package** - shadcn/ui primitives live in `packages/ui`");
  if (backend === "hono" || backend === "elysia") {
    features.push(`- **${backend === "hono" ? "Hono" : "Elysia"}** - Server framework`);
  }
  if (api === "trpc") features.push("- **tRPC** - End-to-end type-safe APIs");
  if (api === "orpc")
    features.push("- **oRPC** - End-to-end type-safe APIs with OpenAPI integration");
  if (backend !== "none" && runtime !== "none") {
    const runtimeName = runtime === "bun" ? "Bun" : "Node.js";
    features.push(`- **${runtimeName}** - Runtime environment`);
  }
  if (database !== "none") {
    if (orm === "drizzle") features.push("- **Drizzle** - TypeScript-first ORM");
    features.push(
      `- **${database === "sqlite" && dbSetup === "d1" ? "Cloudflare D1" : database === "sqlite" ? "SQLite/Turso" : "PostgreSQL"}** - Database engine`,
    );
  }
  if (auth !== "none")
    features.push(`- **Authentication** - ${auth === "clerk" ? "Clerk" : "Better Auth"}`);

  const addonFeatures = new Map<SupportedProjectConfig["addons"][number], string>([
    ["pwa", "- **PWA** - Progressive Web App support"],
    ["tauri", "- **Tauri** - Build native desktop applications"],
    ["electrobun", "- **Electrobun** - Lightweight desktop shell for web frontends"],
    ["oxlint", "- **Oxlint** - Oxlint + Oxfmt (linting & formatting)"],
    ["turborepo", "- **Turborepo** - Optimized monorepo build system"],
    [
      "vite-plus",
      "- **Vite+** - Unified Vite toolchain, workspace task runner, linting, and formatting",
    ],
    ["fumadocs", "- **Fumadocs** - Documentation site"],
    ["opentui", "- **OpenTUI** - Terminal UI toolkit"],
    ["mcp", "- **MCP** - Model Context Protocol server integrations"],
    ["skills", "- **Agent Skills** - Install skills for supported coding agents"],
    ["axiom", "- **Axiom** - Application observability"],
    ["evlog", "- **Evlog** - Structured application logging"],
    ["lefthook", "- **Lefthook** - Git hooks"],
  ]);
  for (const addon of addons) {
    const feature = addonFeatures.get(addon);
    if (feature) features.push(feature);
  }
  return features.join("\n");
}
function generateDatabaseSetup(
  config: SupportedProjectConfig,
  packageManagerRunCmd: string,
): string {
  const { database, orm, dbSetup, backend } = config;
  if (database === "none") return "";

  const isBackendSelf = backend === "self";
  const envPath = isBackendSelf ? "apps/web/.env" : "apps/server/.env";
  const ormDesc = orm === "drizzle" ? " with Drizzle ORM" : "";
  const dbSupport = getDbScriptSupport(config);
  const isAlchemyManagedDatabase = usesAlchemyManagedDatabase(config);
  let setup = "## Database Setup\n\n";

  if (isAlchemyManagedDatabase) {
    const provider =
      dbSetup === "prisma-postgres"
        ? "Prisma Postgres"
        : dbSetup === "planetscale"
          ? "PlanetScale"
          : "Neon";
    setup += `Alchemy provisions ${provider}, passes connection credentials to the deployed app, and applies checked-in Drizzle migrations during deployment. You do not need to copy a hosted \`DATABASE_URL\` into the app environment.\n\nGenerate and commit migration SQL with \`${packageManagerRunCmd} db:generate\`.`;
    if (dbSetup === "planetscale") {
      setup +=
        "\n\nThe generated PlanetScale resource uses the `PS_DEV` size and may incur usage charges.";
    }
    return `${setup}\n`;
  }

  if (dbSupport.isD1Alchemy) {
    const steps: string[] = [];
    if (dbSupport.hasDbGenerate) {
      steps.push(
        `Generate migration files:\n\n\`\`\`bash\n${packageManagerRunCmd} db:generate\n\`\`\``,
      );
    }
    if (dbSupport.hasDbMigrate) {
      steps.push(
        `Create and apply migrations locally:\n\n\`\`\`bash\n${packageManagerRunCmd} db:migrate\n\`\`\``,
      );
    }
    return `${setup}This project uses Cloudflare D1 (SQLite)${ormDesc}. Runtime database access uses the Cloudflare \`DB\` binding from \`packages/infra/alchemy.run.ts\`.\n\n${steps.join("\n\n")}\n`;
  }

  if (database === "sqlite") {
    setup += `This project uses SQLite${ormDesc}.\n\n`;
    if (dbSetup !== "d1") {
      setup += `Start the local SQLite database (optional):\n\n\`\`\`bash\n${packageManagerRunCmd} db:local\n\`\`\`\n\n`;
    }
    setup += `Update \`${envPath}\` with the appropriate connection details if needed.`;
  } else {
    setup += `This project uses PostgreSQL${ormDesc}.\n\n1. Make sure you have a PostgreSQL database set up.\n2. Update \`${envPath}\` with your PostgreSQL connection details.`;
  }

  if (dbSupport.hasDbPush) {
    setup += `\n\nApply the schema to your database:\n\n\`\`\`bash\n${packageManagerRunCmd} db:push\n\`\`\``;
  }
  return `${setup}\n`;
}
function generateScriptsList(packageManagerRunCmd: string, config: SupportedProjectConfig): string {
  const { database, addons, backend, dbSetup, frontend, webDeploy, serverDeploy } = config;
  const hasWeb = hasWebFrontend(frontend);
  const dbSupport = getDbScriptSupport(config);
  const hasAxiom = addons.includes("axiom");
  const hasAxiomWebRuntime = hasAxiom && frontend.includes("tanstack-start");
  const hasAxiomServerRuntime = hasAxiom && ["hono", "elysia"].includes(backend);

  let scripts = `- \`${packageManagerRunCmd} dev\`: Start all applications in development mode
- \`${packageManagerRunCmd} build\`: Build all applications`;
  if (hasWeb && !hasAxiomWebRuntime) {
    scripts += `\n- \`${packageManagerRunCmd} dev:web\`: Start only the web application`;
  }
  if (backend !== "none" && backend !== "self" && !hasAxiomServerRuntime) {
    scripts += `\n- \`${packageManagerRunCmd} dev:server\`: Start only the server`;
  }
  scripts += `\n- \`${packageManagerRunCmd} check-types\`: Check TypeScript types across all apps`;
  if (dbSupport.hasDbScripts) {
    if (dbSupport.hasDbPush)
      scripts += `\n- \`${packageManagerRunCmd} db:push\`: Push schema changes to database`;
    if (dbSupport.hasDbGenerate)
      scripts += `\n- \`${packageManagerRunCmd} db:generate\`: Generate database types or migrations`;
    if (dbSupport.hasDbMigrate)
      scripts += `\n- \`${packageManagerRunCmd} db:migrate\`: Run database migrations`;
    if (dbSupport.hasDbStudio)
      scripts += `\n- \`${packageManagerRunCmd} db:studio\`: Open database studio UI`;
  }
  if (database === "sqlite" && dbSetup !== "d1" && dbSupport.hasDbScripts) {
    scripts += `\n- \`${packageManagerRunCmd} db:local\`: Start the local SQLite database`;
  }

  if (addons.includes("vite-plus")) {
    scripts += `\n- \`${packageManagerRunCmd} check\`: Run Vite+ format/lint checks and workspace TypeScript checks
- \`${packageManagerRunCmd} lint\`: Run Vite+ lint checks
- \`${packageManagerRunCmd} format\`: Run Vite+ formatting
- \`${packageManagerRunCmd} staged\`: Run Vite+ checks against staged files`;
    if (!addons.includes("lefthook")) {
      scripts += `\n- \`${packageManagerRunCmd} hooks:setup\`: Install Vite+ native Git hooks with \`vp config\``;
    }
  } else if (addons.includes("oxlint")) {
    scripts += `\n- \`${packageManagerRunCmd} check\`: Run Oxlint and Oxfmt`;
  }

  if (addons.includes("pwa")) {
    scripts += `\n- \`cd apps/web && ${packageManagerRunCmd} generate-pwa-assets\`: Generate PWA assets`;
  }
  if (addons.includes("tauri")) {
    scripts += `\n- \`cd apps/web && ${packageManagerRunCmd} desktop:dev\`: Start Tauri desktop app in development
- \`cd apps/web && ${packageManagerRunCmd} desktop:build\`: Build Tauri desktop app`;
    const staticBuildNote = getDesktopStaticBuildNote(frontend);
    if (staticBuildNote) scripts += `\n- Note: ${staticBuildNote}`;
  }
  if (addons.includes("electrobun")) {
    scripts += `\n- \`${packageManagerRunCmd} dev:desktop\`: Start the Electrobun desktop app with HMR
- \`${packageManagerRunCmd} build:desktop\`: Build the stable Electrobun desktop app
- \`${packageManagerRunCmd} build:desktop:canary\`: Build the canary Electrobun desktop app`;
    const staticBuildNote = getDesktopStaticBuildNote(frontend);
    if (staticBuildNote) scripts += `\n- Note: ${staticBuildNote}`;
  }
  if (webDeploy === "docker" || serverDeploy === "docker") {
    scripts += `\n- \`${packageManagerRunCmd} docker:build\`: Build the Docker Compose images
- \`${packageManagerRunCmd} docker:up\`: Build and start the Docker Compose stack
- \`${packageManagerRunCmd} docker:logs\`: Tail logs from the Docker Compose stack
- \`${packageManagerRunCmd} docker:down\`: Stop the Docker Compose stack`;
  }
  if (webDeploy === "vercel" || serverDeploy === "vercel") {
    const v = getVercelScriptNames(webDeploy, serverDeploy);
    scripts += `\n- \`${packageManagerRunCmd} ${v.setup}\`: Link this repo to a Vercel project (first-time setup)
- \`${packageManagerRunCmd} dev:vercel\`: Run the Vercel Services dev environment locally
- \`${packageManagerRunCmd} ${v.envPreview}\`: Sync local env files to the Vercel preview environment
- \`${packageManagerRunCmd} ${v.envProduction}\`: Sync local env files to the Vercel production environment
- \`${packageManagerRunCmd} ${v.deploy}\`: Create a Vercel preview deployment
- \`${packageManagerRunCmd} ${v.deployProd}\`: Deploy to Vercel production
- \`${packageManagerRunCmd} ${v.deployCheck}\`: Dry-run a deploy to preview framework detection and included files without uploading`;
  }
  return scripts;
}
function generateDeploymentCommands(
  packageManagerRunCmd: string,
  webDeploy: SupportedProjectConfig["webDeploy"],
  serverDeploy: SupportedProjectConfig["serverDeploy"],
  backend: SupportedProjectConfig["backend"],
  auth: SupportedProjectConfig["auth"],
  frontend: SupportedProjectConfig["frontend"],
  database: SupportedProjectConfig["database"],
  dbSetup: SupportedProjectConfig["dbSetup"],
  addons: SupportedProjectConfig["addons"],
): string {
  const hasCloudflare = webDeploy === "cloudflare" || serverDeploy === "cloudflare";
  const hasPrismaCompute = webDeploy === "prisma" || serverDeploy === "prisma";
  const hasAxiom = addons.includes("axiom");
  const hasAlchemyCompute = hasCloudflare || hasPrismaCompute;
  const hasAlchemy = hasAlchemyCompute || hasAxiom;
  const hasDocker = webDeploy === "docker" || serverDeploy === "docker";
  const hasVercel = webDeploy === "vercel" || serverDeploy === "vercel";

  if (!hasAlchemy && !hasDocker && !hasVercel) {
    return "";
  }

  const lines: string[] = ["## Deployment"];

  if (hasAlchemy) {
    const targetLabel = [
      ...(isAlchemyDeployTarget(webDeploy)
        ? [`web on ${webDeploy === "cloudflare" ? "Cloudflare" : "Prisma"}`]
        : []),
      ...(isAlchemyDeployTarget(serverDeploy) && backend !== "self"
        ? [`server on ${serverDeploy === "cloudflare" ? "Cloudflare" : "Prisma"}`]
        : []),
      ...(hasAxiom ? ["Axiom observability"] : []),
    ].join(" + ");
    const alchemyDeployScript =
      !hasAlchemyCompute && (hasVercel || hasDocker)
        ? "deploy:infra"
        : hasVercel
          ? isAlchemyDeployTarget(webDeploy)
            ? "deploy:web"
            : "deploy:server"
          : "deploy";
    const alchemyExec = packageManagerRunCmd.startsWith("npm")
      ? "npx"
      : packageManagerRunCmd.startsWith("pnpm")
        ? "pnpm exec"
        : "bunx";

    lines.push(
      "",
      "### Alchemy",
      "",
      `- Target: ${targetLabel}`,
      `- Configure provider accounts: \`cd packages/infra && ${alchemyExec} alchemy profile edit\``,
      `- Dev: ${packageManagerRunCmd} dev`,
      `- Deploy: ${packageManagerRunCmd} ${alchemyDeployScript}`,
      `- Destroy: ${packageManagerRunCmd} destroy`,
      "",
      "`alchemy profile edit` stores the selected Axiom, Cloudflare, Neon, PlanetScale, and/or Prisma provider profiles under `~/.alchemy`; no provider-specific setup command is required by this scaffold.",
      "",
      "Deploys are staged and default to a personal `dev_<username>` stage. For production, run the deploy with an explicit stage from `packages/infra`:",
      "",
      "```bash",
      `cd packages/infra && ${alchemyExec} alchemy deploy --stage production`,
      "```",
    );

    if (hasAxiom) {
      lines.push(
        "",
        "Alchemy creates a stage-specific Axiom dataset and a least-privilege ingest token. `dev` injects the credentials into the observed apps without writing the token to an env file.",
      );
      if (hasVercel) {
        lines.push(
          "Link the Vercel project before the Alchemy deploy. Deploy from `packages/infra` with `alchemy deploy --stage preview` or `alchemy deploy --stage production` to sync Axiom credentials to the matching Vercel environment. Personal stages do not change shared Vercel credentials.",
        );
      }
      if (hasDocker) {
        lines.push(
          "For a deployed Docker image, pass `AXIOM_API_KEY`, `AXIOM_DATASET`, and `AXIOM_EDGE_URL` through the target platform's secret manager. Local observed development runs through Alchemy with the credentials injected in memory.",
        );
      }
    }

    const hasWeb = hasWebFrontend(frontend);
    const needsCorsOrigin = backend !== "self" && isAlchemyDeployTarget(serverDeploy) && hasWeb;
    const prismaAuthTarget =
      auth === "better-auth" && backend === "self" && webDeploy === "prisma"
        ? { envPath: "apps/web/.env", label: "web" }
        : auth === "better-auth" && backend !== "self" && serverDeploy === "prisma"
          ? { envPath: "apps/server/.env", label: "server" }
          : undefined;

    if (needsCorsOrigin || prismaAuthTarget) {
      lines.push("", "### Production origins", "");
    }
    if (needsCorsOrigin) {
      lines.push(
        "- Required after the first deploy: set `CORS_ORIGIN` in `apps/server/.env` to the exact deployed web origin, such as `https://app.example.com`, then deploy the server again.",
      );
    }
    if (prismaAuthTarget) {
      lines.push(
        `- Prisma + Better Auth: after the first deploy, set \`BETTER_AUTH_URL\` in \`${prismaAuthTarget.envPath}\` to the returned ${prismaAuthTarget.label} URL, then deploy again.`,
      );
    }
  }

  if (hasDocker) {
    const targetLabel =
      webDeploy === "docker" && (serverDeploy === "docker" || backend === "self")
        ? "web + server"
        : webDeploy === "docker"
          ? "web"
          : "server";

    lines.push(
      "",
      "### Docker Compose",
      "",
      `- Target: ${targetLabel}`,
      "- Config: `docker-compose.yml` (app Dockerfiles live in `apps/*/Dockerfile`)",
      `- Build images: ${packageManagerRunCmd} docker:build`,
      `- Start: ${packageManagerRunCmd} docker:up`,
      `- Logs: ${packageManagerRunCmd} docker:logs`,
      `- Stop: ${packageManagerRunCmd} docker:down`,
      "",
      "Environment variables are read from each app's `.env` file (baked into web builds for public variables) and overridden in `docker-compose.yml` for container networking.",
    );

    if (
      database === "sqlite" &&
      dbSetup === "none" &&
      isDatabaseConsumedByDocker({ backend, serverDeploy, webDeploy })
    ) {
      lines.push(
        "",
        `Docker Compose uses the local \`./.data/local.db\` file. Run \`${packageManagerRunCmd} db:push\` before starting the stack.`,
      );
    }

    lines.push(
      "",
      "For more details, see the guide on [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).",
    );
  }

  if (hasVercel) {
    const vercelNames = getVercelScriptNames(webDeploy, serverDeploy);
    const targetLabel =
      webDeploy === "vercel" && (serverDeploy === "vercel" || backend === "self")
        ? "web + server"
        : webDeploy === "vercel"
          ? "web"
          : "server";

    lines.push(
      "",
      "### Vercel Services",
      "",
      `- Target: ${targetLabel}`,
      "- Config: `vercel.json`",
      `- Link the project first: ${packageManagerRunCmd} ${vercelNames.setup}`,
      `- Local Vercel dev: ${packageManagerRunCmd} dev:vercel`,
      `- Sync preview env: ${packageManagerRunCmd} ${vercelNames.envPreview}`,
      `- Sync production env: ${packageManagerRunCmd} ${vercelNames.envProduction}`,
      `- Dry-run check (no upload): ${packageManagerRunCmd} ${vercelNames.deployCheck}`,
      `- Preview deploy: ${packageManagerRunCmd} ${vercelNames.deploy}`,
      `- Production deploy: ${packageManagerRunCmd} ${vercelNames.deployProd}`,
    );

    if (webDeploy === "vercel" && serverDeploy === "vercel" && backend !== "self") {
      lines.push(
        "- Web requests under `/api/*` route to the server service, which serves those paths directly. Local server URLs include `/api` too.",
      );
    }

    lines.push(
      "Vercel Services share project environment variables, but deploys do not upload local `.env` files automatically. Link the project with `vercel link`, then run the env sync command before your first deploy (otherwise the deployment starts with no env vars), or pass one-off envs with `vercel deploy -e KEY=value`.",
      `Pass Vercel CLI flags to the env sync command directly, for example: \`${packageManagerRunCmd} ${vercelNames.envProduction} --scope your-team\`.`,
      "",
      "For more details, see the guide on [Deploying to Vercel](https://www.better-t-stack.dev/docs/guides/vercel).",
    );
  }

  return `${lines.join("\n")}\n`;
}

function generateGitHooksSection(
  packageManagerRunCmd: string,
  addons: SupportedProjectConfig["addons"],
): string {
  const hasLefthook = addons.includes("lefthook");
  const hasVitePlus = addons.includes("vite-plus");
  const hasLinting = addons.includes("oxlint") || hasVitePlus;
  if (!hasLefthook && !hasLinting) return "";

  const lines: string[] = ["## Git Hooks and Formatting", ""];
  if (hasLefthook)
    lines.push(`- Install Lefthook hooks: \`${packageManagerRunCmd} lefthook install\``);
  if (hasVitePlus && !hasLefthook) {
    lines.push(
      `- Optional native Vite+ hooks: \`${packageManagerRunCmd} hooks:setup\``,
      "- Docs: [Vite+ commit hooks](https://viteplus.dev/guide/commit-hooks)",
    );
  }
  if (hasLinting) lines.push(`- Run checks: \`${packageManagerRunCmd} check\``);
  return `${lines.join("\n")}\n\n`;
}
function getVercelScriptNames(
  webDeploy: SupportedProjectConfig["webDeploy"] | undefined,
  serverDeploy: SupportedProjectConfig["serverDeploy"] | undefined,
) {
  const mixedCloud = isAlchemyDeployTarget(webDeploy) || isAlchemyDeployTarget(serverDeploy);
  const target = webDeploy === "vercel" ? "web" : "server";
  const deploy = mixedCloud ? `deploy:${target}` : "deploy";
  return {
    setup: "deploy:setup",
    envPreview: "env:preview",
    envProduction: "env:production",
    deploy,
    deployProd: `${deploy}:prod`,
    deployCheck: "deploy:check",
  };
}
