import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { orderStatus } = body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    const updated = await db
      .update(orders)
      .set({ orderStatus })
      .where(eq(orders.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
