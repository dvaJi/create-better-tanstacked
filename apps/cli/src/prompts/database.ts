import { DEFAULT_CONFIG } from "../constants";
import type { Backend, Database, Runtime } from "../types";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableSelect, preferValidInitial } from "./navigable";

export async function getDatabaseChoice(
  database?: Database,
  backend?: Backend,
  _runtime?: Runtime,
  previousValue?: Database,
) {
  if (backend === "none") {
    return "none";
  }

  if (database !== undefined) return database;

  const databaseOptions: Array<{
    value: Database;
    label: string;
    hint: string;
  }> = [
    {
      value: "none",
      label: "None",
      hint: "No database setup",
    },
    {
      value: "sqlite",
      label: "SQLite",
      hint: "lightweight, server-less, embedded relational database",
    },
    {
      value: "postgres",
      label: "PostgreSQL",
      hint: "powerful, open source object-relational database system",
    },
  ];

  const response = await navigableSelect<Database>({
    message: "Choose a database",
    options: databaseOptions,
    initialValue: preferValidInitial(databaseOptions, previousValue, DEFAULT_CONFIG.database),
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });

  return response;
}
