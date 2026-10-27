import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { expectError, expectSuccess, runCreateTest } from "./test-utils";

function expectParseableTsx(content: string) {
  expect(() => new Bun.Transpiler({ loader: "tsx" }).transformSync(content)).not.toThrow();
}

describe("Addon Configurations", () => {
  describe("Standalone Addons", () => {
    // smoke coverage for addons that have no dedicated content tests
    for (const addon of ["oxlint", "lefthook", "mcp"] as const) {
      it(`should work with ${addon} addon`, async () => {
        const result = await runCreateTest({
          projectName: `${addon}-standalone`,
          addons: [addon],
        });

        expectSuccess(result);
      });
    }
  });
  describe("TanStack Addons", () => {
    it("should wire TanStack table, charts, DB, and AI addons", async () => {
      const result = await runCreateTest({
        projectName: "tanstack-addons",
        frontend: ["tanstack-start"],
        backend: "self",
        runtime: "none",
        api: "none",
        addons: ["tanstack-table", "tanstack-charts", "tanstack-db", "tanstack-ai"],
      });

      expectSuccess(result);
      const projectDir = result.projectDir;

      const webPackageJson = JSON.parse(
        await readFile(join(projectDir, "apps/web/package.json"), "utf8"),
      ) as { dependencies?: Record<string, string> };

      expect(webPackageJson.dependencies?.["@tanstack/react-table"]).toBeDefined();
      expect(webPackageJson.dependencies?.["@tanstack/react-virtual"]).toBeDefined();
      expect(webPackageJson.dependencies?.["@tanstack/charts"]).toBeDefined();
      expect(webPackageJson.dependencies?.["@tanstack/react-query"]).toBeDefined();
      expect(webPackageJson.dependencies?.["@tanstack/react-db"]).toBeDefined();
      expect(webPackageJson.dependencies?.["@tanstack/query-db-collection"]).toBeDefined();
      expect(webPackageJson.dependencies?.["@tanstack/ai"]).toBeDefined();
      expect(webPackageJson.dependencies?.["@tanstack/ai-react"]).toBeDefined();
      expect(webPackageJson.dependencies?.["@tanstack/ai-openai"]).toBeDefined();

      for (const filePath of [
        "apps/web/src/routes/table.tsx",
        "apps/web/src/routes/charts.tsx",
        "apps/web/src/lib/project-collection.ts",
        "apps/web/src/routes/db.tsx",
        "apps/web/src/routes/api/chat.ts",
        "apps/web/src/routes/chat.tsx",
      ]) {
        expect(existsSync(join(projectDir, filePath))).toBe(true);
      }

      const envSchema = await readFile(join(projectDir, "apps/web/.env.schema"), "utf8");
      expect(envSchema).toContain("OPENAI_API_KEY");

      const header = await readFile(join(projectDir, "apps/web/src/components/header.tsx"), "utf8");
      expect(header).toContain('to: "/table"');
      expect(header).toContain('to: "/charts"');
      expect(header).toContain('to: "/db"');
      expect(header).toContain('to: "/chat"');

      const tableRoute = await readFile(join(projectDir, "apps/web/src/routes/table.tsx"), "utf8");
      expect(tableRoute).toContain("useTable(");
      expectParseableTsx(tableRoute);

      const chartsRoute = await readFile(
        join(projectDir, "apps/web/src/routes/charts.tsx"),
        "utf8",
      );
      expect(chartsRoute).toContain("defineChart(");
      expectParseableTsx(chartsRoute);

      const dbRoute = await readFile(join(projectDir, "apps/web/src/routes/db.tsx"), "utf8");
      expect(dbRoute).toContain("useLiveQuery(");
      expectParseableTsx(dbRoute);

      const chatRoute = await readFile(join(projectDir, "apps/web/src/routes/chat.tsx"), "utf8");
      expect(chatRoute).toContain("useChat(");
      expectParseableTsx(chatRoute);
    });

    it("should reject TanStack AI without TanStack Start", async () => {
      const result = await runCreateTest({
        projectName: "tanstack-ai-router-fail",
        frontend: ["tanstack-router"],
        addons: ["tanstack-ai"],
      });

      expectError(result, "tanstack-ai addon requires one of these frontends: tanstack-start");
    });
  });

  describe("Product Addons", () => {
    it("should wire ErrorDX and Shipboard into a TanStack Start app", async () => {
      const result = await runCreateTest({
        projectName: "product-addons-start",
        frontend: ["tanstack-start"],
        backend: "self",
        runtime: "none",
        api: "none",
        addons: ["errordx", "shipboard"],
      });

      expectSuccess(result);
      const projectDir = result.projectDir;

      const webPackageJson = JSON.parse(
        await readFile(join(projectDir, "apps/web/package.json"), "utf8"),
      ) as { dependencies?: Record<string, string> };
      expect(webPackageJson.dependencies?.["@sentry/browser"]).toBeDefined();

      for (const filePath of [
        "apps/web/src/lib/errordx.ts",
        "apps/web/src/lib/shipboard.ts",
        "apps/web/src/components/shipboard-widget.tsx",
      ]) {
        expect(existsSync(join(projectDir, filePath))).toBe(true);
      }

      const router = await readFile(join(projectDir, "apps/web/src/router.tsx"), "utf8");
      expect(router).toContain('import { initErrorDx } from "./lib/errordx";');
      expect(router).toContain("initErrorDx();");
      expectParseableTsx(router);

      const header = await readFile(join(projectDir, "apps/web/src/components/header.tsx"), "utf8");
      expect(header).toContain('import { ShipboardWidget } from "./shipboard-widget";');
      expect(header).toContain("<ShipboardWidget />");
      expectParseableTsx(header);

      const envSchema = await readFile(join(projectDir, "apps/web/.env.schema"), "utf8");
      expect(envSchema).toContain("VITE_ERRORDX_DSN");
      expect(envSchema).toContain("VITE_SHIPBOARD_SLUG");

      const agents = await readFile(join(projectDir, "AGENTS.md"), "utf8");
      expect(agents).toContain("## ErrorDX");
      expect(agents).toContain("## Shipboard");
      expect(agents).toContain("errordx");
      expect(agents).toContain("shipboard");
    });

    it("should wire ErrorDX into a TanStack Router app", async () => {
      const result = await runCreateTest({
        projectName: "product-addons-router",
        frontend: ["tanstack-router"],
        addons: ["errordx", "shipboard"],
      });

      expectSuccess(result);
      const projectDir = result.projectDir;
      const main = await readFile(join(projectDir, "apps/web/src/main.tsx"), "utf8");

      expect(main).toContain('import { initErrorDx } from "./lib/errordx";');
      expect(main).toContain("initErrorDx();");
      expectParseableTsx(main);
    });
  });

  describe("WebMCP Addon", () => {
    it("should expose WebMCP tools in a TanStack Start app", async () => {
      const result = await runCreateTest({
        projectName: "webmcp-start",
        frontend: ["tanstack-start"],
        backend: "self",
        runtime: "none",
        api: "none",
        addons: ["webmcp"],
      });

      expectSuccess(result);
      const projectDir = result.projectDir;

      const webPackageJson = JSON.parse(
        await readFile(join(projectDir, "apps/web/package.json"), "utf8"),
      ) as { dependencies?: Record<string, string> };
      expect(webPackageJson.dependencies?.["@mcp-b/webmcp-polyfill"]).toBeDefined();
      expect(webPackageJson.dependencies?.["@mcp-b/react-webmcp"]).toBeDefined();

      for (const filePath of [
        "apps/web/src/lib/webmcp.ts",
        "apps/web/src/components/webmcp-tools.tsx",
      ]) {
        expect(existsSync(join(projectDir, filePath))).toBe(true);
      }

      const router = await readFile(join(projectDir, "apps/web/src/router.tsx"), "utf8");
      expect(router).toContain('import { initWebMcp } from "./lib/webmcp";');
      expect(router).toContain("initWebMcp();");
      expectParseableTsx(router);

      const header = await readFile(join(projectDir, "apps/web/src/components/header.tsx"), "utf8");
      expect(header).toContain('import { WebMcpTools } from "./webmcp-tools";');
      expect(header).toContain("<WebMcpTools />");
      expectParseableTsx(header);

      const tools = await readFile(
        join(projectDir, "apps/web/src/components/webmcp-tools.tsx"),
        "utf8",
      );
      expect(tools).toContain("useWebMCP(");
      expect(tools).toContain("show_notification");
      expectParseableTsx(tools);

      const agents = await readFile(join(projectDir, "AGENTS.md"), "utf8");
      expect(agents).toContain("## WebMCP");
    });

    it("should initialize WebMCP in a TanStack Router app", async () => {
      const result = await runCreateTest({
        projectName: "webmcp-router",
        frontend: ["tanstack-router"],
        addons: ["webmcp"],
      });

      expectSuccess(result);
      const projectDir = result.projectDir;
      const main = await readFile(join(projectDir, "apps/web/src/main.tsx"), "utf8");

      expect(main).toContain('import { initWebMcp } from "./lib/webmcp";');
      expect(main).toContain("initWebMcp();");
      expectParseableTsx(main);
    });
  });

  describe("Addons with None Option", () => {
    it("should work with addons none", async () => {
      const result = await runCreateTest({
        projectName: "no-addons",
      });

      expectSuccess(result);
    });

    it("should fail with none + other addons", async () => {
      const result = await runCreateTest({
        projectName: "none-with-other-addons-fail",
        addons: ["none", "oxlint"],
      });

      expectError(result, "Cannot combine 'none' with other addons");
    });
  });
});
