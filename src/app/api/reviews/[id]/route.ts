import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema } from "@/lib/commerce";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

export async function PATCH(
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
      .update(reviews)
      .set({
        status: String(body.status ?? "pending"),
      })
      .where(eq(reviews.id, Number(id)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Review update error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
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
    await db.delete(reviews).where(eq(reviews.id, Number(id)));
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Review delete error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
