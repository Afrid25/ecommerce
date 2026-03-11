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
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, phone, address, items, paymentMethod } = body;

    // Validate input
    if (!customerName || !phone || !address || !items || !items.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    const createdOrders = await db.transaction(async (tx) => {
      const orderResults = [];

      for (const item of items) {
        // Check stock within transaction
        const product = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId));

        if (product.length === 0) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product[0].stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product[0].name}`);
        }

        const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;
        const totalPrice = product[0].price * item.quantity;

        // Create order
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

        // Update stock atomically
        await tx
          .update(products)
          .set({ stock: product[0].stock - item.quantity })
          .where(eq(products.id, item.productId));

        orderResults.push(newOrder[0]);
      }

      return orderResults;
    });

    return NextResponse.json(createdOrders, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
