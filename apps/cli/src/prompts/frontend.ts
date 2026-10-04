import { DEFAULT_CONFIG } from "../constants";
import type { Backend, Frontend, Auth } from "../types";
import { isFirstPrompt } from "../utils/context";
import { UserCancelledError } from "../utils/errors";
import {
  GO_BACK_SYMBOL,
  isCancel,
  isGoBack,
  navigableMultiselect,
  navigableSelect,
  preferValidInitial,
  setIsFirstPrompt,
} from "./navigable";

const WEB_FRONTEND_VALUES: readonly Frontend[] = ["tanstack-router", "tanstack-start"];

export async function getFrontendChoice(
  frontendOptions?: Frontend[],
  _backend?: Backend,
  _auth?: Auth,
  previousValue?: Frontend[],
): Promise<Frontend[] | symbol> {
  if (frontendOptions !== undefined) return frontendOptions;

  const previousWeb = previousValue?.find((f) => WEB_FRONTEND_VALUES.includes(f));
  while (true) {
    const wasFirstPrompt = isFirstPrompt();

    const frontendTypes = await navigableMultiselect({
      message: "What are you building?",
      options: [
        {
          value: "web",
          label: "Web",
          hint: "TanStack React application",
        },
      ],
      required: false,
      initialValues: previousValue ? (previousWeb ? ["web"] : []) : ["web"],
    });

    if (isGoBack(frontendTypes)) return GO_BACK_SYMBOL;
    if (isCancel(frontendTypes)) throw new UserCancelledError({ message: "Operation cancelled" });

    setIsFirstPrompt(false);

    if (!frontendTypes.includes("web")) return [];

    const webOptions = [
      {
        value: "tanstack-router" as const,
        label: "TanStack Router",
        hint: "Modern and scalable routing for React applications",
      },
      {
        value: "tanstack-start" as const,
        label: "TanStack Start",
        hint: "SSR, Server Functions, API Routes and more with TanStack Router",
      },
    ];
    const webFramework = await navigableSelect<Frontend>({
      message: "Choose a TanStack React framework",
      options: webOptions,
      initialValue: preferValidInitial(webOptions, previousWeb, DEFAULT_CONFIG.frontend[0]),
    });

    if (isGoBack(webFramework)) {
      setIsFirstPrompt(wasFirstPrompt);
      continue;
    }
    if (isCancel(webFramework)) throw new UserCancelledError({ message: "Operation cancelled" });
    return [webFramework];
  }
}
