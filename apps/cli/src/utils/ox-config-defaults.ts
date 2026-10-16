import type { FormatOptions } from "oxfmt";

export const DEFAULT_OX_IGNORE_PATTERNS = [".agents/*", "routeTree.gen.ts"];

export type OxlintConfig = {
  $schema: string;
  ignorePatterns: string[];
};

export type OxfmtConfig = {
  $schema: string;
  printWidth: number;
  ignorePatterns: string[];
  sortImports: {
    groups: Array<string | string[]>;
    order: "asc" | "desc";
    ignoreCase: boolean;
    sortSideEffects: boolean;
  };
};

export const OXLINT_CONFIG: OxlintConfig = {
  $schema: "./node_modules/oxlint/configuration_schema.json",
  ignorePatterns: DEFAULT_OX_IGNORE_PATTERNS,
};

export const OXFMT_CONFIG: OxfmtConfig = {
  $schema: "./node_modules/oxfmt/configuration_schema.json",
  printWidth: 100,
  ignorePatterns: DEFAULT_OX_IGNORE_PATTERNS,
  sortImports: {
    groups: [
      ["side_effect"],
      ["builtin"],
      ["external", "type-external"],
      ["internal", "type-internal"],
      ["parent", "type-parent"],
      ["sibling", "type-sibling"],
      ["index", "type-index"],
    ],
    order: "asc",
    ignoreCase: true,
    sortSideEffects: false,
  },
};

/** Runtime formatting options matching {@link OXFMT_CONFIG} for generated files. */
export const OXFMT_FORMAT_OPTIONS: FormatOptions = {
  printWidth: OXFMT_CONFIG.printWidth,
  sortPackageJson: true,
  sortImports: OXFMT_CONFIG.sortImports,
};
