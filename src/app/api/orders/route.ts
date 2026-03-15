import { db } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
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

    // Input validation
    if (!customerName || !phone || !address || !items || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items must be a non-empty array" },
        { status: 400 }
      );
    }

    const validPaymentMethods = ["cod", "bkash", "nagad"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Validate all products and stock before creating any orders
    const productDetails = [];
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: "Each item must have a valid productId and quantity" },
          { status: 400 }
        );
      }

      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));

      if (product.length === 0) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product[0].stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product[0].name}". Available: ${product[0].stock}` },
          { status: 400 }
        );
      }

      productDetails.push({ product: product[0], quantity: item.quantity });
    }

    // Shared order ID for all items in this checkout
    const sharedOrderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

    const createdOrders = [];
    for (const { product, quantity } of productDetails) {
      const totalPrice = product.price * quantity;

      const newOrder = await db
        .insert(orders)
        .values({
          orderId: sharedOrderId,
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          productId: product.id,
          quantity,
          totalPrice,
          paymentMethod,
          orderStatus: "pending",
        })
        .returning();

      // Atomic stock update to prevent race conditions
      await db
        .update(products)
        .set({ stock: sql`${products.stock} - ${quantity}` })
        .where(eq(products.id, product.id));

      createdOrders.push(newOrder[0]);
    }

    return NextResponse.json(createdOrders, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
