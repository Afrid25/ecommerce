import { eq, sql } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { user } from "@/lib/db/schema";

export async function getAdminCount() {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(user)
    .where(eq(user.role, "admin"));

  return Number(result[0]?.count ?? 0);
}

export async function promoteUserToAdmin(email: string) {
  if (!isDatabaseConfigured()) {
    return { promoted: false, reason: "db_unavailable" as const };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const updatedUsers = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, normalizedEmail))
    .returning({
      id: user.id,
      email: user.email,
      role: user.role,
    });

  if (updatedUsers.length === 0) {
    return { promoted: false, reason: "user_not_found" as const };
  }

  return { promoted: true, user: updatedUsers[0] };
}

export async function bootstrapFirstAdmin(email: string) {
  if (!isDatabaseConfigured()) {
    return { promoted: false, reason: "db_unavailable" as const };
  }

  const adminCount = await getAdminCount();
  if (adminCount > 0) {
    return { promoted: false, reason: "admin_exists" as const };
  }

  return promoteUserToAdmin(email);
}
