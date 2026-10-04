import type { StackState, TechOptions, TechCategory, StackOptionId } from "./types";
export type { StackState } from "./types";

export const ICON_BASE_URL = "https://r2.better-t-stack.dev/icons";

export const TECH_OPTIONS: TechOptions = {
  api: [
    {
      id: "trpc",
      name: "tRPC",
      description: "End-to-end typesafe APIs",
      icon: `${ICON_BASE_URL}/trpc.svg`,
      color: "from-blue-500 to-blue-700",
      default: true,
    },
    {
      id: "orpc",
      name: "oRPC",
      description: "Typesafe APIs Made Simple",
      icon: `${ICON_BASE_URL}/orpc.svg`,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      id: "none",
      name: "No API",
      description: "No API layer (API routes disabled)",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  webFrontend: [
    {
      id: "tanstack-router",
      name: "TanStack Router",
      description: "Modern type-safe router for React",
      icon: `${ICON_BASE_URL}/tanstack.svg`,
      color: "from-blue-400 to-blue-600",
      default: true,
    },
    {
      id: "tanstack-start",
      name: "TanStack Start",
      description: "Full-stack React framework powered by TanStack Router",
      icon: `${ICON_BASE_URL}/tanstack.svg`,
      color: "from-purple-400 to-purple-600",
      default: false,
    },
    {
      id: "none",
      name: "No Web Frontend",
      description: "No web-based frontend",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: false,
    },
  ],
  runtime: [
    {
      id: "bun",
      name: "Bun",
      description: "Fast JavaScript runtime & toolkit",
      icon: `${ICON_BASE_URL}/bun.svg`,
      color: "from-amber-400 to-amber-600",
      default: true,
    },
    {
      id: "node",
      name: "Node.js",
      description: "JavaScript runtime environment",
      icon: `${ICON_BASE_URL}/node.svg`,
      color: "from-green-400 to-green-600",
    },
    {
      id: "workers",
      name: "Cloudflare Workers",
      description: "Serverless runtime for the edge",
      icon: `${ICON_BASE_URL}/workers.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "none",
      name: "No Runtime",
      description: "No specific runtime",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  backend: [
    {
      id: "hono",
      name: "Hono",
      description: "Ultrafast web framework",
      icon: `${ICON_BASE_URL}/hono.svg`,
      color: "from-blue-500 to-blue-700",
      default: true,
    },
    {
      id: "elysia",
      name: "Elysia",
      description: "TypeScript web framework",
      icon: `${ICON_BASE_URL}/elysia.svg`,
      color: "from-purple-500 to-purple-700",
    },
    {
      id: "self-tanstack-start",
      name: "Fullstack TanStack Start",
      description: "Use TanStack Start's built-in API routes",
      icon: `${ICON_BASE_URL}/tanstack.svg`,
      color: "from-purple-400 to-purple-600",
    },
    {
      id: "none",
      name: "No Backend",
      description: "Skip backend integration (frontend only)",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  database: [
    {
      id: "sqlite",
      name: "SQLite",
      description: "File-based SQL database",
      icon: `${ICON_BASE_URL}/sqlite.svg`,
      color: "from-blue-400 to-cyan-500",
      default: true,
    },
    {
      id: "postgres",
      name: "PostgreSQL",
      description: "Advanced SQL database",
      icon: `${ICON_BASE_URL}/postgres.svg`,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      id: "none",
      name: "No Database",
      description: "Skip database integration",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  orm: [
    {
      id: "drizzle",
      name: "Drizzle",
      description: "TypeScript ORM",
      icon: `${ICON_BASE_URL}/drizzle.svg`,
      color: "from-cyan-400 to-cyan-600",
      default: true,
    },
    {
      id: "none",
      name: "No ORM",
      description: "Skip ORM integration",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  dbSetup: [
    {
      id: "turso",
      name: "Turso",
      description: "Distributed SQLite with edge replicas (libSQL)",
      icon: `${ICON_BASE_URL}/turso.svg`,
      color: "from-pink-400 to-pink-600",
    },
    {
      id: "d1",
      name: "Cloudflare D1",
      description: "Serverless SQLite-compatible database for Cloudflare Workers",
      icon: `${ICON_BASE_URL}/workers.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "neon",
      name: "Neon Postgres",
      description: "Serverless Postgres with autoscaling and branching",
      icon: `${ICON_BASE_URL}/neon.svg`,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "prisma-postgres",
      name: "Prisma PostgreSQL",
      description: "Managed Postgres via Prisma Data Platform",
      icon: `${ICON_BASE_URL}/prisma.svg`,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      id: "supabase",
      name: "Supabase",
      description: "Local Postgres stack via Supabase (Docker required)",
      icon: `${ICON_BASE_URL}/supabase.svg`,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      id: "planetscale",
      name: "PlanetScale",
      description: "Managed Postgres on NVMe",
      icon: `${ICON_BASE_URL}/planetscale.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "docker",
      name: "Docker",
      description: "Run PostgreSQL locally via Docker Compose",
      icon: `${ICON_BASE_URL}/docker.svg`,
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "none",
      name: "Basic Setup",
      description: "No cloud DB integration",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: true,
    },
  ],
  webDeploy: [
    {
      id: "cloudflare",
      name: "Cloudflare",
      description: "Deploy to Cloudflare Workers using Alchemy",
      icon: `${ICON_BASE_URL}/workers.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "prisma",
      name: "Prisma",
      description: "Deploy with Prisma using Alchemy",
      icon: `${ICON_BASE_URL}/prisma.svg`,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      id: "docker",
      name: "Docker",
      description: "Self-host with a Dockerfile and docker-compose.yml",
      icon: `${ICON_BASE_URL}/docker.svg`,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "vercel",
      name: "Vercel",
      description: "Deploy to Vercel with Services",
      icon: `${ICON_BASE_URL}/vercel.svg`,
      color: "from-gray-700 to-black",
      experimental: true,
    },
    {
      id: "none",
      name: "None",
      description: "Skip deployment setup",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: true,
    },
  ],
  serverDeploy: [
    {
      id: "cloudflare",
      name: "Cloudflare",
      description: "Deploy to Cloudflare Workers using Alchemy",
      icon: `${ICON_BASE_URL}/workers.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "prisma",
      name: "Prisma",
      description: "Deploy with Prisma using Alchemy",
      icon: `${ICON_BASE_URL}/prisma.svg`,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      id: "docker",
      name: "Docker",
      description: "Self-host with a Dockerfile and docker-compose.yml",
      icon: `${ICON_BASE_URL}/docker.svg`,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "vercel",
      name: "Vercel",
      description: "Deploy to Vercel with Services",
      icon: `${ICON_BASE_URL}/vercel.svg`,
      color: "from-gray-700 to-black",
      experimental: true,
    },
    {
      id: "none",
      name: "None",
      description: "Skip deployment setup",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: true,
    },
  ],
  auth: [
    {
      id: "better-auth",
      name: "Better-Auth",
      description: "The most comprehensive authentication framework for TypeScript",
      icon: `${ICON_BASE_URL}/better-auth.svg`,
      color: "from-green-400 to-green-600",
      default: true,
    },
    {
      id: "clerk",
      name: "Clerk",
      description: "More than authentication, Complete User Management",
      icon: `${ICON_BASE_URL}/clerk.svg`,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "none",
      name: "No Auth",
      description: "Skip authentication",
      icon: "",
      color: "from-red-400 to-red-600",
    },
  ],
  payments: [
    {
      id: "polar",
      name: "Polar",
      description: "Turn your software into a business. 6 lines of code.",
      icon: `${ICON_BASE_URL}/polar.svg`,
      color: "from-purple-400 to-purple-600",
      default: false,
    },
    {
      id: "none",
      name: "No Payments",
      description: "Skip payments integration",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: true,
    },
  ],
  packageManager: [
    {
      id: "npm",
      name: "npm",
      description: "Default package manager",
      icon: `${ICON_BASE_URL}/npm.svg`,
      color: "from-red-500 to-red-700",
      className: "invert-0 dark:invert",
    },
    {
      id: "pnpm",
      name: "pnpm",
      description: "Fast, disk space efficient",
      icon: `${ICON_BASE_URL}/pnpm.svg`,
      color: "from-orange-500 to-orange-700",
    },
    {
      id: "bun",
      name: "bun",
      description: "All-in-one toolkit",
      icon: `${ICON_BASE_URL}/bun.svg`,
      color: "from-amber-500 to-amber-700",
      default: true,
    },
  ],
  addons: [
    {
      id: "pwa",
      name: "PWA (Progressive Web App)",
      description: "Make your app installable and work offline",
      icon: "",
      color: "from-blue-500 to-blue-700",
      default: false,
    },
    {
      id: "tauri",
      name: "Tauri",
      description: "Package static web apps as native desktop apps",
      icon: `${ICON_BASE_URL}/tauri.svg`,
      color: "from-amber-500 to-amber-700",
      default: false,
    },
    {
      id: "electrobun",
      name: "Electrobun",
      description: "Bundle static web apps in a lightweight desktop shell",
      icon: "",
      color: "from-orange-500 to-orange-700",
      default: false,
    },
    {
      id: "fumadocs",
      name: "Fumadocs",
      description: "Build excellent documentation site",
      icon: `${ICON_BASE_URL}/fumadocs.svg`,
      color: "from-indigo-500 to-indigo-700",
      default: false,
    },
    {
      id: "lefthook",
      name: "Lefthook",
      description: "Fast and powerful Git hooks manager",
      icon: "",
      color: "from-red-500 to-red-700",
      default: false,
    },
    {
      id: "oxlint",
      name: "Oxlint",
      description: "Oxlint + Oxfmt (linting & formatting)",
      icon: `${ICON_BASE_URL}/oxc.svg`,
      color: "from-orange-500 to-orange-700",
      default: false,
    },
    {
      id: "turborepo",
      name: "Turborepo",
      description: "High-performance build system",
      icon: `${ICON_BASE_URL}/turborepo.svg`,
      color: "from-gray-400 to-gray-700",
      default: true,
    },
    {
      id: "vite-plus",
      name: "Vite+",
      description: "Unified Vite toolchain, task runner, linting, formatting, and optional hooks",
      icon: `${ICON_BASE_URL}/vite-plus.svg`,
      color: "from-violet-500 to-cyan-600",
      default: false,
    },
    {
      id: "opentui",
      name: "OpenTUI",
      description: "Build terminal user interfaces",
      icon: "",
      color: "from-cyan-500 to-cyan-700",
      default: false,
    },
    {
      id: "skills",
      name: "Skills",
      description: "Install AI agent skills for coding assistants",
      icon: "",
      color: "from-pink-500 to-pink-700",
      default: false,
    },
    {
      id: "mcp",
      name: "MCP",
      description: "Install MCP servers for your agents/editors",
      icon: "",
      color: "from-emerald-500 to-emerald-700",
      default: false,
    },
    {
      id: "evlog",
      name: "evlog",
      description: "Structured request logging with Better Auth context",
      icon: "",
      color: "from-sky-500 to-slate-700",
      default: false,
    },
    {
      id: "axiom",
      name: "Axiom",
      description: "Managed production observability through evlog and Alchemy",
      icon: "",
      color: "from-violet-500 to-indigo-700",
      default: false,
    },
  ],
  examples: [
    {
      id: "todo",
      name: "Todo Example",
      description: "Simple todo application",
      icon: "",
      color: "from-indigo-500 to-indigo-700",
      default: false,
    },
    {
      id: "ai",
      name: "AI Example",
      description: "AI integration example using AI SDK",
      icon: "",
      color: "from-purple-500 to-purple-700",
      default: false,
    },
  ],
  git: [
    {
      id: "true",
      name: "Git",
      description: "Initialize Git repository",
      icon: `${ICON_BASE_URL}/git.svg`,
      color: "from-gray-500 to-gray-700",
      default: true,
    },
    {
      id: "false",
      name: "No Git",
      description: "Skip Git initialization",
      icon: "",
      color: "from-red-400 to-red-600",
    },
  ],
  install: [
    {
      id: "true",
      name: "Install Dependencies",
      description: "Install packages automatically",
      icon: "",
      color: "from-green-400 to-green-600",
      default: true,
    },
    {
      id: "false",
      name: "Skip Install",
      description: "Skip dependency installation",
      icon: "",
      color: "from-yellow-400 to-yellow-600",
    },
  ],
};

export function getStackOptionIds<K extends TechCategory>(category: K): StackOptionId<K>[] {
  return TECH_OPTIONS[category].map(({ id }) => id);
}

export function isStackOption<K extends TechCategory>(
  category: K,
  value: string,
): value is StackOptionId<K> {
  return TECH_OPTIONS[category].some(({ id }) => id === value);
}

export const PRESET_TEMPLATES: {
  id: string;
  name: string;
  description: string;
  stack: StackState;
}[] = [
  {
    id: "tanstack-start",
    name: "TanStack Start Fullstack",
    description: "TanStack Start with server routes, SQLite, Drizzle, and Better Auth",
    stack: {
      projectName: "my-better-t-app",
      webFrontend: ["tanstack-start"],
      runtime: "none",
      backend: "self-tanstack-start",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "none",
      auth: "better-auth",
      payments: "none",
      packageManager: "bun",
      addons: ["turborepo"],
      examples: ["none"],
      git: "true",
      install: "true",
      api: "trpc",
      webDeploy: "none",
      serverDeploy: "none",
      yolo: "false",
    },
  },
];

export const DEFAULT_STACK: StackState = {
  projectName: "my-better-t-app",
  webFrontend: ["tanstack-router"],
  runtime: "bun",
  backend: "hono",
  database: "sqlite",
  orm: "drizzle",
  dbSetup: "none",
  auth: "better-auth",
  payments: "none",
  packageManager: "bun",
  addons: ["turborepo"],
  examples: ["none"],
  git: "true",
  install: "true",
  api: "trpc",
  webDeploy: "none",
  serverDeploy: "none",
  yolo: "false",
};

export const isStackDefault = <K extends keyof StackState>(
  key: K,
  value: StackState[K],
): boolean => {
  const defaultValue = DEFAULT_STACK[key];

  if (key === "webFrontend" || key === "addons" || key === "examples") {
    if (Array.isArray(defaultValue) && Array.isArray(value)) {
      const sortedDefault = [...defaultValue].sort();
      const sortedValue = [...value].sort();
      return (
        sortedDefault.length === sortedValue.length &&
        sortedDefault.every((item, index) => item === sortedValue[index])
      );
    }
  }

  if (Array.isArray(defaultValue) && Array.isArray(value)) {
    const sortedDefault = [...defaultValue].sort();
    const sortedValue = [...value].sort();
    return (
      sortedDefault.length === sortedValue.length &&
      sortedDefault.every((item, index) => item === sortedValue[index])
    );
  }

  return defaultValue === value;
};
