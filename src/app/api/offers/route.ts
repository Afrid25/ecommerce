import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";
import { offers } from "@/lib/db/schema";
import { ensureCommerceSchema } from "@/lib/commerce";
import { requireAdmin } from "@/lib/auth-guards";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json([]);
    }

    await ensureCommerceSchema();
    const result = await db.select().from(offers).orderBy(desc(offers.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Offers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    await ensureCommerceSchema();
    const body = await req.json();
    const { title, description, discountPercent, productIds, active, startsAt, expiresAt } = body;

    if (!title || !description || discountPercent === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [created] = await db
      .insert(offers)
      .values({
        title: title.trim(),
        description: description.trim(),
        discountPercent: parseInt(discountPercent),
        productIds: JSON.stringify(productIds || []),
        active: active !== false,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Offer creation error:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
