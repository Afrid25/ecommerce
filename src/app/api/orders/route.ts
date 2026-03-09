import { db } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const allOrders = await db
      .select({
        id: orders.id,
        orderId: orders.orderId,
        customerName: orders.customerName,
        phone: orders.phone,
        address: orders.address,
        productId: orders.productId,
        quantity: orders.quantity,
        totalPrice: orders.totalPrice,
        paymentMethod: orders.paymentMethod,
        orderStatus: orders.orderStatus,
        createdAt: orders.createdAt,
        productName: products.name,
        productImage: products.image,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json(allOrders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, phone, address, items, paymentMethod } = body;

    const createdOrders = [];

    for (const item of items) {
      // Check stock
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));

      if (product.length === 0) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product[0].stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product[0].name}` },
          { status: 400 }
        );
      }

      const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;
      const totalPrice = product[0].price * item.quantity;

      const newOrder = await db
        .insert(orders)
        .values({
          orderId,
          customerName,
          phone,
          address,
          productId: item.productId,
          quantity: item.quantity,
          totalPrice,
          paymentMethod,
          orderStatus: "pending",
        })
        .returning();

      // Update stock
      await db
        .update(products)
        .set({ stock: product[0].stock - item.quantity })
        .where(eq(products.id, item.productId));

      createdOrders.push(newOrder[0]);
    }

    return NextResponse.json(createdOrders, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
