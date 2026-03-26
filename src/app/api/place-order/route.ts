import { db, isDatabaseConfigured } from "@/lib/db";
import { orderItems, orders, products } from "@/lib/db/schema";
import { checkoutSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

type LockedProduct = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

function normalizeLockedProduct(row: unknown): LockedProduct | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const record = row as Record<string, unknown>;
  const id = Number(record.id);
  const price = Number(record.price);
  const stock = Number(record.stock);
  const name = typeof record.name === "string" ? record.name : "";

  if (!Number.isInteger(id) || Number.isNaN(price) || !Number.isInteger(stock) || !name) {
    return null;
  }

  return { id, name, price, stock };
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ available: false, error: "Database unavailable" }, { status: 503 });
  }

  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Checkout availability check failed:", error);
    return NextResponse.json({ available: false, error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid checkout payload" },
        { status: 400 }
      );
    }

    const { customerName, phone, address, items, paymentMethod } = parsed.data;
    const aggregatedItems = Array.from(
      items.reduce((map, item) => {
        map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
        return map;
      }, new Map<number, number>())
    ).map(([productId, quantity]) => ({ productId, quantity }));

    const sharedOrderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

    const createdOrder = await db.transaction(async (tx) => {
      const lockedProducts: LockedProduct[] = [];

      for (const item of aggregatedItems) {
        const result = await tx.execute(sql`
          SELECT id, name, price, stock
          FROM products
          WHERE id = ${item.productId}
          FOR UPDATE
        `);

        const product = normalizeLockedProduct(result.rows[0]);
        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}:${product.stock}`);
        }

        lockedProducts.push(product);
      }

      const totalPrice = aggregatedItems.reduce((sum, item) => {
        const product = lockedProducts.find((entry) => entry.id === item.productId)!;
        return sum + product.price * item.quantity;
      }, 0);

      const [created] = await tx
        .insert(orders)
        .values({
          orderId: sharedOrderId,
          customerName,
          phone,
          address,
          paymentMethod,
          orderStatus: "pending",
          totalPrice,
        })
        .returning();

      for (const item of aggregatedItems) {
        const product = lockedProducts.find((entry) => entry.id === item.productId)!;

        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, product.id));

        await tx.insert(orderItems).values({
          orderId: created.id,
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: product.price * item.quantity,
        });
      }

      return created;
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("PRODUCT_NOT_FOUND:")) {
        const productId = error.message.split(":")[1];
        return NextResponse.json(
          { error: `Product with ID ${productId} not found` },
          { status: 404 }
        );
      }

      if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
        const [, productName, availableStock] = error.message.split(":");
        return NextResponse.json(
          { error: `Insufficient stock for "${productName}". Available: ${availableStock}` },
          { status: 400 }
        );
      }
    }

    console.error("Order placement error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
