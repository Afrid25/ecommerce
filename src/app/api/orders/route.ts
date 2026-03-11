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

    const createdOrders = await db.transaction(async (tx) => {
      const results = [];

      for (const item of items) {
        // Check stock
        const product = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId));

        if (product.length === 0) {
          throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
        }

        if (product[0].stock < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product[0].name}`);
        }

        const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;
        const totalPrice = product[0].price * item.quantity;

        const newOrder = await tx
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
        await tx
          .update(products)
          .set({ stock: product[0].stock - item.quantity })
          .where(eq(products.id, item.productId));

        results.push(newOrder[0]);
      }

      return results;
    });

    return NextResponse.json(createdOrders, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("PRODUCT_NOT_FOUND:")) {
        const productId = error.message.split(":")[1];
        return NextResponse.json(
          { error: `Product ${productId} not found` },
          { status: 404 }
        );
      }
      if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
        const productName = error.message.split(":")[1];
        return NextResponse.json(
          { error: `Insufficient stock for ${productName}` },
          { status: 400 }
        );
      }
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
