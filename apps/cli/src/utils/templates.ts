import type { CreateInput, Template } from "../types";

export const TEMPLATE_PRESETS = {
  uniwind: {
    database: "none",
    orm: "none",
    backend: "none",
    runtime: "none",
    frontend: ["native-uniwind"],
    api: "none",
    auth: "none",
    payments: "none",
    addons: ["none"],
    examples: ["none"],
    dbSetup: "none",
    webDeploy: "none",
    serverDeploy: "none",
  },
  none: null,
} satisfies Record<Template, CreateInput | null>;

export function getTemplateConfig(template: Template) {
  if (template === "none" || !template) {
    return null;
  }

  const config = TEMPLATE_PRESETS[template];
  if (!config) {
    throw new Error(`Unknown template: ${template}`);
  }

  return config;
}

export function getTemplateDescription(template: Template) {
  const descriptions = {
    uniwind: "Expo + Uniwind native app with no backend services",
    none: "No template - Full customization",
  } satisfies Record<Template, string>;

  return descriptions[template] || "";
}

export function listAvailableTemplates() {
  return Object.keys(TEMPLATE_PRESETS).filter((t) => t !== "none") as Template[];
}
