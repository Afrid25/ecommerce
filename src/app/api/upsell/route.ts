import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema } from "@/lib/commerce";
import { db } from "@/lib/db";
import { cartUpsells } from "@/lib/db/schema";

export async function GET() {
  try {
    await ensureCommerceSchema();
    return NextResponse.json(await db.select().from(cartUpsells));
  } catch (error) {
    console.error("Upsell fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch upsells" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const body = await req.json();
    const [created] = await db
      .insert(cartUpsells)
      .values({
        productId: Number(body.productId),
        discount: Number(body.discount ?? 0),
        isActive: Boolean(body.isActive),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Upsell create error:", error);
    return NextResponse.json({ error: "Failed to create upsell" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const id = Number(req.nextUrl.searchParams.get("id"));
    await db.delete(cartUpsells).where(eq(cartUpsells.id, id));
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Upsell delete error:", error);
    return NextResponse.json({ error: "Failed to delete upsell" }, { status: 500 });
  }
}
