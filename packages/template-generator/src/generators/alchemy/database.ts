import { assertNever, type AlchemyDeploymentPlan, type ManagedDatabasePlan } from "./plan";
import { writeObject, type AlchemyWriter } from "./writer";

function writesDatabaseMigrations(database: ManagedDatabasePlan): boolean {
  return database.kind === "prisma-postgres";
}

function writeNeon(writer: AlchemyWriter) {
  writeObject(
    writer,
    'const database = yield* Neon.Project("database", {',
    () => writer.writeLine('migrations: "../../packages/db/src/migrations",'),
    "});",
  );
  writer.writeLine(
    "const runtimeUrl = database.pooledConnectionUri.pipe(Output.map(Redacted.make));",
  );
}

function writePlanetScalePostgres(writer: AlchemyWriter) {
  writeObject(
    writer,
    'const database = yield* Planetscale.PostgresDatabase("database", {',
    () => {
      writer.writeLine('clusterSize: "PS_DEV",');
      writer.writeLine('migrations: "../../packages/db/src/migrations",');
    },
    "});",
  );
  writeObject(
    writer,
    'const role = yield* Planetscale.PostgresRole("database-role", {',
    () => {
      writer.writeLine("database,");
      writer.writeLine('inheritedRoles: ["pg_read_all_data", "pg_write_all_data"],');
    },
    "});",
  );
  writer.writeLine("const runtimeUrl = role.connectionUrlPooled;");
}

function writePrismaPostgres(writer: AlchemyWriter): void {
  writer.writeLine("const project = yield* prismaProject;");
  writer.writeLine('const database = yield* Prisma.Postgres("database", { project });');
  writer.writeLine(
    'const connection = yield* Prisma.Connection("database-connection", { database });',
  );
  writer.writeLine(
    "const runtimeUrl = Output.all(connection.directConnectionString, connection.databaseUrl).pipe(",
  );
  writer.indent(() => {
    writer.writeLine("Output.map(([directUrl, fallbackUrl]) => {");
    writer.indent(() => {
      writer.writeLine("const url = directUrl ?? fallbackUrl;");
      writer.writeLine("if (!url) {");
      writer.indent(() => {
        writer.writeLine('throw new Error("Prisma did not return a database connection URL");');
      });
      writer.writeLine("}");
      writer.writeLine("return url;");
    });
    writer.writeLine("}),");
  });
  writer.writeLine(");");
  writer.writeLine("const migrationUrl = runtimeUrl;");
}

function writeMigrationCommand(writer: AlchemyWriter, plan: AlchemyDeploymentPlan): void {
  if (!writesDatabaseMigrations(plan.managedDatabase)) return;
  writer.blankLine();
  writeObject(
    writer,
    'yield* Command.Exec("database-migrations", {',
    () => {
      writer.writeLine(`command: "${plan.config.packageManager} run db:migrate:deploy",`);
      writer.writeLine('cwd: "../../packages/db",');
      writer.writeLine("env: { DATABASE_URL: migrationUrl },");
      writeObject(
        writer,
        "memo: {",
        () => {
          writer.writeLine("include: [");
          writer.indent(() => {
            writer.writeLine('"src/migrations/**",');
            writer.writeLine('"src/schema/**",');
          });
          writer.writeLine("],");
        },
        "},",
      );
    },
    "});",
  );
}

function writeManagedDatabase(writer: AlchemyWriter, plan: AlchemyDeploymentPlan): void {
  const database = plan.managedDatabase;
  if (database.kind === "none") return;

  writer.writeLine("const managedDatabase = Effect.gen(function* () {");
  writer.indent(() => {
    switch (database.kind) {
      case "neon":
        writeNeon(writer);
        break;
      case "planetscale-postgres":
        writePlanetScalePostgres(writer);
        break;
      case "prisma-postgres":
        writePrismaPostgres(writer);
        break;
      default:
        assertNever(database);
    }

    writeMigrationCommand(writer, plan);
    writer.blankLine();
    writer.writeLine("return { runtimeEnv: { DATABASE_URL: runtimeUrl } };");
  });
  writer.writeLine("});");
  writer.blankLine();
  writer.writeLine(
    "export const databaseEnv = managedDatabase.pipe(Effect.map(({ runtimeEnv }) => runtimeEnv));",
  );
  writer.blankLine();
  writeObject(
    writer,
    "export const databaseBindings = {",
    () =>
      writer.writeLine(
        "DATABASE_URL: databaseEnv.pipe(Effect.map(({ DATABASE_URL }) => DATABASE_URL)),",
      ),
    "};",
  );
  writer.blankLine();
  writer.writeLine("export const databaseProviders = Layer.mergeAll(");
  writer.indent(() => {
    if (writesDatabaseMigrations(database)) writer.writeLine("Command.providers(),");
    if (database.kind === "neon") writer.writeLine("Neon.providers(),");
    else if (database.kind === "planetscale-postgres") writer.writeLine("Planetscale.providers(),");
    else writer.writeLine("Prisma.providers(),");
  });
  writer.writeLine(");");
}

function writeExternalDatabaseEnv(writer: AlchemyWriter, plan: AlchemyDeploymentPlan): void {
  if (!plan.hasPrismaDeploy || plan.hasAlchemyManagedDatabase) return;
  const { config } = plan;

  writeObject(
    writer,
    "export const databaseEnv = Effect.succeed({",
    () => {
      if (config.dbSetup === "d1") return;
      if (config.database !== "none")
        writer.writeLine('DATABASE_URL: Config.Redacted("DATABASE_URL"),');
    },
    "});",
  );
  writer.blankLine();
  writer.writeLine("export const databaseProviders = Prisma.providers();");
}

function writeD1(writer: AlchemyWriter, plan: AlchemyDeploymentPlan): void {
  if (!plan.hasD1Resource) return;
  writeObject(
    writer,
    'export const db = Cloudflare.D1.Database("database", {',
    () => writer.writeLine('migrations: "../../packages/db/src/migrations",'),
    "});",
  );
}

export function writeDatabaseResources(writer: AlchemyWriter, plan: AlchemyDeploymentPlan): void {
  if (plan.hasPrismaDeploy || plan.managedDatabase.kind === "prisma-postgres") {
    writeObject(
      writer,
      'export const prismaProject = Prisma.Project("project", {',
      () => {
        writer.writeLine("createDatabase: false,");
        writer.writeLine('region: "us-east-1",');
      },
      "});",
    );
    writer.blankLine();
  }

  writeManagedDatabase(writer, plan);
  writeExternalDatabaseEnv(writer, plan);
  if (plan.hasAlchemyManagedDatabase || plan.hasPrismaDeploy) writer.blankLine();
  writeD1(writer, plan);
}
