import path from "node:path";

import { Result } from "better-result";
import fs from "fs-extra";

import type { Backend, ProjectConfig } from "../../types";
import { AddonSetupError } from "../../utils/errors";

type EvlogBackend = Extract<Backend, "hono" | "elysia">;

const evlogBackends = ["hono", "elysia"] as const;
const NODE_DEV_FS_DRAIN_EXPRESSION =
  'process.env.NODE_ENV === "production" ? undefined : createFsDrain()';

function isEvlogBackend(backend: Backend): backend is EvlogBackend {
  return (evlogBackends as readonly Backend[]).includes(backend);
}

function usesAxiom(config: ProjectConfig) {
  return config.addons.includes("axiom");
}

function shouldWireEvlogServerFsDrain(config: ProjectConfig) {
  return (
    !usesAxiom(config) &&
    isEvlogBackend(config.backend) &&
    config.runtime !== "workers" &&
    config.serverDeploy !== "cloudflare"
  );
}

function shouldWireEvlogWebFsDrain(config: ProjectConfig) {
  return (
    !usesAxiom(config) &&
    config.frontend.includes("tanstack-start") &&
    config.webDeploy !== "cloudflare"
  );
}

export function supportsEvlogLocalLogs(config: ProjectConfig) {
  return shouldWireEvlogServerFsDrain(config) || shouldWireEvlogWebFsDrain(config);
}

function shouldIdentifyWebAuth(config: ProjectConfig) {
  return config.auth === "better-auth" && config.backend === "self";
}

function getEvlogServerMiddlewareMarker(backend: EvlogBackend, fsDrain: boolean, axiom = false) {
  const options = axiom
    ? "{ drain: createAxiomDrain() }"
    : fsDrain
      ? `{ drain: ${NODE_DEV_FS_DRAIN_EXPRESSION} }`
      : "";

  return backend === "hono" ? `app.use(evlog(${options}));` : `.use(evlog(${options}))`;
}

function findEvlogServerMiddlewareMarker(content: string, backend: EvlogBackend) {
  const axiomMarker = getEvlogServerMiddlewareMarker(backend, false, true);
  if (content.includes(axiomMarker)) return axiomMarker;
  const fsDrainMarker = getEvlogServerMiddlewareMarker(backend, true);
  return content.includes(fsDrainMarker)
    ? fsDrainMarker
    : getEvlogServerMiddlewareMarker(backend, false);
}

function prependMissingImports(content: string, imports: string[]) {
  const missingImports = imports.filter((line) => !content.includes(line));
  if (missingImports.length === 0) return content;

  const importBlock = `${missingImports.join("\n")}\n`;
  const referenceMatch = content.match(/^(?:\/\/\/ <reference[^\n]*>\n)+/);
  if (referenceMatch) {
    return `${referenceMatch[0]}${importBlock}${content.slice(referenceMatch[0].length)}`;
  }

  return `${importBlock}${content}`;
}

function addNamedImport(content: string, moduleName: string, names: string[]) {
  const importRegex = new RegExp(
    `import \\{([^}]+)\\} from "${moduleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}";`,
  );
  const match = content.match(importRegex);

  if (!match) {
    return prependMissingImports(content, [`import { ${names.join(", ")} } from "${moduleName}";`]);
  }

  const existingNames = match[1]
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const nextNames = [...existingNames];

  for (const name of names) {
    if (!nextNames.includes(name)) nextNames.push(name);
  }

  return content.replace(match[0], `import { ${nextNames.join(", ")} } from "${moduleName}";`);
}

function insertBeforeOnce(
  content: string,
  marker: string,
  snippet: string,
  alreadyPresent: string,
) {
  if (content.includes(alreadyPresent) || !content.includes(marker)) return content;
  return content.replace(marker, `${snippet}${marker}`);
}

function insertAfterOnce(content: string, marker: string, snippet: string, alreadyPresent: string) {
  if (content.includes(alreadyPresent) || !content.includes(marker)) return content;
  return content.replace(marker, `${marker}${snippet}`);
}

async function writeFileIfChanged(filePath: string, content: string) {
  const existing = (await fs.pathExists(filePath))
    ? await fs.readFile(filePath, "utf-8")
    : undefined;
  if (existing === content) return;
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

async function updateFileIfExists(filePath: string, update: (content: string) => string) {
  if (!(await fs.pathExists(filePath))) return;
  const content = await fs.readFile(filePath, "utf-8");
  const nextContent = update(content);
  if (nextContent !== content) await fs.writeFile(filePath, nextContent);
}

function usesCreateAuthFactory(config: ProjectConfig) {
  return (
    config.runtime === "workers" ||
    config.serverDeploy === "cloudflare" ||
    (config.backend === "self" && config.webDeploy === "cloudflare")
  );
}

function getAuthImportLine(config: ProjectConfig, source: string) {
  return usesCreateAuthFactory(config)
    ? `import { createAuth } from "${source}";`
    : `import { auth } from "${source}";`;
}

function getAuthExpression(config: ProjectConfig) {
  return usesCreateAuthFactory(config) ? "(await createAuth())" : "auth";
}

function addAiSdkEvlogTelemetry(content: string, loggerExpression: string) {
  let nextContent = addNamedImport(content, "evlog/ai", [
    "createAILogger",
    "createEvlogIntegration",
  ]);

  if (!nextContent.includes("const ai = createAILogger(")) {
    nextContent = nextContent.replace(
      /^(\s*)const model = wrapLanguageModel\({/m,
      (_match, indent: string) =>
        `${indent}const ai = createAILogger(${loggerExpression});\n${indent}const model = wrapLanguageModel({`,
    );
  }

  if (!nextContent.includes("model: ai.wrap(model)")) {
    nextContent = nextContent.replace(
      /(const result = streamText\({\n\s*)model,/,
      "$1model: ai.wrap(model),",
    );
  }

  if (!nextContent.includes("createEvlogIntegration(ai)")) {
    nextContent = nextContent.replace(
      /^(\s*)(messages:\s*await convertToModelMessages\([^)]+\),?)/m,
      (_match, indent: string, messages: string) =>
        `${indent}${messages.endsWith(",") ? messages : `${messages},`}\n${indent}telemetry: {\n${indent}\tisEnabled: true,\n${indent}\tintegrations: [createEvlogIntegration(ai)],\n${indent}},`,
    );
  }

  return nextContent;
}

function addEvlogBetterAuthServerSetup(
  content: string,
  backend: EvlogBackend,
  authExpression: string,
) {
  let nextContent = addNamedImport(content, "evlog/better-auth", [
    "createAuthMiddleware",
    "type BetterAuthInstance",
  ]);
  const usesAuthFactory = authExpression.endsWith("()");
  const evlogAuthExpression = `${authExpression} as BetterAuthInstance`;
  const authOptions = '{ exclude: ["/api/auth/**"], maskEmail: true }';
  const identifySnippet = usesAuthFactory
    ? ""
    : `const identifyUser = createAuthMiddleware(${evlogAuthExpression}, ${authOptions});\n\n`;
  const identifyUserSetup = usesAuthFactory
    ? `\n\tconst identifyUser = createAuthMiddleware(${evlogAuthExpression}, ${authOptions});`
    : "";

  if (backend === "hono") {
    const evlogMarker = findEvlogServerMiddlewareMarker(nextContent, backend);
    nextContent = insertBeforeOnce(
      nextContent,
      "const app = new Hono",
      identifySnippet,
      "createAuthMiddleware(",
    );
    return insertAfterOnce(
      nextContent,
      evlogMarker,
      `\napp.use("*", async (c, next) => {${identifyUserSetup}\n\tawait identifyUser(c.get("log"), c.req.raw.headers, c.req.path);\n\tawait next();\n});`,
      'identifyUser(c.get("log")',
    );
  }

  const elysiaMarker = nextContent.includes("const app = new Elysia")
    ? "const app = new Elysia"
    : "new Elysia";
  nextContent = insertBeforeOnce(
    nextContent,
    elysiaMarker,
    identifySnippet,
    "createAuthMiddleware(",
  );
  const evlogMarker = findEvlogServerMiddlewareMarker(nextContent, backend);
  return insertAfterOnce(
    nextContent,
    evlogMarker,
    `\n\t.derive(async ({ request, log }) => {${identifyUserSetup.replace(/\n\t/g, "\n\t\t")}\n\t\tawait identifyUser(log, request.headers, new URL(request.url).pathname);\n\t\treturn {};\n\t})`,
    "identifyUser(log",
  );
}

export function addEvlogServerSetup(
  content: string,
  backend: EvlogBackend,
  serviceName: string,
  fsDrain: boolean,
  axiom = false,
) {
  const initSnippet = `initLogger({\n\tenv: { service: "${serviceName}" },\n});\n\n`;
  const evlogMarker = getEvlogServerMiddlewareMarker(backend, fsDrain, axiom);
  const legacyEvlogMarker = getEvlogServerMiddlewareMarker(backend, false);

  if (backend === "hono") {
    let nextContent = prependMissingImports(content, [
      'import { initLogger } from "evlog";',
      'import { evlog, type EvlogVariables } from "evlog/hono";',
      ...(fsDrain ? ['import { createFsDrain } from "evlog/fs";'] : []),
      ...(axiom ? ['import { createAxiomDrain } from "evlog/axiom";'] : []),
    ]);
    nextContent = insertBeforeOnce(
      nextContent,
      "const app = new Hono",
      initSnippet,
      "initLogger({",
    );
    nextContent = nextContent.replace(
      "const app = new Hono();",
      "const app = new Hono<EvlogVariables>();",
    );
    nextContent = nextContent
      .replace('import { logger } from "hono/logger";\n', "")
      .replace(/\napp\.use\(logger\(\)\);/, "");
    if (fsDrain) nextContent = nextContent.replace(legacyEvlogMarker, evlogMarker);
    return insertAfterOnce(
      nextContent,
      "const app = new Hono<EvlogVariables>();",
      `\n\n${evlogMarker}`,
      evlogMarker,
    );
  }

  let nextContent = prependMissingImports(content, [
    'import { initLogger } from "evlog";',
    'import { evlog } from "evlog/elysia";',
    ...(fsDrain ? ['import { createFsDrain } from "evlog/fs";'] : []),
    ...(axiom ? ['import { createAxiomDrain } from "evlog/axiom";'] : []),
  ]);
  const elysiaMarker = nextContent.includes("const app = new Elysia")
    ? "const app = new Elysia"
    : "new Elysia";
  nextContent = insertBeforeOnce(nextContent, elysiaMarker, initSnippet, "initLogger({");
  if (fsDrain) nextContent = nextContent.replace(legacyEvlogMarker, evlogMarker);
  for (const marker of ["new Elysia({ adapter: node() })", "new Elysia()"]) {
    nextContent = insertAfterOnce(nextContent, marker, `\n\t${evlogMarker}`, evlogMarker);
  }
  return nextContent;
}

function addBackendAiEvlogSetup(content: string, backend: EvlogBackend) {
  const loggerExpression = backend === "hono" ? 'c.get("log")' : "context.log";
  return addAiSdkEvlogTelemetry(content, loggerExpression);
}

function addTanstackStartRootEvlogSetup(content: string) {
  let nextContent = prependMissingImports(content, [
    'import { createMiddleware } from "@tanstack/react-start";',
    'import { evlogErrorHandler } from "evlog/nitro/v3";',
  ]);
  const middlewareEntry = "createMiddleware().server(evlogErrorHandler)";
  if (nextContent.includes(`middleware: [${middlewareEntry}]`)) return nextContent;
  if (nextContent.includes("middleware: [")) {
    return nextContent.replace("middleware: [", `middleware: [${middlewareEntry}, `);
  }
  if (/server:\s*{/.test(nextContent)) {
    return nextContent.replace(
      /server:\s*{\n/,
      `server: {\n    middleware: [${middlewareEntry}],\n`,
    );
  }
  return nextContent.replace(
    "head: () => ({",
    `server: {\n    middleware: [${middlewareEntry}],\n  },\n\n  head: () => ({`,
  );
}

function getNitroEvlogDrainFile(axiom: boolean) {
  const drainImport = axiom
    ? 'import { createAxiomDrain } from "evlog/axiom";'
    : 'import { createFsDrain } from "evlog/fs";';
  const drainCall = axiom ? "createAxiomDrain()" : "createFsDrain()";
  const localGuard = axiom ? "" : "  if (!import.meta.dev) return;\n";
  return `import { definePlugin } from "nitro";\n${drainImport}\n\nexport default definePlugin((nitroApp) => {\n${localGuard}  nitroApp.hooks.hook("evlog:drain", ${drainCall});\n});\n`;
}

function getNitroEvlogAuthPluginFile(config: ProjectConfig) {
  if (usesCreateAuthFactory(config)) {
    return `${getAuthImportLine(config, "../../src/services")}
import { definePlugin } from "nitro";
import { createAuthIdentifier, type BetterAuthInstance } from "evlog/better-auth";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    const identify = createAuthIdentifier(${getAuthExpression(config)} as BetterAuthInstance, {
      exclude: ["/api/auth/**"],
      maskEmail: true,
    });
    await identify(event);
  });
});
`;
  }

  return `${getAuthImportLine(config, "../../src/services")}
import { definePlugin } from "nitro";
import { createAuthIdentifier, type BetterAuthInstance } from "evlog/better-auth";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook(
    "request",
    createAuthIdentifier(${getAuthExpression(config)} as BetterAuthInstance, {
      exclude: ["/api/auth/**"],
      maskEmail: true,
    }),
  );
});
`;
}

function getTanstackNitroConfigFile(serviceName: string) {
  return `import { defineConfig } from "nitro";
import evlog from "evlog/nitro/v3";

export default defineConfig({
  serverDir: "./server",
  experimental: {
    asyncContext: true,
  },
  modules: [
    evlog({
      env: { service: "${serviceName}" },
    }),
  ],
});
`;
}

function getTanstackWorkersEvlogFile(config: ProjectConfig, serviceName: string) {
  const identify = shouldIdentifyWebAuth(config);
  return `import handler from "@tanstack/react-start/server-entry";
import { initWorkersLogger, withEvlog } from "evlog/workers";
import { createAxiomDrain } from "evlog/axiom";
${identify ? `${getAuthImportLine(config, "./services")}\nimport { createAuthMiddleware, type BetterAuthInstance } from "evlog/better-auth";\n` : ""}
initWorkersLogger({ env: { service: "${serviceName}" } });

export default withEvlog(async (request${identify ? ", _env, _ctx, log" : ""}) => {
${
  identify
    ? `  const identifyUser = createAuthMiddleware(${getAuthExpression(config)} as BetterAuthInstance, {
    exclude: ["/api/auth/**"],
    maskEmail: true,
  });
  await identifyUser(log, request.headers, new URL(request.url).pathname);
`
    : ""
}  return handler.fetch(request);
}, { drain: createAxiomDrain() });
`;
}

function addTanstackStartAiEvlogSetup(content: string) {
  const nextContent = prependMissingImports(content, [
    'import type { RequestLogger } from "evlog";',
    'import { useRequest } from "nitro/context";',
  ]);
  return addAiSdkEvlogTelemetry(nextContent, "useRequest().context.log as RequestLogger");
}

async function setupTanstackStartEvlog(config: ProjectConfig, serviceName: string) {
  const webDir = path.join(config.projectDir, "apps/web");
  const fsDrain = shouldWireEvlogWebFsDrain(config);

  if (usesAxiom(config) && config.webDeploy === "cloudflare") {
    await writeFileIfChanged(
      path.join(webDir, "src/server.ts"),
      getTanstackWorkersEvlogFile(config, serviceName),
    );
    if (config.examples.includes("ai")) {
      await updateFileIfExists(path.join(webDir, "src/routes/api/ai/$.ts"), (content) =>
        addAiSdkEvlogTelemetry(addNamedImport(content, "evlog", ["useLogger"]), "useLogger()"),
      );
    }
    return;
  }

  const nitroConfigPath = path.join(webDir, "nitro.config.ts");
  if (!(await fs.pathExists(nitroConfigPath))) {
    await writeFileIfChanged(nitroConfigPath, getTanstackNitroConfigFile(serviceName));
  }
  await updateFileIfExists(
    path.join(webDir, "src/routes/__root.tsx"),
    addTanstackStartRootEvlogSetup,
  );

  if (fsDrain || usesAxiom(config)) {
    const drainPath = path.join(webDir, "server/plugins/evlog-drain.ts");
    if (!(await fs.pathExists(drainPath))) {
      await writeFileIfChanged(drainPath, getNitroEvlogDrainFile(usesAxiom(config)));
    }
  }

  if (shouldIdentifyWebAuth(config)) {
    const authPluginPath = path.join(webDir, "server/plugins/evlog-auth.ts");
    if (!(await fs.pathExists(authPluginPath))) {
      await writeFileIfChanged(authPluginPath, getNitroEvlogAuthPluginFile(config));
    }
  }

  if (config.examples.includes("ai")) {
    await updateFileIfExists(
      path.join(webDir, "src/routes/api/ai/$.ts"),
      addTanstackStartAiEvlogSetup,
    );
  }
}

async function setupEvlogWeb(config: ProjectConfig) {
  if (!config.frontend.includes("tanstack-start")) return;
  await setupTanstackStartEvlog(config, `${config.projectName}-web`);
}

export async function setupEvlog(config: ProjectConfig): Promise<Result<void, AddonSetupError>> {
  return Result.tryPromise({
    try: async () => {
      if (isEvlogBackend(config.backend)) {
        const serverIndexPath = path.join(config.projectDir, "apps/server/src/index.ts");
        if (await fs.pathExists(serverIndexPath)) {
          const content = await fs.readFile(serverIndexPath, "utf-8");
          let nextContent = addEvlogServerSetup(
            content,
            config.backend,
            `${config.projectName}-server`,
            shouldWireEvlogServerFsDrain(config),
            usesAxiom(config),
          );

          if (config.auth === "better-auth") {
            nextContent = addEvlogBetterAuthServerSetup(
              nextContent,
              config.backend,
              getAuthExpression(config),
            );
          }

          if (config.examples.includes("ai")) {
            nextContent = addBackendAiEvlogSetup(nextContent, config.backend);
          }

          if (nextContent !== content) await fs.writeFile(serverIndexPath, nextContent);
        }
      }

      await setupEvlogWeb(config);
    },
    catch: (error) =>
      new AddonSetupError({
        addon: "evlog",
        message: `Failed to set up evlog: ${error instanceof Error ? error.message : String(error)}`,
        cause: error,
      }),
  });
}
