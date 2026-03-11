import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use neon-http which has built-in connection pooling
// The connection string format determines if it uses pool or direct connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
