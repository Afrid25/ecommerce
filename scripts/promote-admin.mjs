import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const email = (process.argv[2] || "25afridfoisal00@gmail.com").trim().toLowerCase();
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const sql = neon(databaseUrl);

try {
  const result = await sql`
    UPDATE "user"
    SET role = 'admin'
    WHERE lower(email) = lower(${email})
    RETURNING id, email, role
  `;

  if (result.length === 0) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  console.log(`Promoted ${result[0].email} to ${result[0].role}`);
} catch (error) {
  console.error("Failed to promote admin:", error);
  process.exit(1);
}
