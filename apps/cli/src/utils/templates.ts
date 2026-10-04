import type { CreateInput, Template } from "../types";

export const TEMPLATE_PRESETS = {
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
    none: "No template - Full customization",
  } satisfies Record<Template, string>;

  return descriptions[template] || "";
}

export function listAvailableTemplates() {
  return Object.keys(TEMPLATE_PRESETS).filter((t) => t !== "none") as Template[];
}
