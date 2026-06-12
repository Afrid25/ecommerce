import { Pool, neon, neonConfig } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import WebSocket from "ws";
import { z } from "zod";
import * as schema from "./schema";

export class MissingDatabaseUrlError extends Error {
  constructor() {
    super(
      "DATABASE_URL is not configured. Set it in `.env.local` or your deployment environment."
    );
    this.name = "MissingDatabaseUrlError";
  }
}

export class InvalidDatabaseUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDatabaseUrlError";
  }
}

type ParsedDatabaseConfig = {
  url: string;
  summary: DatabaseConfigSummary;
};

export type DatabaseConfigSummary = {
  envLoaded: boolean;
  formatValid: boolean;
  envFileHint: string;
  protocol: string | null;
  host: string | null;
  port: string | null;
  database: string | null;
  sslMode: string | null;
};

export type DatabaseHealthReport = {
  ok: boolean;
  latencyMs: number;
  message: string;
  config: DatabaseConfigSummary;
  checks: {
    connection: boolean;
    ordersTableExists: boolean;
    ordersTableMatchesSchema: boolean;
    missingOrderColumns: string[];
    orderItemsTableExists: boolean;
    orderItemsTableMatchesSchema: boolean;
    missingOrderItemColumns: string[];
    blockingLegacyOrderColumns: string[];
  };
  diagnostics?: {
    errorChain: string[];
    reachabilityIssue: boolean;
  };
};

const EXPECTED_ORDER_COLUMNS = [
  "id",
  "order_id",
  "user_id",
  "customer_name",
  "customer_email",
  "phone",
  "address",
  "payment_method",
  "source",
  "order_status",
  "notes",
  "total_price",
  "total_cost",
  "profit",
  "created_at",
] as const;

const EXPECTED_ORDER_ITEM_COLUMNS = [
  "id",
  "order_id",
  "product_id",
  "quantity",
  "unit_price",
  "total_price",
  "product_name",
  "product_image",
] as const;

const DATABASE_ENV_HINT =
  "Next.js loads `.env` and `.env.local`. Use `.env.local` for local secrets and restart the dev server after changes.";

const databaseUrlSchema = z
  .string()
  .trim()
  .min(1, "DATABASE_URL is not configured. Set it in `.env.local` or your deployment environment.")
  .superRefine((value, ctx) => {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(value);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DATABASE_URL must be a valid postgres:// or postgresql:// connection string.",
      });
      return;
    }

    if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DATABASE_URL must start with postgres:// or postgresql://.",
      });
    }

    if (!parsedUrl.hostname) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DATABASE_URL must include a database host.",
      });
    }

    if (!parsedUrl.pathname || parsedUrl.pathname === "/") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DATABASE_URL must include a database name in the path.",
      });
    }
  });

type HttpDatabase = ReturnType<typeof drizzleHttp<typeof schema>>;
type TransactionalDatabase = ReturnType<typeof drizzleServerless<typeof schema>>;

let dbInstance: HttpDatabase | null = null;
let parsedDatabaseConfig: ParsedDatabaseConfig | null = null;
let neonServerlessConfigured = false;

function summarizeDatabaseUrl(urlValue?: string): DatabaseConfigSummary {
  const trimmed = urlValue?.trim() ?? "";
  if (!trimmed) {
    return {
      envLoaded: false,
      formatValid: false,
      envFileHint: DATABASE_ENV_HINT,
      protocol: null,
      host: null,
      port: null,
      database: null,
      sslMode: null,
    };
  }

  try {
    const parsedUrl = new URL(trimmed);
    const formatValid = ["postgres:", "postgresql:"].includes(parsedUrl.protocol)
      && Boolean(parsedUrl.hostname)
      && Boolean(parsedUrl.pathname && parsedUrl.pathname !== "/");

    return {
      envLoaded: true,
      formatValid,
      envFileHint: DATABASE_ENV_HINT,
      protocol: parsedUrl.protocol.replace(":", ""),
      host: parsedUrl.hostname,
      port: parsedUrl.port || null,
      database: parsedUrl.pathname.replace(/^\//, "") || null,
      sslMode: parsedUrl.searchParams.get("sslmode"),
    };
  } catch {
    return {
      envLoaded: true,
      formatValid: false,
      envFileHint: DATABASE_ENV_HINT,
      protocol: null,
      host: null,
      port: null,
      database: null,
      sslMode: null,
    };
  }
}

function getParsedDatabaseConfig() {
  if (parsedDatabaseConfig) {
    return parsedDatabaseConfig;
  }

  const rawValue = process.env.DATABASE_URL;
  if (!rawValue?.trim()) {
    throw new MissingDatabaseUrlError();
  }

  const result = databaseUrlSchema.safeParse(rawValue);
  if (!result.success) {
    throw new InvalidDatabaseUrlError(
      result.error.issues[0]?.message
        || "DATABASE_URL must be a valid postgres:// or postgresql:// connection string."
    );
  }

  parsedDatabaseConfig = {
    url: result.data.trim(),
    summary: summarizeDatabaseUrl(result.data),
  };

  return parsedDatabaseConfig;
}

export function getDatabaseConfigSummary() {
  return summarizeDatabaseUrl(process.env.DATABASE_URL);
}

export function getDatabaseConfigurationMessage() {
  const summary = getDatabaseConfigSummary();

  if (!summary.envLoaded) {
    return "DATABASE_URL is missing. Add it to `.env.local` or your deployment environment.";
  }

  if (!summary.formatValid) {
    return "DATABASE_URL is invalid. Use a valid postgres:// or postgresql:// Neon connection string.";
  }

  return "Database configuration looks valid.";
}

export function isDatabaseConfigured() {
  const summary = getDatabaseConfigSummary();
  return summary.envLoaded && summary.formatValid;
}

export function collectErrorMessages(error: unknown) {
  const messages: string[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && !seen.has(current)) {
    seen.add(current);

    if (current instanceof Error) {
      const message = current.message?.trim();
      if (message) {
        messages.push(message);
      }
      current = current.cause;
      continue;
    }

    if (typeof current === "string" && current.trim()) {
      messages.push(current.trim());
      break;
    }

    break;
  }

  return messages;
}

function extractDatabaseErrorCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const record = error as { code?: string; cause?: { code?: string } };
  return record.code ?? record.cause?.code;
}

export function isDatabaseReachabilityError(error: unknown) {
  const code = extractDatabaseErrorCode(error);
  if (code === "ECONNREFUSED" || code === "ECONNRESET" || code === "ENOTFOUND" || code === "EACCES") {
    return true;
  }

  const combined = collectErrorMessages(error).join(" ").toLowerCase();
  return [
    "fetch failed",
    "connect",
    "connection",
    "network",
    "timeout",
    "timed out",
    "enotfound",
    "econnrefused",
    "econnreset",
  ].some((fragment) => combined.includes(fragment));
}

export function describeDatabaseFailure(
  error: unknown,
  operation: string,
  context: Record<string, unknown> = {}
) {
  const config = getDatabaseConfigSummary();
  const errorChain = collectErrorMessages(error);
  const reachabilityIssue = isDatabaseReachabilityError(error);

  const userMessage = !config.envLoaded
    ? "DATABASE_URL is missing. Add it to `.env.local` or your deployment environment."
    : !config.formatValid
      ? "DATABASE_URL is invalid. Use a valid postgres:// or postgresql:// Neon connection string."
      : reachabilityIssue
        ? "Unable to reach the PostgreSQL database. Check the Neon host, sslmode=require, and network access."
        : "Database query failed while processing the request.";

  return {
    userMessage,
    diagnostics: {
      operation,
      config,
      reachabilityIssue,
      errorChain,
      ...context,
    },
  };
}

export function logDatabaseError(
  label: string,
  error: unknown,
  operation: string,
  context: Record<string, unknown> = {}
) {
  const failure = describeDatabaseFailure(error, operation, context);
  console.error(label, failure.diagnostics);
  return failure;
}

function ensureNeonServerlessWebSocket() {
  if (neonServerlessConfigured) {
    return;
  }

  if (typeof globalThis.WebSocket === "undefined") {
    neonConfig.webSocketConstructor = WebSocket;
  }

  neonServerlessConfigured = true;
}

export function getDb() {
  const { url } = getParsedDatabaseConfig();

  if (!dbInstance) {
    const databaseClient = neon(url);
    dbInstance = drizzleHttp(databaseClient, { schema });
  }

  return dbInstance;
}

export function createTransactionalDb(): {
  db: TransactionalDatabase;
  close: () => Promise<void>;
} {
  const { url } = getParsedDatabaseConfig();
  ensureNeonServerlessWebSocket();

  const pool = new Pool({
    connectionString: url,
  });
  const db = drizzleServerless(pool, { schema });

  return {
    db,
    close: async () => {
      await pool.end();
    },
  };
}

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const database = getDb() as unknown as Record<PropertyKey, unknown>;
      return database[prop];
    },
  }
) as HttpDatabase;

export async function getDatabaseHealth(): Promise<DatabaseHealthReport> {
  const startedAt = Date.now();
  const config = getDatabaseConfigSummary();

  if (!config.envLoaded || !config.formatValid) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      message: getDatabaseConfigurationMessage(),
      config,
      checks: {
        connection: false,
        ordersTableExists: false,
        ordersTableMatchesSchema: false,
        missingOrderColumns: [...EXPECTED_ORDER_COLUMNS],
        orderItemsTableExists: false,
        orderItemsTableMatchesSchema: false,
        missingOrderItemColumns: [...EXPECTED_ORDER_ITEM_COLUMNS],
        blockingLegacyOrderColumns: [],
      },
    };
  }

  try {
    const database = getDb();

    await database.execute(sql`SELECT 1`);

    const ordersTableResult = await database.execute(sql`
      SELECT to_regclass('public.orders') AS table_name
    `);
    const ordersTableExists = Boolean(
      (ordersTableResult.rows[0] as Record<string, unknown> | undefined)?.table_name
    );

    const orderItemsTableResult = await database.execute(sql`
      SELECT to_regclass('public.order_items') AS table_name
    `);
    const orderItemsTableExists = Boolean(
      (orderItemsTableResult.rows[0] as Record<string, unknown> | undefined)?.table_name
    );

    const tableColumnsResult = await database.execute(sql`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name IN ('orders', 'order_items')
      ORDER BY table_name, ordinal_position
    `);

    const availableColumnsByTable = tableColumnsResult.rows.reduce<Record<string, string[]>>(
      (accumulator, row) => {
        const record = row as Record<string, unknown>;
        const tableName = String(record.table_name);
        const columnName = String(record.column_name);
        accumulator[tableName] = [...(accumulator[tableName] ?? []), columnName];
        return accumulator;
      },
      {}
    );
    const availableOrderColumns = availableColumnsByTable.orders ?? [];
    const missingOrderColumns = EXPECTED_ORDER_COLUMNS.filter(
      (column) => !availableOrderColumns.includes(column)
    );
    const availableOrderItemColumns = availableColumnsByTable.order_items ?? [];
    const missingOrderItemColumns = EXPECTED_ORDER_ITEM_COLUMNS.filter(
      (column) => !availableOrderItemColumns.includes(column)
    );
    const legacyOrderColumnsResult = await database.execute(sql`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name IN ('product_id', 'quantity')
    `);
    const blockingLegacyOrderColumns = legacyOrderColumnsResult.rows
      .filter((row) => String((row as Record<string, unknown>).is_nullable) === "NO")
      .map((row) => String((row as Record<string, unknown>).column_name));
    const orderTablesMatchSchema =
      ordersTableExists &&
      missingOrderColumns.length === 0 &&
      orderItemsTableExists &&
      missingOrderItemColumns.length === 0 &&
      blockingLegacyOrderColumns.length === 0;

    return {
      ok: orderTablesMatchSchema,
      latencyMs: Date.now() - startedAt,
      message:
        orderTablesMatchSchema
          ? "Database is reachable and the order tables match the expected schema."
          : !ordersTableExists
            ? "Database is reachable, but the orders table does not exist."
            : !orderItemsTableExists
              ? "Database is reachable, but the order_items table does not exist."
              : blockingLegacyOrderColumns.length > 0
                ? "Database is reachable, but legacy orders columns are still blocking normalized order inserts."
              : "Database is reachable, but one or more order tables are missing expected columns.",
      config,
      checks: {
        connection: true,
        ordersTableExists,
        ordersTableMatchesSchema: ordersTableExists && missingOrderColumns.length === 0,
        missingOrderColumns,
        orderItemsTableExists,
        orderItemsTableMatchesSchema: orderItemsTableExists && missingOrderItemColumns.length === 0,
        missingOrderItemColumns,
        blockingLegacyOrderColumns,
      },
    };
  } catch (error) {
    const failure = describeDatabaseFailure(error, "db-health");

    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      message: failure.userMessage,
      config,
      checks: {
        connection: false,
        ordersTableExists: false,
        ordersTableMatchesSchema: false,
        missingOrderColumns: [...EXPECTED_ORDER_COLUMNS],
        orderItemsTableExists: false,
        orderItemsTableMatchesSchema: false,
        missingOrderItemColumns: [...EXPECTED_ORDER_ITEM_COLUMNS],
        blockingLegacyOrderColumns: [],
      },
      diagnostics: {
        errorChain: failure.diagnostics.errorChain,
        reachabilityIssue: failure.diagnostics.reachabilityIssue,
      },
    };
  }
}
