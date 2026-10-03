import type { DesktopWebFrontend, WebFrontend } from "./types";

export const webFrontends = [
  "tanstack-router",
  "tanstack-start",
] as const satisfies readonly Exclude<WebFrontend, "none">[];

export const desktopWebFrontends = [
  "tanstack-router",
  "tanstack-start",
] as const satisfies readonly DesktopWebFrontend[];
