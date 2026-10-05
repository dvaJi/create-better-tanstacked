// Auto-generated - DO NOT EDIT
// Run 'bun run generate-templates' to regenerate

export const EMBEDDED_TEMPLATES: Map<string, string> = new Map([
  ["addons/electrobun/apps/desktop/.gitignore", `.hutch/
/artifacts/
/build/
`],
  ["addons/electrobun/apps/desktop/electrobun.config.ts.hbs", `import type { ElectrobunConfig } from "electrobun";

const webBuildDir =
  "../web/dist/client";

export default {
  app: {
    name: "{{projectName}}",
    identifier: "dev.bettertstack.{{projectName}}.desktop",
    version: "0.0.1",
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
  build: {
    mainProcess: "cottontail",
    cottontail: {
      entrypoint: "src/bun/index.ts",
    },
    copy: {
      [webBuildDir]: "views/mainview",
    },
    watchIgnore: [\`\${webBuildDir}/**\`],
    mac: {
      bundleCEF: true,
      defaultRenderer: "cef",
    },
    linux: {
      bundleCEF: true,
      defaultRenderer: "cef",
    },
    win: {
      bundleCEF: true,
      defaultRenderer: "cef",
    },
  },
} satisfies ElectrobunConfig;
`],
  ["addons/electrobun/apps/desktop/package.json.hbs", `{
  "name": "desktop",
  "private": true,
  "type": "module",
  "scripts": {},
  "devDependencies": {
    "@types/bun": "^1.4.2",
    "concurrently": "^10.0.5",
    "electrobun": "^2.0.2",
    "typescript": "^6.0.3"
  }
}
`],
  ["addons/electrobun/apps/desktop/src/bun/index.ts.hbs", `import { BrowserWindow, Updater } from "electrobun/main";

const DEV_SERVER_PORT = 3001;
const DEV_SERVER_URL = \`http://localhost:\${DEV_SERVER_PORT}\`;

async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel === "dev") {
    try {
      await fetch(DEV_SERVER_URL, { method: "HEAD" });
      console.log(\`HMR enabled: Using web dev server at \${DEV_SERVER_URL}\`);
      return DEV_SERVER_URL;
    } catch {
      console.log(
        "Web dev server not running. Run dev:hmr for live reload.",
      );
    }
  }

  return "views://mainview/index.html";
}

const url = await getMainViewUrl();

new BrowserWindow({
  title: "{{projectName}}",
  url,
  preload: url.startsWith("views://") ? 'history.replaceState(null, "", "/");' : undefined,
  frame: {
    width: 1280,
    height: 820,
    x: 120,
    y: 120,
  },
});

console.log("Electrobun desktop shell started.");
`],
  ["addons/electrobun/apps/desktop/tsconfig.json.hbs", `{
  "extends": ["../../packages/config/tsconfig.base.json", "./.hutch/devkit/tsconfig.json"],
  "compilerOptions": {
    "ignoreDeprecations": "6.0",
    "lib": ["ESNext", "DOM"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "types": ["bun"]
  },
  "include": ["src/**/*.ts", "electrobun.config.ts"]
}
`],
  ["addons/lefthook/lefthook.yml.hbs", `# Lefthook configuration
# https://github.com/evilmartians/lefthook

pre-commit:
  parallel: true
  jobs:
{{#if (includes addons "oxlint")}}
    - name: oxlint
      run: {{packageManager}} oxlint --fix {staged_files}
      stage_fixed: true
    - name: oxfmt
      run: {{packageManager}} oxfmt --write {staged_files}
      stage_fixed: true
{{else if (includes addons "vite-plus")}}
    - name: vite-plus
      run: {{packageManager}} vp staged
      stage_fixed: true
{{else}}
    # Add your pre-commit commands here
    # Example:
    # - name: lint
    #   run: {{packageManagerRunCmd}} lint
{{/if}}
`],
  ["addons/pwa/apps/web/ssr/public/offline.html", `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>You are offline</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: system-ui, sans-serif;
      }
      body {
        min-height: 90vh;
        display: grid;
        place-content: center;
        padding: 1.5rem;
      }
      a {
        color: inherit;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>You are offline</h1>
      <p>Reconnect to the internet to load this page.</p>
      <a href="/">Try again</a>
    </main>
  </body>
</html>
`],
  ["addons/pwa/apps/web/vite/public/logo.png", `[Binary file]`],
  ["addons/pwa/apps/web/vite/pwa-assets.config.ts.hbs", `import {
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset,
  images: ["public/logo.png"],
});
`],
  ["api/orpc/context.ts.hbs", `import type { Context as ApiContext } from "@{{projectName}}/api/context";
{{#if (ne database "none")}}
import { {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}getDb{{else}}db{{/if}} } from "@{{projectName}}/app-services";
{{/if}}
{{#if (eq auth "clerk")}}
type ClerkContextAuth = ApiContext["auth"];


function toClerkContextAuth(auth: ClerkContextAuth): ClerkContextAuth {
	return auth ? { userId: auth.userId } : null;
}
{{/if}}

{{#if (and (eq auth "clerk") (or (eq backend 'self') (eq backend 'hono') (eq backend 'elysia')))}}
{{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}
{{else}}
import { createClerkClient } from "@clerk/backend";
import { ENV } from "./env.server";

const clerkClient = createClerkClient({
	secretKey: ENV.CLERK_SECRET_KEY,
	publishableKey: ENV.CLERK_PUBLISHABLE_KEY,
});

async function authenticateClerkRequest(request: Request): Promise<ClerkContextAuth> {
	const requestState = await clerkClient.authenticateRequest(request, {
		authorizedParties: [ENV.CORS_ORIGIN],
	});
	return toClerkContextAuth(requestState.toAuth());
}
{{/if}}
{{/if}}

{{#if (and (eq backend 'self') (includes frontend "tanstack-start"))}}
{{#if (eq auth "better-auth")}}
{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
import { createAuth } from "@{{projectName}}/auth";
{{else}}
import { auth } from "@{{projectName}}/auth";
{{/if}}
{{/if}}

export async function createContext({{#if (eq auth "none")}}_options{{else}}{ req }{{/if}}: { req: Request }): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}(await createAuth({{#if (ne database "none")}}db{{/if}})){{else}}auth{{/if}}.api.getSession({
		headers: req.headers,
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = await authenticateClerkRequest(req);
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else if (eq backend 'hono')}}
import type { Context as HonoContext } from "hono";
{{#if (eq auth "better-auth")}}
{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
import { createAuth } from "@{{projectName}}/auth";
{{else}}
import { auth } from "@{{projectName}}/auth";
{{/if}}
{{/if}}

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({{#if (eq auth "none")}}_options{{else}}{ context }{{/if}}: CreateContextOptions): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}(await createAuth({{#if (ne database "none")}}db{{/if}})){{else}}auth{{/if}}.api.getSession({
		headers: context.req.raw.headers,
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = await authenticateClerkRequest(context.req.raw);
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else if (eq backend 'elysia')}}
import type { Context as ElysiaContext } from "elysia";
{{#if (eq auth "better-auth")}}
import { auth } from "@{{projectName}}/auth";
{{/if}}

export type CreateContextOptions = {
	context: ElysiaContext;
};

export async function createContext({{#if (eq auth "none")}}_options{{else}}{ context }{{/if}}: CreateContextOptions): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await auth.api.getSession({
		headers: context.request.headers,
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = await authenticateClerkRequest(context.request);
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else if (eq backend 'express')}}
import type { Request } from "express";
{{#if (eq auth "better-auth")}}
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@{{projectName}}/auth";
{{else if (eq auth "clerk")}}
import { getAuth } from "@clerk/express";
{{/if}}

interface CreateContextOptions {
	req: Request;
}

export async function createContext({{#if (eq auth "none")}}_opts{{else}}opts{{/if}}: CreateContextOptions): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(opts.req.headers),
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = toClerkContextAuth(getAuth(opts.req));
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else if (eq backend 'fastify')}}
{{#if (eq auth "better-auth")}}
import type { IncomingHttpHeaders } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@{{projectName}}/auth";
{{else if (eq auth "clerk")}}
import { getAuth } from "@clerk/fastify";
{{else}}
import type { IncomingHttpHeaders } from "node:http";
{{/if}}

export async function createContext(req: {{#if (eq auth "clerk")}}Parameters<typeof getAuth>[0]{{else}}IncomingHttpHeaders{{/if}}): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req),
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = toClerkContextAuth(getAuth(req));
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	void req;
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else}}
export async function createContext(): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
}
{{/if}}

export type Context = Awaited<ReturnType<typeof createContext>>;
`],
  ["api/orpc/fullstack/tanstack-start/src/routes/api/rpc/$.ts.hbs", `import { createContext } from "@{{projectName}}/api/context";
import { appRouter } from "@{{projectName}}/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { createFileRoute } from "@tanstack/react-router";

const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

async function handle({ request }: { request: Request }) {
	const rpcResult = await rpcHandler.handle(request, {
		prefix: "/api/rpc",
		context: await createContext({ req: request }),
	});
	if (rpcResult.response) return rpcResult.response;

	const apiResult = await apiHandler.handle(request, {
		prefix: "/api/rpc/api-reference",
		context: await createContext({ req: request }),
	});
	if (apiResult.response) return apiResult.response;

	return new Response("Not found", { status: 404 });
}

export const Route = createFileRoute('/api/rpc/$')({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
})`],
  ["api/orpc/server/_gitignore", `# dependencies (bun install)
node_modules

# output
out
dist
*.tgz

# code coverage
coverage
*.lcov

# logs
logs
_.log
report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# caches
.eslintcache
.cache
*.tsbuildinfo

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store
`],
  ["api/orpc/server/package.json.hbs", `{
  "name": "@{{projectName}}/api",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  },
  "type": "module",
  "scripts": {
    "build": "tsc -b",
    "check-types": "tsc -b"
  },
  "devDependencies": {},
  "dependencies": {}
}`],
  ["api/orpc/server/src/context.ts.hbs", `{{#if (eq auth "better-auth")}}
import type { Session } from "@{{projectName}}/auth";
{{/if}}
{{#if (eq auth "clerk")}}
import type { SessionAuthObject } from "@clerk/backend";
{{/if}}
{{#if (ne database "none")}}
import type { Database } from "@{{projectName}}/db";
{{/if}}

export type Context = {
{{#if (eq auth "clerk")}}
  auth: Pick<SessionAuthObject, "userId"> | null;
{{else if (eq auth "better-auth")}}
  session: Session | null;
{{/if}}
{{#if (ne database "none")}}
  db: Database;
{{/if}}
};
`],
  ["api/orpc/server/src/index.ts.hbs", `import { {{#if (or (eq auth "better-auth") (eq auth "clerk"))}}ORPCError, {{/if}}os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

{{#if (or (eq auth "better-auth") (eq auth "clerk"))}}
const requireAuth = o.middleware(async ({ context, next }) => {
  {{#if (eq auth "better-auth")}}
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
  {{else}}
  if (!context.auth?.userId) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      auth: context.auth,
    },
  });
  {{/if}}
});

export const protectedProcedure = publicProcedure.use(requireAuth);
{{/if}}
`],
  ["api/orpc/server/src/routers/index.ts.hbs", `{{#if (eq api "orpc")}}
import { {{#if (or (eq auth "better-auth") (eq auth "clerk"))}}protectedProcedure, {{/if}}publicProcedure } from "../index";
import type { RouterClient } from "@orpc/server";
{{#if (includes examples "todo")}}
import { todoRouter } from "./todo";
{{/if}}

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  {{#if (or (eq auth "better-auth") (eq auth "clerk"))}}
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      {{#if (eq auth "better-auth")}}
      user: context.session?.user,
      {{else}}
      userId: context.auth?.userId,
      {{/if}}
    };
  }),
  {{/if}}
  {{#if (includes examples "todo")}}
  todo: todoRouter,
  {{/if}}
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
{{else if (eq api "trpc")}}
import {
  {{#if (eq auth "better-auth")}}protectedProcedure, {{/if}}publicProcedure,
  router,
} from "../index";
{{#if (includes examples "todo")}}
import { todoRouter } from "./todo";
{{/if}}

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  {{#if (eq auth "better-auth")}}
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  {{/if}}
  {{#if (includes examples "todo")}}
  todo: todoRouter,
  {{/if}}
});
export type AppRouter = typeof appRouter;
{{else}}
export const appRouter = {};
export type AppRouter = typeof appRouter;
{{/if}}
`],
  ["api/orpc/server/tsconfig.json.hbs", `{
  "extends": "@{{projectName}}/config/tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "references": [{{#if (ne database "none")}}{ "path": "../db" }{{#if (eq auth "better-auth")}},{{/if}}{{/if}}
    {{#if (eq auth "better-auth")}}{ "path": "../auth" }{{/if}}]
}
`],
  ["api/orpc/web/react/base/src/utils/orpc.ts.hbs", `import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
{{#if (and (includes frontend "tanstack-start") (eq backend "self"))}}
import { createRouterClient } from "@orpc/server";
import type { RouterClient } from "@orpc/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { appRouter } from "@{{projectName}}/api/routers/index";
import { createContext } from "@{{projectName}}/api/context";
{{else if (includes frontend "tanstack-start")}}
import type { AppRouterClient } from "@{{projectName}}/api/routers/index";
import { ENV } from "../env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";
{{#if (eq auth "clerk")}}
import { getClerkAuthToken } from "@/utils/clerk-auth";
{{/if}}
{{else}}
import type { AppRouterClient } from "@{{projectName}}/api/routers/index";
import { ENV } from "../env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";
{{#if (eq auth "clerk")}}
import { getClerkAuthToken } from "@/utils/clerk-auth";
{{/if}}
{{/if}}

export function createQueryClient() {
	return new QueryClient({
		queryCache: new QueryCache({
			onError: (error, query) => {
				toast.error(\`Error: \${error.message}\`, {
					action: {
						label: "retry",
						onClick: () => {
							query.invalidate();
						},
					},
				});
			},
		}),
{{#if (includes frontend "tanstack-start")}}
		defaultOptions: { queries: { staleTime: 60 * 1000 } },
{{/if}}
	});
}

{{#unless (includes frontend "tanstack-start")}}
export const queryClient = createQueryClient();
{{/unless}}

{{#unless (eq backend "self")}}
{{> getServerUrl}}

{{/unless}}
{{#if (and (includes frontend "tanstack-start") (eq backend "self"))}}
const getORPCClient = createIsomorphicFn()
	.server(() =>
		createRouterClient(appRouter, {
			context: async () => {
				return createContext({ req: getRequest() });
			},
		}),
	)
	.client((): RouterClient<typeof appRouter> => {
			const link = new RPCLink({
			url: \`\${window.location.origin}/api/rpc\`,
{{#if (eq auth "better-auth")}}
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
{{/if}}
		});

		return createORPCClient(link);
	});

export const client: RouterClient<typeof appRouter> = getORPCClient();
{{else if (includes frontend "tanstack-start")}}
const link = new RPCLink({
{{#if (and (eq webDeploy serverDeploy) (or (eq webDeploy "vercel") (eq webDeploy "docker")))}}
	url: \`\${getServerUrl(ENV.VITE_SERVER_URL)}/rpc\`,
{{else}}
	url: \`\${ENV.VITE_SERVER_URL.replace(/\\/$/, "")}/rpc\`,
{{/if}}
{{#if (eq auth "clerk")}}
	headers: async () => {
		const token = await getClerkAuthToken();
		return token ? { Authorization: \`Bearer \${token}\` } : {};
	},
{{/if}}
{{#if (eq auth "better-auth")}}
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},
{{/if}}
});

export const client: AppRouterClient = createORPCClient(link);
{{else}}
export const link = new RPCLink({
{{#if (and (eq webDeploy serverDeploy) (or (eq webDeploy "vercel") (eq webDeploy "docker")))}}
	url: \`\${getServerUrl(ENV.VITE_SERVER_URL)}/rpc\`,
{{else}}
	url: \`\${ENV.VITE_SERVER_URL.replace(/\\/$/, "")}/rpc\`,
{{/if}}
{{#if (eq auth "clerk")}}
	headers: async () => {
		const token = await getClerkAuthToken();
		return token ? { Authorization: \`Bearer \${token}\` } : {};
	},
{{/if}}
{{#if (eq auth "better-auth")}}
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},

{{/if}}
});

export const client: AppRouterClient = createORPCClient(link)
{{/if}}

export const orpc = createTanstackQueryUtils(client)
`],
  ["api/trpc/context.ts.hbs", `import type { Context as ApiContext } from "@{{projectName}}/api/context";
{{#if (ne database "none")}}
import { {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}getDb{{else}}db{{/if}} } from "@{{projectName}}/app-services";
{{/if}}
{{#if (eq auth "clerk")}}
type ClerkContextAuth = ApiContext["auth"];


function toClerkContextAuth(auth: ClerkContextAuth): ClerkContextAuth {
	return auth ? { userId: auth.userId } : null;
}
{{/if}}

{{#if (and (eq auth "clerk") (or (eq backend 'self') (eq backend 'hono') (eq backend 'elysia')))}}
import { createClerkClient } from "@clerk/backend";
import { ENV } from "./env.server";

const clerkClient = createClerkClient({
	secretKey: ENV.CLERK_SECRET_KEY,
	publishableKey: ENV.CLERK_PUBLISHABLE_KEY,
});

async function authenticateClerkRequest(request: Request): Promise<ClerkContextAuth> {
	const requestState = await clerkClient.authenticateRequest(request, {
		authorizedParties: [ENV.CORS_ORIGIN],
	});
	return toClerkContextAuth(requestState.toAuth());
}
{{/if}}

{{#if (and (eq backend 'self') (includes frontend "tanstack-start"))}}
{{#if (eq auth "better-auth")}}
{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
import { createAuth } from "@{{projectName}}/auth";
{{else}}
import { auth } from "@{{projectName}}/auth";
{{/if}}
{{/if}}

export async function createContext({{#if (eq auth "none")}}_options{{else}}{ req }{{/if}}: { req: Request }): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}(await createAuth({{#if (ne database "none")}}db{{/if}})){{else}}auth{{/if}}.api.getSession({
		headers: req.headers,
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = await authenticateClerkRequest(req);
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else if (eq backend 'hono')}}
import type { Context as HonoContext } from "hono";
{{#if (eq auth "better-auth")}}
{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
import { createAuth } from "@{{projectName}}/auth";
{{else}}
import { auth } from "@{{projectName}}/auth";
{{/if}}
{{/if}}

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({{#if (eq auth "none")}}_options{{else}}{ context }{{/if}}: CreateContextOptions): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}(await createAuth({{#if (ne database "none")}}db{{/if}})){{else}}auth{{/if}}.api.getSession({
		headers: context.req.raw.headers,
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = await authenticateClerkRequest(context.req.raw);
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else if (eq backend 'elysia')}}
import type { Context as ElysiaContext } from "elysia";
{{#if (eq auth "better-auth")}}
import { auth } from "@{{projectName}}/auth";
{{/if}}

export type CreateContextOptions = {
	context: ElysiaContext;
};

export async function createContext({{#if (eq auth "none")}}_options{{else}}{ context }{{/if}}: CreateContextOptions): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await auth.api.getSession({
		headers: context.request.headers,
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = await authenticateClerkRequest(context.request);
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else if (eq backend 'express')}}
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
{{#if (eq auth "better-auth")}}
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@{{projectName}}/auth";
{{else if (eq auth "clerk")}}
import { getAuth } from "@clerk/express";
{{/if}}

export async function createContext({{#if (eq auth "none")}}_opts{{else}}opts{{/if}}: CreateExpressContextOptions): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(opts.req.headers),
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = toClerkContextAuth(getAuth(opts.req));
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else if (eq backend 'fastify')}}
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
{{#if (eq auth "better-auth")}}
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@{{projectName}}/auth";
{{else if (eq auth "clerk")}}
import { getAuth } from "@clerk/fastify";
{{/if}}

export async function createContext({ req }: CreateFastifyContextOptions): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
{{#if (eq auth "better-auth")}}
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		session,
	};
{{else if (eq auth "clerk")}}
	const clerkAuth = toClerkContextAuth(getAuth(req));
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
		auth: clerkAuth,
	};
{{else}}
	void req;
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
{{/if}}
}

{{else}}
export async function createContext(): Promise<ApiContext> {
{{#if (and (ne database "none") (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare"))))}}
  const db = await getDb({{#if (usesRequestScopedCloudflareEnv backend webDeploy frontend)}}env{{/if}});
{{/if}}
	return {
{{#if (ne database "none")}}
    db,
{{/if}}
	};
}
{{/if}}

export type Context = Awaited<ReturnType<typeof createContext>>;
`],
  ["api/trpc/fullstack/tanstack-start/src/routes/api/trpc/$.ts.hbs", `import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@{{projectName}}/api/routers/index'
import { createContext } from '@{{projectName}}/api/context'
import { createFileRoute } from '@tanstack/react-router'

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: appRouter,
    createContext,
    endpoint: '/api/trpc',
  })
}

export const Route = createFileRoute('/api/trpc/$')({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
})
`],
  ["api/trpc/server/_gitignore", `# dependencies (bun install)
node_modules

# output
out
dist
*.tgz

# code coverage
coverage
*.lcov

# logs
logs
_.log
report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# caches
.eslintcache
.cache
*.tsbuildinfo

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store
`],
  ["api/trpc/server/package.json.hbs", `{
  "name": "@{{projectName}}/api",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  },
  "type": "module",
  "scripts": {
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {}
}`],
  ["api/trpc/server/src/context.ts.hbs", `{{#if (eq auth "better-auth")}}
import type { Session } from "@{{projectName}}/auth";
{{/if}}
{{#if (eq auth "clerk")}}
import type { SessionAuthObject } from "@clerk/backend";
{{/if}}
{{#if (ne database "none")}}
import type { Database } from "@{{projectName}}/db";
{{/if}}

export type Context = {
{{#if (eq auth "clerk")}}
  auth: Pick<SessionAuthObject, "userId"> | null;
{{else if (eq auth "better-auth")}}
  session: Session | null;
{{/if}}
{{#if (ne database "none")}}
  db: Database;
{{/if}}
};
`],
  ["api/trpc/server/src/index.ts.hbs", `import { initTRPC{{#if (or (eq auth "better-auth") (eq auth "clerk"))}}, TRPCError{{/if}} } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

{{#if (or (eq auth "better-auth") (eq auth "clerk"))}}
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  {{#if (eq auth "better-auth")}}
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  {{else}}
  if (!ctx.auth?.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No Clerk userId",
    });
  }
  {{/if}}
  return next({
    ctx: {
      ...ctx,
      {{#if (eq auth "better-auth")}}
      session: ctx.session,
      {{else}}
      auth: ctx.auth,
      {{/if}}
    },
  });
});
{{/if}}
`],
  ["api/trpc/server/src/routers/index.ts.hbs", `{{#if (eq api "orpc")}}
import { {{#if (eq auth "better-auth")}}protectedProcedure, {{/if}}publicProcedure } from "../index";
import type { RouterClient } from "@orpc/server";
{{#if (includes examples "todo")}}
import { todoRouter } from "./todo";
{{/if}}

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  {{#if (eq auth "better-auth")}}
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  {{/if}}
  {{#if (includes examples "todo")}}
  todo: todoRouter,
  {{/if}}
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
{{else if (eq api "trpc")}}
import {
  {{#if (or (eq auth "better-auth") (eq auth "clerk"))}}protectedProcedure, {{/if}}publicProcedure,
  router,
} from "../index";
{{#if (includes examples "todo")}}
import { todoRouter } from "./todo";
{{/if}}

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  {{#if (or (eq auth "better-auth") (eq auth "clerk"))}}
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      {{#if (eq auth "better-auth")}}
      user: ctx.session.user,
      {{else}}
      userId: ctx.auth.userId,
      {{/if}}
    };
  }),
  {{/if}}
  {{#if (includes examples "todo")}}
  todo: todoRouter,
  {{/if}}
});
export type AppRouter = typeof appRouter;
{{else}}
export const appRouter = {};
export type AppRouter = typeof appRouter;
{{/if}}
`],
  ["api/trpc/server/tsconfig.json.hbs", `{
  "extends": "@{{projectName}}/config/tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  }
}
`],
  ["api/trpc/web/react/base/src/utils/trpc.ts.hbs", `{{#if (includes frontend 'tanstack-start')}}
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@{{projectName}}/api/routers/index";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();

{{else}}
import type { AppRouter } from "@{{projectName}}/api/routers/index";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";
import { ENV } from "../env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";
{{#if (eq auth "clerk")}}
import { getClerkAuthToken } from "@/utils/clerk-auth";
{{/if}}

{{> getServerUrl}}

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						query.invalidate();
					},
				},
			});
		},
	}),
});

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
{{#if (and (eq webDeploy serverDeploy) (or (eq webDeploy "vercel") (eq webDeploy "docker")))}}
			url: \`\${getServerUrl(ENV.VITE_SERVER_URL)}/trpc\`,
{{else}}
			url: \`\${ENV.VITE_SERVER_URL.replace(/\\/$/, "")}/trpc\`,
{{/if}}
{{#if (eq auth "clerk")}}
			headers: async () => {
				const token = await getClerkAuthToken();
				return token ? { Authorization: \`Bearer \${token}\` } : {};
			},
{{/if}}
{{#if (eq auth "better-auth")}}
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
{{/if}}
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
{{/if}}
`],
  ["auth/better-auth/convex/backend/convex/auth.config.ts.hbs", `import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
`],
  ["auth/better-auth/convex/backend/convex/auth.ts.hbs", `import { createClient, type GenericCtx } from "@convex-dev/better-auth";
{{#if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
{{else}}
import { convex } from "@convex-dev/better-auth/plugins";
{{/if}}
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

{{#if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}
const siteUrl = process.env.SITE_URL!;
{{/if}}

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    {{#if (includes frontend "tanstack-router")}}
    baseURL: process.env.CONVEX_SITE_URL,
    {{/if}}
    {{#if (includes frontend "tanstack-start")}}
    baseURL: siteUrl,
    {{/if}}
    {{#if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}
    trustedOrigins: [siteUrl],
    {{/if}}
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Revoked sessions may remain active until this cache expires.
      },
    },
    plugins: [
      {{#if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}
      crossDomain({ siteUrl }),
      {{/if}}
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
`],
  ["auth/better-auth/convex/backend/convex/http.ts.hbs", `import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
{{#if (eq payments "polar")}}
import { polar } from "./polar";
{{/if}}

const http = httpRouter();

{{#if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}
authComponent.registerRoutes(http, createAuth, { cors: true });
{{else}}
authComponent.registerRoutes(http, createAuth);
{{/if}}
{{#if (eq payments "polar")}}

polar.registerRoutes(http);
{{/if}}

export default http;
`],
  ["auth/better-auth/convex/backend/convex/privateData.ts.hbs", `import { query } from "./_generated/server";
import { authComponent } from "./auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return {
        message: "Not authenticated",
      };
    }
    return {
      message: "This is private",
    };
  },
});
`],
  ["auth/better-auth/convex/web/react/tanstack-router/src/components/sign-in-form.tsx.hbs", `import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@{{projectName}}/ui/components/button";
import { Input } from "@{{projectName}}/ui/components/input";
import { Label } from "@{{projectName}}/ui/components/label";

export default function SignInForm({
    onSwitchToSignUp,
}: {
    onSwitchToSignUp: () => void;
}) {
    const navigate = useNavigate({
        from: "/",
    });

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            await authClient.signIn.email(
                {
                    email: value.email,
                    password: value.password,
                },
                {
                    onSuccess: () => {
                        navigate({
                            to: "/dashboard",
                        });
                        toast.success("Sign in successful");
                    },
                    onError: (error) => {
                        toast.error(error.error.message || error.error.statusText);
                    },
                },
            );
        },
        validators: {
            onSubmit: z.object({
                email: z.email("Invalid email address"),
                password: z.string().min(8, "Password must be at least 8 characters"),
            }),
        },
    });

    return (
        <div className="mx-auto w-full mt-10 max-w-md p-6">
            <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4"
            >
                <div>
                    <form.Field name="email">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Email</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="email"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error, index) => (
                                    <p key={\`\${field.name}-error-\${index}\`} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <div>
                    <form.Field name="password">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Password</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error, index) => (
                                    <p key={\`\${field.name}-error-\${index}\`} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!canSubmit || isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Sign In"}
                        </Button>
                    )}
                </form.Subscribe>
            </form>

            <div className="mt-4 text-center">
                <Button
                    variant="link"
                    onClick={onSwitchToSignUp}
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    Need an account? Sign Up
                </Button>
            </div>
        </div>
    );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-router/src/components/sign-up-form.tsx.hbs", `import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@{{projectName}}/ui/components/button";
import { Input } from "@{{projectName}}/ui/components/input";
import { Label } from "@{{projectName}}/ui/components/label";

export default function SignUpForm({
    onSwitchToSignIn,
}: {
    onSwitchToSignIn: () => void;
}) {
    const navigate = useNavigate({
        from: "/",
    });

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
            name: "",
        },
        onSubmit: async ({ value }) => {
            await authClient.signUp.email(
                {
                    email: value.email,
                    password: value.password,
                    name: value.name,
                },
                {
                    onSuccess: () => {
                        navigate({
                            to: "/dashboard",
                        });
                        toast.success("Sign up successful");
                    },
                    onError: (error) => {
                        toast.error(error.error.message || error.error.statusText);
                    },
                },
            );
        },
        validators: {
            onSubmit: z.object({
                name: z.string().min(2, "Name must be at least 2 characters"),
                email: z.email("Invalid email address"),
                password: z.string().min(8, "Password must be at least 8 characters"),
            }),
        },
    });

    return (
        <div className="mx-auto w-full mt-10 max-w-md p-6">
            <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4"
            >
                <div>
                    <form.Field name="name">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Name</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error, index) => (
                                    <p key={\`\${field.name}-error-\${index}\`} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <div>
                    <form.Field name="email">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Email</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="email"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error, index) => (
                                    <p key={\`\${field.name}-error-\${index}\`} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <div>
                    <form.Field name="password">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Password</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error, index) => (
                                    <p key={\`\${field.name}-error-\${index}\`} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!canSubmit || isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Sign Up"}
                        </Button>
                    )}
                </form.Subscribe>
            </form>

            <div className="mt-4 text-center">
                <Button
                    variant="link"
                    onClick={onSwitchToSignIn}
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    Already have an account? Sign In
                </Button>
            </div>
        </div>
    );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-router/src/components/user-menu.tsx.hbs", `import { useNavigate } from "@tanstack/react-router";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@{{projectName}}/ui/components/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "@{{projectName}}/backend/convex/_generated/api";

import { Button } from "@{{projectName}}/ui/components/button";

export default function UserMenu() {
    const navigate = useNavigate();
    const user = useQuery(api.auth.getCurrentUser)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
                {user?.name}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>{user?.email}</DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                            authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        navigate({
                                            to: "/dashboard",
                                        });
                                    },
                                },
                            });
                        }}
                    >
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-router/src/lib/auth-client.ts.hbs", `import { createAuthClient } from "better-auth/react";
import {
	convexClient,
	crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
import { ENV } from "../env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";

export const authClient = createAuthClient({
	baseURL: ENV.VITE_CONVEX_SITE_URL,
	plugins: [convexClient(), crossDomainClient()],
});
`],
  ["auth/better-auth/convex/web/react/tanstack-router/src/routes/_auth/dashboard.tsx.hbs", `import UserMenu from "@/components/user-menu";
{{#if (eq payments "polar")}}
import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import { buttonVariants } from "@{{projectName}}/ui/components/button";
{{/if}}
import { api } from "@{{projectName}}/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardContent,
});

function DashboardContent() {
  const privateData = useQuery(api.privateData.get);
  {{#if (eq payments "polar")}}
  const products = useQuery(api.polar.listAllProducts);
  const subscription = useQuery(api.polar.getCurrentSubscription);

  const product = products?.find((product: { isRecurring?: boolean }) => product.isRecurring);
  const hasActiveSubscription = Boolean(subscription);
  {{/if}}

  return (
    <div>
      <h1>Dashboard</h1>
      <p>privateData: {privateData?.message}</p>
      {{#if (eq payments "polar")}}
      <p>Plan: {hasActiveSubscription ? "Active" : "Free"}</p>
      {subscription === undefined ? (
        <p>Loading subscription options...</p>
      ) : hasActiveSubscription ? (
        <CustomerPortalLink
          polarApi={api.polar}
          className={buttonVariants({ variant: "outline" })}
        >
          Manage Subscription
        </CustomerPortalLink>
      ) : products === undefined ? (
        <p>Loading subscription options...</p>
      ) : product ? (
        <CheckoutLink
          polarApi={api.polar}
          productIds={[product.id]}
          embed={false}
          className={buttonVariants({ variant: "default" })}
        >
          Upgrade
        </CheckoutLink>
      ) : (
        <p>No recurring plans available.</p>
      )}
      {{/if}}
      <UserMenu />
    </div>
  );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-router/src/routes/_auth/route.tsx.hbs", `import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useState } from "react";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <Authenticated>
        <Outlet />
      </Authenticated>
      <Unauthenticated>
        {showSignIn ? (
          <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
      </Unauthenticated>
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
    </>
  );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-start/src/components/sign-in-form.tsx.hbs", `import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@{{projectName}}/ui/components/button";
import { Input } from "@{{projectName}}/ui/components/input";
import { Label } from "@{{projectName}}/ui/components/label";

export default function SignInForm({
    onSwitchToSignUp,
}: {
    onSwitchToSignUp: () => void;
}) {
    const navigate = useNavigate({
        from: "/",
    });

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            await authClient.signIn.email(
                {
                    email: value.email,
                    password: value.password,
                },
                {
                    onSuccess: () => {
                        navigate({
                            to: "/dashboard",
                        });
                        toast.success("Sign in successful");
                    },
                    onError: (error) => {
                        toast.error(error.error.message || error.error.statusText);
                    },
                },
            );
        },
        validators: {
            onSubmit: z.object({
                email: z.email("Invalid email address"),
                password: z.string().min(8, "Password must be at least 8 characters"),
            }),
        },
    });

    return (
        <div className="mx-auto w-full mt-10 max-w-md p-6">
            <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4"
            >
                <div>
                    <form.Field name="email">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Email</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="email"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error) => (
                                    <p key={error?.message} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <div>
                    <form.Field name="password">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Password</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error) => (
                                    <p key={error?.message} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!canSubmit || isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Sign In"}
                        </Button>
                    )}
                </form.Subscribe>
            </form>

            <div className="mt-4 text-center">
                <Button
                    variant="link"
                    onClick={onSwitchToSignUp}
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    Need an account? Sign Up
                </Button>
            </div>
        </div>
    );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-start/src/components/sign-up-form.tsx.hbs", `import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@{{projectName}}/ui/components/button";
import { Input } from "@{{projectName}}/ui/components/input";
import { Label } from "@{{projectName}}/ui/components/label";

export default function SignUpForm({
    onSwitchToSignIn,
}: {
    onSwitchToSignIn: () => void;
}) {
    const navigate = useNavigate({
        from: "/",
    });

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
            name: "",
        },
        onSubmit: async ({ value }) => {
            await authClient.signUp.email(
                {
                    email: value.email,
                    password: value.password,
                    name: value.name,
                },
                {
                    onSuccess: () => {
                        navigate({
                            to: "/dashboard",
                        });
                        toast.success("Sign up successful");
                    },
                    onError: (error) => {
                        toast.error(error.error.message || error.error.statusText);
                    },
                },
            );
        },
        validators: {
            onSubmit: z.object({
                name: z.string().min(2, "Name must be at least 2 characters"),
                email: z.email("Invalid email address"),
                password: z.string().min(8, "Password must be at least 8 characters"),
            }),
        },
    });

    return (
        <div className="mx-auto w-full mt-10 max-w-md p-6">
            <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4"
            >
                <div>
                    <form.Field name="name">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Name</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error) => (
                                    <p key={error?.message} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <div>
                    <form.Field name="email">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Email</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="email"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error) => (
                                    <p key={error?.message} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <div>
                    <form.Field name="password">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Password</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.map((error) => (
                                    <p key={error?.message} className="text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>
                </div>

                <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!canSubmit || isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Sign Up"}
                        </Button>
                    )}
                </form.Subscribe>
            </form>

            <div className="mt-4 text-center">
                <Button
                    variant="link"
                    onClick={onSwitchToSignIn}
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    Already have an account? Sign In
                </Button>
            </div>
        </div>
    );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-start/src/components/user-menu.tsx.hbs", `import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@{{projectName}}/ui/components/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "@{{projectName}}/backend/convex/_generated/api";

import { Button } from "@{{projectName}}/ui/components/button";

export default function UserMenu() {
    const user = useQuery(api.auth.getCurrentUser)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
                {user?.name}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>{user?.email}</DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                            authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        location.reload();
                                    },
                                },
                            });
                        }}
                    >
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-start/src/lib/auth-client.ts.hbs", `import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});`],
  ["auth/better-auth/convex/web/react/tanstack-start/src/lib/auth-server.ts.hbs", `import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";
import { ENV } from "../env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";

export const {
	handler,
	getToken,
	fetchAuthQuery,
	fetchAuthMutation,
	fetchAuthAction,
} = convexBetterAuthReactStart({
	convexUrl: ENV.VITE_CONVEX_URL,
	convexSiteUrl: ENV.VITE_CONVEX_SITE_URL,
});
`],
  ["auth/better-auth/convex/web/react/tanstack-start/src/routes/_auth/dashboard.tsx.hbs", `import UserMenu from "@/components/user-menu";
{{#if (eq payments "polar")}}
import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import { buttonVariants } from "@{{projectName}}/ui/components/button";
{{/if}}
import { api } from "@{{projectName}}/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardContent,
});

function DashboardContent() {
  const privateData = useQuery(api.privateData.get);
  {{#if (eq payments "polar")}}
  const products = useQuery(api.polar.listAllProducts);
  const subscription = useQuery(api.polar.getCurrentSubscription);

  const product = products?.find((product: { isRecurring?: boolean }) => product.isRecurring);
  const hasActiveSubscription = Boolean(subscription);
  {{/if}}

  return (
    <div>
      <h1>Dashboard</h1>
      <p>privateData: {privateData?.message}</p>
      {{#if (eq payments "polar")}}
      <p>Plan: {hasActiveSubscription ? "Active" : "Free"}</p>
      {subscription === undefined ? (
        <p>Loading subscription options...</p>
      ) : hasActiveSubscription ? (
        <CustomerPortalLink
          polarApi={api.polar}
          className={buttonVariants({ variant: "outline" })}
        >
          Manage Subscription
        </CustomerPortalLink>
      ) : products === undefined ? (
        <p>Loading subscription options...</p>
      ) : product ? (
        <CheckoutLink
          polarApi={api.polar}
          productIds={[product.id]}
          embed={false}
          className={buttonVariants({ variant: "default" })}
        >
          Upgrade
        </CheckoutLink>
      ) : (
        <p>No recurring plans available.</p>
      )}
      {{/if}}
      <UserMenu />
    </div>
  );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-start/src/routes/_auth/route.tsx.hbs", `import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useState } from "react";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <Authenticated>
        <Outlet />
      </Authenticated>
      <Unauthenticated>
        {showSignIn ? (
          <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
      </Unauthenticated>
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
    </>
  );
}
`],
  ["auth/better-auth/convex/web/react/tanstack-start/src/routes/api/auth/$.ts.hbs", `import { createFileRoute } from "@tanstack/react-router";
import { handler } from "@/lib/auth-server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
});
`],
  ["auth/better-auth/fullstack/tanstack-start/src/routes/api/auth/$.ts.hbs", `{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
import { createAuth } from '@{{projectName}}/auth'
{{else}}
import { auth } from '@{{projectName}}/auth'
{{/if}}
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
        const auth = await createAuth()
        {{/if}}
        return auth.handler(request)
      },
      POST: async ({ request }) => {
        {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
        const auth = await createAuth()
        {{/if}}
        return auth.handler(request)
      },
    },
  },
})
`],
  ["auth/better-auth/server/base/_gitignore", `# dependencies (bun install)
node_modules

# output
out
dist
*.tgz

# code coverage
coverage
*.lcov

# logs
logs
_.log
report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# caches
.eslintcache
.cache
*.tsbuildinfo

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store
`],
  ["auth/better-auth/server/base/package.json.hbs", `{
  "name": "@{{projectName}}/auth",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  },
  "type": "module",
  "scripts": {
    {{#if (eq api "orpc")}}
    "build": "tsc -b",
    "check-types": "tsc -b"
    {{else}}
    "check-types": "tsc --noEmit"
    {{/if}}
  },
  "devDependencies": {}
}`],
  ["auth/better-auth/server/base/src/index.ts.hbs", `{{#if (or (eq orm "drizzle") (eq orm "prisma") (eq orm "mongoose"))}}
import { betterAuth } from "better-auth/minimal";
{{else}}
import { betterAuth } from "better-auth";
{{/if}}
{{#if (eq orm "prisma")}}
import { prismaAdapter } from "better-auth/adapters/prisma";
{{else if (eq orm "drizzle")}}
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import * as schema from "@{{projectName}}/db/schema/auth";
{{else if (eq orm "mongoose")}}
import { mongodbAdapter } from "better-auth/adapters/mongodb";
{{/if}}
{{#if (ne database "none")}}
import type { Database } from "@{{projectName}}/db";
{{/if}}
{{#if (eq payments "polar")}}
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { createPolarClient } from "./lib/payments";
{{/if}}

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
{{#if (ne backend "self")}}
  CORS_ORIGIN: string;
{{/if}}
{{#if (eq payments "polar")}}
  POLAR_ACCESS_TOKEN: string;
  POLAR_SUCCESS_URL: string;
{{/if}}
};

export function createAuth(env: AuthConfig{{#if (ne database "none")}}, database: Database{{/if}}{{#if (ne backend "self")}}, desktopOrigins: readonly string[] = []{{/if}}) {
  return betterAuth({
{{#if (eq orm "prisma")}}
    database: prismaAdapter(database, {
      provider: "{{#if (eq database "postgres")}}postgresql{{else}}{{database}}{{/if}}",
    }),
{{else if (eq orm "drizzle")}}
    database: drizzleAdapter(database, {
      provider: "{{#if (eq database "postgres")}}pg{{else}}{{database}}{{/if}}",
      schema,
    }),
{{else if (eq orm "mongoose")}}
    database: mongodbAdapter(database),
{{/if}}
    trustedOrigins: [
      {{#if (eq backend "self")}}env.BETTER_AUTH_URL{{else}}env.CORS_ORIGIN,
      ...desktopOrigins{{/if}},
    ],
    emailAndPassword: { enabled: true },
{{#if (ne database "none")}}
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Revoked sessions may remain active until this cache expires.
      },
    },
{{/if}}
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
{{#if (ne backend "self")}}
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
{{/if}}
    plugins: [
{{#if (eq payments "polar")}}
      polar({
        client: createPolarClient(env),
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [{ productId: "your-product-id", slug: "pro" }],
            successUrl: env.POLAR_SUCCESS_URL,
            authenticatedUsersOnly: true,
          }),
          portal(),
        ],
      }),
{{/if}}
    ],
  });
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
`],
  ["auth/better-auth/server/base/tsconfig.json.hbs", `{
  "extends": "@{{projectName}}/config/tsconfig.base.json",
  {{#if (eq api "orpc")}}
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "references": [{{#if (ne database "none")}}{ "path": "../db" }{{/if}}]
  {{else}}
  "compilerOptions": {
    "noEmit": true
  }
  {{/if}}
}
`],
  ["auth/better-auth/server/db/drizzle/mysql/src/schema/auth.ts.hbs", `import { defineRelationsPart } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = mysqlTable(
  "session",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = mysqlTable(
  "account",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = mysqlTable(
  "verification",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const authRelations = defineRelationsPart(
  { user, session, account, verification },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
  }),
);
`],
  ["auth/better-auth/server/db/drizzle/postgres/src/schema/auth.ts.hbs", `import { defineRelationsPart } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const authRelations = defineRelationsPart(
  { user, session, account, verification },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
  }),
);
`],
  ["auth/better-auth/server/db/drizzle/sqlite/src/schema/auth.ts.hbs", `import { defineRelationsPart, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql\`(cast(unixepoch('subsecond') * 1000 as integer))\`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql\`(cast(unixepoch('subsecond') * 1000 as integer))\`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql\`(cast(unixepoch('subsecond') * 1000 as integer))\`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql\`(cast(unixepoch('subsecond') * 1000 as integer))\`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql\`(cast(unixepoch('subsecond') * 1000 as integer))\`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql\`(cast(unixepoch('subsecond') * 1000 as integer))\`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const authRelations = defineRelationsPart(
  { user, session, account, verification },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
  }),
);
`],
  ["auth/better-auth/server/db/mongoose/mongodb/src/models/auth.model.ts.hbs", `import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const userSchema = new Schema(
    {
        _id: { type: ObjectId, auto: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        emailVerified: { type: Boolean, required: true, default: false },
        image: { type: String },
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now },
    },
    { collection: 'user' }
);

const sessionSchema = new Schema(
    {
        _id: { type: ObjectId, auto: true },
        expiresAt: { type: Date, required: true },
        token: { type: String, required: true, unique: true },
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now },
        ipAddress: { type: String },
        userAgent: { type: String },
        userId: { type: ObjectId, ref: 'User', required: true },
    },
    { collection: 'session' }
);
sessionSchema.index({ userId: 1 });

const accountSchema = new Schema(
    {
        _id: { type: ObjectId, auto: true },
        accountId: { type: String, required: true },
        providerId: { type: String, required: true },
        userId: { type: ObjectId, ref: 'User', required: true },
        accessToken: { type: String },
        refreshToken: { type: String },
        idToken: { type: String },
        accessTokenExpiresAt: { type: Date },
        refreshTokenExpiresAt: { type: Date },
        scope: { type: String },
        password: { type: String },
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now },
    },
    { collection: 'account' }
);
accountSchema.index({ providerId: 1, accountId: 1 }, { unique: true });
accountSchema.index({ userId: 1 });

const verificationSchema = new Schema(
    {
        _id: { type: ObjectId, auto: true },
        identifier: { type: String, required: true },
        value: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now },
    },
    { collection: 'verification' }
);
verificationSchema.index({ identifier: 1 });

const User = model('User', userSchema);
const Session = model('Session', sessionSchema);
const Account = model('Account', accountSchema);
const Verification = model('Verification', verificationSchema);

export { User, Session, Account, Verification };
`],
  ["auth/better-auth/server/db/prisma/mongodb/prisma/schema/auth.prisma.hbs", `model User {
  id            String    @id @map("_id")
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id @map("_id")
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id @map("_id")
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id @map("_id")
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}
`],
  ["auth/better-auth/server/db/prisma/mysql/prisma/schema/auth.prisma.hbs", `model User {
  id            String    @id
  name          String    @db.Text
  email         String
  emailVerified Boolean   @default(false)
  image         String?   @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?  @db.Text
  userAgent String?  @db.Text
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId(length: 191)])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String    @db.Text
  providerId            String    @db.Text
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?   @db.Text
  refreshToken          String?   @db.Text
  idToken               String?   @db.Text
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?   @db.Text
  password              String?   @db.Text
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId(length: 191)])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String   @db.Text
  value      String   @db.Text
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier(length: 191)])
  @@map("verification")
}
`],
  ["auth/better-auth/server/db/prisma/postgres/prisma/schema/auth.prisma.hbs", `model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}
`],
  ["auth/better-auth/server/db/prisma/sqlite/prisma/schema/auth.prisma.hbs", `model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}
`],
  ["auth/better-auth/web/react/base/src/lib/auth-client.ts.hbs", `import { createAuthClient } from "better-auth/react";
{{#if (eq payments "polar")}}
import { polarClient } from "@polar-sh/better-auth/client";
{{/if}}
{{#unless (eq backend "self")}}
import { ENV } from "../env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";

{{> getServerUrl}}
{{/unless}}

export const authClient = createAuthClient({
{{#unless (eq backend "self")}}
{{#if (and (eq webDeploy serverDeploy) (or (eq webDeploy "vercel") (eq webDeploy "docker")))}}
  baseURL: new URL("/api/auth", getServerUrl(ENV.VITE_SERVER_URL)).toString(),
{{else}}
  baseURL: ENV.VITE_SERVER_URL,
{{/if}}
{{/unless}}
{{#if (eq payments "polar")}}
	plugins: [polarClient()]
{{/if}}
});
`],
  ["auth/better-auth/web/react/tanstack-router/src/components/sign-in-form.tsx.hbs", `import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "@{{projectName}}/ui/components/button";
import { Input } from "@{{projectName}}/ui/components/input";
import { Label } from "@{{projectName}}/ui/components/label";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignUp}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Need an account? Sign Up
        </Button>
      </div>
    </div>
  );
}
`],
  ["auth/better-auth/web/react/tanstack-router/src/components/sign-up-form.tsx.hbs", `import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "@{{projectName}}/ui/components/button";
import { Input } from "@{{projectName}}/ui/components/input";
import { Label } from "@{{projectName}}/ui/components/label";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Sign Up"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Already have an account? Sign In
        </Button>
      </div>
    </div>
  );
}
`],
  ["auth/better-auth/web/react/tanstack-router/src/components/user-menu.tsx.hbs", `import { Link, useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@{{projectName}}/ui/components/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "@{{projectName}}/ui/components/button";
import { Skeleton } from "@{{projectName}}/ui/components/skeleton";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        {session.user.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({
                      to: "/",
                    });
                  },
                },
              });
            }}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`],
  ["auth/better-auth/web/react/tanstack-router/src/routes/_auth/dashboard.tsx.hbs", `{{#if (eq payments "polar")}}
import { Button } from "@{{projectName}}/ui/components/button";
import { authClient } from "@/lib/auth-client";
{{/if}}
{{#if (eq api "orpc")}}
import { orpc } from "@/utils/orpc";
{{/if}}
{{#if (eq api "trpc")}}
import { trpc } from "@/utils/trpc";
{{/if}}
{{#if (or (eq api "orpc") (eq api "trpc"))}}
import { useQuery } from "@tanstack/react-query";
{{/if}}
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const { session{{#if (eq payments "polar")}}, customerState{{/if}} } = Route.useRouteContext();

	{{#if (eq api "orpc")}}
	const privateData = useQuery(orpc.privateData.queryOptions());
	{{/if}}
	{{#if (eq api "trpc")}}
	const privateData = useQuery(trpc.privateData.queryOptions());
	{{/if}}

	{{#if (eq payments "polar")}}
	const hasProSubscription = (customerState?.active_subscriptions?.length ?? 0) > 0;
	{{/if}}

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session.data?.user.name}</p>
			{{#if (or (eq api "orpc") (eq api "trpc"))}}
			<p>API: {privateData.data?.message}</p>
			{{/if}}
			{{#if (eq payments "polar")}}
			<p>Plan: {hasProSubscription ? "Pro" : "Free"}</p>
			{hasProSubscription ? (
				<Button onClick={async () => await authClient.customer.portal()}>
					Manage Subscription
				</Button>
			) : (
				<Button onClick={async () => await authClient.checkout({ slug: "pro" })}>
					Upgrade to Pro
				</Button>
			)}
			{{/if}}
		</div>
	);
}
`],
  ["auth/better-auth/web/react/tanstack-router/src/routes/_auth/route.tsx.hbs", `import { authClient } from "@/lib/auth-client";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({
				to: "/login",
			});
		}
		{{#if (eq payments "polar")}}
		const { data: customerState } = await authClient.customer.state();
		return { session, customerState };
		{{else}}
		return { session };
		{{/if}}
	},
});

function AuthLayout() {
	return <Outlet />;
}
`],
  ["auth/better-auth/web/react/tanstack-router/src/routes/login.tsx.hbs", `import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
`],
  ["auth/better-auth/web/react/tanstack-start/src/components/sign-in-form.tsx.hbs", `import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "@{{projectName}}/ui/components/button";
import { Input } from "@{{projectName}}/ui/components/input";
import { Label } from "@{{projectName}}/ui/components/label";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignUp}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Need an account? Sign Up
        </Button>
      </div>
    </div>
  );
}
`],
  ["auth/better-auth/web/react/tanstack-start/src/components/sign-up-form.tsx.hbs", `import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "@{{projectName}}/ui/components/button";
import { Input } from "@{{projectName}}/ui/components/input";
import { Label } from "@{{projectName}}/ui/components/label";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Sign Up"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Already have an account? Sign In
        </Button>
      </div>
    </div>
  );
}
`],
  ["auth/better-auth/web/react/tanstack-start/src/components/user-menu.tsx.hbs", `import { Link, useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@{{projectName}}/ui/components/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "@{{projectName}}/ui/components/button";
import { Skeleton } from "@{{projectName}}/ui/components/skeleton";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        {session.user.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({
                      to: "/",
                    });
                  },
                },
              });
            }}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`],
  ["auth/better-auth/web/react/tanstack-start/src/functions/get-user.ts.hbs", `import { authMiddleware } from "@/middleware/auth";
import { createServerFn } from "@tanstack/react-start";

export const getUser = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
    return context.session
})`],
  ["auth/better-auth/web/react/tanstack-start/src/middleware/auth.ts.hbs", `{{#if (eq backend "self")}}
{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
import { createAuth } from "@{{projectName}}/auth";
{{else}}
import { auth } from "@{{projectName}}/auth";
{{/if}}
import { createMiddleware } from "@tanstack/react-start";


export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
    const session = await {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}(await createAuth()){{else}}auth{{/if}}.api.getSession({
        headers: request.headers,
    })
    return next({
        context: { session }
    })
})
{{else}}
import { authClient } from "@/lib/auth-client";
import { createMiddleware } from "@tanstack/react-start";

export const authMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const session = await authClient.getSession({
			fetchOptions: {
				headers: request.headers,
				throw: true
			}
		})
		return next({
			context: { session },
		});
	},
);
{{/if}}
`],
  ["auth/better-auth/web/react/tanstack-start/src/routes/_auth/dashboard.tsx.hbs", `{{#if (eq payments "polar") }}
import { Button } from "@{{projectName}}/ui/components/button";
import { authClient } from "@/lib/auth-client";
{{/if}}
{{#if (eq api "trpc") }}
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
{{/if}}
{{#if (eq api "orpc") }}
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
{{/if}}
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session{{#if (eq payments "polar") }}, customerState{{/if}} } = Route.useRouteContext();

  {{#if (eq api "trpc") }}
  const trpc = useTRPC();
  const privateData = useQuery(trpc.privateData.queryOptions());
  {{/if}}
  {{#if (eq api "orpc") }}
  const privateData = useQuery(orpc.privateData.queryOptions());
  {{/if}}

  {{#if (eq payments "polar") }}
  const hasProSubscription = (customerState?.active_subscriptions?.length ?? 0) > 0;
  {{/if}}

  return (
    <div>
      <h1>Dashboard</h1>
      {{#if (eq backend "self")}}
      <p>Welcome {session?.user.name}</p>
      {{else}}
      <p>Welcome {session.data?.user.name}</p>
      {{/if}}
      {{#if (eq api "trpc") }}
      <p>API: {privateData.data?.message}</p>
      {{else if (eq api "orpc") }}
      <p>API: {privateData.data?.message}</p>
      {{/if}}
      {{#if (eq payments "polar") }}
      <p>Plan: {hasProSubscription ? "Pro" : "Free"}</p>
      {hasProSubscription ? (
        <Button
          onClick={async function handlePortal() {
            await authClient.customer.portal();
          }}
        >
          Manage Subscription
        </Button>
      ) : (
        <Button
          onClick={async function handleUpgrade() {
            await authClient.checkout({ slug: "pro" });
          }}
        >
          Upgrade to Pro
        </Button>
      )}
      {{/if}}
    </div>
  );
}
`],
  ["auth/better-auth/web/react/tanstack-start/src/routes/_auth/route.tsx.hbs", `{{#if (eq backend "self")}}
import { getUser } from "@/functions/get-user";
{{else}}
import { authClient } from "@/lib/auth-client";
{{/if}}
{{#if (and (eq backend "self") (eq payments "polar"))}}
import { getPayment } from "@/functions/get-payment";
{{/if}}
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  {{#unless (eq backend "self")}}
  ssr: false,
  {{/unless}}
  component: AuthLayout,
  beforeLoad: async () => {
    {{#if (eq backend "self")}}
    const session = await getUser();
    if (!session) {
      throw redirect({
        to: "/login",
      });
    }
    {{#if (eq payments "polar") }}
    const customerState = await getPayment();
    return { session, customerState };
    {{else}}
    return { session };
    {{/if}}
    {{else}}
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
      });
    }
    {{#if (eq payments "polar") }}
    const { data: customerState } = await authClient.customer.state();
    return { session, customerState };
    {{else}}
    return { session };
    {{/if}}
    {{/if}}
  },
  {{#if (eq backend "self")}}
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
  {{/if}}
});

function AuthLayout() {
  return <Outlet />;
}
`],
  ["auth/better-auth/web/react/tanstack-start/src/routes/login.tsx.hbs", `import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
`],
  ["auth/clerk/convex/backend/convex/auth.config.ts.hbs", `import type { AuthConfig } from "convex/server";

export default {
	providers: [
		{
			// Clerk Frontend API URL from the Convex integration in the Clerk Dashboard.
			// Set CLERK_JWT_ISSUER_DOMAIN on the Convex deployment (npx convex env set).
			// See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
			domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
			applicationID: "convex",
		},
	],
} satisfies AuthConfig;
`],
  ["auth/clerk/convex/backend/convex/privateData.ts.hbs", `import { query } from "./_generated/server";

export const get = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			return {
				message: "Not authenticated",
			};
		}
		return {
			message: "This is private",
		};
	},
});
`],
  ["auth/clerk/convex/web/react/tanstack-router/src/routes/_auth/dashboard.tsx.hbs", `import { UserButton, useUser } from "@clerk/react";
import { api } from "@{{projectName}}/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const privateData = useQuery(api.privateData.get);
	const user = useUser();

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {user.user?.fullName}</p>
			<p>privateData: {privateData?.message}</p>
			<UserButton />
		</div>
	);
}
`],
  ["auth/clerk/convex/web/react/tanstack-router/src/routes/_auth/route.tsx.hbs", `import { SignInButton } from "@clerk/react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<>
			<Authenticated>
				<Outlet />
			</Authenticated>
			<Unauthenticated>
				<SignInButton />
			</Unauthenticated>
			<AuthLoading>
				<div>Loading...</div>
			</AuthLoading>
		</>
	);
}
`],
  ["auth/clerk/convex/web/react/tanstack-start/src/routes/_auth/dashboard.tsx.hbs", `import { UserButton, useUser } from "@clerk/tanstack-react-start";
import { api } from "@{{projectName}}/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const privateData = useQuery(api.privateData.get);
	const user = useUser();

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {user.user?.fullName}</p>
			<p>privateData: {privateData?.message}</p>
			<UserButton />
		</div>
	);
}
`],
  ["auth/clerk/convex/web/react/tanstack-start/src/routes/_auth/route.tsx.hbs", `import { SignInButton } from "@clerk/tanstack-react-start";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<>
			<Authenticated>
				<Outlet />
			</Authenticated>
			<Unauthenticated>
				<SignInButton />
			</Unauthenticated>
			<AuthLoading>
				<div>Loading...</div>
			</AuthLoading>
		</>
	);
}
`],
  ["auth/clerk/convex/web/react/tanstack-start/src/start.ts.hbs", `import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [clerkMiddleware()],
	}
})`],
  ["auth/clerk/web/react/base/src/utils/clerk-auth.ts.hbs", `type ClerkTokenGetter = () => Promise<string | null>;

let clerkTokenGetter: ClerkTokenGetter | null = null;

export function setClerkAuthTokenGetter(getToken: ClerkTokenGetter | null) {
	clerkTokenGetter = getToken;
}

export async function getClerkAuthToken() {
	return (await clerkTokenGetter?.()) ?? null;
}
`],
  ["auth/clerk/web/react/tanstack-router/src/routes/_auth/dashboard.tsx.hbs", `{{#if (eq api "orpc")}}
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
{{/if}}
{{#if (eq api "trpc")}}
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
{{/if}}
import { UserButton, useUser } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const user = useUser();
	const nameFromParts = [user.user?.firstName, user.user?.lastName].filter(Boolean).join(" ");
	const displayName =
		user.user?.fullName ||
		nameFromParts ||
		user.user?.username ||
		user.user?.primaryEmailAddress?.emailAddress ||
		user.user?.primaryPhoneNumber?.phoneNumber ||
		"User";
	{{#if (eq api "orpc")}}
	const privateData = useQuery({
		...orpc.privateData.queryOptions(),
		enabled: user.isLoaded && !!user.user,
	});
	{{/if}}
	{{#if (eq api "trpc")}}
	const privateData = useQuery({
		...trpc.privateData.queryOptions(),
		enabled: user.isLoaded && !!user.user,
	});
	{{/if}}

	return (
		<div className="space-y-4 p-6">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<p>Welcome {displayName}</p>
			{{#if (or (eq api "orpc") (eq api "trpc"))}}
			<p>API: {privateData.data?.message}</p>
			{{/if}}
			<UserButton />
		</div>
	);
}
`],
  ["auth/clerk/web/react/tanstack-router/src/routes/_auth/route.tsx.hbs", `import { SignInButton, useUser } from "@clerk/react";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
});

function AuthLayout() {
	const user = useUser();

	if (!user.isLoaded) {
		return <div className="p-6">Loading...</div>;
	}

	if (!user.user) {
		return (
			<div className="p-6">
				<SignInButton />
			</div>
		);
	}

	return <Outlet />;
}
`],
  ["auth/clerk/web/react/tanstack-start/src/routes/_auth/dashboard.tsx.hbs", `{{#if (eq api "trpc")}}
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
{{/if}}
{{#if (eq api "orpc")}}
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
{{/if}}
import { UserButton, useUser } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const user = useUser();
	const nameFromParts = [user.user?.firstName, user.user?.lastName].filter(Boolean).join(" ");
	const displayName =
		user.user?.fullName ||
		nameFromParts ||
		user.user?.username ||
		user.user?.primaryEmailAddress?.emailAddress ||
		user.user?.primaryPhoneNumber?.phoneNumber ||
		"User";
	{{#if (eq api "trpc")}}
	const trpc = useTRPC();
	const privateData = useQuery({
		...trpc.privateData.queryOptions(),
		enabled: user.isLoaded && !!user.user,
	});
	{{/if}}
	{{#if (eq api "orpc")}}
	const privateData = useQuery({
		...orpc.privateData.queryOptions(),
		enabled: user.isLoaded && !!user.user,
	});
	{{/if}}

	return (
		<div className="space-y-4 p-6">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<p>Welcome {displayName}</p>
			{{#if (or (eq api "orpc") (eq api "trpc"))}}
			<p>API: {privateData.data?.message}</p>
			{{/if}}
			<UserButton />
		</div>
	);
}
`],
  ["auth/clerk/web/react/tanstack-start/src/routes/_auth/route.tsx.hbs", `import { SignInButton, useUser } from "@clerk/tanstack-react-start";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
});

function AuthLayout() {
	const user = useUser();

	if (!user.isLoaded) {
		return <div className="p-6">Loading...</div>;
	}

	if (!user.user) {
		return (
			<div className="p-6">
				<SignInButton />
			</div>
		);
	}

	return <Outlet />;
}
`],
  ["auth/clerk/web/react/tanstack-start/src/start.ts.hbs", `import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [clerkMiddleware()],
	}
})
`],
  ["backend/convex/packages/backend/_gitignore", `
.env.local
`],
  ["backend/convex/packages/backend/convex/_generated/api.d.ts", `/* eslint-disable */
export declare const api: any;
export declare const internal: any;
export declare const components: any;
`],
  ["backend/convex/packages/backend/convex/_generated/api.js", `/* eslint-disable */
import { anyApi, componentsGeneric } from "convex/server";

export const api = anyApi;
export const internal = anyApi;
export const components = componentsGeneric();
`],
  ["backend/convex/packages/backend/convex/_generated/dataModel.d.ts", `/* eslint-disable */
import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  SystemTableNames,
  TableNamesInDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";

import schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type TableNames = TableNamesInDataModel<DataModel>;
export type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>;
export type Id<TableName extends TableNames | SystemTableNames> = GenericId<TableName>;
`],
  ["backend/convex/packages/backend/convex/_generated/server.d.ts", `/* eslint-disable */
import type {
  ActionBuilder,
  GenericActionCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
  GenericMutationCtx,
  GenericQueryCtx,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
} from "convex/server";

import type { DataModel } from "./dataModel.js";

export declare const query: QueryBuilder<DataModel, "public">;
export declare const internalQuery: QueryBuilder<DataModel, "internal">;
export declare const mutation: MutationBuilder<DataModel, "public">;
export declare const internalMutation: MutationBuilder<DataModel, "internal">;
export declare const action: ActionBuilder<DataModel, "public">;
export declare const internalAction: ActionBuilder<DataModel, "internal">;
export declare const httpAction: HttpActionBuilder;

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;
export type DatabaseReader = GenericDatabaseReader<DataModel>;
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;
`],
  ["backend/convex/packages/backend/convex/_generated/server.js", `/* eslint-disable */
import {
  actionGeneric,
  httpActionGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";

export const query = queryGeneric;
export const internalQuery = internalQueryGeneric;
export const mutation = mutationGeneric;
export const internalMutation = internalMutationGeneric;
export const action = actionGeneric;
export const internalAction = internalActionGeneric;
export const httpAction = httpActionGeneric;
`],
  ["backend/convex/packages/backend/convex/convex.config.ts.hbs", `import { defineApp } from "convex/server";
{{#if (eq auth "better-auth")}}
import betterAuth from "@convex-dev/better-auth/convex.config";
{{/if}}
{{#if (eq payments "polar")}}
import polar from "@convex-dev/polar/convex.config.js";
{{/if}}
{{#if (includes examples "ai")}}
import agent from "@convex-dev/agent/convex.config";
{{/if}}

const app = defineApp();
{{#if (eq auth "better-auth")}}
app.use(betterAuth);
{{/if}}
{{#if (eq payments "polar")}}
app.use(polar);
{{/if}}
{{#if (includes examples "ai")}}
app.use(agent);
{{/if}}

export default app;
`],
  ["backend/convex/packages/backend/convex/healthCheck.ts.hbs", `import { query } from "./_generated/server";

export const get = query({
  handler: async () => {
    return "OK";
  },
});
`],
  ["backend/convex/packages/backend/convex/README.md", `# Welcome to your Convex functions directory!

Write your Convex functions here.
See https://docs.convex.dev/functions for more.

A query function that takes two arguments looks like:

\`\`\`ts
// convex/myFunctions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    const documents = await ctx.db.query("tablename").collect();

    // Arguments passed from the client are properties of the args object.
    console.log(args.first, args.second);

    // Write arbitrary JavaScript here: filter, aggregate, build derived data,
    // remove non-public properties, or create new objects.
    return documents;
  },
});
\`\`\`

Using this query function in a React component looks like:

\`\`\`ts
const data = useQuery(api.myFunctions.myQueryFunction, {
  first: 10,
  second: "hello",
});
\`\`\`

A mutation function looks like:

\`\`\`ts
// convex/myFunctions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    first: v.string(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);

    // Optionally, return a value from your mutation.
    return await ctx.db.get("messages", id);
  },
});
\`\`\`

Using this mutation function in a React component looks like:

\`\`\`ts
const mutation = useMutation(api.myFunctions.myMutationFunction);
function handleButtonPress() {
  // fire and forget, the most common way to use mutations
  mutation({ first: "Hello!", second: "me" });
  // OR
  // use the result once the mutation has completed
  mutation({ first: "Hello!", second: "me" }).then((result) => console.log(result));
}
\`\`\`

Use the Convex CLI to push your functions to a deployment. See everything
the Convex CLI can do by running \`npx convex -h\` in your project root
directory. To learn more, launch the docs with \`npx convex docs\`.
`],
  ["backend/convex/packages/backend/convex/schema.ts.hbs", `import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
{{#if (includes examples "todo")}}
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
{{/if}}
});
`],
  ["backend/convex/packages/backend/convex/tsconfig.json.hbs", `{
  /* This TypeScript project config describes the environment that
   * Convex functions run in and is used to typecheck them.
   * You can modify it, but some settings are required to use Convex.
   */
  "compilerOptions": {
    /* These settings are not required by Convex and can be modified. */
    "allowJs": true,
    "strict": true,
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"],

    /* These compiler options are required by Convex */
    "target": "ESNext",
    "lib": ["ES2021", "dom"],
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["./**/*"],
  "exclude": ["./_generated"]
}
`],
  ["backend/convex/packages/backend/package.json.hbs", `{
  "name": "@{{projectName}}/backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "convex dev",
    "dev:setup": "convex dev --configure --until-success"
  },
  "author": "",
  "license": "ISC",
  "description": "",
  "devDependencies": {
    "@types/node": "^26.6.4"
  },
  "dependencies": {}
}
`],
  ["backend/server/base/_gitignore", `# prod
dist/
/build
/out/

# dev
.yarn/
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions
.vscode/*
!.vscode/launch.json
!.vscode/*.code-snippets
.idea/workspace.xml
.idea/usage.statistics.xml
.idea/shelf
.wrangler
.alchemy
/.next/
.vercel
prisma/generated/


# deps
node_modules/
/node_modules
/.pnp
.pnp.*

# env
.env*
.env.production
!.env.example
.dev.vars

# logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# misc
.DS_Store
*.pem

# local db
*.db*

# typescript
*.tsbuildinfo
next-env.d.ts
`],
  ["backend/server/base/package.json.hbs", `{
	"name": "server",
	"main": "src/index.ts",
	"type": "module",
	"scripts": {
		"build": "{{#if (and (eq api "orpc") (ne backend "convex") (ne backend "none"))}}tsc -b ../../packages/api && {{/if}}tsdown",
		"check-types": "{{#if (and (eq api "orpc") (ne backend "convex") (ne backend "none"))}}tsc -b ../../packages/api && {{/if}}tsc --noEmit",
		"compile": "bun build --compile --no-compile-autoload-dotenv --minify --sourcemap --bytecode ./src/index.ts --outfile server"
	},
	"dependencies": {},
	{{#if (eq dbSetup 'supabase')}}
	"trustedDependencies": [
        "supabase"
    ],
    {{/if}}
	"devDependencies": {}
}
`],
  ["backend/server/base/tsconfig.json.hbs", `{
  "extends": "@{{projectName}}/config/tsconfig.base.json",
  {{#if (eq api "orpc")}}
  "references": [{ "path": "../../packages/api" }],
  {{/if}}
  "compilerOptions": {
    "noEmit": true,
		"paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "react-jsx"{{#if (eq backend "hono")}},
    "jsxImportSource": "hono/jsx"{{/if}}
  }
}
`],
  ["backend/server/base/tsdown.config.ts.hbs", `import { defineConfig } from "tsdown";
{{#if (and (eq runtime "workers") (eq orm "prisma"))}}
import { unwasm } from "unwasm/plugin";
{{/if}}

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
  clean: true,
  {{#if (and (eq runtime "workers") (eq orm "prisma"))}}
  plugins: [unwasm({ esmImport: true })],
  {{/if}}
  deps: {
    alwaysBundle: [/@{{projectName}}\\/.*/],
    {{#if (eq runtime "workers")}}
    neverBundle: ["cloudflare:workers"],
    {{/if}}
  },
});
`],
  ["backend/server/elysia/src/index.ts.hbs", `{{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}import { desktopOrigins, ENV } from "./env.server";{{else}}import { ENV } from "./env.server";{{/if}}
{{#if (eq runtime "node")}}
import { node } from "@elysiajs/node";
{{/if}}
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
{{#if (includes examples "ai")}}
import { google } from "@ai-sdk/google";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage, wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
{{/if}}
{{#if (eq api "trpc")}}
import { createContext } from "@{{projectName}}/api/context";
import { appRouter } from "@{{projectName}}/api/routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
{{/if}}
{{#if (eq api "orpc")}}
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { appRouter } from "@{{projectName}}/api/routers/index";
import { createContext } from "@{{projectName}}/api/context";
{{/if}}
{{#if (eq auth "better-auth")}}
import { auth } from "@{{projectName}}/auth";
{{/if}}

{{#if (eq api "orpc")}}
const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});
const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});
{{/if}}

{{#if (eq serverDeploy "vercel")}}const app = {{/if}}{{#if (eq runtime "node")}}new Elysia({ adapter: node() }){{else}}new Elysia(){{/if}}
	.use(
		cors({
			origin: {{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}[ENV.CORS_ORIGIN, ...desktopOrigins]{{else}}ENV.CORS_ORIGIN{{/if}},
			methods: ["GET", "POST", "OPTIONS"],
{{#if (or (eq auth "better-auth") (eq auth "clerk"))}}
			allowedHeaders: ["Content-Type", "Authorization"],
{{/if}}
{{#if (eq auth "better-auth")}}
			credentials: true,
{{/if}}
		}),
	)
{{#if (eq auth "better-auth")}}
	.all("/api/auth/*", async (context) => {
		const { request, status } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		return status(405)
	})
{{/if}}
{{#if (eq api "orpc")}}
	.all(
		"{{apiPrefix webDeploy serverDeploy}}/rpc*",
		async (context) => {
			const { response } = await rpcHandler.handle(context.request, {
				prefix: "{{apiPrefix webDeploy serverDeploy}}/rpc",
				context: await createContext({ context }),
			});
			return response ?? new Response("Not Found", { status: 404 });
		},
		{
			parse: "none",
		}
	)
	.all(
		"{{apiPrefix webDeploy serverDeploy}}/api-reference*",
		async (context) => {
			const { response } = await apiHandler.handle(context.request, {
				prefix: "{{apiPrefix webDeploy serverDeploy}}/api-reference",
				context: await createContext({ context }),
			});
			return response ?? new Response("Not Found", { status: 404 });
		},
		{
			parse: "none",
		}
	)
{{/if}}
{{#if (eq api "trpc")}}
	.all("{{apiPrefix webDeploy serverDeploy}}/trpc/*", async (context) => {
		const res = await fetchRequestHandler({
			endpoint: "{{apiPrefix webDeploy serverDeploy}}/trpc",
			router: appRouter,
			req: context.request,
			createContext: () => createContext({ context }),
		});
		return res;
	})
{{/if}}
{{#if (includes examples "ai")}}
	.post("{{apiPrefix webDeploy serverDeploy}}/ai", async (context) => {
		const body = (await context.request.json()) as { messages?: UIMessage[] };
		const uiMessages = body.messages || [];
		const model = wrapLanguageModel({
			model: google("gemini-2.5-flash"),
			middleware: devToolsMiddleware(),
		});
		const result = streamText({
			model,
			messages: await convertToModelMessages(uiMessages),
		});

		return createUIMessageStreamResponse({
			stream: toUIMessageStream({ stream: result.stream }),
		});
	})
{{/if}}
	.get("/", () => "OK")
{{#if (eq serverDeploy "vercel")}};

export default app;

// Elysia's default export is not auto-served by Bun or Node, so start a local
// server outside Vercel while still exporting the app for Vercel functions.
if (!process.env.VERCEL) {
	app.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
}
{{else}}
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
{{/if}}
`],
  ["backend/server/express/src/index.ts.hbs", `{{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}import { desktopOrigins, ENV } from "./env.server";{{else}}import { ENV } from "./env.server";{{/if}}
{{#if (eq api "trpc")}}
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "@{{projectName}}/api/context";
import { appRouter } from "@{{projectName}}/api/routers/index";
{{/if}}
{{#if (eq api "orpc")}}
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { RPCHandler } from "@orpc/server/node";
import { onError } from "@orpc/server";
import { appRouter } from "@{{projectName}}/api/routers/index";
import { createContext } from "@{{projectName}}/api/context";
{{/if}}
import cors from "cors";
import express from "express";
{{#if (includes examples "ai")}}
import { pipeUIMessageStreamToResponse, streamText, toUIMessageStream, type UIMessage, convertToModelMessages, wrapLanguageModel } from "ai";
import { google } from "@ai-sdk/google";
import { devToolsMiddleware } from "@ai-sdk/devtools";
{{/if}}
{{#if (eq auth "better-auth")}}
import { auth } from "@{{projectName}}/auth";
import { toNodeHandler } from "better-auth/node";
{{/if}}
{{#if (eq auth "clerk")}}
import { clerkMiddleware } from "@clerk/express";
{{/if}}

const app = express();

app.use(
	cors({
		origin: {{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}[ENV.CORS_ORIGIN, ...desktopOrigins]{{else}}ENV.CORS_ORIGIN{{/if}},
		methods: ["GET", "POST", "OPTIONS"],
{{#if (or (eq auth "better-auth") (eq auth "clerk"))}}
		allowedHeaders: ["Content-Type", "Authorization"],
{{/if}}
{{#if (eq auth "better-auth")}}
		credentials: true,
{{/if}}
	})
);

{{#if (eq auth "clerk")}}
app.use(clerkMiddleware());
{{/if}}

{{#if (eq auth "better-auth")}}
app.all("/api/auth{/*path}", toNodeHandler(auth));
{{/if}}

{{#if (eq api "trpc")}}
app.use(
	"{{apiPrefix webDeploy serverDeploy}}/trpc",
	createExpressMiddleware({
		router: appRouter,
		createContext,
	})
);
{{/if}}

{{#if (eq api "orpc")}}
const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});
const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

app.use(async (req, res, next) => {
	const rpcResult = await rpcHandler.handle(req, res, {
		prefix: "{{apiPrefix webDeploy serverDeploy}}/rpc",
		context: await createContext({ req }),
	});
	if (rpcResult.matched) return;

	const apiResult = await apiHandler.handle(req, res, {
		prefix: "{{apiPrefix webDeploy serverDeploy}}/api-reference",
		context: await createContext({ req }),
	});
	if (apiResult.matched) return;

	next();
});
{{/if}}

app.use(express.json());

{{#if (includes examples "ai")}}
app.post("{{apiPrefix webDeploy serverDeploy}}/ai", async (req, res) => {
	const { messages = [] } = (req.body || {}) as { messages: UIMessage[] };
	const model = wrapLanguageModel({
		model: google("gemini-2.5-flash"),
		middleware: devToolsMiddleware(),
	});
	const result = streamText({
		model,
		messages: await convertToModelMessages(messages),
	});
	pipeUIMessageStreamToResponse({
		response: res,
		stream: toUIMessageStream({ stream: result.stream }),
	});
});
{{/if}}

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
`],
  ["backend/server/fastify/src/index.ts.hbs", `{{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}import { desktopOrigins, ENV } from "./env.server";{{else}}import { ENV } from "./env.server";{{/if}}
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

{{#if (eq api "trpc")}}
import { fastifyTRPCPlugin, type FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import { createContext } from "@{{projectName}}/api/context";
import { appRouter, type AppRouter } from "@{{projectName}}/api/routers/index";
{{/if}}

{{#if (eq api "orpc")}}
import { OpenAPIHandler } from "@orpc/openapi/fastify";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { RPCHandler } from "@orpc/server/fastify";
import { onError } from "@orpc/server";
import { createContext } from "@{{projectName}}/api/context";
import { appRouter } from "@{{projectName}}/api/routers/index";
{{/if}}

{{#if (includes examples "ai")}}
import { createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage, convertToModelMessages, wrapLanguageModel } from "ai";
import { google } from "@ai-sdk/google";
import { devToolsMiddleware } from "@ai-sdk/devtools";
{{/if}}

{{#if (eq auth "better-auth")}}
import { auth } from "@{{projectName}}/auth";
{{/if}}
{{#if (eq auth "clerk")}}
import { clerkPlugin } from "@clerk/fastify";
{{/if}}

const baseCorsConfig = {
	origin: {{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}[ENV.CORS_ORIGIN, ...desktopOrigins]{{else}}ENV.CORS_ORIGIN{{/if}},
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With"
	],
	credentials: true,
	maxAge: 86400,
};

{{#if (eq api "orpc")}}
const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

const fastify = Fastify({
	logger: true,
});
{{else}}
const fastify = Fastify({
	logger: true,
});
{{/if}}

fastify.register(fastifyCors, baseCorsConfig);
{{#if (eq auth "clerk")}}
fastify.register(clerkPlugin, {
	publishableKey: ENV.CLERK_PUBLISHABLE_KEY,
	secretKey: ENV.CLERK_SECRET_KEY,
});
{{/if}}

{{#if (eq api "orpc")}}
fastify.register(async (rpcApp) => {
	// Fully utilize oRPC features by letting oRPC parse the request body.
	rpcApp.addContentTypeParser("*", (_, _payload, done) => {
		done(null, undefined);
	});

	rpcApp.all("{{apiPrefix webDeploy serverDeploy}}/rpc/*", async (request, reply) => {
		const { matched } = await rpcHandler.handle(request, reply, {
			context: await createContext({{#if (eq auth "clerk")}}request{{else}}request.headers{{/if}}),
			prefix: "{{apiPrefix webDeploy serverDeploy}}/rpc",
		});

		if (!matched) {
			reply.status(404).send();
		}
	});

	rpcApp.all("{{apiPrefix webDeploy serverDeploy}}/api-reference/*", async (request, reply) => {
		const { matched } = await apiHandler.handle(request, reply, {
			context: await createContext({{#if (eq auth "clerk")}}request{{else}}request.headers{{/if}}),
			prefix: "{{apiPrefix webDeploy serverDeploy}}/api-reference",
		});

		if (!matched) {
			reply.status(404).send();
		}
	});
});
{{/if}}

{{#if (eq auth "better-auth")}}
fastify.route({
	method: ["GET", "POST"],
	url: "/api/auth/*",
	async handler(request, reply) {
		try {
			const url = new URL(request.url, \`http://\${request.headers.host}\`);
			const headers = new Headers();
			Object.entries(request.headers).forEach(([key, value]) => {
				if (value) headers.append(key, value.toString());
			});
			const req = new Request(url.toString(), {
				method: request.method,
				headers,
				body: request.body ? JSON.stringify(request.body) : undefined,
			});
			const response = await auth.handler(req);
			reply.status(response.status);
			response.headers.forEach((value, key) => reply.header(key, value));
			reply.send(response.body ? await response.text() : null);
		} catch (error) {
			fastify.log.error({ err: error }, "Authentication Error:");
			reply.status(500).send({
				error: "Internal authentication error",
				code: "AUTH_FAILURE"
			});
		}
	}
});
{{/if}}

{{#if (eq api "trpc")}}
fastify.register(fastifyTRPCPlugin, {
	prefix: "{{apiPrefix webDeploy serverDeploy}}/trpc",
	trpcOptions: {
		router: appRouter,
		createContext,
		onError({ path, error }) {
			console.error(\`Error in tRPC handler on path '\${path}':\`, error);
		},
	} satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});
{{/if}}

{{#if (includes examples "ai")}}
interface AiRequestBody {
	id?: string;
	messages: UIMessage[];
}

fastify.post('{{apiPrefix webDeploy serverDeploy}}/ai', async function (request) {
	const { messages } = request.body as AiRequestBody;
	const model = wrapLanguageModel({
		model: google('gemini-2.5-flash'),
		middleware: devToolsMiddleware(),
	});
	const result = streamText({
		model,
		messages: await convertToModelMessages(messages),
	});

	return createUIMessageStreamResponse({
		stream: toUIMessageStream({ stream: result.stream }),
	});
});
{{/if}}

fastify.get('/', async () => {
	return 'OK';
});

fastify.listen({ port: 3000{{#if (or (eq serverDeploy "docker") (eq serverDeploy "prisma"))}}, host: "0.0.0.0"{{/if}} }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log("Server running on port 3000");
});
`],
  ["backend/server/hono/src/index.ts.hbs", `{{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}import { desktopOrigins, ENV } from "./env.server";{{else}}import { ENV } from "./env.server";{{/if}}
{{#if (eq api "orpc")}}
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { createContext } from "@{{projectName}}/api/context";
import { appRouter } from "@{{projectName}}/api/routers/index";
{{/if}}
{{#if (eq api "trpc")}}
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@{{projectName}}/api/context";
import { appRouter } from "@{{projectName}}/api/routers/index";
{{/if}}
{{#if (eq auth "better-auth")}}
{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
import { createAuth } from "@{{projectName}}/auth";
{{else}}
import { auth } from "@{{projectName}}/auth";
{{/if}}
{{/if}}
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
{{#if (and (includes examples "ai") (or (eq runtime "bun") (eq runtime "node")))}}
import { createUIMessageStreamResponse, streamText, toUIMessageStream, convertToModelMessages, wrapLanguageModel } from "ai";
import { google } from "@ai-sdk/google";
import { devToolsMiddleware } from "@ai-sdk/devtools";
{{/if}}
{{#if (and (includes examples "ai") (eq runtime "workers"))}}
import { createUIMessageStreamResponse, streamText, toUIMessageStream, convertToModelMessages, wrapLanguageModel } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { devToolsMiddleware } from "@ai-sdk/devtools";
{{/if}}

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: {{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}[ENV.CORS_ORIGIN, ...desktopOrigins]{{else}}ENV.CORS_ORIGIN{{/if}},
		allowMethods: ["GET", "POST", "OPTIONS"],
{{#if (or (eq auth "better-auth") (eq auth "clerk"))}}
		allowHeaders: ["Content-Type", "Authorization"],
{{/if}}
{{#if (eq auth "better-auth")}}
		credentials: true,
{{/if}}
	})
);

{{#if (eq auth "better-auth")}}
app.on(
	["POST", "GET"],
	"/api/auth/*",
	async (c) =>
{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
		(await createAuth()).handler(c.req.raw)
{{else}}
		auth.handler(c.req.raw)
{{/if}}
);
{{/if}}

{{#if (eq api "orpc")}}
export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

app.use("/*", async (c, next) => {
	const context = await createContext({ context: c });

	const rpcResult = await rpcHandler.handle(c.req.raw, {
		prefix: "{{apiPrefix webDeploy serverDeploy}}/rpc",
		context: context,
	});

	if (rpcResult.matched) {
		return c.newResponse(rpcResult.response.body, rpcResult.response);
	}

	const apiResult = await apiHandler.handle(c.req.raw, {
		prefix: "{{apiPrefix webDeploy serverDeploy}}/api-reference",
		context: context,
	});

	if (apiResult.matched) {
		return c.newResponse(apiResult.response.body, apiResult.response);
	}

	await next();
});
{{/if}}

{{#if (eq api "trpc")}}
app.use(
	"{{apiPrefix webDeploy serverDeploy}}/trpc/*",
	trpcServer({
		endpoint: "{{apiPrefix webDeploy serverDeploy}}/trpc",
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	})
);
{{/if}}

{{#if (and (includes examples "ai") (or (eq runtime "bun") (eq runtime "node")))}}
app.post("{{apiPrefix webDeploy serverDeploy}}/ai", async (c) => {
	const body = await c.req.json();
	const uiMessages = body.messages || [];
	const model = wrapLanguageModel({
		model: google("gemini-2.5-flash"),
		middleware: devToolsMiddleware(),
	});
	const result = streamText({
		model,
		messages: await convertToModelMessages(uiMessages),
	});

	return createUIMessageStreamResponse({
		stream: toUIMessageStream({ stream: result.stream }),
	});
});
{{/if}}

{{#if (and (includes examples "ai") (eq runtime "workers"))}}
app.post("{{apiPrefix webDeploy serverDeploy}}/ai", async (c) => {
	const body = await c.req.json();
	const uiMessages = body.messages || [];
	const google = createGoogleGenerativeAI({
		apiKey: ENV.GOOGLE_GENERATIVE_AI_API_KEY,
	});
	const model = wrapLanguageModel({
		model: google("gemini-2.5-flash"),
		middleware: devToolsMiddleware(),
	});
	const result = streamText({
		model,
		messages: await convertToModelMessages(uiMessages),
	});

	return createUIMessageStreamResponse({
		stream: toUIMessageStream({ stream: result.stream }),
	});
});
{{/if}}

app.get("/", (c) => {
	return c.text("OK");
});

{{#if (eq runtime "node")}}
import { serve } from "@hono/node-server";

{{#if (eq serverDeploy "vercel")}}
export default app;

if (!process.env.VERCEL) {
{{/if}}
	serve(
		{
			fetch: app.fetch,
			port: 3000,
		},
		(info) => {
			console.log(\`Server is running on http://localhost:\${info.port}\`);
		}
	);
{{#if (eq serverDeploy "vercel")}}
}
{{/if}}
{{else}}
{{#if (eq runtime "bun")}}
export default app;
{{/if}}
{{#if (eq runtime "workers")}}
export default app;
{{/if}}
{{/if}}
`],
  ["base/_gitignore", `# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
dist
build
*.tsbuildinfo

# Generated files
apps/web/src/routeTree.gen.ts
local.db
local.db-*

# Environment variables
.env
.env*.local

# IDEs and editors
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea
*.swp
*.swo
*~
.DS_Store

# Logs
logs
.evlog/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Turbo
.turbo
.nx

# Better-T-Stack
.alchemy
.vercel

# Testing
coverage
.nyc_output

# Misc
*.tgz
.cache
tmp
temp
`],
  ["base/package.json.hbs", `{
  "name": "better-t-stack",
  "private": true,
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
{{#if (and (includes addons "vite-plus") (and (eq auth "better-auth") (eq payments "polar")))}}
  "engines": { "node": "^24.11.0 || >=26.0.0" },
{{else if (includes addons "vite-plus")}}
  "engines": { "node": "^22.18.0 || ^24.11.0 || >=26.0.0" },
{{else if (and (eq auth "better-auth") (eq payments "polar"))}}
  "engines": { "node": ">=24.0.0" },
{{/if}}
  "scripts": {}
}
`],
  ["base/tsconfig.json.hbs", `{
  "extends": "@{{projectName}}/config/tsconfig.base.json",
}
`],
  ["db-setup/docker-compose/mongodb/docker-compose.yml.hbs", `name: {{projectName}}

services:
  mongodb:
    image: mongo:8
    container_name: {{projectName}}-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: {{projectName}}
    ports:
      - "27017:27017"
    volumes:
      - {{projectName}}_mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  {{projectName}}_mongodb_data:`],
  ["db-setup/docker-compose/mysql/docker-compose.yml.hbs", `name: {{projectName}}

services:
  mysql:
    image: mysql:8.4
    container_name: {{projectName}}-mysql
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: {{projectName}}
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - {{projectName}}_mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  {{projectName}}_mysql_data:`],
  ["db-setup/docker-compose/postgres/docker-compose.yml.hbs", `name: {{projectName}}

services:
  postgres:
    image: postgres:18
    container_name: {{projectName}}-postgres
    environment:
      POSTGRES_DB: {{projectName}}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - {{projectName}}_postgres_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  {{projectName}}_postgres_data:`],
  ["db/base/_gitignore", `# dependencies (bun install)
node_modules

# output
out
dist
*.tgz
/prisma/generated

# code coverage
coverage
*.lcov

# logs
logs
_.log
report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# caches
.eslintcache
.cache
*.tsbuildinfo

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store
`],
  ["db/base/package.json.hbs", `{
  "name": "@{{projectName}}/db",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  },
  "scripts": {
    {{#if (eq api "orpc")}}
    "build": "tsc -b",
    "check-types": "tsc -b"
    {{else}}
    "check-types": "tsc --noEmit"
    {{/if}}
  },
  "devDependencies": {}
}`],
  ["db/base/src/config.ts.hbs", `{{#if (eq dbSetup "d1")}}
/// <reference types="@cloudflare/workers-types" />
{{/if}}
export type DatabaseConfig = {
{{#if (eq dbSetup "d1")}}
  DB: D1Database;
{{else if (and (eq database "mysql") (eq orm "drizzle") (eq dbSetup "planetscale"))}}
  DATABASE_HOST: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
{{else}}
  DATABASE_URL: string;
{{#if (eq dbSetup "turso")}}
  DATABASE_AUTH_TOKEN: string;
{{/if}}
{{/if}}
};
`],
  ["db/base/tsconfig.json.hbs", `{
  "extends": "@{{projectName}}/config/tsconfig.base.json",
  {{#if (eq api "orpc")}}
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"{{#if (eq orm "prisma")}}, "prisma/generated/**/*.ts"{{/if}}],
  "references": []
  {{else}}
  "compilerOptions": {
    "noEmit": true
  }
  {{/if}}
}
`],
  ["db/drizzle/base/src/relations.ts.hbs", `import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = {
  ...defineRelations(schema),
{{#if (eq auth "better-auth")}}
  ...schema.authRelations,
{{/if}}
};
`],
  ["db/drizzle/base/src/schema/index.ts.hbs", `{{#if (eq auth "better-auth")}}
export * from "./auth";
{{/if}}
{{#if (includes examples "todo")}}
export * from "./todo";
{{/if}}
export {};`],
  ["db/drizzle/mysql/drizzle.config.ts.hbs", `import { defineConfig } from "drizzle-kit";
import "varlock/auto-load";


export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
`],
  ["db/drizzle/mysql/src/index.ts.hbs", `import type { DatabaseConfig } from "./config";
{{#if (or (eq runtime "bun") (eq runtime "node") (eq runtime "none"))}}
import { relations } from "./relations";

{{#if (eq dbSetup "planetscale")}}
import { drizzle } from "drizzle-orm/planetscale-serverless";

export function createDb(env: DatabaseConfig) {
	return drizzle({
		connection: {
			host: env.DATABASE_HOST,
			username: env.DATABASE_USERNAME,
			password: env.DATABASE_PASSWORD,
		},
		relations,
	});
}
{{else}}
import { drizzle } from "drizzle-orm/mysql2";

export function createDb(env: DatabaseConfig) {
	return drizzle({
		connection: {
			uri: env.DATABASE_URL,
		},
		relations,
	});
}
{{/if}}

{{/if}}

{{#if (eq runtime "workers")}}
import { relations } from "./relations";

{{#if (eq dbSetup "planetscale")}}
import { drizzle } from "drizzle-orm/planetscale-serverless";

export function createDb(env: DatabaseConfig) {
	return drizzle({
		connection: {
			host: env.DATABASE_HOST,
			username: env.DATABASE_USERNAME,
			password: env.DATABASE_PASSWORD,
		},
		relations,
	});
}
{{else}}
import { drizzle } from "drizzle-orm/mysql2";

export function createDb(env: DatabaseConfig) {
	return drizzle({
		connection: {
			uri: env.DATABASE_URL,
		},
		relations,
	});
}
{{/if}}
{{/if}}

export type Database = ReturnType<typeof createDb>;
`],
  ["db/drizzle/mysql/src/migrations/.gitkeep", `
`],
  ["db/drizzle/postgres/drizzle.config.ts.hbs", `import { defineConfig } from "drizzle-kit";
import "varlock/auto-load";


export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
`],
  ["db/drizzle/postgres/src/index.ts.hbs", `import type { DatabaseConfig } from "./config";
{{#if (or (eq runtime "bun") (eq runtime "node") (eq runtime "none"))}}
import { relations } from "./relations";

{{#if (eq dbSetup "neon")}}
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export function createDb(env: DatabaseConfig) {
	const sql = neon(env.DATABASE_URL);
	return drizzle({ client: sql, relations });
}
{{else}}
{{#if (and (eq backend "self") (eq webDeploy "cloudflare"))}}
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
{{else}}
import { drizzle } from "drizzle-orm/node-postgres";
{{/if}}

export function createDb(env: DatabaseConfig) {
{{#if (and (eq backend "self") (eq webDeploy "cloudflare"))}}
	const client = postgres(env.DATABASE_URL, { max: 1 });

	return drizzle({ client, relations });
{{else}}
	return drizzle(env.DATABASE_URL, { relations });
{{/if}}
}
{{/if}}

{{/if}}

{{#if (eq runtime "workers")}}
import { relations } from "./relations";

{{#if (eq dbSetup "neon")}}
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export function createDb(env: DatabaseConfig) {
	const sql = neon(env.DATABASE_URL || "");
	return drizzle({ client: sql, relations });
}
{{else}}
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createDb(env: DatabaseConfig) {
	const client = postgres(env.DATABASE_URL || "", { max: 1 });

	return drizzle({ client, relations });
}
{{/if}}
{{/if}}

export type Database = ReturnType<typeof createDb>;
`],
  ["db/drizzle/postgres/src/migrations/.gitkeep", `
`],
  ["db/drizzle/sqlite/drizzle.config.ts.hbs", `import { defineConfig } from "drizzle-kit";
import "varlock/auto-load";


export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  {{#if (eq dbSetup "d1")}}
  // DOCS: https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit
  dialect: "sqlite",
  driver: "d1-http",
  {{else}}
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
    {{#if (eq dbSetup "turso")}}
    authToken: process.env.DATABASE_AUTH_TOKEN,
    {{/if}}
  },
  {{/if}}
});
`],
  ["db/drizzle/sqlite/src/index.ts.hbs", `import type { DatabaseConfig } from "./config";
{{#if (eq dbSetup "d1")}}
import { relations } from "./relations";
import { drizzle } from "drizzle-orm/d1";

export function createDb(env: DatabaseConfig) {
	return drizzle(env.DB, { relations });
}
{{else if (or (eq runtime "bun") (eq runtime "node") (eq runtime "none"))}}
import { relations } from "./relations";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

export function createDb(env: DatabaseConfig) {
	const client = createClient({
		url: env.DATABASE_URL,
{{#if (eq dbSetup "turso")}}
		authToken: env.DATABASE_AUTH_TOKEN,
{{/if}}
	});

	return drizzle({ client, relations });
}

{{else if (eq runtime "workers")}}
import { relations } from "./relations";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

export function createDb(env: DatabaseConfig) {
	const client = createClient({
		url: env.DATABASE_URL || "",
{{#if (eq dbSetup "turso")}}
		authToken: env.DATABASE_AUTH_TOKEN,
{{/if}}
	});

	return drizzle({ client, relations });
}
{{/if}}

export type Database = ReturnType<typeof createDb>;
`],
  ["db/drizzle/sqlite/src/migrations/.gitkeep", ``],
  ["db/mongoose/mongodb/src/index.ts.hbs", `import mongoose from "mongoose";
import type { DatabaseConfig } from "./config";

export async function createDb(env: DatabaseConfig) {
  await mongoose.connect(env.DATABASE_URL);
  return mongoose.connection.getClient().db();
}

export type Database = Awaited<ReturnType<typeof createDb>>;
`],
  ["db/prisma/mongodb/prisma.config.ts.hbs", `import path from "node:path";
import type { PrismaConfig } from "prisma";
import "varlock/auto-load";


export default {
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
  }
} satisfies PrismaConfig;
`],
  ["db/prisma/mongodb/prisma/schema/schema.prisma.hbs", `generator client {
  provider = "prisma-client"
  output   = "../generated"
  moduleFormat = "esm"
  {{#if (eq runtime "bun")}}
  runtime = "bun"
  {{/if}}
  {{#if (eq runtime "node")}}
  runtime = "nodejs"
  {{/if}}
  {{#if (or (eq runtime "workers") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
  runtime = "cloudflare"
  {{/if}}
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
`],
  ["db/prisma/mongodb/src/index.ts.hbs", `import type { DatabaseConfig } from "./config";
import { PrismaClient } from "../prisma/generated/client";

export function createPrismaClient(env: DatabaseConfig) {
  return new PrismaClient({ datasourceUrl: env.DATABASE_URL });
}

export type Database = ReturnType<typeof createPrismaClient>;
`],
  ["db/prisma/mysql/prisma.config.ts.hbs", `import path from "node:path";
import { defineConfig, env } from "prisma/config";
import "varlock/auto-load";


export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: {{#if (usesAlchemyDatabase backend dbSetup webDeploy serverDeploy dbSetupOptions)}}process.env.DATABASE_URL!{{else}}env("DATABASE_URL"){{/if}},
  },
});
`],
  ["db/prisma/mysql/prisma/migrations/.gitkeep", `
`],
  ["db/prisma/mysql/prisma/migrations/0000_init/migration.sql.hbs", `{{#if (eq auth "better-auth")}}
-- CreateTable
CREATE TABLE \`user\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`name\` TEXT NOT NULL,
    \`email\` VARCHAR(191) NOT NULL,
    \`emailVerified\` BOOLEAN NOT NULL DEFAULT false,
    \`image\` TEXT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    UNIQUE INDEX \`user_email_key\`(\`email\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`session\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`expiresAt\` DATETIME(3) NOT NULL,
    \`token\` VARCHAR(191) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    \`ipAddress\` TEXT NULL,
    \`userAgent\` TEXT NULL,
    \`userId\` VARCHAR(191) NOT NULL,

    INDEX \`session_userId_idx\`(\`userId\`(191)),
    UNIQUE INDEX \`session_token_key\`(\`token\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`account\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`accountId\` TEXT NOT NULL,
    \`providerId\` TEXT NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`accessToken\` TEXT NULL,
    \`refreshToken\` TEXT NULL,
    \`idToken\` TEXT NULL,
    \`accessTokenExpiresAt\` DATETIME(3) NULL,
    \`refreshTokenExpiresAt\` DATETIME(3) NULL,
    \`scope\` TEXT NULL,
    \`password\` TEXT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    INDEX \`account_userId_idx\`(\`userId\`(191)),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`verification\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`identifier\` TEXT NOT NULL,
    \`value\` TEXT NOT NULL,
    \`expiresAt\` DATETIME(3) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    INDEX \`verification_identifier_idx\`(\`identifier\`(191)),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

{{/if}}
{{#if (includes examples "todo")}}
-- CreateTable
CREATE TABLE \`todo\` (
    \`id\` INTEGER NOT NULL AUTO_INCREMENT,
    \`text\` VARCHAR(191) NOT NULL,
    \`completed\` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
{{/if}}
`],
  ["db/prisma/mysql/prisma/migrations/migration_lock.toml.hbs", `# Please do not edit this file manually
# It should be added in your version-control system (e.g., Git)
provider = "mysql"
`],
  ["db/prisma/mysql/prisma/schema/schema.prisma.hbs", `generator client {
  provider      = "prisma-client"
  output        = "../generated"
  moduleFormat  = "esm"
  {{#if (eq runtime "bun")}}
  runtime       = "bun"
  {{/if}}
  {{#if (eq runtime "node")}}
  runtime       = "nodejs"
  {{/if}}
  {{#if (or (eq runtime "workers") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
  runtime       = "cloudflare"
  {{/if}}
}

datasource db {
  provider = "mysql"
  {{#if (eq dbSetup "planetscale")}}
  relationMode = "prisma"
  {{/if}}
}
`],
  ["db/prisma/mysql/src/index.ts.hbs", `import type { DatabaseConfig } from "./config";
{{#if (eq runtime "workers")}}
import { PrismaClient } from "../prisma/generated/client";

{{#if (eq dbSetup "planetscale")}}
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";

export function createPrismaClient(env: DatabaseConfig) {
	const adapter = new PrismaPlanetScale({ url: env.DATABASE_URL });
	return new PrismaClient({ adapter });
}
{{else}}
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export function createPrismaClient(env: DatabaseConfig) {
	const databaseUrl: string = env.DATABASE_URL;
	const url: URL = new URL(databaseUrl);
	const connectionConfig = {
		host: url.hostname,
		port: parseInt(url.port || "3306"),
		user: url.username,
		password: url.password,
		database: url.pathname.slice(1),
	};

	const adapter = new PrismaMariaDb(connectionConfig);
	return new PrismaClient({ adapter });
}
{{/if}}
{{else}}
import { PrismaClient } from "../prisma/generated/client";

{{#if (eq dbSetup "planetscale")}}
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";

export function createPrismaClient(env: DatabaseConfig) {
	const adapter = new PrismaPlanetScale({ url: env.DATABASE_URL });
	return new PrismaClient({ adapter });
}
{{else}}
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export function createPrismaClient(env: DatabaseConfig) {
	const databaseUrl: string = env.DATABASE_URL;
	const url: URL = new URL(databaseUrl);
	const connectionConfig = {
		host: url.hostname,
		port: parseInt(url.port || "3306"),
		user: url.username,
		password: url.password,
		database: url.pathname.slice(1),
	};

	const adapter = new PrismaMariaDb(connectionConfig);
	return new PrismaClient({ adapter });
}
{{/if}}

{{/if}}

export type Database = ReturnType<typeof createPrismaClient>;
`],
  ["db/prisma/postgres/prisma.config.ts.hbs", `import path from "node:path";
import { defineConfig, env } from 'prisma/config'
import "varlock/auto-load";


export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
    },
    datasource: {
        url: {{#if (usesAlchemyDatabase backend dbSetup webDeploy serverDeploy dbSetupOptions)}}process.env.DATABASE_URL!{{else}}env('DATABASE_URL'){{/if}},
    },
})
`],
  ["db/prisma/postgres/prisma/migrations/.gitkeep", `
`],
  ["db/prisma/postgres/prisma/migrations/0000_init/migration.sql.hbs", `-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

{{#if (eq auth "better-auth")}}
-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

{{/if}}
{{#if (includes examples "todo")}}
-- CreateTable
CREATE TABLE "todo" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

{{/if}}
{{#if (eq auth "better-auth")}}
-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

{{#unless (eq dbSetup "planetscale")}}
-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
{{/unless}}
{{/if}}
`],
  ["db/prisma/postgres/prisma/migrations/migration_lock.toml.hbs", `# Please do not edit this file manually
# It should be added in your version-control system (e.g., Git)
provider = "postgresql"
`],
  ["db/prisma/postgres/prisma/schema/schema.prisma.hbs", `generator client {
  provider = "prisma-client"
  output   = "../generated"
  moduleFormat = "esm"
  {{#if (eq runtime "bun")}}
  runtime = "bun"
  {{/if}}
  {{#if (eq runtime "node")}}
  runtime = "nodejs"
  {{/if}}
  {{#if (or (eq runtime "workers") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
  runtime = "cloudflare"
  {{/if}}
}

datasource db {
  provider = "postgresql"
  {{#if (eq dbSetup "planetscale")}}
  relationMode = "prisma"
  {{/if}}
}
`],
  ["db/prisma/postgres/src/index.ts.hbs", `import type { DatabaseConfig } from "./config";
{{#if (eq runtime "workers")}}
import { PrismaClient } from "../prisma/generated/client";
{{#if (eq dbSetup "neon")}}
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.poolQueryViaFetch = true;

export function createPrismaClient(env: DatabaseConfig) {
	return new PrismaClient({
		adapter: new PrismaNeon({
			connectionString: env.DATABASE_URL,
		}),
	});
}

{{else if (eq dbSetup "prisma-postgres")}}
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";

export function createPrismaClient(env: DatabaseConfig) {
	const adapter = new PrismaPostgresAdapter({
		connectionString: env.DATABASE_URL,
	});

	return new PrismaClient({ adapter });
}

{{else}}
import { PrismaPg } from "@prisma/adapter-pg";

export function createPrismaClient(env: DatabaseConfig) {
	const adapter = new PrismaPg({
		connectionString: env.DATABASE_URL,
		maxUses: 1,
	});
	return new PrismaClient({ adapter });
}

{{/if}}
{{else}}
import { PrismaClient } from "../prisma/generated/client";
{{#if (eq dbSetup "neon")}}
import { PrismaNeon } from "@prisma/adapter-neon";

export function createPrismaClient(env: DatabaseConfig) {
	const adapter = new PrismaNeon({
		connectionString: env.DATABASE_URL,
	});

	return new PrismaClient({ adapter });
}

{{else if (eq dbSetup "prisma-postgres")}}
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";

export function createPrismaClient(env: DatabaseConfig) {
	const adapter = new PrismaPostgresAdapter({
		connectionString: env.DATABASE_URL,
	});

	return new PrismaClient({ adapter });
}

{{else}}
import { PrismaPg } from "@prisma/adapter-pg";

export function createPrismaClient(env: DatabaseConfig) {
	const adapter = new PrismaPg({
		connectionString: env.DATABASE_URL,
{{#if (and (eq backend "self") (eq webDeploy "cloudflare"))}}
		maxUses: 1,
{{/if}}
	});
	return new PrismaClient({ adapter });
}

{{/if}}
{{/if}}

export type Database = ReturnType<typeof createPrismaClient>;
`],
  ["db/prisma/sqlite/prisma.config.ts.hbs", `import path from "node:path";
import { defineConfig, env } from "prisma/config";
import "varlock/auto-load";


export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    {{#if (eq dbSetup "turso")}}
    url: "file:./dev.db",
    {{else}}
    url: env("DATABASE_URL"),
    {{/if}}
  },
});`],
  ["db/prisma/sqlite/prisma/migrations/.gitkeep", ``],
  ["db/prisma/sqlite/prisma/schema/schema.prisma.hbs", `generator client {
  provider = "prisma-client"
  output   = "../generated"
  moduleFormat = "esm"
  {{#if (eq runtime "bun")}}
  runtime = "bun"
  {{/if}}
  {{#if (eq runtime "node")}}
  runtime = "nodejs"
  {{/if}}
  {{#if (or (eq runtime "workers") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
  runtime = "cloudflare"
  {{/if}}
}

datasource db {
  provider = "sqlite"
}
`],
  ["db/prisma/sqlite/src/index.ts.hbs", `import type { DatabaseConfig } from "./config";
import { PrismaClient } from "../prisma/generated/client";

{{#if (eq dbSetup "d1")}}
import { PrismaD1 } from "@prisma/adapter-d1";

export function createPrismaClient(env: DatabaseConfig) {
	const adapter = new PrismaD1(env.DB);
	return new PrismaClient({ adapter });
}

{{else}}
import { PrismaLibSql } from "@prisma/adapter-libsql";

export function createPrismaClient(env: DatabaseConfig) {
	const adapter = new PrismaLibSql({
		url: env.DATABASE_URL,
{{#if (eq dbSetup "turso")}}
		authToken: env.DATABASE_AUTH_TOKEN || "",
{{/if}}
	});

	return new PrismaClient({ adapter });
}

{{/if}}

export type Database = ReturnType<typeof createPrismaClient>;
`],
  ["deploy/docker/compose/_dockerignore", `**/node_modules
.git

**/dist
**/build
**/.output
**/.turbo
.turbo

**/.wrangler
**/.alchemy
**/.vercel
*.log

Dockerfile
**/Dockerfile
docker-compose.yml

# Env value files stay out of COPY layers; runtime env comes from compose env_file,
# build-time configuration uses BuildKit secrets; public values use build args
**/.env
**/.env.*
!**/.env.example
!**/.env.schema

local.db
local.db-*
.data
`],
  ["deploy/docker/compose/docker-compose.yml.hbs", `name: {{projectName}}

services:
{{#if (eq webDeploy "docker")}}
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      secrets:
{{#if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}
        - web_env
{{/if}}
{{#if (and (ne backend "self") (ne backend "none") (ne backend "convex"))}}
        - server_env
{{/if}}
{{#if (or (and (ne backend "self") (ne backend "none") (ne backend "convex")) (eq backend "convex") (and (eq auth "clerk") (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))))}}
      args:
{{#if (and (ne backend "self") (ne backend "none") (ne backend "convex"))}}
        VITE_SERVER_URL: http://localhost:3000
{{/if}}
{{#if (eq backend "convex")}}
        VITE_CONVEX_URL: \${VITE_CONVEX_URL:-}
{{/if}}
{{#if (and (eq auth "clerk") (or (includes frontend "tanstack-router") (includes frontend "tanstack-start")))}}
        VITE_CLERK_PUBLISHABLE_KEY: \${VITE_CLERK_PUBLISHABLE_KEY:-}
{{/if}}
{{/if}}
    init: true
    ports:
{{#if (includes frontend "tanstack-router")}}
      - "3001:80"
{{else}}
      - "3001:3001"
{{/if}}
    env_file:
      - path: apps/web/.env
        required: false
{{#if (eq backend "self")}}
{{#if (or (eq dbSetup "docker") (eq auth "better-auth") (and (eq database "sqlite") (eq dbSetup "none")) (includes addons "axiom"))}}
    environment:
{{#if (includes addons "axiom")}}
      AXIOM_API_KEY: \${AXIOM_API_KEY:?Set AXIOM_API_KEY}
      AXIOM_DATASET: \${AXIOM_DATASET:?Set AXIOM_DATASET}
      AXIOM_EDGE_URL: \${AXIOM_EDGE_URL:?Set AXIOM_EDGE_URL}
{{/if}}
{{#if (eq auth "better-auth")}}
      BETTER_AUTH_URL: http://localhost:3001
      CORS_ORIGIN: http://localhost:3001
{{/if}}
{{#if (and (eq database "sqlite") (eq dbSetup "none"))}}
      DATABASE_URL: file:/data/local.db
{{/if}}
{{#if (and (eq dbSetup "docker") (eq database "postgres"))}}
      DATABASE_URL: postgresql://postgres:\${POSTGRES_PASSWORD:-password}@postgres:5432/{{projectName}}
{{/if}}
{{#if (and (eq dbSetup "docker") (eq database "mysql"))}}
      DATABASE_URL: mysql://user:\${MYSQL_PASSWORD:-password}@mysql:3306/{{projectName}}
{{/if}}
{{#if (and (eq dbSetup "docker") (eq database "mongodb"))}}
      DATABASE_URL: mongodb://root:\${MONGO_PASSWORD:-password}@mongodb:27017/{{projectName}}?authSource=admin
{{/if}}
{{/if}}
{{#if (eq dbSetup "docker")}}
    depends_on:
      {{database}}:
        condition: service_healthy
{{else if (and (eq database "sqlite") (eq dbSetup "none"))}}
    volumes:
      - type: bind
        source: ./.data
        target: /data
        bind:
          create_host_path: false
{{/if}}
{{else}}
{{#if (or (eq serverDeploy "docker") (and (includes addons "axiom") (includes frontend "tanstack-start")))}}
{{#unless (includes frontend "tanstack-router")}}
    environment:
{{#if (and (includes addons "axiom") (includes frontend "tanstack-start"))}}
      AXIOM_API_KEY: \${AXIOM_API_KEY:?Set AXIOM_API_KEY}
      AXIOM_DATASET: \${AXIOM_DATASET:?Set AXIOM_DATASET}
      AXIOM_EDGE_URL: \${AXIOM_EDGE_URL:?Set AXIOM_EDGE_URL}
{{/if}}
{{#if (eq serverDeploy "docker")}}
      SERVER_URL: http://server:3000
{{#if (includes frontend "tanstack-start")}}
      VITE_SERVER_URL: http://server:3000
{{/if}}
{{/if}}
{{/unless}}
{{#if (eq serverDeploy "docker")}}
    depends_on:
      server:
        condition: service_healthy
{{/if}}
{{/if}}
{{/if}}
    healthcheck:
{{#if (includes frontend "tanstack-router")}}
      test: ["CMD", "wget", "-q", "--spider", "http://127.0.0.1:80/"]
{{else}}
      test:
        [
          "CMD",
{{#if (and (includes frontend "tanstack-start") (eq runtime "bun"))}}
          "bun",
{{else}}
          "node",
{{/if}}
          "-e",
          "fetch('http://localhost:3001/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))",
        ]
{{/if}}
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped

{{/if}}
{{#if (and (eq serverDeploy "docker") (ne backend "self"))}}
  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
      secrets:
{{#if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}
        - web_env
{{/if}}
{{#if (and (ne backend "self") (ne backend "none") (ne backend "convex"))}}
        - server_env
{{/if}}
    init: true
    ports:
      - "3000:3000"
    env_file:
      - path: apps/server/.env
        required: false
{{#if (or (eq webDeploy "docker") (eq dbSetup "docker") (and (eq database "sqlite") (eq dbSetup "none")) (includes addons "axiom"))}}
    environment:
{{#if (includes addons "axiom")}}
      AXIOM_API_KEY: \${AXIOM_API_KEY:?Set AXIOM_API_KEY}
      AXIOM_DATASET: \${AXIOM_DATASET:?Set AXIOM_DATASET}
      AXIOM_EDGE_URL: \${AXIOM_EDGE_URL:?Set AXIOM_EDGE_URL}
{{/if}}
{{#if (eq webDeploy "docker")}}
      CORS_ORIGIN: http://localhost:3001
{{/if}}
{{#if (and (eq database "sqlite") (eq dbSetup "none"))}}
      DATABASE_URL: file:/data/local.db
{{/if}}
{{#if (and (eq dbSetup "docker") (eq database "postgres"))}}
      DATABASE_URL: postgresql://postgres:\${POSTGRES_PASSWORD:-password}@postgres:5432/{{projectName}}
{{/if}}
{{#if (and (eq dbSetup "docker") (eq database "mysql"))}}
      DATABASE_URL: mysql://user:\${MYSQL_PASSWORD:-password}@mysql:3306/{{projectName}}
{{/if}}
{{#if (and (eq dbSetup "docker") (eq database "mongodb"))}}
      DATABASE_URL: mongodb://root:\${MONGO_PASSWORD:-password}@mongodb:27017/{{projectName}}?authSource=admin
{{/if}}
{{/if}}
    healthcheck:
      test:
        [
          "CMD",
{{#if (eq runtime "bun")}}
          "bun",
{{else}}
          "node",
{{/if}}
          "-e",
          "fetch('http://localhost:3000/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))",
        ]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
{{#if (eq dbSetup "docker")}}
    depends_on:
      {{database}}:
        condition: service_healthy
{{else if (and (eq database "sqlite") (eq dbSetup "none"))}}
    volumes:
      - type: bind
        source: ./.data
        target: /data
        bind:
          create_host_path: false
{{/if}}
    restart: unless-stopped

{{/if}}
{{#if (eq dbSetup "docker")}}
{{#if (eq database "postgres")}}
  postgres:
    image: postgres:18
    container_name: {{projectName}}-postgres
    environment:
      POSTGRES_DB: {{projectName}}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-password}
    ports:
      - "5432:5432"
    volumes:
      - {{projectName}}_postgres_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
{{/if}}
{{#if (eq database "mysql")}}
  mysql:
    image: mysql:8.4
    container_name: {{projectName}}-mysql
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD:-password}
      MYSQL_DATABASE: {{projectName}}
      MYSQL_USER: user
      MYSQL_PASSWORD: \${MYSQL_PASSWORD:-password}
    ports:
      - "3306:3306"
    volumes:
      - {{projectName}}_mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
{{/if}}
{{#if (eq database "mongodb")}}
  mongodb:
    image: mongo:8
    container_name: {{projectName}}-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_PASSWORD:-password}
      MONGO_INITDB_DATABASE: {{projectName}}
    ports:
      - "27017:27017"
    volumes:
      - {{projectName}}_mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
{{/if}}

volumes:
  {{projectName}}_{{database}}_data:
{{/if}}

# BuildKit makes these available only while install/build commands run.
secrets:
{{#if (or (includes frontend "tanstack-router") (includes frontend "tanstack-start"))}}
  web_env:
    file: apps/web/.env
{{/if}}
{{#if (and (ne backend "self") (ne backend "none") (ne backend "convex"))}}
  server_env:
    file: apps/server/.env
{{/if}}
`],
  ["deploy/docker/server/Dockerfile.hbs", `{{#if (eq packageManager "bun")}}
FROM oven/bun:1 AS builder
{{else}}
FROM node:24-slim AS builder
{{/if}}
{{#if (eq packageManager "pnpm")}}
RUN npm install -g pnpm@11
{{/if}}
WORKDIR /app

COPY . .
{{#if (eq packageManager "bun")}}
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/root/.bun/install/cache bun install
{{else if (eq packageManager "pnpm")}}
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/pnpm-store pnpm install --store-dir /pnpm-store
{{else}}
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/root/.npm npm install
{{/if}}

ENV NODE_ENV=production
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local cd apps/server && {{packageManager}} run build

{{#if (eq runtime "bun")}}
FROM oven/bun:1 AS runner
{{else}}
FROM node:24-slim AS runner
{{/if}}
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app

EXPOSE 3000

WORKDIR /app/apps/server
{{#if (eq runtime "bun")}}
CMD ["bun", "dist/index.mjs"]
{{else}}
CMD ["node", "dist/index.mjs"]
{{/if}}
`],
  ["deploy/docker/web/react/tanstack-router/Dockerfile.hbs", `FROM node:24{{#unless (includes addons "vite-plus")}}-slim{{/unless}} AS builder
{{#if (eq packageManager "bun")}}
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
{{/if}}
{{#if (eq packageManager "pnpm")}}
RUN npm install -g pnpm@11
{{/if}}
WORKDIR /app

COPY . .
{{#if (eq packageManager "bun")}}
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/root/.bun/install/cache bun install
{{else if (eq packageManager "pnpm")}}
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/pnpm-store pnpm install --store-dir /pnpm-store
{{else}}
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/root/.npm npm install
{{/if}}

{{#if (and (ne backend "self") (ne backend "none") (ne backend "convex"))}}
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=\${VITE_SERVER_URL}
{{/if}}
{{#if (eq backend "convex")}}
ARG VITE_CONVEX_URL
ENV VITE_CONVEX_URL=\${VITE_CONVEX_URL}
{{/if}}
{{#if (eq auth "clerk")}}
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=\${VITE_CLERK_PUBLISHABLE_KEY}
{{/if}}
ENV NODE_ENV=production
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local cd apps/web && {{packageManager}} run build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`],
  ["deploy/docker/web/react/tanstack-router/nginx.conf", `server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
`],
  ["deploy/docker/web/react/tanstack-start/Dockerfile.hbs", `{{#if (and (eq packageManager "bun") (not (includes addons "vite-plus")))}}
FROM oven/bun:1 AS builder
{{else}}
FROM node:24{{#unless (includes addons "vite-plus")}}-slim{{/unless}} AS builder
{{#if (eq packageManager "bun")}}
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
{{/if}}
{{/if}}
{{#if (eq packageManager "pnpm")}}
RUN npm install -g pnpm@11
{{/if}}
WORKDIR /app

COPY . .
{{#if (eq packageManager "bun")}}
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/root/.bun/install/cache bun install
{{else if (eq packageManager "pnpm")}}
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/pnpm-store pnpm install --store-dir /pnpm-store
{{else}}
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/root/.npm npm install
{{/if}}

{{#if (and (ne backend "self") (ne backend "none") (ne backend "convex"))}}
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=\${VITE_SERVER_URL}
{{/if}}
{{#if (eq backend "convex")}}
ARG VITE_CONVEX_URL
ENV VITE_CONVEX_URL=\${VITE_CONVEX_URL}
{{/if}}
{{#if (eq auth "clerk")}}
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=\${VITE_CLERK_PUBLISHABLE_KEY}
{{/if}}
ENV NODE_ENV=production
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local cd apps/web && {{packageManager}} run build
{{#if (eq orm "prisma")}}
ENV DATABASE_URL=
{{/if}}

{{#if (eq runtime "bun")}}
FROM oven/bun:1 AS runner
{{else}}
FROM node:24-slim AS runner
{{/if}}
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app

ENV HOST=0.0.0.0
ENV PORT=3001
EXPOSE 3001

# SSR chunks require workspace dependencies at runtime
WORKDIR /app/apps/web
{{#if (eq runtime "bun")}}
CMD ["bun", ".output/server/index.mjs"]
{{else}}
CMD ["node", ".output/server/index.mjs"]
{{/if}}
`],
  ["deploy/vercel/_vercelignore", `# Local env files must never ship in deployments: Vercel project env vars are
# the source of truth (bun env:vercel:*); these localhost values should not
# be included in deployment output.
.env
.env.*
**/.env
**/.env.*
!**/.env.example
!**/.env.schema
local.db
local.db-*
.alchemy/
`],
  ["deploy/vercel/scripts/sync-vercel-env.ts.hbs", `import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseEnv } from "node:util";

const DEFAULT_ENVIRONMENT = "preview";
const VALID_ENVIRONMENTS = new Set(["development", "preview", "production"]);
const VERCEL_COMMAND = [{{#if (eq packageManager "npm")}}"npx", "--yes", "vercel"{{else if (eq packageManager "pnpm")}}"pnpm", "dlx", "vercel"{{else}}"bunx", "vercel"{{/if}}] as const;
const DEFAULT_FILES = [
{{#if (eq webDeploy "vercel")}}
	"apps/web/.env",
{{/if}}
{{#if (and (eq serverDeploy "vercel") (ne backend "self") (ne backend "none") (ne backend "convex"))}}
	"apps/server/.env",
{{/if}}
];
const SKIP_KEYS = new Set([
{{#if (or (and (eq webDeploy "vercel") (eq serverDeploy "vercel") (ne backend "self") (ne backend "none") (ne backend "convex")) (and (eq webDeploy "vercel") (eq backend "self")))}}
	"BETTER_AUTH_URL",
	"CORS_ORIGIN",
	"NODE_ENV",
{{else if (and (eq serverDeploy "vercel") (ne backend "self") (ne backend "none") (ne backend "convex"))}}
	// BETTER_AUTH_URL derives from the deployment's own origin at runtime;
	// CORS_ORIGIN stays synced because the web app (if any) lives on another host
	"BETTER_AUTH_URL",
	"NODE_ENV",
{{/if}}
]);
const OVERRIDE_KEYS = new Map([
{{#if (and (eq webDeploy "vercel") (eq serverDeploy "vercel") (ne backend "self") (ne backend "none") (ne backend "convex"))}}
	["PUBLIC_SERVER_URL", "/api"],
	["VITE_SERVER_URL", "/api"],
{{/if}}
]);

const args = process.argv.slice(2);
const separatorIndex = args.indexOf("--");
const scriptArgs = separatorIndex === -1 ? args : args.slice(0, separatorIndex);
const forwardedArgs = separatorIndex === -1 ? [] : args.slice(separatorIndex + 1);

const environment =
	scriptArgs[0] && VALID_ENVIRONMENTS.has(scriptArgs[0]) ? scriptArgs[0] : DEFAULT_ENVIRONMENT;
const remainingArgs = scriptArgs.slice(VALID_ENVIRONMENTS.has(scriptArgs[0] ?? "") ? 1 : 0);
// Split remaining args into env-file paths and passthrough Vercel CLI flags.
// A bare token counts as a file only when it exists on disk, so flags and their
// values (e.g. \`--scope my-team\`) forward correctly regardless of argument order.
const files: string[] = [];
const passthroughArgs: string[] = [];
for (const arg of remainingArgs) {
	if (!arg.startsWith("-") && existsSync(arg)) {
		files.push(arg);
	} else {
		passthroughArgs.push(arg);
	}
}
const vercelArgs = [...passthroughArgs, ...forwardedArgs];
const envFiles = files.length > 0 ? files : DEFAULT_FILES;

const env = new Map<string, string>();
const undeclaredKeys: string[] = [];
const emptyKeys: string[] = [];

for (const file of envFiles) {
	if (!existsSync(file)) {
		console.warn(\`Skipping missing env file: \${file}\`);
		continue;
	}

	// Only the keys an app declares in its .env.schema are config; tools such as
	// database CLIs also write local-only values (claim links, direct URLs) to .env
	const schemaFile = join(dirname(file), ".env.schema");
	const declaredKeys = existsSync(schemaFile)
		? new Set(Object.keys(parseEnv(readFileSync(schemaFile, "utf8"))))
		: undefined;

	for (const [key, value] of Object.entries(parseEnv(readFileSync(file, "utf8")))) {
		if (SKIP_KEYS.has(key)) continue;
		if (declaredKeys && !declaredKeys.has(key)) {
			undeclaredKeys.push(key);
			continue;
		}
		const syncedValue = OVERRIDE_KEYS.get(key) ?? value;
		if (!syncedValue) {
			emptyKeys.push(key);
			continue;
		}
		env.set(key, syncedValue);
	}
}

if (undeclaredKeys.length > 0) {
	console.log(\`Skipping \${undeclaredKeys.join(", ")}: not declared in .env.schema.\`);
}
if (emptyKeys.length > 0) {
	console.warn(
		\`Warning: \${emptyKeys.join(", ")} \${emptyKeys.length === 1 ? "is" : "are"} empty in your .env file(s) and won't be synced. Required values must be set before deploying, or the build or server fails env validation.\`,
	);
}

{{#if (includes addons "axiom")}}
for (const key of ["AXIOM_API_KEY", "AXIOM_DATASET", "AXIOM_EDGE_URL"] as const) {
	const value = process.env[key];
	if (value) env.set(key, value);
}
{{/if}}

if (env.size === 0) {
	console.log("No Vercel env vars found to sync.");
	process.exit(0);
}

const LOCAL_VALUE_PATTERN = /localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0|^file:/i;
const localKeys = [...env.entries()]
	.filter(([, value]) => LOCAL_VALUE_PATTERN.test(value))
	.map(([key]) => key);
if (localKeys.length > 0) {
	console.warn(
		\`Warning: \${localKeys.join(", ")} look\${localKeys.length === 1 ? "s" : ""} like local-only value(s). Update them in your .env file(s) and re-run this sync if your deployed app should not point at local endpoints.\`,
	);
}

console.log(\`Syncing \${env.size} env var(s) to Vercel \${environment}.\`);
for (const [key, value] of env.entries()) {
	const result = spawnSync(
		VERCEL_COMMAND[0],
		[
			...VERCEL_COMMAND.slice(1),
			"env",
			"add",
			key,
			environment,
			"--force",
			"--yes",
			"--non-interactive",
			...vercelArgs,
		],
		{
			input: \`\${value}\\n\`,
			stdio: ["pipe", "inherit", "inherit"],
			encoding: "utf8",
			// Windows resolves bunx/npx/pnpm via .cmd shims, which need a shell
			shell: process.platform === "win32",
		},
	);

	if (result.error) {
		console.error(\`Failed to sync \${key}: \${result.error.message}\`);
		process.exit(1);
	}

	if (result.status !== 0) {
		console.error(\`Failed to sync \${key}\`);
		process.exit(result.status ?? 1);
	}
}

console.log("Vercel env sync complete. Redeploy for changes to take effect.");
`],
  ["env/auth-client.ts.hbs", `import { createClient, type AuthClient } from "@{{projectName}}/auth/client";
{{#unless (eq backend "self")}}
import { ENV } from "./env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";

{{> getServerUrl}}
{{/unless}}

export const authClient: AuthClient = createClient({{#unless (eq backend "self")}}{{#if (and (eq webDeploy serverDeploy) (or (eq webDeploy "vercel") (eq webDeploy "docker")))}}new URL("/api/auth", getServerUrl(ENV.VITE_SERVER_URL)).toString(){{else}}ENV.VITE_SERVER_URL{{/if}}{{/unless}});
`],
  ["env/env.server.ts.hbs", `{{#if (and (eq serverDeploy "cloudflare") (or (ne backend "self") (ne webDeploy "cloudflare")))}}
/// <reference types="@cloudflare/workers-types" />
/// <reference path="../cloudflare-env.d.ts" />
// For Cloudflare Workers, env is accessed via cloudflare:workers module
// Types are defined in env.d.ts based on your alchemy.run.ts bindings
export { env as ENV } from "cloudflare:workers";
{{else if (and (eq backend "self") (eq webDeploy "cloudflare"))}}
/// <reference types="@cloudflare/workers-types" />
/// <reference path="../cloudflare-env.d.ts" />
// For Cloudflare Workers, env is accessed via cloudflare:workers module
// Types are defined in env.d.ts based on your alchemy.run.ts bindings
export { env as ENV } from "cloudflare:workers";
{{else}}
{{#if (ne backend "self")}}
import "varlock/auto-load";
{{/if}}
export { ENV } from "./env";
{{/if}}
{{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}

/** Packaged desktop builds serve the frontend from their own origin, not CORS_ORIGIN. */
export const desktopOrigins = [
{{#if (includes addons "electrobun")}}
	"views://mainview",
{{/if}}
{{#if (includes addons "tauri")}}
	"tauri://localhost",
	"http://tauri.localhost",
{{/if}}
];
{{/if}}
`],
  ["env/services.ts.hbs", `import { ENV{{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}, desktopOrigins{{/if}} } from "./env.server";
{{#if (ne database "none")}}
import { {{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}type Database, {{/if}}createDb } from "@{{projectName}}/db";
{{/if}}
{{#if (eq auth "better-auth")}}
import { createAuth{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}} as createConfiguredAuth{{/if}} } from "@{{projectName}}/auth";
{{/if}}

{{#if (or (eq runtime "workers") (eq serverDeploy "cloudflare") (and (eq backend "self") (eq webDeploy "cloudflare")))}}
{{#if (ne database "none")}}
export function getDb(): Database {
  return createDb(ENV);
}
{{/if}}
{{#if (eq auth "better-auth")}}
export async function createAuth({{#if (ne database "none")}}database?: Database{{/if}}) {
  return createConfiguredAuth(ENV{{#if (ne database "none")}}, database ?? getDb(){{/if}}{{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}, desktopOrigins{{/if}});
}
{{/if}}
{{else}}
{{#if (ne database "none")}}
export const db = createDb(ENV);
{{/if}}
{{#if (eq auth "better-auth")}}
export const auth = createAuth(ENV{{#if (ne database "none")}}, db{{/if}}{{#if (and (ne backend "self") (or (includes addons "electrobun") (includes addons "tauri")))}}, desktopOrigins{{/if}});
{{/if}}
{{/if}}
`],
  ["examples/ai/convex/packages/backend/convex/agent.ts.hbs", `import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "./_generated/api";

export const chatAgent = new Agent(components.agent, {
  name: "Chat Agent",
  languageModel: google("gemini-2.5-flash"),
  instructions: "You are a helpful AI assistant. Be concise and friendly in your responses.",
});
`],
  ["examples/ai/convex/packages/backend/convex/chat.ts.hbs", `import {
  createThread,
  listUIMessages,
  saveMessage,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { components, internal } from "./_generated/api";
import { internalAction, mutation, query } from "./_generated/server";
import { chatAgent } from "./agent";

export const createNewThread = mutation({
  args: {},
  handler: async (ctx) => {
    const threadId = await createThread(ctx, components.agent, {});
    return threadId;
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});

export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
    });
    await ctx.scheduler.runAfter(0, internal.chat.generateResponseAsync, {
      threadId,
      promptMessageId: messageId,
    });
    return messageId;
  },
});

export const generateResponseAsync = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (ctx, { threadId, promptMessageId }) => {
    await chatAgent.streamText(
      ctx,
      { threadId },
      { promptMessageId },
      { saveStreamDeltas: true },
    );
  },
});
`],
  ["examples/ai/fullstack/tanstack-start/src/routes/api/ai/$.ts.hbs", `import { createFileRoute } from "@tanstack/react-router";
import { google } from "@ai-sdk/google";
import { createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage, convertToModelMessages, wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";

export const Route = createFileRoute("/api/ai/$")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages }: { messages: UIMessage[] } = await request.json();

          const model = wrapLanguageModel({
            model: google("gemini-2.5-flash"),
            middleware: devToolsMiddleware(),
          });
          const result = streamText({
            model,
            messages: await convertToModelMessages(messages),
          });

          return createUIMessageStreamResponse({
            stream: toUIMessageStream({ stream: result.stream }),
          });
        } catch (error) {
          console.error("AI API error:", error);
          return new Response(
            JSON.stringify({ error: "Failed to process AI request" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
`],
  ["examples/ai/web/react/tanstack-router/src/routes/ai.tsx.hbs", `{{#if (eq backend "convex")}}
import { api } from "@{{projectName}}/backend/convex/_generated/api";
import {
  useSmoothText,
  useUIMessages,
} from "@convex-dev/agent/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import {
  ArrowUpIcon,
  Loader2,
  MessageCircleDashedIcon,
  RotateCwIcon,
} from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Streamdown } from "streamdown";

import { Bubble, BubbleContent } from "@{{projectName}}/ui/components/bubble";
import { Button } from "@{{projectName}}/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@{{projectName}}/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@{{projectName}}/ui/components/input-group";
import {
  Message,
  MessageContent as MessageBody,
  MessageHeader,
} from "@{{projectName}}/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@{{projectName}}/ui/components/message-scroller";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@{{projectName}}/ui/components/tooltip";

export const Route = createFileRoute("/ai")({
  component: RouteComponent,
});

function StreamingMessageText({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const [visibleText] = useSmoothText(text, {
    startStreaming: isStreaming,
  });

  return <Streamdown>{visibleText}</Streamdown>;
}

function RouteComponent() {
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createThread = useMutation(api.chat.createNewThread);
  const sendMessage = useMutation(api.chat.sendMessage);

  const { results: messages } = useUIMessages(
    api.chat.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true },
  );

  const hasStreamingMessage = messages?.some(
    (m) => m.status === "streaming",
  );
  const isBusy = isLoading || Boolean(hasStreamingMessage);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;

    setIsLoading(true);
    setInput("");

    try {
      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await createThread();
        setThreadId(currentThreadId);
      }

      await sendMessage({ threadId: currentThreadId, prompt: text });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const resetConversation = () => {
    setInput("");
    setThreadId(null);
  };

  return (
    <MessageScrollerProvider>
      <div className="flex h-full min-h-0 w-full flex-col">
        <header className="shrink-0 border-b px-4 py-3">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-sm font-medium">New Chat</h1>
              <p className="text-xs/relaxed text-muted-foreground">
                How can I help you today?
              </p>
            </div>
            <div className="shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Reset conversation"
                        onClick={resetConversation}
                        disabled={isBusy}
                      />
                    }
                  >
                    <RotateCwIcon />
                  </TooltipTrigger>
                  <TooltipContent>Reset</TooltipContent>
                </Tooltip>
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1">
              {(!messages || messages.length === 0) && !isLoading ? (
                <Empty className="mx-auto h-full max-w-3xl px-4">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageCircleDashedIcon />
                    </EmptyMedia>
                    <EmptyTitle>Morning, {{projectName}}!</EmptyTitle>
                    <EmptyDescription>
                      What are we working on today?
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <MessageScroller>
                  <MessageScrollerViewport>
                    <MessageScrollerContent
                      aria-busy={isBusy}
                      className="mx-auto w-full max-w-3xl px-4 py-6"
                    >
                      {messages.map((message) => {
                        const isUser = message.role === "user";

	                        return (
	                          <MessageScrollerItem
	                            key={\`\${message.order}-\${message.stepOrder}\`}
	                            scrollAnchor={isUser}
	                          >
                            <Message align={isUser ? "end" : "start"}>
                              <MessageBody>
                                <MessageHeader>
                                  {isUser ? "You" : "AI Assistant"}
                                </MessageHeader>
                                <Bubble
                                  align={isUser ? "end" : "start"}
                                  variant={isUser ? "default" : "secondary"}
                                >
                                  <BubbleContent>
                                    <StreamingMessageText
                                      text={(message.parts ?? [])
                                        .map((part) => (part.type === "text" ? part.text : ""))
                                        .join("")}
                                      isStreaming={message.status === "streaming"}
                                    />
                                  </BubbleContent>
                                </Bubble>
                              </MessageBody>
                            </Message>
                          </MessageScrollerItem>
                        );
                      })}
                      {isLoading && !hasStreamingMessage && (
                        <MessageScrollerItem>
                          <Message align="start">
                            <MessageBody>
                              <Bubble variant="secondary">
                                <BubbleContent className="flex items-center gap-2">
                                  <Loader2 className="size-3.5 animate-spin" />
                                  <span className="shimmer">Thinking...</span>
                                </BubbleContent>
                              </Bubble>
                            </MessageBody>
                          </Message>
                        </MessageScrollerItem>
                      )}
                      <MessageScrollerItem scrollAnchor />
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  <MessageScrollerButton />
                </MessageScroller>
              )}
        </main>
        <footer className="shrink-0 border-t px-4 py-3">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
              <form onSubmit={handleSubmit} className="w-full">
                <InputGroup>
                  <InputGroupTextarea
                    name="prompt"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    placeholder="Type your message..."
                    className="max-h-32 min-h-14"
                    rows={1}
                    autoComplete="off"
                    autoFocus
                    disabled={isBusy}
                  />
                  <InputGroupAddon align="block-end" className="pt-1">
                    <InputGroupButton
                      type="submit"
                      variant="default"
                      size="icon-sm"
                      disabled={isBusy || !input.trim()}
                      className="ml-auto"
                    >
                      {isBusy ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <ArrowUpIcon />
                      )}
                      <span className="sr-only">Send</span>
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
            </form>
          </div>
        </footer>
      </div>
    </MessageScrollerProvider>
  );
}
{{else}}
import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import {
  ArrowUpIcon,
  Loader2,
  MessageCircleDashedIcon,
  RotateCwIcon,
} from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Streamdown } from "streamdown";
{{#unless (eq backend "self")}}
import { ENV } from "../env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";
{{/unless}}

import { Bubble, BubbleContent } from "@{{projectName}}/ui/components/bubble";
import { Button } from "@{{projectName}}/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@{{projectName}}/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@{{projectName}}/ui/components/input-group";
import {
  Message,
  MessageContent as MessageBody,
  MessageHeader,
} from "@{{projectName}}/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@{{projectName}}/ui/components/message-scroller";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@{{projectName}}/ui/components/tooltip";

export const Route = createFileRoute("/ai")({
  component: RouteComponent,
});

function RouteComponent() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: {{#if (eq backend "self")}}"/api/ai"{{else}}\`\${ENV.VITE_SERVER_URL}/ai\`{{/if}},
    }),
  });
  const isSending = status === "submitted" || status === "streaming";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    sendMessage({ text });
    setInput("");
  };

  const handlePromptKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const resetConversation = () => {
    setInput("");
    setMessages([]);
  };

  return (
    <MessageScrollerProvider>
      <div className="flex h-full min-h-0 w-full flex-col">
        <header className="shrink-0 border-b px-4 py-3">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-sm font-medium">New Chat</h1>
              <p className="text-xs/relaxed text-muted-foreground">
                How can I help you today?
              </p>
            </div>
            <div className="shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Reset conversation"
                        onClick={resetConversation}
                        disabled={isSending}
                      />
                    }
                  >
                    <RotateCwIcon />
                  </TooltipTrigger>
                  <TooltipContent>Reset</TooltipContent>
                </Tooltip>
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1">
              {messages.length === 0 && !isSending ? (
                <Empty className="mx-auto h-full max-w-3xl px-4">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageCircleDashedIcon />
                    </EmptyMedia>
                    <EmptyTitle>Morning, {{projectName}}!</EmptyTitle>
                    <EmptyDescription>
                      What are we working on today?
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <MessageScroller>
                  <MessageScrollerViewport>
                    <MessageScrollerContent
                      aria-busy={isSending}
                      className="mx-auto w-full max-w-3xl px-4 py-6"
                    >
                      {messages.map((message) => {
                        const isUser = message.role === "user";

                        return (
                          <MessageScrollerItem
                            key={message.id}
                            scrollAnchor={isUser}
                          >
                            <Message align={isUser ? "end" : "start"}>
                              <MessageBody>
                                <MessageHeader>
                                  {isUser ? "You" : "AI Assistant"}
                                </MessageHeader>
                                <Bubble
                                  align={isUser ? "end" : "start"}
                                  variant={isUser ? "default" : "secondary"}
                                >
                                  <BubbleContent>
                                    {message.parts?.map((part, index) => {
                                      if (part.type === "text") {
                                        return (
                                          <Streamdown
                                            key={index}
                                            isAnimating={status === "streaming" && message.role === "assistant"}
                                          >
                                            {part.text}
                                          </Streamdown>
                                        );
                                      }
                                      return null;
                                    })}
                                  </BubbleContent>
                                </Bubble>
                              </MessageBody>
                            </Message>
                          </MessageScrollerItem>
                        );
                      })}
                      {status === "submitted" && (
                        <MessageScrollerItem>
                          <Message align="start">
                            <MessageBody>
                              <Bubble variant="secondary">
                                <BubbleContent className="flex items-center gap-2">
                                  <Loader2 className="size-3.5 animate-spin" />
                                  <span className="shimmer">Thinking...</span>
                                </BubbleContent>
                              </Bubble>
                            </MessageBody>
                          </Message>
                        </MessageScrollerItem>
                      )}
                      <MessageScrollerItem scrollAnchor />
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  <MessageScrollerButton />
                </MessageScroller>
              )}
        </main>
        <footer className="shrink-0 border-t px-4 py-3">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
              <form onSubmit={handleSubmit} className="w-full">
                <InputGroup>
                  <InputGroupTextarea
                    name="prompt"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    placeholder="Type your message..."
                    className="max-h-32 min-h-14"
                    rows={1}
                    autoComplete="off"
                    autoFocus
                    disabled={isSending}
                  />
                  <InputGroupAddon align="block-end" className="pt-1">
                    <InputGroupButton
                      type="submit"
                      variant="default"
                      size="icon-sm"
                      disabled={isSending || !input.trim()}
                      className="ml-auto"
                    >
                      {isSending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <ArrowUpIcon />
                      )}
                      <span className="sr-only">Send</span>
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
            </form>
          </div>
        </footer>
      </div>
    </MessageScrollerProvider>
  );
}
{{/if}}
`],
  ["examples/ai/web/react/tanstack-start/src/routes/ai.tsx.hbs", `{{#if (eq backend "convex")}}
import { api } from "@{{projectName}}/backend/convex/_generated/api";
import {
  useSmoothText,
  useUIMessages,
} from "@convex-dev/agent/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import {
  ArrowUpIcon,
  Loader2,
  MessageCircleDashedIcon,
  RotateCwIcon,
} from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Streamdown } from "streamdown";

import { Bubble, BubbleContent } from "@{{projectName}}/ui/components/bubble";
import { Button } from "@{{projectName}}/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@{{projectName}}/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@{{projectName}}/ui/components/input-group";
import {
  Message,
  MessageContent as MessageBody,
  MessageHeader,
} from "@{{projectName}}/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@{{projectName}}/ui/components/message-scroller";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@{{projectName}}/ui/components/tooltip";

export const Route = createFileRoute("/ai")({
  component: RouteComponent,
});

function StreamingMessageText({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const [visibleText] = useSmoothText(text, {
    startStreaming: isStreaming,
  });

  return <Streamdown>{visibleText}</Streamdown>;
}

function RouteComponent() {
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createThread = useMutation(api.chat.createNewThread);
  const sendMessage = useMutation(api.chat.sendMessage);

  const { results: messages } = useUIMessages(
    api.chat.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true },
  );

  const hasStreamingMessage = messages?.some(
    (m) => m.status === "streaming",
  );
  const isBusy = isLoading || Boolean(hasStreamingMessage);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;

    setIsLoading(true);
    setInput("");

    try {
      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await createThread();
        setThreadId(currentThreadId);
      }

      await sendMessage({ threadId: currentThreadId, prompt: text });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const resetConversation = () => {
    setInput("");
    setThreadId(null);
  };

  return (
    <MessageScrollerProvider>
      <div className="flex h-full min-h-0 w-full flex-col">
        <header className="shrink-0 border-b px-4 py-3">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-sm font-medium">New Chat</h1>
              <p className="text-xs/relaxed text-muted-foreground">
                How can I help you today?
              </p>
            </div>
            <div className="shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Reset conversation"
                        onClick={resetConversation}
                        disabled={isBusy}
                      />
                    }
                  >
                    <RotateCwIcon />
                  </TooltipTrigger>
                  <TooltipContent>Reset</TooltipContent>
                </Tooltip>
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1">
              {(!messages || messages.length === 0) && !isLoading ? (
                <Empty className="mx-auto h-full max-w-3xl px-4">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageCircleDashedIcon />
                    </EmptyMedia>
                    <EmptyTitle>Morning, {{projectName}}!</EmptyTitle>
                    <EmptyDescription>
                      What are we working on today?
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <MessageScroller>
                  <MessageScrollerViewport>
                    <MessageScrollerContent
                      aria-busy={isBusy}
                      className="mx-auto w-full max-w-3xl px-4 py-6"
                    >
                      {messages.map((message) => {
                        const isUser = message.role === "user";

	                        return (
	                          <MessageScrollerItem
	                            key={\`\${message.order}-\${message.stepOrder}\`}
	                            scrollAnchor={isUser}
	                          >
                            <Message align={isUser ? "end" : "start"}>
                              <MessageBody>
                                <MessageHeader>
                                  {isUser ? "You" : "AI Assistant"}
                                </MessageHeader>
                                <Bubble
                                  align={isUser ? "end" : "start"}
                                  variant={isUser ? "default" : "secondary"}
                                >
                                  <BubbleContent>
                                    <StreamingMessageText
                                      text={(message.parts ?? [])
                                        .map((part) => (part.type === "text" ? part.text : ""))
                                        .join("")}
                                      isStreaming={message.status === "streaming"}
                                    />
                                  </BubbleContent>
                                </Bubble>
                              </MessageBody>
                            </Message>
                          </MessageScrollerItem>
                        );
                      })}
                      {isLoading && !hasStreamingMessage && (
                        <MessageScrollerItem>
                          <Message align="start">
                            <MessageBody>
                              <Bubble variant="secondary">
                                <BubbleContent className="flex items-center gap-2">
                                  <Loader2 className="size-3.5 animate-spin" />
                                  <span className="shimmer">Thinking...</span>
                                </BubbleContent>
                              </Bubble>
                            </MessageBody>
                          </Message>
                        </MessageScrollerItem>
                      )}
                      <MessageScrollerItem scrollAnchor />
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  <MessageScrollerButton />
                </MessageScroller>
              )}
        </main>
        <footer className="shrink-0 border-t px-4 py-3">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
              <form onSubmit={handleSubmit} className="w-full">
                <InputGroup>
                  <InputGroupTextarea
                    name="prompt"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    placeholder="Type your message..."
                    className="max-h-32 min-h-14"
                    rows={1}
                    autoComplete="off"
                    autoFocus
                    disabled={isBusy}
                  />
                  <InputGroupAddon align="block-end" className="pt-1">
                    <InputGroupButton
                      type="submit"
                      variant="default"
                      size="icon-sm"
                      disabled={isBusy || !input.trim()}
                      className="ml-auto"
                    >
                      {isBusy ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <ArrowUpIcon />
                      )}
                      <span className="sr-only">Send</span>
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
            </form>
          </div>
        </footer>
      </div>
    </MessageScrollerProvider>
  );
}
{{else}}
import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import {
  ArrowUpIcon,
  Loader2,
  MessageCircleDashedIcon,
  RotateCwIcon,
} from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Streamdown } from "streamdown";
{{#unless (eq backend "self")}}
import { ENV } from "../env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";
{{/unless}}

import { Bubble, BubbleContent } from "@{{projectName}}/ui/components/bubble";
import { Button } from "@{{projectName}}/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@{{projectName}}/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@{{projectName}}/ui/components/input-group";
import {
  Message,
  MessageContent as MessageBody,
  MessageHeader,
} from "@{{projectName}}/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@{{projectName}}/ui/components/message-scroller";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@{{projectName}}/ui/components/tooltip";

export const Route = createFileRoute("/ai")({
  component: RouteComponent,
});

function RouteComponent() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: {{#if (eq backend "self")}}"/api/ai"{{else}}\`\${ENV.VITE_SERVER_URL}/ai\`{{/if}},
    }),
  });
  const isSending = status === "submitted" || status === "streaming";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    sendMessage({ text });
    setInput("");
  };

  const handlePromptKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const resetConversation = () => {
    setInput("");
    setMessages([]);
  };

  return (
    <MessageScrollerProvider>
      <div className="flex h-full min-h-0 w-full flex-col">
        <header className="shrink-0 border-b px-4 py-3">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-sm font-medium">New Chat</h1>
              <p className="text-xs/relaxed text-muted-foreground">
                How can I help you today?
              </p>
            </div>
            <div className="shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Reset conversation"
                        onClick={resetConversation}
                        disabled={isSending}
                      />
                    }
                  >
                    <RotateCwIcon />
                  </TooltipTrigger>
                  <TooltipContent>Reset</TooltipContent>
                </Tooltip>
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1">
              {messages.length === 0 && !isSending ? (
                <Empty className="mx-auto h-full max-w-3xl px-4">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageCircleDashedIcon />
                    </EmptyMedia>
                    <EmptyTitle>Morning, {{projectName}}!</EmptyTitle>
                    <EmptyDescription>
                      What are we working on today?
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <MessageScroller>
                  <MessageScrollerViewport>
                    <MessageScrollerContent
                      aria-busy={isSending}
                      className="mx-auto w-full max-w-3xl px-4 py-6"
                    >
                      {messages.map((message) => {
                        const isUser = message.role === "user";

                        return (
                          <MessageScrollerItem
                            key={message.id}
                            scrollAnchor={isUser}
                          >
                            <Message align={isUser ? "end" : "start"}>
                              <MessageBody>
                                <MessageHeader>
                                  {isUser ? "You" : "AI Assistant"}
                                </MessageHeader>
                                <Bubble
                                  align={isUser ? "end" : "start"}
                                  variant={isUser ? "default" : "secondary"}
                                >
                                  <BubbleContent>
                                    {message.parts?.map((part, index) => {
                                      if (part.type === "text") {
                                        return (
                                          <Streamdown
                                            key={index}
                                            isAnimating={status === "streaming" && message.role === "assistant"}
                                          >
                                            {part.text}
                                          </Streamdown>
                                        );
                                      }
                                      return null;
                                    })}
                                  </BubbleContent>
                                </Bubble>
                              </MessageBody>
                            </Message>
                          </MessageScrollerItem>
                        );
                      })}
                      {status === "submitted" && (
                        <MessageScrollerItem>
                          <Message align="start">
                            <MessageBody>
                              <Bubble variant="secondary">
                                <BubbleContent className="flex items-center gap-2">
                                  <Loader2 className="size-3.5 animate-spin" />
                                  <span className="shimmer">Thinking...</span>
                                </BubbleContent>
                              </Bubble>
                            </MessageBody>
                          </Message>
                        </MessageScrollerItem>
                      )}
                      <MessageScrollerItem scrollAnchor />
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  <MessageScrollerButton />
                </MessageScroller>
              )}
        </main>
        <footer className="shrink-0 border-t px-4 py-3">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
              <form onSubmit={handleSubmit} className="w-full">
                <InputGroup>
                  <InputGroupTextarea
                    name="prompt"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    placeholder="Type your message..."
                    className="max-h-32 min-h-14"
                    rows={1}
                    autoComplete="off"
                    autoFocus
                    disabled={isSending}
                  />
                  <InputGroupAddon align="block-end" className="pt-1">
                    <InputGroupButton
                      type="submit"
                      variant="default"
                      size="icon-sm"
                      disabled={isSending || !input.trim()}
                      className="ml-auto"
                    >
                      {isSending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <ArrowUpIcon />
                      )}
                      <span className="sr-only">Send</span>
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
            </form>
          </div>
        </footer>
      </div>
    </MessageScrollerProvider>
  );
}
{{/if}}
`],
  ["examples/todo/convex/packages/backend/convex/todos.ts.hbs", `import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("todos").collect();
    },
});

export const create = mutation({
    args: {
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const newTodoId = await ctx.db.insert("todos", {
            text: args.text,
            completed: false,
        });
        return await ctx.db.get("todos", newTodoId);
    },
});

export const toggle = mutation({
    args: {
        id: v.id("todos"),
        completed: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch("todos", args.id, { completed: args.completed });
        return { success: true };
    },
});

export const deleteTodo = mutation({
    args: {
        id: v.id("todos"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete("todos", args.id);
        return { success: true };
    },
});`],
  ["examples/todo/server/drizzle/base/src/routers/todo.ts.hbs", `{{#if (eq api "orpc")}}
import { eq } from "drizzle-orm";
import z from "zod";
import { todo } from "@{{projectName}}/db/schema/todo";
import { publicProcedure } from "../index";

export const todoRouter = {
  getAll: publicProcedure.handler(async ({ context }) => {
    return await context.db.select().from(todo);
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      return await context.db
        .insert(todo)
        .values({
          text: input.text,
        });
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .handler(async ({ input, context }) => {
      return await context.db
        .update(todo)
        .set({ completed: input.completed })
        .where(eq(todo.id, input.id));
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input, context }) => {
      return await context.db.delete(todo).where(eq(todo.id, input.id));
    }),
};
{{/if}}

{{#if (eq api "trpc")}}
import z from "zod";
import { router, publicProcedure } from "../index";
import { todo } from "@{{projectName}}/db/schema/todo";
import { eq } from "drizzle-orm";

export const todoRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(todo);
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.insert(todo).values({
        text: input.text,
      });
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(todo)
        .set({ completed: input.completed })
        .where(eq(todo.id, input.id));
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.delete(todo).where(eq(todo.id, input.id));
    }),
});
{{/if}}
`],
  ["examples/todo/server/drizzle/mysql/src/schema/todo.ts", `import { mysqlTable, varchar, int, boolean } from "drizzle-orm/mysql-core";

export const todo = mysqlTable("todo", {
  id: int("id").primaryKey().autoincrement(),
  text: varchar("text", { length: 255 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
});
`],
  ["examples/todo/server/drizzle/postgres/src/schema/todo.ts", `import { pgTable, text, boolean, serial } from "drizzle-orm/pg-core";

export const todo = pgTable("todo", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
});
`],
  ["examples/todo/server/drizzle/sqlite/src/schema/todo.ts", `import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todo = sqliteTable("todo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
});
`],
  ["examples/todo/server/mongoose/base/src/routers/todo.ts.hbs", `{{#if (eq api "orpc")}}
import z from "zod";
import "@{{projectName}}/db";
import { publicProcedure } from "../index";
import { Todo } from "@{{projectName}}/db/models/todo.model";

export const todoRouter = {
    getAll: publicProcedure.handler(async () => {
        const todos = await Todo.find().lean();
        return todos.map((todo) => ({ ...todo, id: todo.id }));
    }),

    create: publicProcedure
        .input(z.object({ text: z.string().min(1) }))
        .handler(async ({ input }) => {
            const newTodo = await Todo.create({ text: input.text });
            const todo = newTodo.toObject();
            return { ...todo, id: todo.id };
    }),

    toggle: publicProcedure
        .input(z.object({ id: z.string(), completed: z.boolean() }))
        .handler(async ({ input }) => {
            await Todo.updateOne({ id: input.id }, { completed: input.completed });
            return { success: true };
    }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            await Todo.deleteOne({ id: input.id });
            return { success: true };
    }),
};

{{/if}}

{{#if (eq api "trpc")}}
import z from "zod";
import "@{{projectName}}/db";
import { router, publicProcedure } from "../index";
import { Todo } from "@{{projectName}}/db/models/todo.model";

export const todoRouter = router({
    getAll: publicProcedure.query(async () => {
        const todos = await Todo.find().lean();
        return todos.map((todo) => ({ ...todo, id: todo.id }));
    }),

    create: publicProcedure
        .input(z.object({ text: z.string().min(1) }))
        .mutation(async ({ input }) => {
            const newTodo = await Todo.create({ text: input.text });
        const todo = newTodo.toObject();
        return { ...todo, id: todo.id };
    }),

    toggle: publicProcedure
        .input(z.object({ id: z.string(), completed: z.boolean() }))
        .mutation(async ({ input }) => {
            await Todo.updateOne({ id: input.id }, { completed: input.completed });
            return { success: true };
    }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await Todo.deleteOne({ id: input.id });
            return { success: true };
    }),
});
{{/if}}
`],
  ["examples/todo/server/mongoose/mongodb/src/models/todo.model.ts.hbs", `import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const todoSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  collection: 'todo',
  id: false,
});

const Todo = model('Todo', todoSchema);

export { Todo };
`],
  ["examples/todo/server/prisma/base/src/routers/todo.ts.hbs", `{{#if (eq api "orpc")}}
import z from "zod";
import { publicProcedure } from "../index";

export const todoRouter = {
  getAll: publicProcedure.handler(async ({ context }) => {
    return await context.db.todo.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      return await context.db.todo.create({
        data: {
          text: input.text,
        },
      });
    }),

  toggle: publicProcedure
    {{#if (eq database "mongodb")}}
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    {{else}}
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    {{/if}}
    .handler(async ({ input, context }) => {
      return await context.db.todo.update({
        where: { id: input.id },
        data: { completed: input.completed },
      });
    }),

  delete: publicProcedure
    {{#if (eq database "mongodb")}}
    .input(z.object({ id: z.string() }))
    {{else}}
    .input(z.object({ id: z.number() }))
    {{/if}}
    .handler(async ({ input, context }) => {
      return await context.db.todo.delete({
        where: { id: input.id },
      });
    }),
};
{{/if}}

{{#if (eq api "trpc")}}
import { TRPCError } from "@trpc/server";
import z from "zod";
import { publicProcedure, router } from "../index";

export const todoRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.todo.findMany({
      orderBy: {
        id: "asc"
      }
    });
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.todo.create({
        data: {
          text: input.text,
        },
      });
    }),

  toggle: publicProcedure
    {{#if (eq database "mongodb")}}
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    {{else}}
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    {{/if}}
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.db.todo.update({
          where: { id: input.id },
          data: { completed: input.completed },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Todo not found",
        });
      }
    }),

  delete: publicProcedure
    {{#if (eq database "mongodb")}}
    .input(z.object({ id: z.string() }))
    {{else}}
    .input(z.object({ id: z.number() }))
    {{/if}}
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.db.todo.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Todo not found",
        });
      }
    }),
});
{{/if}}
`],
  ["examples/todo/server/prisma/mongodb/prisma/schema/todo.prisma.hbs", `model Todo {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  text      String
  completed Boolean @default(false)

  @@map("todo")
}
`],
  ["examples/todo/server/prisma/mysql/prisma/schema/todo.prisma.hbs", `model Todo {
  id        Int     @id @default(autoincrement())
  text      String
  completed Boolean @default(false)

  @@map("todo")
}
`],
  ["examples/todo/server/prisma/postgres/prisma/schema/todo.prisma.hbs", `model Todo {
  id        Int     @id @default(autoincrement())
  text      String
  completed Boolean @default(false)

  @@map("todo")
}
`],
  ["examples/todo/server/prisma/sqlite/prisma/schema/todo.prisma.hbs", `model Todo {
  id        Int     @id @default(autoincrement())
  text      String
  completed Boolean @default(false)

  @@map("todo")
}
`],
  ["examples/todo/web/react/tanstack-router/src/routes/todos.tsx.hbs", `import { Button } from "@{{projectName}}/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@{{projectName}}/ui/components/card";
import { Checkbox } from "@{{projectName}}/ui/components/checkbox";
import { Input } from "@{{projectName}}/ui/components/input";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

{{#if (eq backend "convex")}}
import { useMutation, useQuery } from "convex/react";
import { api } from "@{{projectName}}/backend/convex/_generated/api";
import type { Id } from "@{{projectName}}/backend/convex/_generated/dataModel";
{{else}}
  {{#if (eq api "orpc")}}
  import { orpc } from "@/utils/orpc";
  {{/if}}
  {{#if (eq api "trpc")}}
  import { trpc } from "@/utils/trpc";
  {{/if}}
import { useMutation, useQuery } from "@tanstack/react-query";
{{/if}}

{{#unless (eq backend "convex")}}
type TodoId = {{#if (or (eq orm "mongoose") (eq database "mongodb"))}}string{{else}}number{{/if}};
{{/unless}}

export const Route = createFileRoute("/todos")({
  component: TodosRoute,
});

function TodosRoute() {
  const [newTodoText, setNewTodoText] = useState("");

  {{#if (eq backend "convex")}}
  const todos = useQuery(api.todos.getAll);
  const createTodo = useMutation(api.todos.create);
  const toggleTodo = useMutation(api.todos.toggle);
  const deleteTodo = useMutation(api.todos.deleteTodo);

  const handleAddTodo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = newTodoText.trim();
    if (!text) return;
    await createTodo({ text });
    setNewTodoText("");
  };

  const handleToggleTodo = (id: Id<"todos">, currentCompleted: boolean) => {
    toggleTodo({ id, completed: !currentCompleted });
  };

  const handleDeleteTodo = (id: Id<"todos">) => {
    deleteTodo({ id });
  };
  {{else}}
    {{#if (eq api "orpc")}}
    const todos = useQuery(orpc.todo.getAll.queryOptions());
    const createMutation = useMutation(
      orpc.todo.create.mutationOptions({
        onSuccess: () => {
          todos.refetch();
          setNewTodoText("");
        },
      }),
    );
    const toggleMutation = useMutation(
      orpc.todo.toggle.mutationOptions({
        onSuccess: () => { todos.refetch() },
      }),
    );
    const deleteMutation = useMutation(
      orpc.todo.delete.mutationOptions({
        onSuccess: () => { todos.refetch() },
      }),
    );
    {{/if}}
    {{#if (eq api "trpc")}}
    const todos = useQuery(trpc.todo.getAll.queryOptions());
    const createMutation = useMutation(
      trpc.todo.create.mutationOptions({
        onSuccess: () => {
          todos.refetch();
          setNewTodoText("");
        },
      }),
    );
    const toggleMutation = useMutation(
      trpc.todo.toggle.mutationOptions({
        onSuccess: () => { todos.refetch() },
      }),
    );
    const deleteMutation = useMutation(
      trpc.todo.delete.mutationOptions({
        onSuccess: () => { todos.refetch() },
      }),
    );
    {{/if}}

  const handleAddTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      createMutation.mutate({ text: newTodoText });
    }
  };

  const handleToggleTodo = (id: TodoId, completed: boolean) => {
    toggleMutation.mutate({ id, completed: !completed });
  };

  const handleDeleteTodo = (id: TodoId) => {
    deleteMutation.mutate({ id });
  };
  {{/if}}

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
          <CardDescription>Manage your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddTodo}
            className="mb-6 flex items-center space-x-2"
          >
            <Input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add a new task..."
              {{#if (eq backend "convex")}}
              {{else}}
              disabled={createMutation.isPending}
              {{/if}}
            />
            <Button
              type="submit"
              {{#if (eq backend "convex")}}
              disabled={!newTodoText.trim()}
              {{else}}
              disabled={createMutation.isPending || !newTodoText.trim()}
              {{/if}}
            >
              {{#if (eq backend "convex")}}
              Add
              {{else}}
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              {{/if}}
            </Button>
          </form>

          {{#if (eq backend "convex")}}
            {todos === undefined ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : todos.length === 0 ? (
              <p className="py-4 text-center">No todos yet. Add one above!</p>
            ) : (
              <ul className="space-y-2">
                {todos.map((todo) => (
                  <li
                    key={todo._id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() =>
                          handleToggleTodo(todo._id, todo.completed)
                        }
                        id={\`todo-\${todo._id}\`}
                      />
                      <label
                        htmlFor={\`todo-\${todo._id}\`}
                        className={\`\${todo.completed ? "line-through text-muted-foreground" : ""}\`}
                      >
                        {todo.text}
                      </label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTodo(todo._id)}
                      aria-label="Delete todo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          {{else}}
            {todos.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : todos.data?.length === 0 ? (
              <p className="py-4 text-center">
                No todos yet. Add one above!
              </p>
            ) : (
              <ul className="space-y-2">
                {todos.data?.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() =>
                          handleToggleTodo(todo.id, todo.completed)
                        }
                        id={\`todo-\${todo.id}\`}
                      />
                      <label
                        htmlFor={\`todo-\${todo.id}\`}
                        className={\`\${todo.completed ? "line-through" : ""}\`}
                      >
                        {todo.text}
                      </label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTodo(todo.id)}
                      aria-label="Delete todo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          {{/if}}
        </CardContent>
      </Card>
    </div>
  );
}
`],
  ["examples/todo/web/react/tanstack-start/src/routes/todos.tsx.hbs", `import { Button } from "@{{projectName}}/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@{{projectName}}/ui/components/card";
import { Checkbox } from "@{{projectName}}/ui/components/checkbox";
import { Input } from "@{{projectName}}/ui/components/input";
import { createFileRoute } from "@tanstack/react-router";
{{#if (eq backend "convex")}}
import { Trash2 } from "lucide-react";
{{else}}
import { Loader2, Trash2 } from "lucide-react";
{{/if}}
import { useState, type FormEvent } from "react";

{{#if (eq backend "convex")}}
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { api } from "@{{projectName}}/backend/convex/_generated/api";
import type { Id } from "@{{projectName}}/backend/convex/_generated/dataModel";
{{else}}
{{#if (eq api "trpc")}}
import { useTRPC } from "@/utils/trpc";
{{/if}}
{{#if (eq api "orpc")}}
import { orpc } from "@/utils/orpc";
{{/if}}
import { useMutation, useQuery } from "@tanstack/react-query";
{{/if}}

{{#unless (eq backend "convex")}}
type TodoId = {{#if (or (eq orm "mongoose") (eq database "mongodb"))}}string{{else}}number{{/if}};
{{/unless}}

export const Route = createFileRoute("/todos")({
  component: TodosRoute,
});

function TodosRoute() {
  const [newTodoText, setNewTodoText] = useState("");

  {{#if (eq backend "convex")}}
  const todosQuery = useSuspenseQuery(convexQuery(api.todos.getAll, {}));
  const todos = todosQuery.data;

  const createTodo = useMutation(api.todos.create);
  const toggleTodo = useMutation(api.todos.toggle);
  const removeTodo = useMutation(api.todos.deleteTodo);

  const handleAddTodo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = newTodoText.trim();
    if (text) {
      setNewTodoText("");
      try {
        await createTodo({ text });
      } catch (error) {
        console.error("Failed to add todo:", error);
        setNewTodoText(text);
      }
    }
  };

  const handleToggleTodo = async (id: Id<"todos">, completed: boolean) => {
    try {
      await toggleTodo({ id, completed: !completed });
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const handleDeleteTodo = async (id: Id<"todos">) => {
    try {
      await removeTodo({ id });
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };
  {{else}}
    {{#if (eq api "trpc")}}
  const trpc = useTRPC();
    {{/if}}
    {{#if (eq api "orpc")}}
    {{/if}}

    {{#if (eq api "trpc")}}
  const todos = useQuery(trpc.todo.getAll.queryOptions());
  const createMutation = useMutation(
    trpc.todo.create.mutationOptions({
      onSuccess: () => {
        todos.refetch();
        setNewTodoText("");
      },
    }),
  );
  const toggleMutation = useMutation(
    trpc.todo.toggle.mutationOptions({
      onSuccess: () => { todos.refetch() },
    }),
  );
  const deleteMutation = useMutation(
    trpc.todo.delete.mutationOptions({
      onSuccess: () => { todos.refetch() },
    }),
  );
    {{/if}}
    {{#if (eq api "orpc")}}
  const todos = useQuery(orpc.todo.getAll.queryOptions());
  const createMutation = useMutation(
    orpc.todo.create.mutationOptions({
      onSuccess: () => {
        todos.refetch();
        setNewTodoText("");
      },
    }),
  );
  const toggleMutation = useMutation(
    orpc.todo.toggle.mutationOptions({
      onSuccess: () => { todos.refetch() },
    }),
  );
  const deleteMutation = useMutation(
    orpc.todo.delete.mutationOptions({
      onSuccess: () => { todos.refetch() },
    }),
  );
    {{/if}}

  const handleAddTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      createMutation.mutate({ text: newTodoText });
    }
  };

  const handleToggleTodo = (id: TodoId, completed: boolean) => {
    toggleMutation.mutate({ id, completed: !completed });
  };

  const handleDeleteTodo = (id: TodoId) => {
    deleteMutation.mutate({ id });
  };
  {{/if}}

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Todo List{{#if (eq backend "convex")}} (Convex){{/if}}</CardTitle>
          <CardDescription>Manage your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddTodo}
            className="mb-6 flex items-center space-x-2"
          >
            <Input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add a new task..."
              {{#unless (eq backend "convex")}}
              disabled={createMutation.isPending}
              {{/unless}}
            />
            <Button
              type="submit"
              {{#unless (eq backend "convex")}}
              disabled={createMutation.isPending || !newTodoText.trim()}
              {{else}}
              disabled={!newTodoText.trim()}
              {{/unless}}
            >
              {{#unless (eq backend "convex")}}
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
              {{else}}
              Add
              {{/unless}}
            </Button>
          </form>

          {{#if (eq backend "convex")}}
          {todos?.length === 0 ? (
            <p className="py-4 text-center">No todos yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {todos?.map((todo) => (
                <li
                  key={todo._id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() =>
                        handleToggleTodo(todo._id, todo.completed)
                      }
                      id={\`todo-\${todo._id}\`}
                    />
                    <label
                      htmlFor={\`todo-\${todo._id}\`}
                      className={\`\${
                        todo.completed
                          ? "text-muted-foreground line-through"
                          : ""
                      }\`}
                    >
                      {todo.text}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTodo(todo._id)}
                    aria-label="Delete todo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {{else}}
          {todos.isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : todos.data?.length === 0 ? (
            <p className="py-4 text-center">No todos yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {todos.data?.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() =>
                        handleToggleTodo(todo.id, todo.completed)
                      }
                      id={\`todo-\${todo.id}\`}
                    />
                    <label
                      htmlFor={\`todo-\${todo.id}\`}
                      className={\`\${todo.completed ? "line-through" : ""}\`}
                    >
                      {todo.text}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTodo(todo.id)}
                    aria-label="Delete todo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {{/if}}
        </CardContent>
      </Card>
    </div>
  );
}
`],
  ["extras/_npmrc.hbs", `node-linker=isolated
`],
  ["extras/env.d.ts.hbs", `{{#if (eq serverDeploy "cloudflare")}}
import type { ServerEnv } from "@{{projectName}}/infra/alchemy.run";
{{else}}
import type { WebEnv as ServerEnv } from "@{{projectName}}/infra/alchemy.run";
{{/if}}

// This file infers types for the cloudflare:workers environment from your Alchemy Worker.
// @see https://alchemy.run/cloudflare/compute/workers

export type CloudflareEnv = ServerEnv;

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
}
`],
  ["frontend/react/tanstack-router/index.html.hbs", `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>

  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`],
  ["frontend/react/tanstack-router/package.json.hbs", `{
	"name": "web",
	"version": "0.0.0",
	"private": true,
	"type": "module",
	"scripts": {
		"dev": "vite dev",
		"build": "{{#if (and (eq api "orpc") (ne backend "convex") (ne backend "none"))}}tsc -b ../../packages/api && {{/if}}vite build",
		"serve": "vite preview",
		"start": "vite",
		"check-types": "{{#if (and (eq api "orpc") (ne backend "convex") (ne backend "none"))}}tsc -b ../../packages/api && {{/if}}vite build && tsc --noEmit"
	},
	"dependencies": {
        "@{{projectName}}/ui": "{{#if (eq packageManager "npm")}}*{{else}}workspace:*{{/if}}",
		"@tailwindcss/vite": "^4.3.3",
		"@tanstack/react-router": "^1.170.41",
		"lucide-react": "^1.52.0",
        "next-themes": "^0.4.6",
		"react": "^19.3.0",
		"react-dom": "^19.3.0",
        "sonner": "^2.0.8"
	},
	"devDependencies": {
		"@tanstack/react-router-devtools": "^1.167.2",
		"@tanstack/router-plugin": "^1.168.42",
		"@types/node": "^26.6.4",
		"@types/react": "^19.3.0",
		"@types/react-dom": "^19.3.0",
		"@vitejs/plugin-react": "^6.1.2",
		"oxc-transform-react": "^0.152.0",
		"postcss": "^8.5.28",
		"tailwindcss": "^4.3.3",
		"vite": "^8.3.2"
	}
}
`],
  ["frontend/react/tanstack-router/src/components/mode-toggle.tsx.hbs", `import { Moon, Sun } from "lucide-react";

import { Button } from "@{{projectName}}/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@{{projectName}}/ui/components/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`],
  ["frontend/react/tanstack-router/src/components/theme-provider.tsx.hbs", `import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { useTheme } from "next-themes";
`],
  ["frontend/react/tanstack-router/src/main.tsx.hbs", `import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
{{#if (and (eq auth "clerk") (ne backend "convex") (ne api "none"))}}
import { useEffect } from "react";
import { setClerkAuthTokenGetter } from "@/utils/clerk-auth";
{{/if}}
import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";

{{#if (eq api "orpc")}}
  import { QueryClientProvider } from "@tanstack/react-query";
  import { orpc, queryClient } from "./utils/orpc";
{{/if}}
{{#if (eq api "trpc")}}
  import { QueryClientProvider } from "@tanstack/react-query";
  import { queryClient, trpc } from "./utils/trpc";
{{/if}}
{{#if (or (eq backend "convex") (eq auth "clerk"))}}
  import { ENV } from "./env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";
{{/if}}
{{#if (eq auth "clerk")}}
  import { ClerkProvider{{#if (or (eq backend "convex") (ne api "none"))}}, useAuth{{/if}} } from "@clerk/react";
{{/if}}
{{#if (eq backend "convex")}}
  import { ConvexReactClient } from "convex/react";
  {{#if (eq auth "clerk")}}
  import { ConvexProviderWithClerk } from "convex/react-clerk";
  {{else if (eq auth "better-auth")}}
  import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
  import { authClient } from "@/lib/auth-client";
  {{else}}
  import { ConvexProvider } from "convex/react";
  {{/if}}
  const convex = new ConvexReactClient(ENV.VITE_CONVEX_URL);
{{/if}}

{{#if (and (eq auth "clerk") (ne backend "convex") (ne api "none"))}}
function ClerkApiAuthBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkAuthTokenGetter(getToken);

    return () => {
      setClerkAuthTokenGetter(null);
    };
  }, [getToken]);

  return null;
}
{{/if}}

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPendingComponent: () => <Loader />,
  {{#if (eq api "orpc")}}
  context: { orpc, queryClient },
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      {{#if (eq auth "clerk")}}
      <ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}>
        <ClerkApiAuthBridge />
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ClerkProvider>
      {{else}}
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
      {{/if}}
    );
  },
  {{else if (eq api "trpc")}}
  context: { trpc, queryClient },
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      {{#if (eq auth "clerk")}}
      <ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}>
        <ClerkApiAuthBridge />
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ClerkProvider>
      {{else}}
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
      {{/if}}
    );
  },
  {{else if (eq backend "convex")}}
  context: {},
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    {{#if (eq auth "clerk")}}
    return (
      <ClerkProvider
        publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
    {{else if (eq auth "better-auth")}}
    return <ConvexBetterAuthProvider client={convex} authClient={authClient}>{children}</ConvexBetterAuthProvider>;
    {{else}}
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
    {{/if}}
  },
  {{else if (eq auth "clerk")}}
  context: {},
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return <ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}>{children}</ClerkProvider>;
  },
  {{else}}
  context: {},
  {{/if}}
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
`],
  ["frontend/react/tanstack-router/src/routes/__root.tsx.hbs", `import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@{{projectName}}/ui/components/sonner";
{{#if (eq api "orpc")}}
import { link, orpc } from "@/utils/orpc";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "@{{projectName}}/api/routers/index";
import { createORPCClient } from "@orpc/client";
{{/if}}
{{#if (eq api "trpc")}}
import type { trpc } from "@/utils/trpc";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
{{/if}}
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";

{{#if (eq api "orpc")}}
export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}
{{else if (eq api "trpc")}}
export interface RouterAppContext {
  trpc: typeof trpc;
  queryClient: QueryClient;
}
{{else}}
export interface RouterAppContext {}
{{/if}}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "{{projectName}}",
      },
      {
        name: "description",
        content: "{{projectName}} is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  {{#if (eq api "orpc")}}
  const [client] = useState<AppRouterClient>(() => createORPCClient(link));
  const [orpcUtils] = useState(() => createTanstackQueryUtils(client));
  {{/if}}

  return (
    <>
      <HeadContent />
      {{#if (eq api "orpc")}}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          storageKey="vite-ui-theme"
        >
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header />
            <Outlet />
          </div>
          <Toaster richColors />
        </ThemeProvider>
      {{else}}
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="grid grid-rows-[auto_1fr] h-svh">
          <Header />
          <Outlet />
        </div>
        <Toaster richColors />
      </ThemeProvider>
      {{/if}}
      <TanStackRouterDevtools position="bottom-left" />
      {{#if (or (eq api "orpc") (eq api "trpc"))}}
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
      {{/if}}
    </>
  );
}
`],
  ["frontend/react/tanstack-router/src/routes/index.tsx.hbs", `import { createFileRoute } from "@tanstack/react-router";
{{#if (eq api "orpc")}}
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
{{/if}}
{{#if (eq api "trpc")}}
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
{{/if}}
{{#if (eq backend "convex")}}
import { useQuery } from "convex/react";
import { api } from "@{{ projectName }}/backend/convex/_generated/api";
{{/if}}

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TITLE_TEXT = \`
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 \`;

function HomeComponent() {
  {{#if (eq api "orpc")}}
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  {{/if}}
  {{#if (eq api "trpc")}}
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  {{/if}}
  {{#if (eq backend "convex")}}
  const healthCheck = useQuery(api.healthCheck.get);
  {{/if}}

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          {{#if (eq backend "convex")}}
          <div className="flex items-center gap-2">
            <div
              className={\`h-2 w-2 rounded-full \${healthCheck === "OK" ? "bg-green-500" : healthCheck === undefined ? "bg-orange-400" : "bg-red-500"}\`}
            />
            <span className="text-sm text-muted-foreground">
              {healthCheck === undefined
                ? "Checking..."
                : healthCheck === "OK"
                  ? "Connected"
                  : "Error"}
            </span>
          </div>
          {{else}}
            {{#unless (eq api "none")}}
            <div className="flex items-center gap-2">
              <div
                className={\`h-2 w-2 rounded-full \${healthCheck.data ? "bg-green-500" : "bg-red-500"}\`}
              />
              <span className="text-sm text-muted-foreground">
                {healthCheck.isLoading
                  ? "Checking..."
                  : healthCheck.data
                    ? "Connected"
                    : "Disconnected"}
              </span>
            </div>
            {{/unless}}
          {{/if}}
        </section>
      </div>
    </div>
  );
}
`],
  ["frontend/react/tanstack-router/tsconfig.json.hbs", `{
  {{#if (and (eq api "orpc") (ne backend "convex") (ne backend "none"))}}
  "references": [{ "path": "../../packages/api" }],
  {{/if}}
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true,
    "types": ["vite/client"],
    "rootDirs": ["."],
    "paths": {
      "@/*": ["./src/*"],
      "@{{projectName}}/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
`],
  ["frontend/react/tanstack-router/vite.config.ts.hbs", `{{#unless (eq webDeploy "cloudflare")}}
import { varlockVitePlugin } from "@varlock/vite-integration";
{{/unless}}
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "{{#if (includes addons "vite-plus")}}vite-plus{{else}}vite{{/if}}";

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
{{#unless (eq webDeploy "cloudflare")}}
    varlockVitePlugin({ ssrInjectMode: "auto-load" }),
{{/unless}}
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({ compiler: true }),
  ],
});
`],
  ["frontend/react/tanstack-start/package.json.hbs", `{
  "name": "web",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "{{#if (and (eq api "orpc") (ne backend "convex") (ne backend "none"))}}tsc -b ../../packages/api && {{/if}}vite build",
    "serve": "vite preview",
    "dev": "vite dev",
    "check-types": "{{#if (and (eq api "orpc") (ne backend "convex") (ne backend "none"))}}tsc -b ../../packages/api && {{/if}}vite build && tsc --noEmit"
  },
  "dependencies": {
    "@{{projectName}}/ui": "{{#if (eq packageManager "npm")}}*{{else}}workspace:*{{/if}}",
    "@tailwindcss/vite": "^4.3.3",
    "@tanstack/react-query": "^5.104.1",
    "@tanstack/react-router": "^1.170.41",
    "@tanstack/react-start": "^1.168.60",
    "lucide-react": "^1.52.0",
    "next-themes": "^0.4.6",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "sonner": "^2.0.8",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@tanstack/react-router-devtools": "^1.167.2",
    "@testing-library/dom": "^10.4.2",
    "@testing-library/react": "^16.3.3",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "oxc-transform-react": "^0.152.0",
    "jsdom": "^30.1.1",
    "vite": "^8.3.2",
    "web-vitals": "^6.2.2"
  }
}
`],
  ["frontend/react/tanstack-start/public/robots.txt", `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
`],
  ["frontend/react/tanstack-start/src/router.tsx.hbs", `{{#if (eq backend "convex")}}
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { routeTree } from "./routeTree.gen";
import Loader from "./components/loader";
import { ENV } from "./env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";
{{else}}
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
{{#if (eq api "trpc")}}
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";
import type { AppRouter } from "@{{projectName}}/api/routers/index";
import { TRPCProvider } from "./utils/trpc";
{{#unless (eq backend "self")}}
import { ENV } from "./env{{#if (eq webDeploy "cloudflare")}}.public{{/if}}";
{{/unless}}
{{#if (eq auth "clerk")}}
import { getClerkAuthToken } from "@/utils/clerk-auth";
{{/if}}
{{else if (eq api "orpc")}}
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createQueryClient, orpc } from "./utils/orpc";
{{/if}}
{{/if}}

{{#if (eq backend "convex")}}
export function getRouter() {
	const convexUrl = ENV.VITE_CONVEX_URL;
	if (!convexUrl) {
		throw new Error("VITE_CONVEX_URL is not set");
	}

	const convexQueryClient = new ConvexQueryClient(convexUrl);

	const queryClient: QueryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
	});
	convexQueryClient.connect(queryClient);

	const router = createTanStackRouter({
		routeTree,
		defaultPreload: "intent",
		defaultPendingComponent: () => <Loader />,
		defaultNotFoundComponent: () => <div>Not Found</div>,
		context: { queryClient, convexQueryClient },
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
}
{{else}}
{{#if (eq api "trpc")}}
{{#unless (eq backend "self")}}
{{> getServerUrl}}

{{/unless}}
function createQueryClient() {
	return new QueryClient({
		queryCache: new QueryCache({
			onError: (error, query) => {
				toast.error(error.message, {
					action: {
						label: "retry",
						onClick: () => {
							query.invalidate();
						},
					},
				});
			},
		}),
		defaultOptions: { queries: { staleTime: 60 * 1000 } },
	});
}

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
{{#if (eq backend "self")}}
			url: "/api/trpc",
{{else if (and (eq webDeploy serverDeploy) (or (eq webDeploy "vercel") (eq webDeploy "docker")))}}
			url: \`\${getServerUrl(ENV.VITE_SERVER_URL)}/trpc\`,
{{else}}
			url: \`\${ENV.VITE_SERVER_URL.replace(/\\/$/, "")}/trpc\`,
{{/if}}
{{#if (eq auth "clerk")}}
			headers: async () => {
				const token = await getClerkAuthToken();
				return token ? { Authorization: \`Bearer \${token}\` } : {};
			},
{{/if}}
{{#if (eq auth "better-auth")}}
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
{{/if}}
		}),
	],
});
{{else if (eq api "orpc")}}
{{/if}}

export const getRouter = () => {
{{#if (eq api "trpc")}}
	const queryClient = createQueryClient();
	const trpc = createTRPCOptionsProxy({
		client: trpcClient,
		queryClient,
	});
{{else if (eq api "orpc")}}
	const queryClient = createQueryClient();
{{/if}}

	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
{{#if (eq api "trpc")}}
		context: { trpc, queryClient },
{{else if (eq api "orpc")}}
		context: { orpc, queryClient },
{{else}}
		context: {},
{{/if}}
		defaultPendingComponent: () => <Loader />,
		defaultNotFoundComponent: () => <div>Not Found</div>,
{{#if (eq api "trpc")}}
		Wrap: ({ children }) => (
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		),
{{/if}}
	});
{{#if (or (eq api "trpc") (eq api "orpc"))}}

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});
{{/if}}

	return router;
};
{{/if}}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
`],
  ["frontend/react/tanstack-start/src/routes/__root.tsx.hbs", `import { Toaster } from "@{{projectName}}/ui/components/sonner";
{{#unless (eq backend "convex")}} {{#unless (eq api "none")}}
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
{{/unless}} {{/unless}}
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
{{#if (and (eq backend "convex") (or (eq auth "clerk") (eq auth "better-auth")))}}
  useRouteContext,
{{/if}}
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "../components/header";
import appCss from "../index.css?url";
{{#if (eq backend "convex")}}
import type { QueryClient } from "@tanstack/react-query";
import type { ConvexQueryClient } from "@convex-dev/react-query";
{{else}}
{{#if (or (eq api "trpc") (eq api "orpc"))}}
import type { QueryClient } from "@tanstack/react-query";
{{/if}}
{{/if}}

{{#if (eq auth "clerk")}}
import { ClerkProvider{{#if (or (eq backend "convex") (ne api "none"))}}, useAuth{{/if}} } from "@clerk/tanstack-react-start";
{{/if}}
{{#if (and (eq auth "clerk") (ne backend "convex") (ne api "none"))}}
import { useEffect } from "react";
import { setClerkAuthTokenGetter } from "@/utils/clerk-auth";
{{/if}}
{{#if (and (eq backend "convex") (eq auth "clerk"))}}
import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { userId, getToken } = await auth();
  const token = await getToken();
  return { userId, token };
});
{{else if (and (eq backend "convex") (eq auth "better-auth"))}}
import { createServerFn } from "@tanstack/react-start";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { getToken } from "@/lib/auth-server";

const getAuth = createServerFn({ method: "GET" }).handler(async () => {
  return await getToken();
});
{{else if (eq backend "convex")}}
import { ConvexProvider } from "convex/react";
{{/if}}

{{#if (and (eq auth "clerk") (ne backend "convex") (ne api "none"))}}
function ClerkApiAuthBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkAuthTokenGetter(getToken);

    return () => {
      setClerkAuthTokenGetter(null);
    };
  }, [getToken]);

  return null;
}
{{/if}}

{{#if (eq backend "convex")}}
export interface RouterAppContext {
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}
{{else}}
  {{#if (eq api "trpc")}}
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@{{projectName}}/api/routers/index";
export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}
  {{else if (eq api "orpc")}}
import type { orpc } from "@/utils/orpc";
export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}
  {{else}}
export interface RouterAppContext {
}
  {{/if}}
{{/if}}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "My App",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
  {{#if (and (eq backend "convex") (eq auth "clerk"))}}
  beforeLoad: async (ctx) => {
    const { userId, token } = await fetchClerkAuth();
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
    return { userId, token };
  },
  {{else if (and (eq backend "convex") (eq auth "better-auth"))}}
  beforeLoad: async (ctx) => {
    const token = await getAuth();
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
    return {
      isAuthenticated: !!token,
      token,
    };
  },
  {{/if}}
});

function RootDocument() {
  {{#if (and (eq backend "convex") (eq auth "clerk"))}}
  const context = useRouteContext({ from: Route.id });
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={context.convexQueryClient.convexClient} useAuth={useAuth}>
        <html lang="en" className="dark">
          <head>
            <HeadContent />
          </head>
          <body>
            <div className="grid h-svh grid-rows-[auto_1fr]">
              <Header />
              <Outlet />
            </div>
            <Toaster richColors />
            <TanStackRouterDevtools position="bottom-left" />
            <Scripts />
          </body>
        </html>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
  {{else if (and (eq backend "convex") (eq auth "better-auth"))}}
  const context = useRouteContext({ from: Route.id });
  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
      initialToken={context.token}
    >
      <html lang="en" className="dark">
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Header />
            <Outlet />
          </div>
          <Toaster richColors />
          <TanStackRouterDevtools position="bottom-left" />
          <Scripts />
        </body>
      </html>
    </ConvexBetterAuthProvider>
  );
  {{else if (eq auth "clerk")}}
  return (
    <ClerkProvider>
      {{#unless (eq api "none")}}
      <ClerkApiAuthBridge />
      {{/unless}}
      <html lang="en" className="dark">
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Header />
            <Outlet />
          </div>
          <Toaster richColors />
          <TanStackRouterDevtools position="bottom-left" />
          {{#unless (eq api "none")}}
          <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
          {{/unless}}
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  );
  {{else if (eq backend "convex")}}
  const { convexQueryClient } = Route.useRouteContext();
  return (
    <ConvexProvider client={convexQueryClient.convexClient}>
      <html lang="en" className="dark">
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Header />
            <Outlet />
          </div>
          <Toaster richColors />
          <TanStackRouterDevtools position="bottom-left" />
          <Scripts />
        </body>
      </html>
    </ConvexProvider>
  );
  {{else}}
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="grid h-svh grid-rows-[auto_1fr]">
          <Header />
          <Outlet />
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        {{#unless (eq api "none")}}
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        {{/unless}}
        <Scripts />
      </body>
    </html>
  );
  {{/if}}
}
`],
  ["frontend/react/tanstack-start/src/routes/index.tsx.hbs", `import { createFileRoute } from "@tanstack/react-router";
{{#if (eq backend "convex")}}
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@{{projectName}}/backend/convex/_generated/api";
{{else if (or (eq api "trpc") (eq api "orpc"))}}
import { useQuery } from "@tanstack/react-query";
  {{#if (eq api "trpc")}}
import { useTRPC } from "@/utils/trpc";
  {{/if}}
  {{#if (eq api "orpc")}}
import { orpc } from "@/utils/orpc";
  {{/if}}
{{/if}}

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TITLE_TEXT = \`
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 \`;

function HomeComponent() {
  {{#if (eq backend "convex")}}
  const healthCheck = useQuery(convexQuery(api.healthCheck.get, {}));
  {{else if (eq api "trpc")}}
  const trpc = useTRPC();
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  {{else if (eq api "orpc")}}
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  {{/if}}

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          {{#if (eq backend "convex")}}
          <div className="flex items-center gap-2">
            <div
              className={\`h-2 w-2 rounded-full \${healthCheck.data === "OK" ? "bg-green-500" : healthCheck.isLoading ? "bg-orange-400" : "bg-red-500"}\`}
            />
            <span className="text-muted-foreground text-sm">
              {healthCheck.isLoading
                ? "Checking..."
                : healthCheck.data === "OK"
                  ? "Connected"
                  : "Error"}
            </span>
          </div>
          {{else}}
            {{#unless (eq api "none")}}
            <div className="flex items-center gap-2">
              <div
                className={\`h-2 w-2 rounded-full \${healthCheck.data ? "bg-green-500" : "bg-red-500"}\`}
              />
              <span className="text-muted-foreground text-sm">
                {healthCheck.isLoading
                  ? "Checking..."
                  : healthCheck.data
                    ? "Connected"
                    : "Disconnected"}
              </span>
            </div>
            {{/unless}}
          {{/if}}
        </section>
      </div>
    </div>
  );
}
`],
  ["frontend/react/tanstack-start/tsconfig.json.hbs", `{
  {{#if (and (eq api "orpc") (ne backend "convex") (ne backend "none"))}}
  "references": [{ "path": "../../packages/api" }],
  {{/if}}
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,

    /* Linting */
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "paths": {
      "@/*": ["./src/*"],
      "@{{projectName}}/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
`],
  ["frontend/react/tanstack-start/vite.config.ts.hbs", `{{#unless (eq webDeploy "cloudflare")}}
import { varlockVitePlugin } from "@varlock/vite-integration";
{{/unless}}
import { defineConfig } from "{{#if (includes addons "vite-plus")}}vite-plus{{else}}vite{{/if}}";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
{{#if (or (eq webDeploy "docker") (eq webDeploy "vercel") (and (eq webDeploy "prisma") (ne backend "none")) (and (ne webDeploy "cloudflare") (not (and (eq webDeploy "prisma") (eq backend "none"))) (includes addons "axiom")))}}
import { nitro } from "nitro/vite";
{{/if}}
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
{{#if (and (eq webDeploy "cloudflare") (eq backend "self") (eq orm "prisma"))}}
import { unwasm } from "unwasm/plugin";

const prismaWasm =
  process.env.ALCHEMY_CLOUDFLARE_VITE_INJECTED === "1"
    ? null
    : unwasm({ esmImport: true });
{{/if}}

export default defineConfig({
  server: {
    port: 3001,
  },
{{#if (and (eq webDeploy "cloudflare") (eq backend "self"))}}
  build: {
    rollupOptions: {
      // resolved by workerd at runtime; node builds cannot bundle it
      external: ["cloudflare:workers"],
    },
  },
{{/if}}
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
{{#unless (eq webDeploy "cloudflare")}}
    varlockVitePlugin({ ssrInjectMode: "{{#if (or (eq webDeploy "vercel") (eq webDeploy "prisma"))}}resolved-env{{else}}auto-load{{/if}}" }),
{{/unless}}
{{#if (and (eq webDeploy "cloudflare") (eq backend "self") (eq orm "prisma"))}}
    prismaWasm,
{{/if}}
    tailwindcss(),
    tanstackStart({{#if (or (includes addons "tauri") (and (includes addons "electrobun") (or (ne backend "convex") (ne auth "better-auth"))))}}
      {
        prerender: {
          enabled: true,
        },
      },
{{/if}}),
{{#if (or (eq webDeploy "docker") (eq webDeploy "vercel") (and (eq webDeploy "prisma") (ne backend "none")) (and (ne webDeploy "cloudflare") (not (and (eq webDeploy "prisma") (eq backend "none"))) (includes addons "axiom")))}}
    nitro({{#if (eq webDeploy "docker")}}{ preset: "{{#if (eq runtime "bun")}}bun{{else}}node-server{{/if}}" }{{/if}}),
{{/if}}
    viteReact({ compiler: true }),
  ],
{{#if (eq webDeploy "vercel")}}
  // Bundle all SSR deps: Vercel functions have no node_modules at runtime
  ssr: {
    noExternal: true,
  },
{{else if (and (eq backend "convex") (eq auth "better-auth"))}}
  ssr: {
    noExternal: ["@convex-dev/better-auth"],
  },
{{/if}}
});
`],
  ["frontend/react/web-base/_gitignore", `# Dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# Testing
/coverage

# Build outputs
/build/
/dist/
.vinxi
.output
.tanstack/
.nitro/

# Deployment
.vercel
.netlify
.wrangler
.alchemy

# Environment & local files
.env*
!.env.example
.DS_Store
*.pem
*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
*.log*

# TypeScript
*.tsbuildinfo

# IDE
.vscode/*
!.vscode/extensions.json
.idea

# Other
dev-dist

.wrangler
.dev.vars*
`],
  ["frontend/react/web-base/components.json.hbs", `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-rhea",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@{{projectName}}/ui/lib/utils",
    "ui": "@{{projectName}}/ui/components",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
`],
  ["frontend/react/web-base/src/components/header.tsx.hbs", `import { Link } from "@tanstack/react-router";
{{#unless (includes frontend "tanstack-start")}}
import { ModeToggle } from "./mode-toggle";
{{/unless}}
{{#if (and (eq auth "better-auth") (ne backend "convex"))}}
import UserMenu from "./user-menu";
{{/if}}

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    {{#if (or (eq auth "better-auth") (eq auth "clerk"))}}
      { to: "/dashboard", label: "Dashboard" },
    {{/if}}
    {{#if (includes examples "todo")}}
    { to: "/todos", label: "Todos" },
    {{/if}}
    {{#if (includes examples "ai")}}
    { to: "/ai", label: "AI Chat" },
    {{/if}}
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link
                key={to}
                to={to}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {{#unless (includes frontend "tanstack-start")}}
          <ModeToggle />
          {{/unless}}
          {{#if (and (eq auth "better-auth") (ne backend "convex"))}}
          <UserMenu />
          {{/if}}
        </div>
      </div>
      <hr />
    </div>
  );
}
`],
  ["frontend/react/web-base/src/components/loader.tsx.hbs", `import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <Loader2 className="animate-spin" />
    </div>
  );
}
`],
  ["frontend/react/web-base/src/index.css.hbs", `@import '@{{projectName}}/ui/globals.css';
{{#if (includes examples "ai")}}
@source "../node_modules/streamdown/dist/*.js";
{{/if}}
`],
  ["packages/config/package.json.hbs", `{
  "name": "@{{projectName}}/config",
  "version": "0.0.0",
  "private": true
}
`],
  ["packages/config/tsconfig.base.json.hbs", `{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "verbatimModuleSyntax": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": [
      {{#if (eq runtime "node")}}
        "node"
      {{else if (eq runtime "bun")}}
        "bun"
      {{else if (eq runtime "workers")}}
        "node"
      {{else}}
        "node"
      {{/if}}{{#if (or (eq serverDeploy "cloudflare") (eq webDeploy "cloudflare"))}},
      "@cloudflare/workers-types"{{/if}}
    ]
  }
}`],
  ["packages/infra/package.json.hbs", `{
  "name": "@{{projectName}}/infra",
  "private": true,
  "type": "module",
  "scripts": {
    "check-types": "tsc --noEmit",
    "dev": "alchemy dev",
    "deploy": "alchemy deploy",
    "destroy": "alchemy destroy"
  }
}
`],
  ["packages/infra/tsconfig.json.hbs", `{
  "extends": "@{{projectName}}/config/tsconfig.base.json",
  "include": ["alchemy.run.ts"]
}
`],
  ["packages/ui/components.json.hbs", `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-rhea",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@{{projectName}}/ui/components",
    "utils": "@{{projectName}}/ui/lib/utils",
    "hooks": "@{{projectName}}/ui/hooks",
    "lib": "@{{projectName}}/ui/lib",
    "ui": "@{{projectName}}/ui/components"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
`],
  ["packages/ui/package.json.hbs", `{
  "name": "@{{projectName}}/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./lib/*": "./src/lib/*.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts",
    "./postcss.config": "./postcss.config.mjs"
  },
  "dependencies": {
    "@base-ui/react": "^1.8.0",
    "@fontsource-variable/inter": "^5.3.0",
    "@shadcn/react": "^0.3.1",
    "shadcn": "^4.21.1",
    "class-variance-authority": "^0.7.1",
    "cn": "^0.4.0",
    "lucide-react": "^1.52.0",
    "next-themes": "^0.4.6",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "sonner": "^2.0.8",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "tailwindcss": "^4.3.3"
  },
  "scripts": {
    "check-types": "tsc --noEmit"
  }
}
`],
  ["packages/ui/postcss.config.mjs.hbs", `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`],
  ["packages/ui/src/components/attachment.tsx.hbs", `import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@{{projectName}}/ui/lib/utils"
import { Button } from "@{{projectName}}/ui/components/button"

const attachmentVariants = cva(
  "group/attachment relative flex w-fit max-w-full min-w-0 shrink-0 flex-wrap rounded-2xl border border-transparent bg-card text-card-foreground transition-[color,box-shadow] focus-within:ring-3 focus-within:ring-ring/30 has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed",
  {
    variants: {
      size: {
        default:
          "gap-2 text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
        sm: "gap-2.5 text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1",
        xs: "gap-1.5 rounded-xl text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1",
      },
      orientation: {
        horizontal: "min-w-40 items-center",
        vertical: "w-24 flex-col has-data-[slot=attachment-content]:w-30",
      },
    },
  }
)

function Attachment({
  className,
  state = "done",
  size = "default",
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof attachmentVariants> & {
    state?: "idle" | "uploading" | "processing" | "error" | "done"
  }) {
  const resolvedOrientation = orientation ?? "horizontal"

  return (
    <div
      data-slot="attachment"
      data-state={state}
      data-size={size}
      data-orientation={resolvedOrientation}
      className={cn(attachmentVariants({ size, orientation }), className)}
      {...props}
    />
  )
}

const attachmentMediaVariants = cva(
  "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-foreground group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 group-data-[size=xs]/attachment:rounded-lg group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive group-data-[orientation=vertical]/attachment:*:data-[slot=spinner]:size-6! [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        icon: "",
        image:
          "opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  }
)

function AttachmentMedia({
  className,
  variant = "icon",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof attachmentMediaVariants>) {
  return (
    <div
      data-slot="attachment-media"
      data-variant={variant}
      className={cn(attachmentMediaVariants({ variant }), className)}
      {...props}
    />
  )
}

function AttachmentContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-content"
      className={cn(
        "max-w-full min-w-0 flex-1 leading-tight group-data-[orientation=vertical]/attachment:px-1",
        className
      )}
      {...props}
    />
  )
}

function AttachmentTitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-title"
      className={cn(
        "block max-w-full min-w-0 truncate font-medium group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer",
        className
      )}
      {...props}
    />
  )
}

function AttachmentDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-description"
      className={cn(
        "mt-0.5 block min-w-0 truncate text-xs text-muted-foreground group-data-[state=error]/attachment:text-destructive/80",
        "max-w-full",
        className
      )}
      {...props}
    />
  )
}

function AttachmentActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-actions"
      className={cn(
        "relative z-20 flex shrink-0 items-center group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-3 group-data-[orientation=vertical]/attachment:right-3 group-data-[orientation=vertical]/attachment:gap-1",
        className
      )}
      {...props}
    />
  )
}

function AttachmentAction({
  className,
  variant,
  size = "icon-xs",
  type = "button",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="attachment-action"
      type={type}
      variant={variant ?? "ghost"}
      size={size}
      className={cn(className)}
      {...props}
    />
  )
}

function AttachmentTrigger({
  className,
  render,
  type,
  ...props
}: useRender.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: render ? type : (type ?? "button"),
        className: cn("absolute inset-0 z-10 outline-none", className),
      },
      props
    ),
    render,
    state: {
      slot: "attachment-trigger",
    },
  })
}

function AttachmentGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-group"
      className={cn(
        "flex min-w-0 scroll-fade-x snap-x snap-mandatory scroll-px-1 scrollbar-none gap-3 overflow-x-auto overscroll-x-contain py-1 *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
        className
      )}
      {...props}
    />
  )
}

export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
}
`],
  ["packages/ui/src/components/bubble.tsx.hbs", `import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@{{projectName}}/ui/lib/utils"

function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  )
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
        secondary:
          "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        muted:
          "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
        tinted:
          "*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] *:data-[slot=bubble-content]:text-foreground dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]",
        outline:
          "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30",
        ghost:
          "border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50",
        destructive:
          "*:data-[slot=bubble-content]:bg-destructive/10 *:data-[slot=bubble-content]:text-destructive dark:*:data-[slot=bubble-content]:bg-destructive/20 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Bubble({
  variant = "default",
  align = "start",
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bubbleVariants> & {
    align?: "start" | "end"
  }) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleVariants({ variant }), className)}
      {...props}
    />
  )
}

function BubbleContent({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "w-fit max-w-full min-w-0 overflow-hidden rounded-2xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/30",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "bubble-content",
    },
  })
}

const bubbleReactionsVariants = cva(
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-xl bg-muted px-1.5 py-0.5 text-xs ring-2 ring-card has-[button]:p-0",
  {
    variants: {
      side: {
        top: "top-0 -translate-y-3/4",
        bottom: "bottom-0 translate-y-3/4",
      },
      align: {
        start: "left-3",
        end: "right-3",
      },
    },
    defaultVariants: {
      side: "bottom",
      align: "end",
    },
  }
)

function BubbleReactions({
  side = "bottom",
  align = "end",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "end"
  side?: "top" | "bottom"
}) {
  return (
    <div
      data-slot="bubble-reactions"
      data-align={align}
      data-side={side}
      className={cn(bubbleReactionsVariants({ side, align }), className)}
      {...props}
    />
  )
}

export { BubbleGroup, Bubble, BubbleContent, BubbleReactions }
`],
  ["packages/ui/src/components/button.tsx.hbs", `import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@{{projectName}}/ui/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-transparent dark:hover:bg-input/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
`],
  ["packages/ui/src/components/card.tsx.hbs", `import * as React from "react"

import { cn } from "@{{projectName}}/ui/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-[min(var(--radius-4xl),24px)] bg-card py-(--card-spacing) text-sm text-card-foreground shadow-sm ring-1 ring-foreground/5 [--card-spacing:--spacing(5)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] dark:ring-foreground/10 *:[img:first-child]:rounded-t-[min(var(--radius-4xl),24px)] *:[img:last-child]:rounded-b-[min(var(--radius-4xl),24px)]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-[min(var(--radius-4xl),24px)] px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "cn-font-heading text-base font-medium",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-[min(var(--radius-4xl),24px)] px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
`],
  ["packages/ui/src/components/checkbox.tsx.hbs", `"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@{{projectName}}/ui/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-transparent bg-input/90 transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
`],
  ["packages/ui/src/components/dropdown-menu.tsx.hbs", `"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@{{projectName}}/ui/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-2xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1 text-xs text-muted-foreground data-inset:pl-7",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex min-h-7 cursor-default items-center gap-2 rounded-xl px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex min-h-7 cursor-default items-center gap-2 rounded-xl px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="cn-rtl-flip ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "cn-menu-target cn-menu-translucent w-auto min-w-[96px] rounded-2xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-xl py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-xl py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
`],
  ["packages/ui/src/components/empty.tsx.hbs", `import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@{{projectName}}/ui/lib/utils"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-3xl border-dashed p-12 text-center text-balance",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("cn-font-heading text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
`],
  ["packages/ui/src/components/input-group.tsx.hbs", `"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@{{projectName}}/ui/lib/utils"
import { Button } from "@{{projectName}}/ui/components/button"
import { Input } from "@{{projectName}}/ui/components/input"
import { Textarea } from "@{{projectName}}/ui/components/textarea"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-8 w-full min-w-0 items-center rounded-2xl border border-transparent bg-input/50 transition-[color,box-shadow] duration-200 outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/30 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>textarea]:h-auto dark:bg-transparent",
        "has-[>[data-align=inline-start]]:[&>input]:pl-2 has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 **:data-[slot=kbd]:rounded-2xl **:data-[slot=kbd]:bg-muted-foreground/10 **:data-[slot=kbd]:px-1.5 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]",
        "inline-end":
          "order-last pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]",
        "block-start":
          "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement
          ?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
          ?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 rounded-2xl text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-xl px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs": "size-6 rounded-xl p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
`],
  ["packages/ui/src/components/input.tsx.hbs", `import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@{{projectName}}/ui/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
`],
  ["packages/ui/src/components/label.tsx.hbs", `"use client"

import * as React from "react"

import { cn } from "@{{projectName}}/ui/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
`],
  ["packages/ui/src/components/marker.tsx.hbs", `import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@{{projectName}}/ui/lib/utils"

const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-xs text-muted-foreground [&_svg:not([class*='size-'])]:size-3.5 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground",
  {
    variants: {
      variant: {
        default: "",
        separator:
          "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
        border: "border-b border-border pb-2",
      },
    },
  }
)

function Marker({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof markerVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(markerVariants({ variant, className })),
      },
      props
    ),
    render,
    state: {
      slot: "marker",
      variant,
    },
  })
}

function MarkerIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="marker-icon"
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    />
  )
}

function MarkerContent({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="marker-content"
      className={cn(
        "min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Marker, MarkerIcon, MarkerContent, markerVariants }
`],
  ["packages/ui/src/components/message-scroller.tsx.hbs", `"use client"

import * as React from "react"
import {
  MessageScroller as MessageScrollerPrimitive,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "@shadcn/react/message-scroller"

import { cn } from "@{{projectName}}/ui/lib/utils"
import { Button } from "@{{projectName}}/ui/components/button"
import { ArrowDownIcon } from "lucide-react"

function MessageScrollerProvider(
  props: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>
) {
  return <MessageScrollerPrimitive.Provider {...props} />
}

function MessageScroller({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Root>) {
  return (
    <MessageScrollerPrimitive.Root
      data-slot="message-scroller"
      className={cn(
        "cn-message-scroller group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerViewport({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Viewport>) {
  return (
    <MessageScrollerPrimitive.Viewport
      data-slot="message-scroller-viewport"
      className={cn(
        "cn-message-scroller-viewport size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-none",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerContent({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Content>) {
  return (
    <MessageScrollerPrimitive.Content
      data-slot="message-scroller-content"
      className={cn(
        "cn-message-scroller-content flex h-max min-h-full flex-col gap-6",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerItem({
  className,
  scrollAnchor = false,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Item>) {
  return (
    <MessageScrollerPrimitive.Item
      data-slot="message-scroller-item"
      scrollAnchor={scrollAnchor}
      className={cn(
        "cn-message-scroller-item min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerButton({
  direction = "end",
  className,
  children,
  render,
  variant = "secondary",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Button> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <MessageScrollerPrimitive.Button
      data-slot="message-scroller-button"
      data-direction={direction}
      data-variant={variant}
      data-size={size}
      direction={direction}
      className={cn(
        "cn-message-scroller-button absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
        className
      )}
      render={render ?? <Button variant={variant} size={size} />}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon />
          <span className="sr-only">
            {direction === "end" ? "Scroll to end" : "Scroll to start"}
          </span>
        </>
      )}
    </MessageScrollerPrimitive.Button>
  )
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
}
`],
  ["packages/ui/src/components/message.tsx.hbs", `import * as React from "react"

import { cn } from "@{{projectName}}/ui/lib/utils"

function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-group"
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function Message({
  className,
  align = "start",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        "group/message relative flex w-full min-w-0 gap-1.5 text-xs data-[align=end]:flex-row-reverse",
        className
      )}
      {...props}
    />
  )
}

function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8",
        className
      )}
      {...props}
    />
  )
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end",
        className
      )}
      {...props}
    />
  )
}

function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-header"
      className={cn(
        "flex max-w-full min-w-0 items-center px-2.5 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0",
        className
      )}
      {...props}
    />
  )
}

function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-footer"
      className={cn(
        "flex max-w-full min-w-0 items-center px-2.5 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end",
        className
      )}
      {...props}
    />
  )
}

export {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
}
`],
  ["packages/ui/src/components/skeleton.tsx.hbs", `import { cn } from "@{{projectName}}/ui/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-2xl bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
`],
  ["packages/ui/src/components/sonner.tsx.hbs", `"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons=\\{{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions=\\{{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
`],
  ["packages/ui/src/components/textarea.tsx.hbs", `import * as React from "react"

import { cn } from "@{{projectName}}/ui/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-transparent bg-input/50 px-2.5 py-2 text-base transition-[color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
`],
  ["packages/ui/src/components/tooltip.tsx.hbs", `"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@{{projectName}}/ui/lib/utils"

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-lg data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:translate-x-[1.5px] data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:translate-x-[-1.5px] data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:translate-x-[-1.5px] data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:translate-x-[1.5px] data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
`],
  ["packages/ui/src/hooks/.gitkeep", ``],
  ["packages/ui/src/lib/utils.ts.hbs", `export { cn } from "cn";
`],
  ["packages/ui/src/styles/globals.css.hbs", `@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';
@import '@fontsource-variable/inter';
@source "../../../apps/**/*.{ts,tsx}";
@source "../../../components/**/*.{ts,tsx}";
@source "../**/*.{ts,tsx}";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@theme inline {
  --font-heading: var(--font-sans);
  --font-sans: 'Inter Variable', sans-serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply font-sans bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
`],
  ["packages/ui/tsconfig.json.hbs", `{
  "extends": "@{{projectName}}/config/tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "types": [],
    "paths": {
      "@{{projectName}}/ui/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
`],
  ["payments/polar/convex/backend/convex/polar.ts.hbs", `import { Polar } from "@convex-dev/polar";

import { api, components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { action, query } from "./_generated/server";

type CurrentSubscription = Awaited<ReturnType<Polar<DataModel>["getCurrentSubscription"]>>;

export const polar: Polar<DataModel> = new Polar<DataModel>(components.polar, {
  getUserInfo: async (ctx) => {
    const user = await ctx.runQuery(api.auth.getCurrentUser);

    if (!user) {
      throw new Error("Not authenticated");
    }

    if (!user.email) {
      throw new Error("Authenticated user is missing an email address");
    }

    return {
      userId: user._id,
      email: user.email,
    };
  },
});

export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  listAllSubscriptions,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx): Promise<CurrentSubscription | null> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser);

    if (!user) {
      return null;
    }

    return await polar.getCurrentSubscription(ctx, {
      userId: user._id,
    });
  },
});

export const syncProducts = action({
  args: {},
  handler: async (ctx): Promise<void> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser);

    if (!user) {
      throw new Error("Not authenticated");
    }

    await polar.syncProducts(ctx);
  },
});
`],
  ["payments/polar/server/base/src/lib/payments.ts.hbs", `import { createPolarCore } from "@polar-sh/sdk/2026-10";

export function createPolarClient(config: { POLAR_ACCESS_TOKEN: string }) {
  return createPolarCore({ accessToken: config.POLAR_ACCESS_TOKEN, environment: "sandbox" });
}
`],
  ["payments/polar/web/react/tanstack-router/src/routes/success.tsx.hbs", `import { createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/success")({
	component: SuccessPage,
	validateSearch: (search) => ({
		checkout_id: search.checkout_id as string,
	}),
});

function SuccessPage() {
	const { checkout_id } = useSearch({ from: "/success" });

	return (
		<div className="container mx-auto px-4 py-8">
			<h1>Payment Successful!</h1>
			{checkout_id && <p>Checkout ID: {checkout_id}</p>}
		</div>
	);
}
`],
  ["payments/polar/web/react/tanstack-start/src/functions/get-payment.ts.hbs", `import { authClient } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getPayment = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async () => {
        const { data: customerState } = await authClient.customer.state({
            fetchOptions: {
                headers: getRequestHeaders()
            }
        });
        return customerState;
    });
`],
  ["payments/polar/web/react/tanstack-start/src/routes/success.tsx.hbs", `import { createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/success")({
	component: SuccessPage,
	validateSearch: (search) => ({
		checkout_id: search.checkout_id as string,
	}),
});

function SuccessPage() {
	const { checkout_id } = useSearch({ from: "/success" });

	return (
		<div className="container mx-auto px-4 py-8">
			<h1>Payment Successful!</h1>
			{checkout_id && <p>Checkout ID: {checkout_id}</p>}
		</div>
	);
}
`]
]);

export const TEMPLATE_COUNT = 233;
