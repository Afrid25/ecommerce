import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Prefer `.env.local`, but fall back to `.env` so the CLI matches Next.js local runtime.
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
