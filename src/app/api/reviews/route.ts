import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { ensureCommerceSchema } from "@/lib/commerce";
import { requireAdmin } from "@/lib/auth-guards";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json([]);
    }

    await ensureCommerceSchema();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");

    let query = db.select().from(reviews).orderBy(desc(reviews.createdAt)).$dynamic();

    if (productId) {
      query = query.where(eq(reviews.productId, parseInt(productId)));
    }

    if (status) {
      query = query.where(eq(reviews.status, status));
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    await ensureCommerceSchema();

    const body = await req.json();
    const { productId, customerName, rating, comment } = body;

    if (!productId || !customerName || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const [created] = await db
      .insert(reviews)
      .values({
        productId: parseInt(productId),
        customerName: customerName.trim(),
        rating,
        comment: comment.trim(),
        status: "pending",
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
