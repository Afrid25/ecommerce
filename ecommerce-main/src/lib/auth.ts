import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
