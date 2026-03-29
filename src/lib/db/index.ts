import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Enable WebSocket for serverless environments
import { neonConfig } from "@neondatabase/serverless";
neonConfig.webSocketConstructor = ws;

export class MissingDatabaseUrlError extends Error {
  constructor() {
    super(
      "DATABASE_URL is not configured. Set it in `.env.local` or your deployment environment."
    );
    this.name = "MissingDatabaseUrlError";
  }
}

let poolInstance: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDb() {
  if (!isDatabaseConfigured()) {
    throw new MissingDatabaseUrlError();
  }

  if (!dbInstance) {
    poolInstance = new Pool({ connectionString: process.env.DATABASE_URL!.trim() });
    dbInstance = drizzle(poolInstance, { schema });
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
