import { z } from "zod";

import {
  DatabaseSchema,
  ORMSchema,
  BackendSchema,
  RuntimeSchema,
  FrontendSchema,
  AddonsSchema,
  ExamplesSchema,
  PackageManagerSchema,
  DatabaseSetupSchema,
  APISchema,
  AuthSchema,
  PaymentsSchema,
  WebDeploySchema,
  ServerDeploySchema,
  DirectoryConflictSchema,
  TemplateSchema,
  AddonOptionsSchema,
  DbSetupOptionsSchema,
  CreateInputSchema,
  AddInputSchema,
  ProjectConfigSchema,
  BetterTStackConfigSchema,
  BetterTStackConfigFileSchema,
  InitResultSchema,
} from "./schemas";

// Generate JSON schemas for each type
export function getDatabaseJsonSchema() {
  return z.toJSONSchema(DatabaseSchema, { io: "input" });
}

export function getORMJsonSchema() {
  return z.toJSONSchema(ORMSchema, { io: "input" });
}

export function getBackendJsonSchema() {
  return z.toJSONSchema(BackendSchema, { io: "input" });
}

export function getRuntimeJsonSchema() {
  return z.toJSONSchema(RuntimeSchema);
}

export function getFrontendJsonSchema() {
  return z.toJSONSchema(FrontendSchema, { io: "input" });
}

export function getAddonsJsonSchema() {
  return z.toJSONSchema(AddonsSchema, { io: "input" });
}

export function getExamplesJsonSchema() {
  return z.toJSONSchema(ExamplesSchema);
}

export function getPackageManagerJsonSchema() {
  return z.toJSONSchema(PackageManagerSchema);
}

export function getDatabaseSetupJsonSchema() {
  return z.toJSONSchema(DatabaseSetupSchema, { io: "input" });
}

export function getAPIJsonSchema() {
  return z.toJSONSchema(APISchema);
}

export function getAuthJsonSchema() {
  return z.toJSONSchema(AuthSchema);
}

export function getPaymentsJsonSchema() {
  return z.toJSONSchema(PaymentsSchema);
}

export function getWebDeployJsonSchema() {
  return z.toJSONSchema(WebDeploySchema);
}

export function getServerDeployJsonSchema() {
  return z.toJSONSchema(ServerDeploySchema);
}

export function getDirectoryConflictJsonSchema() {
  return z.toJSONSchema(DirectoryConflictSchema);
}

export function getTemplateJsonSchema() {
  return z.toJSONSchema(TemplateSchema, { io: "input" });
}

export function getAddonOptionsJsonSchema() {
  return z.toJSONSchema(AddonOptionsSchema, { io: "input" });
}

export function getDbSetupOptionsJsonSchema() {
  return z.toJSONSchema(DbSetupOptionsSchema);
}

export function getCreateInputJsonSchema() {
  return z.toJSONSchema(CreateInputSchema, { io: "input" });
}

export function getAddInputJsonSchema() {
  return z.toJSONSchema(AddInputSchema, { io: "input" });
}

export function getProjectConfigJsonSchema() {
  return z.toJSONSchema(ProjectConfigSchema, { io: "input" });
}

export function getBetterTStackConfigJsonSchema() {
  return z.toJSONSchema(BetterTStackConfigSchema, { io: "input" });
}

export function getBetterTStackConfigFileJsonSchema() {
  return z.toJSONSchema(BetterTStackConfigFileSchema, { target: "draft-7", io: "input" });
}

export function getInitResultJsonSchema() {
  return z.toJSONSchema(InitResultSchema, { io: "input" });
}

// Get all JSON schemas as a single object
export function getAllJsonSchemas() {
  return {
    database: getDatabaseJsonSchema(),
    orm: getORMJsonSchema(),
    backend: getBackendJsonSchema(),
    runtime: getRuntimeJsonSchema(),
    frontend: getFrontendJsonSchema(),
    addons: getAddonsJsonSchema(),
    examples: getExamplesJsonSchema(),
    packageManager: getPackageManagerJsonSchema(),
    databaseSetup: getDatabaseSetupJsonSchema(),
    api: getAPIJsonSchema(),
    auth: getAuthJsonSchema(),
    payments: getPaymentsJsonSchema(),
    webDeploy: getWebDeployJsonSchema(),
    serverDeploy: getServerDeployJsonSchema(),
    directoryConflict: getDirectoryConflictJsonSchema(),
    template: getTemplateJsonSchema(),
    addonOptions: getAddonOptionsJsonSchema(),
    dbSetupOptions: getDbSetupOptionsJsonSchema(),
    createInput: getCreateInputJsonSchema(),
    addInput: getAddInputJsonSchema(),
    projectConfig: getProjectConfigJsonSchema(),
    betterTStackConfig: getBetterTStackConfigJsonSchema(),
    betterTStackConfigFile: getBetterTStackConfigFileJsonSchema(),
    initResult: getInitResultJsonSchema(),
  };
}
