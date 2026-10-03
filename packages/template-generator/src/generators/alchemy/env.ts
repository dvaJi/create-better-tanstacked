import type { SupportedProjectConfig } from "@better-t-stack/types";

import type { AlchemyDeploymentPlan, DeployedWebFramework } from "./plan";

function hasExample(
  plan: AlchemyDeploymentPlan,
  example: SupportedProjectConfig["examples"][number],
): boolean {
  return plan.config.examples.includes(example);
}

export function databaseBindingEntries(plan: AlchemyDeploymentPlan): string[] {
  const { config } = plan;
  if (config.dbSetup === "d1") return ["DB: db,"];
  if (plan.hasAlchemyManagedDatabase) return ["...databaseBindings,"];
  if (config.database !== "none") return ['DATABASE_URL: Config.Redacted("DATABASE_URL"),'];
  return [];
}

function commonRuntimeEntries(plan: AlchemyDeploymentPlan, includeCorsOrigin = true): string[] {
  const { auth, dbSetup, payments } = plan.config;
  const entries = [...databaseBindingEntries(plan)];
  if (includeCorsOrigin) entries.push('CORS_ORIGIN: Config.String("CORS_ORIGIN"),');

  if (auth === "better-auth") {
    entries.push(
      'BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),',
      "BETTER_AUTH_URL: Cloudflare.Worker.URL,",
    );
  }
  if (hasExample(plan, "ai")) {
    entries.push('GOOGLE_GENERATIVE_AI_API_KEY: Config.Redacted("GOOGLE_GENERATIVE_AI_API_KEY"),');
  }
  if (payments === "polar") {
    entries.push(
      'POLAR_ACCESS_TOKEN: Config.Redacted("POLAR_ACCESS_TOKEN"),',
      'POLAR_SUCCESS_URL: Config.String("POLAR_SUCCESS_URL"),',
    );
  }
  if (dbSetup === "turso")
    entries.push('DATABASE_AUTH_TOKEN: Config.Redacted("DATABASE_AUTH_TOKEN"),');
  if (plan.hasAxiomServerRuntime) entries.push("...observabilityBindings,");
  return entries;
}

export function cloudflareServerEnvEntries(plan: AlchemyDeploymentPlan): string[] {
  const { api, auth } = plan.config;
  const entries = commonRuntimeEntries(plan);
  if (auth === "clerk") {
    const insertAt = entries.findIndex(
      (entry) => entry.startsWith("GOOGLE_") || entry.startsWith("POLAR_"),
    );
    const clerkEntries = ['CLERK_SECRET_KEY: Config.Redacted("CLERK_SECRET_KEY"),'];
    if (api !== "none") {
      clerkEntries.push('CLERK_PUBLISHABLE_KEY: Config.String("CLERK_PUBLISHABLE_KEY"),');
    }
    entries.splice(insertAt === -1 ? entries.length : insertAt, 0, ...clerkEntries);
  }
  return entries;
}

export function prismaServerEnvEntries(plan: AlchemyDeploymentPlan): string[] {
  const { api, auth, dbSetup, payments } = plan.config;
  const entries = ["...resolvedDatabaseEnv,", 'CORS_ORIGIN: Config.String("CORS_ORIGIN"),'];
  if (auth === "better-auth") {
    entries.push(
      'BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),',
      'BETTER_AUTH_URL: Config.String("BETTER_AUTH_URL"),',
    );
  }
  if (auth === "clerk") {
    entries.push('CLERK_SECRET_KEY: Config.Redacted("CLERK_SECRET_KEY"),');
    if (api !== "none")
      entries.push('CLERK_PUBLISHABLE_KEY: Config.String("CLERK_PUBLISHABLE_KEY"),');
  }
  if (hasExample(plan, "ai")) {
    entries.push('GOOGLE_GENERATIVE_AI_API_KEY: Config.Redacted("GOOGLE_GENERATIVE_AI_API_KEY"),');
  }
  if (payments === "polar") {
    entries.push(
      'POLAR_ACCESS_TOKEN: Config.Redacted("POLAR_ACCESS_TOKEN"),',
      'POLAR_SUCCESS_URL: Config.String("POLAR_SUCCESS_URL"),',
    );
  }
  if (dbSetup === "turso")
    entries.push('DATABASE_AUTH_TOKEN: Config.Redacted("DATABASE_AUTH_TOKEN"),');
  if (plan.hasAxiomServerRuntime) entries.push("...resolvedObservabilityEnv,");
  return entries;
}

export function selfCloudflareWebEnvEntries(
  plan: AlchemyDeploymentPlan,
  _framework: DeployedWebFramework,
): string[] {
  const { api, auth } = plan.config;
  const entries = [...commonRuntimeEntries(plan, false)];
  if (plan.hasAxiomWebRuntime) entries.push("...observabilityBindings,");

  if (auth === "clerk") {
    entries.push("CORS_ORIGIN: Cloudflare.Worker.URL,");
    if (_framework === "tanstack-start") {
      entries.push('CLERK_SECRET_KEY: Config.Redacted("CLERK_SECRET_KEY"),');
    }
    if (api !== "none") {
      entries.push('CLERK_PUBLISHABLE_KEY: Config.String("CLERK_PUBLISHABLE_KEY"),');
    }
    entries.push('VITE_CLERK_PUBLISHABLE_KEY: Config.String("VITE_CLERK_PUBLISHABLE_KEY"),');
  }
  return entries;
}

function prismaPublicEnvEntries(
  plan: AlchemyDeploymentPlan,
  _framework: DeployedWebFramework,
): string[] {
  const { auth, backend } = plan.config;
  const deployedUrl = plan.server.target === "none" ? undefined : "deployedServer.url";
  const entries: string[] = [];
  if (backend !== "self" && backend !== "none") {
    entries.push(`VITE_SERVER_URL: ${deployedUrl ?? 'Config.String("VITE_SERVER_URL")'},`);
  }
  if (auth === "clerk") {
    entries.push('VITE_CLERK_PUBLISHABLE_KEY: Config.String("VITE_CLERK_PUBLISHABLE_KEY"),');
  }
  return entries;
}

export function prismaWebEnvEntries(
  plan: AlchemyDeploymentPlan,
  framework: DeployedWebFramework,
): string[] {
  const { api, auth, dbSetup, payments } = plan.config;
  const entries = [
    "...(process.env._VARLOCK_ENV_KEY ? { _VARLOCK_ENV_KEY: Redacted.make(process.env._VARLOCK_ENV_KEY) } : {}),",
  ];

  if (plan.web.target !== "none" && plan.web.topology === "self") {
    entries.push("...resolvedDatabaseEnv,");
    if (auth === "better-auth") {
      entries.push(
        'BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),',
        'BETTER_AUTH_URL: Config.String("BETTER_AUTH_URL"),',
      );
    }
    if (auth === "clerk") {
      if (framework === "tanstack-start") {
        entries.push('CLERK_SECRET_KEY: Config.Redacted("CLERK_SECRET_KEY"),');
      }
      if (api !== "none")
        entries.push('CLERK_PUBLISHABLE_KEY: Config.String("CLERK_PUBLISHABLE_KEY"),');
      entries.push('VITE_CLERK_PUBLISHABLE_KEY: Config.String("VITE_CLERK_PUBLISHABLE_KEY"),');
    }
    if (hasExample(plan, "ai")) {
      entries.push(
        'GOOGLE_GENERATIVE_AI_API_KEY: Config.Redacted("GOOGLE_GENERATIVE_AI_API_KEY"),',
      );
    }
    if (payments === "polar") {
      entries.push(
        'POLAR_ACCESS_TOKEN: Config.Redacted("POLAR_ACCESS_TOKEN"),',
        'POLAR_SUCCESS_URL: Config.String("POLAR_SUCCESS_URL"),',
      );
    }
    if (dbSetup === "turso")
      entries.push('DATABASE_AUTH_TOKEN: Config.Redacted("DATABASE_AUTH_TOKEN"),');
    if (plan.hasAxiomWebRuntime) entries.push("...resolvedObservabilityEnv,");
  }

  entries.push(...prismaPublicEnvEntries(plan, framework));
  return entries;
}

export function splitCloudflareWebEnvEntries(
  plan: AlchemyDeploymentPlan,
  _framework: DeployedWebFramework,
): string[] {
  const { auth, backend } = plan.config;
  const serverValue = plan.server.target === "none" ? undefined : "serverWorker.url.as<string>()";
  const entries: string[] = [];
  if (plan.hasAxiomWebRuntime) entries.push("...observabilityBindings,");
  if (backend !== "none") {
    entries.push(`VITE_SERVER_URL: ${serverValue ?? 'Config.String("VITE_SERVER_URL")'},`);
  }
  if (auth === "clerk") {
    if (_framework === "tanstack-start") {
      entries.push('CLERK_SECRET_KEY: Config.Redacted("CLERK_SECRET_KEY"),');
    }
    entries.push('VITE_CLERK_PUBLISHABLE_KEY: Config.String("VITE_CLERK_PUBLISHABLE_KEY"),');
  }
  return entries;
}
