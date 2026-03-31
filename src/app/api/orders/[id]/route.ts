import { db } from "@/lib/db";
import { orderItems, orders, products } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema } from "@/lib/commerce";
import { orderStatusSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";

async function updateOrderStatus(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const { id } = await params;
    const parsed = orderStatusSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid order status" },
        { status: 400 }
      );
    }
    const { orderStatus } = parsed.data;

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

    const updated = await db.transaction(async (tx) => {
      if (orderStatus === "cancelled" && order.orderStatus !== "cancelled") {
        const items = await tx
          .select({
            productId: orderItems.productId,
            quantity: orderItems.quantity,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        for (const item of items) {
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${item.quantity}` })
            .where(eq(products.id, item.productId));
        }
      }

      const [nextOrder] = await tx
        .update(orders)
        .set({ orderStatus })
        .where(eq(orders.id, parseInt(id)))
        .returning();

      return nextOrder;
    });

    revalidateTag("analytics", "max");
    return NextResponse.json(updated);
  } catch {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateOrderStatus(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateOrderStatus(req, context);
}
