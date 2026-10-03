import {
  prismaWebEnvEntries,
  selfCloudflareWebEnvEntries,
  splitCloudflareWebEnvEntries,
} from "./env";
import {
  getPrismaWebsiteFramework,
  type AlchemyDeploymentPlan,
  type DeployedWebFramework,
} from "./plan";
import { writeLines, writeObject, type AlchemyWriter } from "./writer";

function writeEnv(writer: AlchemyWriter, entries: readonly string[]): void {
  writeObject(writer, "env: {", () => writeLines(writer, entries), "},");
}

function writeVite(
  writer: AlchemyWriter,
  declaration: string,
  framework: DeployedWebFramework,
  entries: readonly string[],
): void {
  writeObject(
    writer,
    `${declaration} Cloudflare.Website.Vite("web", {`,
    () => {
      writer.writeLine('rootDir: "../../apps/web",');
      if (framework === "tanstack-start") {
        writeObject(
          writer,
          "compatibility: {",
          () => writer.writeLine('flags: ["nodejs_compat"],'),
          "},",
        );
      }
      if (framework === "tanstack-router") {
        writeObject(
          writer,
          "assets: {",
          () => {
            writer.writeLine('htmlHandling: "auto-trailing-slash",');
            writer.writeLine('notFoundHandling: "single-page-application",');
          },
          "},",
        );
      }
      writeEnv(writer, entries);
      writeObject(writer, "dev: {", () => writer.writeLine("port: 3001,"), "},");
    },
    "});",
  );
}

function writeCloudflareWeb(
  writer: AlchemyWriter,
  plan: AlchemyDeploymentPlan,
  framework: DeployedWebFramework,
  topology: "self" | "split",
): void {
  const declaration = topology === "self" ? "export const web =" : "const webWorker = yield*";
  const entries =
    topology === "self"
      ? selfCloudflareWebEnvEntries(plan, framework)
      : splitCloudflareWebEnvEntries(plan, framework);
  writeVite(writer, declaration, framework, entries);
}

function prismaFramework(framework: DeployedWebFramework): string {
  return framework === "tanstack-start" ? "tanstack-start" : "vite";
}

function writePrismaWeb(writer: AlchemyWriter, plan: AlchemyDeploymentPlan): void {
  if (plan.web.target !== "prisma") return;
  const { framework, topology } = plan.web;
  const websiteFramework = getPrismaWebsiteFramework(plan.config);

  writer.writeLine(
    websiteFramework
      ? "export const web = Effect.gen(function* () {"
      : 'export const web = Prisma.Compute("web", Effect.gen(function* () {',
  );
  writer.indent(() => {
    writer.writeLine("const project = yield* prismaProject;");
    if (topology === "self") {
      writer.writeLine("const resolvedDatabaseEnv = yield* databaseEnv;");
    } else if (plan.server.target !== "none") {
      writer.writeLine("const deployedServer = yield* server;");
    }
    if (plan.hasAxiomWebRuntime) {
      writer.writeLine("const resolvedObservabilityEnv = yield* observabilityEnv;");
    }
    writer.blankLine();
    writeObject(
      writer,
      "const webEnv = {",
      () => writeLines(writer, prismaWebEnvEntries(plan, framework)),
      "};",
    );
    writer.blankLine();

    if (websiteFramework) {
      writer.writeLine(`return yield* Prisma.Website.${websiteFramework}("web", {`);
      writer.indent(() => {
        writer.writeLine("project,");
        writer.writeLine('rootDir: "../../apps/web",');
        writer.writeLine("env: webEnv,");
        writer.writeLine('compute: { healthCheck: { path: "/" }, destroyOldDeployment: true },');
        writer.writeLine("dev: { port: 3001 },");
      });
      writer.writeLine("});");
    } else {
      writer.writeLine("return {");
      writer.indent(() => {
        writer.writeLine("project,");
        writer.writeLine('path: "../../apps/web",');
        writer.writeLine(
          `build: { type: "auto", framework: "${prismaFramework(framework)}", env: webEnv },`,
        );
        writer.writeLine("env: webEnv,");
        writer.writeLine('healthCheck: { path: "/" },');
        writer.writeLine("destroyOldDeployment: true,");
        writeObject(
          writer,
          "dev: {",
          () => {
            writer.writeLine(`command: "${plan.config.packageManager} run dev:bare",`);
            writer.writeLine("port: 3001,");
            writer.writeLine("env: webEnv,");
          },
          "},",
        );
      });
      writer.writeLine("};");
    }
  });
  writer.writeLine(websiteFramework ? "});" : "}));");
}

export function writeExportedWebResource(writer: AlchemyWriter, plan: AlchemyDeploymentPlan): void {
  if (plan.web.target === "prisma") {
    writePrismaWeb(writer, plan);
    return;
  }
  if (plan.web.target === "cloudflare" && plan.web.topology === "self") {
    writeCloudflareWeb(writer, plan, plan.web.framework, "self");
    writer.blankLine();
    writer.writeLine("export type WebEnv = Cloudflare.InferEnv<typeof web>;");
  }
}

export function writeStackWebResource(writer: AlchemyWriter, plan: AlchemyDeploymentPlan): void {
  if (plan.web.target === "none") return;
  if (plan.web.target === "cloudflare" && plan.web.topology === "split") {
    writeCloudflareWeb(writer, plan, plan.web.framework, "split");
  } else {
    writer.writeLine("const webWorker = yield* web;");
  }
}
