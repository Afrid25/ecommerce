import { db } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

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

    // Get current order first
    const currentOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)));

    if (currentOrder.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = currentOrder[0];

    // Prevent updating already cancelled or delivered orders
    if (order.orderStatus === "cancelled" && orderStatus !== "cancelled") {
      return NextResponse.json({ error: "Cannot update a cancelled order" }, { status: 400 });
    }

    if (order.orderStatus === "delivered" && orderStatus === "cancelled") {
      return NextResponse.json({ error: "Cannot cancel a delivered order" }, { status: 400 });
    }

    // Restore stock if cancelling
    if (orderStatus === "cancelled" && order.orderStatus !== "cancelled") {
      await db
        .update(products)
        .set({ stock: sql`${products.stock} + ${order.quantity}` })
        .where(eq(products.id, order.productId));
    }

    const updated = await db
      .update(orders)
      .set({ orderStatus })
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
