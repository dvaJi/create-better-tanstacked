import { describe, expect, test } from "bun:test";

import {
  ADDONS_VALUES,
  SERVER_DEPLOY_VALUES,
  WEB_DEPLOY_VALUES,
} from "../../../packages/types/src/schemas";
import { getTechSelectionUpdate } from "../src/app/(home)/new/_components/stack-builder/use-stack-builder";
import { DEFAULT_STACK, type StackState, TECH_OPTIONS } from "../src/lib/constant";
import { sanitizeAddons } from "../src/lib/sanitize-stack-addons";
import { applyStackUpdate, resolveStackCompatibility } from "../src/lib/stack-compatibility";
import { formatStackCommandForDisplay, generateStackCommand } from "../src/lib/stack-utils";
import { analyzeStackCompatibility, getDisabledReason } from "../src/lib/stack-validation";

function createStack(overrides: Partial<StackState> = {}): StackState {
  return {
    ...DEFAULT_STACK,
    ...overrides,
    webFrontend: [...(overrides.webFrontend ?? DEFAULT_STACK.webFrontend)],
    addons: [...(overrides.addons ?? DEFAULT_STACK.addons)],
    examples: [...(overrides.examples ?? DEFAULT_STACK.examples)],
  };
}

describe("stack builder D1 compatibility", () => {
  test("supports TanStack Start as the self-hosted fullstack backend", () => {
    const stack = createStack({
      webFrontend: ["tanstack-start"],
      backend: "self-tanstack-start",
      runtime: "none",
      api: "orpc",
      serverDeploy: "none",
    });

    expect(getDisabledReason(stack, "backend", "self-tanstack-start")).toBeNull();
    expect(getDisabledReason(stack, "api", "trpc")).toBeNull();
    expect(getDisabledReason(stack, "addons", "evlog")).toBeNull();
    expect(analyzeStackCompatibility(stack).adjustedStack).toBeNull();

    const command = generateStackCommand(stack);
    expect(command).toContain("--frontend tanstack-start");
    expect(command).toContain("--backend self");
  });

  test("keeps self fullstack backends on the D1 + Cloudflare path", () => {
    const stack = createStack({
      backend: "self-tanstack-start",
      webFrontend: ["tanstack-start"],
      runtime: "none",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
      webDeploy: "none",
      serverDeploy: "none",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      backend: "self-tanstack-start",
      runtime: "none",
      database: "sqlite",
      dbSetup: "d1",
      webDeploy: "cloudflare",
      serverDeploy: "none",
    });
  });

  test("still routes non-self D1 stacks through workers + cloudflare", () => {
    const stack = createStack({
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
      serverDeploy: "none",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      backend: "hono",
      runtime: "workers",
      database: "sqlite",
      dbSetup: "d1",
      serverDeploy: "cloudflare",
    });
  });

  test("allows selecting D1 for self fullstack backends", () => {
    const stack = createStack({
      backend: "self-tanstack-start",
      webFrontend: ["tanstack-start"],
      runtime: "none",
      database: "sqlite",
    });

    expect(getDisabledReason(stack, "dbSetup", "d1")).toBeNull();
  });

  test("blocks non-cloudflare web deployment for self fullstack D1 stacks", () => {
    const stack = createStack({
      backend: "self-tanstack-start",
      webFrontend: ["tanstack-start"],
      runtime: "none",
      database: "sqlite",
      dbSetup: "d1",
      webDeploy: "cloudflare",
    });

    expect(getDisabledReason(stack, "webDeploy", "none")).toBe(
      "D1 with a self fullstack backend requires Cloudflare web deployment",
    );
  });

  test("keeps only the latest selected task-runner addon", () => {
    expect(sanitizeAddons(["turborepo", "vite-plus"])).toEqual(["vite-plus"]);
    expect(sanitizeAddons(["vite-plus", "nx"])).toEqual(["nx"]);
    expect(sanitizeAddons(["nx", "turborepo"])).toEqual(["turborepo"]);

    const sanitizedAddons = sanitizeAddons(["turborepo", "vite-plus"]);
    const command = generateStackCommand(createStack({ addons: sanitizedAddons }));

    expect(command).toContain("--addons vite-plus");
    expect(command).not.toContain("turborepo");

    expect(
      getDisabledReason(createStack({ addons: ["turborepo"] }), "addons", "vite-plus"),
    ).toBeNull();
    expect(getDisabledReason(createStack({ addons: ["vite-plus"] }), "addons", "nx")).toBeNull();
  });

  test("keeps only the latest selected observability addon", () => {
    expect(sanitizeAddons(["evlog", "axiom"])).toEqual(["axiom"]);
    expect(sanitizeAddons(["axiom", "evlog"])).toEqual(["evlog"]);
  });

  test("renders long CLI commands with visible flag separators", () => {
    const command = generateStackCommand(
      createStack({ addons: ["vite-plus"], examples: ["none"] }),
    );
    const displayCommand = formatStackCommandForDisplay(command);

    expect(command).toContain("my-better-t-app --frontend");
    expect(displayCommand).toContain(`my-better-t-app ${"\\"}\n  --frontend`);
    expect(displayCommand).toContain(`tanstack-router ${"\\"}\n  --backend`);
  });

  test("quotes project names as a single shell argument", () => {
    expect(generateStackCommand(createStack({ projectName: "name; echo INJECTED" }))).toContain(
      "'name; echo INJECTED' --yes",
    );
    expect(generateStackCommand(createStack({ projectName: "name$(echo INJECTED)" }))).toContain(
      "'name$(echo INJECTED)' --yes",
    );
    expect(generateStackCommand(createStack({ projectName: "project's app\nnext" }))).toContain(
      "'project'\\''s app\nnext' --yes",
    );
  });

  test("reapplies the same D1 adjustment after leaving and returning to it", () => {
    const initialRawD1Stack = createStack({
      backend: "self-tanstack-start",
      webFrontend: ["tanstack-start"],
      runtime: "none",
      database: "sqlite",
      dbSetup: "d1",
      webDeploy: "none",
      serverDeploy: "none",
    });

    const firstD1Selection = applyStackUpdate(initialRawD1Stack, {});
    const tursoSelection = applyStackUpdate(firstD1Selection.stack, {
      dbSetup: "turso",
      webDeploy: "none",
    });
    const secondD1Selection = applyStackUpdate(tursoSelection.stack, { dbSetup: "d1" });

    expect(firstD1Selection.stack.webDeploy).toBe("cloudflare");
    expect(tursoSelection.stack).toMatchObject({ dbSetup: "turso", webDeploy: "none" });
    expect(secondD1Selection.stack).toMatchObject({
      dbSetup: "d1",
      webDeploy: "cloudflare",
    });
  });

  test("allows Polar when there is no frontend at all", () => {
    const stack = createStack({
      webFrontend: ["none"],
      backend: "hono",
      auth: "better-auth",
    });

    expect(getDisabledReason(stack, "payments", "polar")).toBeNull();
  });

  test("allows Polar for TanStack Router stacks", () => {
    const stack = createStack({
      webFrontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      auth: "better-auth",
      payments: "polar",
    });

    expect(getDisabledReason(stack, "payments", "polar")).toBeNull();
    expect(analyzeStackCompatibility(stack).adjustedStack).toBeNull();

    const command = generateStackCommand(stack);
    expect(command).toContain("--frontend tanstack-router");
    expect(command).toContain("--payments polar");
  });

  test("allows Polar for Convex Better Auth with TanStack Start", () => {
    const stack = createStack({
      webFrontend: ["tanstack-start"],
      backend: "convex",
      runtime: "none",
      database: "none",
      orm: "none",
      api: "none",
      dbSetup: "none",
      auth: "better-auth",
      payments: "polar",
    });

    expect(getDisabledReason(stack, "auth", "better-auth")).toBeNull();
    expect(getDisabledReason(stack, "payments", "polar")).toBeNull();
    expect(analyzeStackCompatibility(stack).adjustedStack).toBeNull();

    const command = generateStackCommand(stack);
    expect(command).toContain("--frontend tanstack-start");
    expect(command).toContain("--backend convex");
    expect(command).toContain("--payments polar");
  });

  test("matches the CLI by disabling every ORM when no database is selected", () => {
    const stack = resolveStackCompatibility(
      createStack({ database: "none", orm: "none", dbSetup: "none" }),
    ).stack;

    expect(getDisabledReason(stack, "orm", "drizzle")).toBe("Select a database first");
    expect(getDisabledReason(stack, "orm", "prisma")).toBe("Select a database first");
    expect(getDisabledReason(stack, "orm", "mongoose")).toBe("Select a database first");
    expect(getDisabledReason(stack, "orm", "none")).toBeNull();
  });

  test("allows the AI example for TanStack Start", () => {
    const stack = createStack({
      webFrontend: ["tanstack-router"],
      backend: "self-tanstack-start",
      api: "orpc",
    });

    expect(getDisabledReason(stack, "examples", "ai")).toBeNull();

    const result = analyzeStackCompatibility({
      ...stack,
      examples: ["ai"],
    });

    expect(result.adjustedStack).toBeNull();
  });

  test("blocks Evlog for Convex stacks", () => {
    const stack = createStack({
      webFrontend: ["tanstack-start"],
      backend: "convex",
      runtime: "none",
      addons: ["turborepo"],
    });

    expect(getDisabledReason(stack, "addons", "evlog")).toContain("observability");
  });

  test("removes Evlog when a selected stack switches to Convex", () => {
    const stack = createStack({
      webFrontend: ["tanstack-start"],
      backend: "convex",
      runtime: "none",
      addons: ["turborepo", "evlog"],
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack?.addons).toEqual(["turborepo"]);
    expect(result.changes).toContainEqual(
      expect.objectContaining({
        category: "addons",
        message: expect.stringContaining("evlog removed"),
      }),
    );
  });

  test("allows Evlog for server and fullstack stacks", () => {
    const serverStack = createStack({
      backend: "hono",
      runtime: "bun",
    });
    const fullstackStack = createStack({
      webFrontend: ["tanstack-start"],
      backend: "self-tanstack-start",
      runtime: "none",
    });

    expect(getDisabledReason(serverStack, "addons", "evlog")).toBeNull();
    expect(getDisabledReason(fullstackStack, "addons", "evlog")).toBeNull();
  });

  test("allows Clerk with TanStack Router", () => {
    const stack = createStack({
      webFrontend: ["tanstack-router"],
      auth: "none",
      api: "orpc",
    });

    expect(getDisabledReason(stack, "auth", "clerk")).toBeNull();
    expect(resolveStackCompatibility({ ...stack, auth: "clerk" }).stack.auth).toBe("clerk");
  });

  test("allows Convex Better Auth with TanStack Router", () => {
    const stack = createStack({
      webFrontend: ["tanstack-router"],
      backend: "convex",
      runtime: "none",
      database: "none",
      orm: "none",
      dbSetup: "none",
      api: "none",
      auth: "none",
    });

    expect(getDisabledReason(stack, "auth", "better-auth")).toBeNull();
    expect(resolveStackCompatibility({ ...stack, auth: "better-auth" }).stack.auth).toBe(
      "better-auth",
    );
  });
});

describe("stack builder Docker deployment compatibility", () => {
  test("allows Docker web deploy with a web frontend", () => {
    const stack = createStack({
      webFrontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
    });

    expect(getDisabledReason(stack, "webDeploy", "docker")).toBeNull();

    const command = generateStackCommand({
      ...stack,
      webDeploy: "docker",
    });
    expect(command).toContain("--web-deploy docker");
  });

  test("allows Docker server deploy on bun/node runtimes only", () => {
    const bunStack = createStack({
      backend: "hono",
      runtime: "bun",
    });
    const workersStack = createStack({
      backend: "hono",
      runtime: "workers",
      serverDeploy: "cloudflare",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
    });

    expect(getDisabledReason(bunStack, "serverDeploy", "docker")).toBeNull();
    expect(getDisabledReason(workersStack, "serverDeploy", "docker")).toBe(
      "Docker server deployment requires the Bun or Node runtime",
    );
  });

  test("switches Docker server deploy to Cloudflare when runtime becomes workers", () => {
    const stack = createStack({
      backend: "hono",
      runtime: "workers",
      serverDeploy: "docker",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      serverDeploy: "cloudflare",
    });
  });

  test("clears Docker server deploy for backends without a server app", () => {
    const stack = createStack({
      webFrontend: ["tanstack-start"],
      backend: "self-tanstack-start",
      runtime: "none",
      serverDeploy: "docker",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      serverDeploy: "none",
    });
  });

  test("blocks Docker web deploy when desktop addons require static server output", () => {
    const stack = createStack({
      webFrontend: ["tanstack-start"],
      addons: ["electrobun"],
      webDeploy: "none",
    });

    expect(getDisabledReason(stack, "webDeploy", "docker")).toBe(
      "Docker cannot serve the static output required by electrobun on next",
    );
    expect(resolveStackCompatibility({ ...stack, webDeploy: "docker" }).stack.webDeploy).toBe(
      "none",
    );
  });

  test("keeps the CLI exception for Convex Better Auth with TanStack Start and Electrobun", () => {
    const stack = createStack({
      webFrontend: ["tanstack-start"],
      backend: "convex",
      runtime: "none",
      database: "none",
      orm: "none",
      dbSetup: "none",
      api: "none",
      auth: "better-auth",
      addons: ["electrobun"],
      webDeploy: "docker",
    });

    expect(getDisabledReason(stack, "webDeploy", "docker")).toBeNull();
    expect(resolveStackCompatibility(stack).stack.webDeploy).toBe("docker");
  });
});

describe("stack builder Vercel deployment compatibility", () => {
  test("allows Vercel web deploy with a web frontend", () => {
    const stack = createStack({
      webFrontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
    });

    expect(getDisabledReason(stack, "webDeploy", "vercel")).toBeNull();

    const command = generateStackCommand({
      ...stack,
      webDeploy: "vercel",
    });
    expect(command).toContain("--web-deploy vercel");
  });

  test("allows Vercel server deploy on the node runtime only", () => {
    const nodeStack = createStack({
      backend: "hono",
      runtime: "node",
    });
    const bunStack = createStack({
      backend: "hono",
      runtime: "bun",
    });
    const workersStack = createStack({
      backend: "hono",
      runtime: "workers",
      serverDeploy: "cloudflare",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
    });

    expect(getDisabledReason(nodeStack, "serverDeploy", "vercel")).toBeNull();
    // varlock/auto-load launches the Node-based Varlock CLI; Vercel's Bun runtime has no Node
    expect(getDisabledReason(bunStack, "serverDeploy", "vercel")).toBe(
      "Vercel server deployment requires the Node runtime",
    );
    expect(getDisabledReason(workersStack, "serverDeploy", "vercel")).toBe(
      "Vercel server deployment requires the Node runtime",
    );
  });

  test("switches Vercel server deploy to Cloudflare when runtime becomes workers", () => {
    const stack = createStack({
      backend: "hono",
      runtime: "workers",
      serverDeploy: "vercel",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      serverDeploy: "cloudflare",
    });
  });

  test("clears Vercel server deploy for backends without a server app", () => {
    const stack = createStack({
      webFrontend: ["tanstack-start"],
      backend: "self-tanstack-start",
      runtime: "none",
      serverDeploy: "vercel",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      serverDeploy: "none",
    });
  });
});

describe("stack builder option parity", () => {
  test("exposes every CLI addon and deployment option", () => {
    expect(TECH_OPTIONS.addons.map((option) => option.id).sort()).toEqual(
      ADDONS_VALUES.filter((value) => value !== "none").sort(),
    );
    expect(TECH_OPTIONS.webDeploy.map((option) => option.id).sort()).toEqual(
      [...WEB_DEPLOY_VALUES].sort(),
    );
    expect(TECH_OPTIONS.serverDeploy.map((option) => option.id).sort()).toEqual(
      [...SERVER_DEPLOY_VALUES].sort(),
    );
  });

  test("marks only Vercel deployment as experimental", () => {
    for (const category of [TECH_OPTIONS.webDeploy, TECH_OPTIONS.serverDeploy]) {
      expect(category.find((option) => option.id === "vercel")).toMatchObject({
        experimental: true,
      });
      for (const option of category) {
        const isExperimental = "experimental" in option && option.experimental === true;
        expect(isExperimental).toBe(option.id === "vercel");
      }
    }
  });
});

describe("stack builder Prisma deployment compatibility", () => {
  test("allows Prisma web deployment for supported server and SPA frontends", () => {
    for (const frontend of ["tanstack-router", "tanstack-start"] as const) {
      expect(
        getDisabledReason(createStack({ webFrontend: [frontend] }), "webDeploy", "prisma"),
      ).toBeNull();
    }
  });

  test("blocks Prisma web deploy when desktop addons replace its server artifact", () => {
    const stack = createStack({
      webFrontend: ["tanstack-router"],
      addons: ["tauri"],
      webDeploy: "none",
    });

    expect(getDisabledReason(stack, "webDeploy", "prisma")).toBe(
      "Prisma cannot deploy the static output required by tauri on tanstack-router",
    );
    expect(resolveStackCompatibility({ ...stack, webDeploy: "prisma" }).stack.webDeploy).toBe(
      "none",
    );
  });

  test("generates Prisma web and server deployment flags", () => {
    const command = generateStackCommand(
      createStack({
        webFrontend: ["tanstack-start"],
        backend: "hono",
        runtime: "bun",
        webDeploy: "prisma",
        serverDeploy: "prisma",
      }),
    );

    expect(command).toContain("--web-deploy prisma");
    expect(command).toContain("--server-deploy prisma");
  });

  test("requires Bun or Node for Prisma server deployment", () => {
    expect(
      getDisabledReason(createStack({ backend: "hono", runtime: "bun" }), "serverDeploy", "prisma"),
    ).toBeNull();
    expect(
      getDisabledReason(
        createStack({ backend: "hono", runtime: "workers" }),
        "serverDeploy",
        "prisma",
      ),
    ).toBe("Prisma server deployment requires the Bun or Node runtime");
  });

  test("preserves Prisma SPA deployment and repairs incompatible server runtimes", () => {
    expect(
      resolveStackCompatibility(
        createStack({ webFrontend: ["tanstack-router"], webDeploy: "prisma" }),
      ).stack.webDeploy,
    ).toBe("prisma");
    expect(
      resolveStackCompatibility(
        createStack({
          backend: "hono",
          runtime: "workers",
          serverDeploy: "prisma",
          database: "sqlite",
          orm: "drizzle",
          dbSetup: "d1",
        }),
      ).stack.serverDeploy,
    ).toBe("cloudflare");
  });

  test("allows Cloudflare web deployment for TanStack Start with Postgres", () => {
    const postgresStack = createStack({
      webFrontend: ["tanstack-start"],
      backend: "self-tanstack-start",
      runtime: "none",
      database: "postgres",
      orm: "prisma",
      dbSetup: "none",
    });

    expect(getDisabledReason(postgresStack, "webDeploy", "cloudflare")).toBeNull();
  });
});

test("changing one builder field preserves unrelated settings", () => {
  const stack = createStack({
    projectName: "keep-me",
    database: "postgres",
    orm: "prisma",
    runtime: "node",
  });
  const update = getTechSelectionUpdate(stack, "git", "false");
  expect(update).toEqual({ git: "false" });
  const next = applyStackUpdate(stack, update).stack;
  expect(next.projectName).toBe("keep-me");
  expect(next.database).toBe("postgres");
  expect(next.orm).toBe("prisma");
  expect(next.runtime).toBe("node");
});

test("ignores option IDs belonging to a different builder category", () => {
  expect(getTechSelectionUpdate(DEFAULT_STACK, "runtime", "unsupported-runtime")).toEqual({});
  expect(getTechSelectionUpdate(DEFAULT_STACK, "addons", "postgres")).toEqual({});
});
