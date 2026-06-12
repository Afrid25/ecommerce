import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema, stringifyIdList } from "@/lib/commerce";
import { db } from "@/lib/db";
import { offers } from "@/lib/db/schema";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const body = await req.json();
    const { id } = await params;
    const [updated] = await db
      .update(offers)
      .set({
        title: String(body.title ?? "").trim(),
        discount: Number(body.discount ?? 0),
        discountType: body.discountType === "fixed" ? "fixed" : "percentage",
        productIds: stringifyIdList(
          Array.isArray(body.productIds) ? body.productIds.map((value: unknown) => Number(value)) : []
        ),
        image: String(body.image ?? "").trim(),
        priority: Number(body.priority ?? 0),
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: Boolean(body.isActive),
      })
      .where(eq(offers.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Offer update error:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const { id } = await params;
    await db.delete(offers).where(eq(offers.id, Number(id)));
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Offer delete error:", error);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
