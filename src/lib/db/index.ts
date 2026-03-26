import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export class MissingDatabaseUrlError extends Error {
  constructor() {
    super(
      "DATABASE_URL is not configured. Set it in `.env.local` or your deployment environment."
    );
    this.name = "MissingDatabaseUrlError";
  }
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDb() {
  if (!isDatabaseConfigured()) {
    throw new MissingDatabaseUrlError();
  }

  if (!dbInstance) {
    const sql = neon(process.env.DATABASE_URL!.trim());
    dbInstance = drizzle(sql, { schema });
  }

  return dbInstance;
}

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const database = getDb() as unknown as Record<PropertyKey, unknown>;
      return database[prop];
    },
  }
) as ReturnType<typeof drizzle<typeof schema>>;
