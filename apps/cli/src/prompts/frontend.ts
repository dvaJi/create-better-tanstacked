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
  const previousNative = previousValue?.find((f) => f.startsWith("native-"));

  while (true) {
    const wasFirstPrompt = isFirstPrompt();

    const frontendTypes = await navigableMultiselect({
      message: "What are you building?",
      options: [
        {
          value: "web",
          label: "Web",
          hint: "TanStack web application",
        },
        {
          value: "native",
          label: "Native",
          hint: "Create a React Native/Expo app",
        },
      ],
      required: false,
      initialValues: previousValue
        ? [...(previousWeb ? ["web"] : []), ...(previousNative ? ["native"] : [])]
        : ["web"],
    });

    if (isGoBack(frontendTypes)) return GO_BACK_SYMBOL;
    if (isCancel(frontendTypes)) throw new UserCancelledError({ message: "Operation cancelled" });

    setIsFirstPrompt(false);

    const result: Frontend[] = [];
    let shouldRestart = false;

    if (frontendTypes.includes("web")) {
      const webOptions = [
        {
          value: "tanstack-router" as const,
          label: "TanStack Router",
          hint: "Modern and scalable routing for React Applications",
        },
        {
          value: "tanstack-start" as const,
          label: "TanStack Start",
          hint: "SSR, Server Functions, API Routes and more with TanStack Router",
        },
      ];
      const webFramework = await navigableSelect<Frontend>({
        message: "Choose a web framework",
        options: webOptions,
        initialValue: preferValidInitial(webOptions, previousWeb, DEFAULT_CONFIG.frontend[0]),
      });

      if (isGoBack(webFramework)) {
        shouldRestart = true;
      } else if (isCancel(webFramework)) {
        throw new UserCancelledError({ message: "Operation cancelled" });
      } else {
        result.push(webFramework as Frontend);
      }
    }

    if (shouldRestart) {
      setIsFirstPrompt(wasFirstPrompt);
      continue;
    }

    if (frontendTypes.includes("native")) {
      const nativeFramework = await navigableSelect<Frontend>({
        message: "Choose a native setup",
        options: [
          {
            value: "native-bare" as const,
            label: "Bare",
            hint: "Bare Expo without styling library",
          },
          {
            value: "native-uniwind" as const,
            label: "Uniwind",
            hint: "Fastest Tailwind bindings for React Native with HeroUI Native",
          },
          {
            value: "native-unistyles" as const,
            label: "Unistyles",
            hint: "Consistent styling for React Native",
          },
        ],
        initialValue: previousNative ?? "native-bare",
      });

      if (isGoBack(nativeFramework)) {
        if (frontendTypes.includes("web")) {
          shouldRestart = true;
        } else {
          setIsFirstPrompt(wasFirstPrompt);
          continue;
        }
      } else if (isCancel(nativeFramework)) {
        throw new UserCancelledError({ message: "Operation cancelled" });
      } else {
        result.push(nativeFramework as Frontend);
      }
    }

    if (shouldRestart) {
      setIsFirstPrompt(wasFirstPrompt);
      continue;
    }

    return result;
  }
}
