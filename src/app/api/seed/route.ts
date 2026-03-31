import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema } from "@/lib/commerce";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
  // Only allow seeding in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seeding is not allowed in production" },
      { status: 403 }
    );
  }

  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const currentProducts = await db.select().from(products);
    return NextResponse.json({
      message: `Catalog synchronized with ${currentProducts.length} products available.`,
      products: currentProducts,
    });
  } catch {
    return NextResponse.json({ error: "Failed to seed products" }, { status: 500 });
  }
}
