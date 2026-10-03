import { DEFAULT_CONFIG } from "../constants";
import type { Backend, Frontend } from "../types";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableSelect, preferValidInitial } from "./navigable";

// TanStack Start can use its built-in server routes as the backend.
const FULLSTACK_FRONTENDS: readonly Frontend[] = ["tanstack-start"];

export async function getBackendFrameworkChoice(
  backendFramework?: Backend,
  frontends?: Frontend[],
  previousValue?: Backend,
) {
  if (backendFramework !== undefined) return backendFramework;

  const hasFullstackFrontend = frontends?.some((f) => FULLSTACK_FRONTENDS.includes(f));

  const backendOptions: Array<{
    value: Backend;
    label: string;
    hint: string;
  }> = [];

  if (hasFullstackFrontend) {
    backendOptions.push({
      value: "self" as const,
      label: "Self (Fullstack)",
      hint: "Use frontend's built-in api routes",
    });
  }

  backendOptions.push(
    {
      value: "hono" as const,
      label: "Hono",
      hint: "Lightweight, ultrafast web framework",
    },
    {
      value: "elysia" as const,
      label: "Elysia",
      hint: "Ergonomic web framework for building backend servers",
    },
  );

  backendOptions.push({
    value: "none" as const,
    label: "None",
    hint: "No backend server",
  });

  const response = await navigableSelect<Backend>({
    message: "Choose a backend",
    options: backendOptions,
    initialValue: preferValidInitial(
      backendOptions,
      previousValue,
      hasFullstackFrontend ? "self" : DEFAULT_CONFIG.backend,
    ),
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });

  return response;
}
