import { DEFAULT_CONFIG } from "../constants";
import type { Backend, Database, ORM, Runtime } from "../types";
import { validateOrmDatabaseCompat } from "../utils/config-validation";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableSelect, preferValidInitial } from "./navigable";

export async function getORMChoice(
  orm: ORM | undefined,
  hasDatabase: boolean,
  database?: Database,
  _backend?: Backend,
  runtime?: Runtime,
  previousValue?: ORM,
) {
  if (!hasDatabase) return "none";
  if (orm !== undefined) {
    const compat = validateOrmDatabaseCompat(orm, database);
    if (compat.isErr()) throw compat.error;
    return orm;
  }

  const options = [
    {
      value: "drizzle" as const,
      label: "Drizzle",
      hint: "Lightweight and performant TypeScript ORM",
    },
  ];

  const response = await navigableSelect<ORM>({
    message: "Choose an ORM",
    options,
    initialValue: preferValidInitial(
      options,
      previousValue,
      runtime === "workers" ? "drizzle" : DEFAULT_CONFIG.orm,
    ),
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });

  return response;
}
