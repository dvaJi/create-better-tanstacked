import type { DatabaseSetup, Examples, Frontend, ProjectConfig } from "../../src/types";

import { evaluateMatrixConfig, type MatrixOracleResult } from "./oracle";

export const MATRIX_DATABASES = ["none", "sqlite", "postgres"] as const;
export const MATRIX_ORMS = ["drizzle", "none"] as const;
export const MATRIX_BACKENDS = ["hono", "elysia", "self", "none"] as const;
export const MATRIX_RUNTIMES = ["bun", "node", "workers", "none"] as const;
export const MATRIX_WEB_FRONTENDS = ["tanstack-router", "tanstack-start"] as const;
export const MATRIX_APIS = ["trpc", "orpc", "none"] as const;
export const MATRIX_AUTHS = ["better-auth", "clerk", "none"] as const;
export const MATRIX_PAYMENTS = ["polar", "none"] as const;
export const MATRIX_DB_SETUPS = [
  "turso",
  "neon",
  "prisma-postgres",
  "planetscale",
  "supabase",
  "d1",
  "docker",
  "none",
] as const;
export const MATRIX_WEB_DEPLOYS = ["cloudflare", "none"] as const;
export const MATRIX_SERVER_DEPLOYS = ["cloudflare", "none"] as const;
export const MATRIX_EXAMPLE_SETS = [[], ["todo"], ["ai"], ["todo", "ai"]] as const;

export type MatrixFrontendSet = readonly Frontend[];
export type MatrixExampleSet = readonly Examples[];

export interface MatrixCase {
  index: number;
  config: ProjectConfig;
  expected: MatrixOracleResult;
}

export interface MatrixShard {
  index: number;
  total: number;
}

export const MATRIX_FRONTEND_SETS: readonly MatrixFrontendSet[] = [
  [],
  ...MATRIX_WEB_FRONTENDS.map((frontend) => [frontend] as const),
];

export const TOTAL_MATRIX_CASES =
  MATRIX_DATABASES.length *
  MATRIX_ORMS.length *
  MATRIX_BACKENDS.length *
  MATRIX_RUNTIMES.length *
  MATRIX_FRONTEND_SETS.length *
  MATRIX_APIS.length *
  MATRIX_AUTHS.length *
  MATRIX_PAYMENTS.length *
  MATRIX_DB_SETUPS.length *
  MATRIX_WEB_DEPLOYS.length *
  MATRIX_SERVER_DEPLOYS.length *
  MATRIX_EXAMPLE_SETS.length;

type MatrixConfigInput = Pick<
  ProjectConfig,
  | "database"
  | "orm"
  | "backend"
  | "runtime"
  | "frontend"
  | "api"
  | "auth"
  | "payments"
  | "dbSetup"
  | "webDeploy"
  | "serverDeploy"
  | "examples"
>;

const BASE_VALID_CONFIG: MatrixConfigInput = {
  database: "sqlite",
  orm: "drizzle",
  backend: "hono",
  runtime: "bun",
  frontend: ["tanstack-router"],
  api: "trpc",
  auth: "none",
  payments: "none",
  dbSetup: "none",
  webDeploy: "none",
  serverDeploy: "none",
  examples: [],
};

export function createMatrixConfig(overrides: Partial<MatrixConfigInput> = {}): ProjectConfig {
  const config = {
    ...BASE_VALID_CONFIG,
    ...overrides,
  };

  return {
    projectName: "matrix-app",
    projectDir: "/virtual/matrix-app",
    relativePath: "matrix-app",
    database: config.database,
    orm: config.orm,
    backend: config.backend,
    runtime: config.runtime,
    frontend: [...config.frontend],
    addons: [],
    examples: [...config.examples],
    auth: config.auth,
    payments: config.payments,
    git: false,
    packageManager: "bun",
    install: false,
    dbSetup: config.dbSetup,
    api: config.api,
    webDeploy: config.webDeploy,
    serverDeploy: config.serverDeploy,
  };
}

function createMatrixCase(index: number, config: ProjectConfig): MatrixCase {
  return {
    index,
    config: {
      ...config,
      projectName: `matrix-app-${index}`,
      projectDir: `/virtual/matrix-app-${index}`,
      relativePath: `matrix-app-${index}`,
    },
    expected: evaluateMatrixConfig(config),
  };
}

export function* generateMatrixCases(shard?: MatrixShard): Generator<MatrixCase> {
  let index = 0;

  for (const database of MATRIX_DATABASES) {
    for (const orm of MATRIX_ORMS) {
      for (const backend of MATRIX_BACKENDS) {
        for (const runtime of MATRIX_RUNTIMES) {
          for (const frontend of MATRIX_FRONTEND_SETS) {
            for (const api of MATRIX_APIS) {
              for (const auth of MATRIX_AUTHS) {
                for (const payments of MATRIX_PAYMENTS) {
                  for (const dbSetup of MATRIX_DB_SETUPS) {
                    for (const webDeploy of MATRIX_WEB_DEPLOYS) {
                      for (const serverDeploy of MATRIX_SERVER_DEPLOYS) {
                        for (const examples of MATRIX_EXAMPLE_SETS) {
                          if (caseMatchesShard(index, shard)) {
                            yield createMatrixCase(
                              index,
                              createMatrixConfig({
                                database,
                                orm,
                                backend,
                                runtime,
                                frontend: [...frontend],
                                api,
                                auth,
                                payments,
                                dbSetup,
                                webDeploy,
                                serverDeploy,
                                examples: [...examples],
                              }),
                            );
                          }
                          index++;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function compactConfigKey(config: ProjectConfig) {
  return JSON.stringify({
    database: config.database,
    orm: config.orm,
    backend: config.backend,
    runtime: config.runtime,
    frontend: config.frontend,
    api: config.api,
    auth: config.auth,
    payments: config.payments,
    dbSetup: config.dbSetup,
    webDeploy: config.webDeploy,
    serverDeploy: config.serverDeploy,
    examples: config.examples,
  });
}

function pushUnique(
  configs: ProjectConfig[],
  seen: Set<string>,
  overrides: Partial<MatrixConfigInput>,
) {
  const config = createMatrixConfig(overrides);
  const key = compactConfigKey(config);
  if (seen.has(key)) return;
  seen.add(key);
  configs.push(config);
}

function getCompatibleDatabaseSetup(dbSetup: DatabaseSetup): Partial<MatrixConfigInput> {
  switch (dbSetup) {
    case "turso":
      return { database: "sqlite", orm: "drizzle" };
    case "neon":
    case "supabase":
    case "prisma-postgres":
    case "planetscale":
      return { database: "postgres", orm: "drizzle" };
    case "d1":
      return {
        database: "sqlite",
        orm: "drizzle",
        backend: "hono",
        runtime: "workers",
        serverDeploy: "cloudflare",
      };
    case "docker":
      return { database: "postgres", orm: "drizzle" };
    case "none":
      return {};
    default:
      return {};
  }
}

export function createSmokeMatrixCases(): MatrixCase[] {
  const configs: ProjectConfig[] = [];
  const seen = new Set<string>();

  pushUnique(configs, seen, {});

  for (const database of MATRIX_DATABASES) {
    for (const orm of MATRIX_ORMS) {
      pushUnique(configs, seen, { database, orm });
    }
  }

  for (const backend of MATRIX_BACKENDS) {
    for (const runtime of MATRIX_RUNTIMES) {
      const terminal = backend === "none";
      const self = backend === "self";
      pushUnique(configs, seen, {
        backend,
        runtime,
        database: terminal ? "none" : "sqlite",
        orm: terminal ? "none" : "drizzle",
        api: terminal ? "none" : "trpc",
        auth: "none",
        frontend: self ? ["tanstack-start"] : ["tanstack-router"],
        serverDeploy: runtime === "workers" ? "cloudflare" : "none",
      });
    }
  }

  for (const frontend of MATRIX_FRONTEND_SETS) {
    for (const api of MATRIX_APIS) {
      pushUnique(configs, seen, { frontend: [...frontend], api });
    }
  }

  for (const frontend of MATRIX_FRONTEND_SETS) {
    pushUnique(configs, seen, { frontend: [...frontend], auth: "clerk" });
  }

  for (const payments of MATRIX_PAYMENTS) {
    for (const frontend of [[], ["tanstack-router"], ["tanstack-start"]] as const) {
      pushUnique(configs, seen, {
        payments,
        auth: payments === "polar" ? "better-auth" : "none",
        frontend: [...frontend],
      });
    }
  }

  for (const dbSetup of MATRIX_DB_SETUPS) {
    pushUnique(configs, seen, {
      dbSetup,
      ...getCompatibleDatabaseSetup(dbSetup),
    });
    if (dbSetup !== "none" && dbSetup !== "d1") {
      pushUnique(configs, seen, {
        dbSetup,
        database: "none",
        orm: "none",
      });
    }
  }

  for (const webDeploy of MATRIX_WEB_DEPLOYS) {
    for (const serverDeploy of MATRIX_SERVER_DEPLOYS) {
      pushUnique(configs, seen, {
        webDeploy,
        serverDeploy,
        backend: "hono",
        runtime: serverDeploy === "cloudflare" ? "workers" : "bun",
      });
    }
  }

  pushUnique(configs, seen, {
    webDeploy: "cloudflare",
    frontend: [],
    backend: "hono",
    runtime: "bun",
  });

  for (const examples of MATRIX_EXAMPLE_SETS) {
    pushUnique(configs, seen, {
      examples: [...examples],
      backend: "hono",
      database: "sqlite",
      api: "trpc",
    });
    pushUnique(configs, seen, {
      examples: [...examples],
      backend: "none",
      runtime: "none",
      database: "none",
      orm: "none",
      api: "none",
      auth: "none",
    });
    pushUnique(configs, seen, {
      examples: [...examples],
      backend: "self",
      runtime: "none",
      frontend: ["tanstack-start"],
      database: "sqlite",
      api: "trpc",
      auth: "better-auth",
    });
  }

  for (const frontend of ["tanstack-start"] as const) {
    for (const api of ["trpc", "orpc"] as const) {
      pushUnique(configs, seen, {
        backend: "self",
        runtime: "none",
        frontend: [frontend],
        api,
        auth: "better-auth",
      });
    }
  }

  for (const backend of MATRIX_BACKENDS) {
    pushUnique(configs, seen, {
      backend,
      runtime: "workers",
      database: backend === "none" ? "none" : "sqlite",
      orm: backend === "none" ? "none" : "drizzle",
      api: backend === "none" ? "none" : "trpc",
      serverDeploy: "cloudflare",
    });
  }

  return configs.map((config, index) => createMatrixCase(index, config));
}

export function parseMatrixShard(value?: string): MatrixShard | undefined {
  if (!value) return undefined;

  const match = value.match(/^(\d+)\/(\d+)$/);
  if (!match) {
    throw new Error(`Invalid matrix shard "${value}". Expected format like "1/20".`);
  }

  const oneBasedIndex = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isInteger(oneBasedIndex) || !Number.isInteger(total) || total < 1) {
    throw new Error(`Invalid matrix shard "${value}". Expected positive integers.`);
  }
  if (oneBasedIndex < 1 || oneBasedIndex > total) {
    throw new Error(`Invalid matrix shard "${value}". Shard index must be between 1 and ${total}.`);
  }

  return {
    index: oneBasedIndex - 1,
    total,
  };
}

export function getMatrixShardFromArgs(argv = process.argv, env = process.env) {
  const envShard = env.BTS_MATRIX_SHARD;
  if (envShard) return parseMatrixShard(envShard);

  const shardArg = argv.find((arg) => arg.startsWith("--shard="));
  if (shardArg) return parseMatrixShard(shardArg.slice("--shard=".length));

  const shardFlagIndex = argv.indexOf("--shard");
  if (shardFlagIndex >= 0) {
    return parseMatrixShard(argv[shardFlagIndex + 1]);
  }

  return undefined;
}

export function caseMatchesShard(index: number, shard?: MatrixShard) {
  if (!shard) return true;
  return index % shard.total === shard.index;
}

export type MatrixMode = "smoke" | "full";

export function getMatrixMode(env = process.env): MatrixMode | undefined {
  const mode = env.BTS_MATRIX_MODE;
  if (mode === "smoke" || mode === "full") return mode;
  return undefined;
}
