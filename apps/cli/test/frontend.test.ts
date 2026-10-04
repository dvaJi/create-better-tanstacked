import { describe, it } from "bun:test";

import { expectError, expectSuccess, runCreateTest } from "./test-utils";

const TANSTACK_FRONTENDS = ["tanstack-router", "tanstack-start"] as const;

describe("TanStack React frontend configurations", () => {
  for (const frontend of TANSTACK_FRONTENDS) {
    it(`generates a project with ${frontend}`, async () => {
      expectSuccess(
        await runCreateTest({
          projectName: `${frontend}-app`,
          frontend: [frontend],
        }),
      );
    });

    it(`supports tRPC and Clerk with ${frontend}`, async () => {
      expectSuccess(
        await runCreateTest({
          projectName: `${frontend}-clerk`,
          frontend: [frontend],
          api: "trpc",
          auth: "clerk",
        }),
      );
    });
  }

  it("supports a project with no frontend", async () => {
    expectSuccess(
      await runCreateTest({
        projectName: "no-frontend",
        frontend: ["none"],
      }),
    );
  });

  it("rejects selecting both TanStack frontends", async () => {
    expectError(
      await runCreateTest({
        projectName: "multiple-frontends",
        frontend: ["tanstack-router", "tanstack-start"],
      }),
      "Cannot select multiple web frameworks",
    );
  });

  it("rejects combining no frontend with a TanStack frontend", async () => {
    expectError(
      await runCreateTest({
        projectName: "none-with-frontend",
        frontend: ["none", "tanstack-router"],
      }),
      "Cannot combine 'none' with other frontend options",
    );
  });

  it("requires a TanStack frontend for web deployment", async () => {
    expectError(
      await runCreateTest({
        projectName: "web-deploy-without-frontend",
        frontend: ["none"],
        webDeploy: "cloudflare",
      }),
      "'--web-deploy' requires a web frontend",
    );
  });
});
