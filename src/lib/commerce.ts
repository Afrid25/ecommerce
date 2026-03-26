import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db, isDatabaseConfigured } from "@/lib/db";
import { categoryDefinitions, getCategoryBySlug, resolveCategorySlug } from "@/lib/categories";
import { orderItems, orders, products } from "@/lib/db/schema";

export type OrderPayload = {
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  paymentMethod: "cod" | "bkash" | "nagad" | "cash" | "offline";
  source: "online" | "manual";
  notes?: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
};

type LockedProduct = {
  id: number;
  name: string;
  image: string;
  price: number;
  stock: number;
};

let schemaEnsured = false;

function isMissingRelationError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as { cause?: { code?: string } };
  return record.cause?.code === "42P01";
}

function normalizeLockedProduct(row: unknown): LockedProduct | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const record = row as Record<string, unknown>;
  const id = Number(record.id);
  const name = typeof record.name === "string" ? record.name : "";
  const image = typeof record.image === "string" ? record.image : "";
  const price = Number(record.price);
  const stock = Number(record.stock);

  if (!Number.isInteger(id) || !name || !image || Number.isNaN(price) || !Number.isInteger(stock)) {
    return null;
  }

  return { id, name, image, price, stock };
}

function buildOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MAT-${stamp}-${random}`;
}

export async function ensureCommerceSchema() {
  if (!isDatabaseConfigured() || schemaEnsured) {
    return;
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id serial PRIMARY KEY,
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        image text NOT NULL,
        description text NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS category_slug text DEFAULT '';
    `);

    await db.execute(sql`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_email text,
      ADD COLUMN IF NOT EXISTS source text DEFAULT 'online',
      ADD COLUMN IF NOT EXISTS notes text;
    `);

    await db.execute(sql`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS product_name text DEFAULT '',
      ADD COLUMN IF NOT EXISTS product_image text DEFAULT '';
    `);

    for (const category of categoryDefinitions) {
      await db.execute(sql`
        INSERT INTO categories (id, name, slug, image, description)
        VALUES (${category.id}, ${category.name}, ${category.slug}, ${category.image}, ${category.description})
        ON CONFLICT (slug) DO UPDATE
        SET
          name = EXCLUDED.name,
          image = EXCLUDED.image,
          description = EXCLUDED.description;
      `);
    }

    const currentProducts = await db
      .select({
        id: products.id,
        category: products.category,
      })
      .from(products);

    for (const product of currentProducts) {
      const categorySlug = resolveCategorySlug(product.category);
      const category = getCategoryBySlug(categorySlug);

      if (!category) {
        continue;
      }

      await db
        .update(products)
        .set({
          category: category.name,
          categorySlug,
        })
        .where(eq(products.id, product.id));
    }

    schemaEnsured = true;
  } catch (error) {
    if (!isMissingRelationError(error)) {
      console.warn("Commerce schema bootstrap skipped:", error);
    }
  }
}

export async function getCategoryRecords() {
  if (!isDatabaseConfigured()) {
    return categoryDefinitions;
  }

  try {
    await ensureCommerceSchema();

    const result = await db.execute(sql`
      SELECT id, name, slug, image, description
      FROM categories
      ORDER BY id ASC;
    `);

    return result.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      slug: String(row.slug),
      image: String(row.image),
      description: String(row.description),
    }));
  } catch (error) {
    if (!isMissingRelationError(error)) {
      console.warn("Falling back to local category data:", error);
    }
    return categoryDefinitions;
  }
}

export async function createOrder(payload: OrderPayload) {
  await ensureCommerceSchema();

  const aggregatedItems = Array.from(
    payload.items.reduce((map, item) => {
      map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
      return map;
    }, new Map<number, number>())
  ).map(([productId, quantity]) => ({ productId, quantity }));

  const orderId = buildOrderId();

  const createdOrder = await db.transaction(async (tx) => {
    const lockedProducts: LockedProduct[] = [];

    for (const item of aggregatedItems) {
      const result = await tx.execute(sql`
        SELECT id, name, image, price, stock
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
        orderId,
        customerName: payload.customerName.trim(),
        customerEmail: payload.customerEmail?.trim() || null,
        phone: payload.phone.trim(),
        address: payload.address.trim(),
        paymentMethod: payload.paymentMethod,
        orderStatus: "pending",
        totalPrice,
        source: payload.source,
        notes: payload.notes?.trim() || null,
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
        productName: product.name,
        productImage: product.image,
      });
    }

    return created;
  });

  revalidateTag("analytics", "max");
  revalidateTag("catalog", "max");

  return createdOrder;
}

export async function getOrderList(options?: { status?: string; source?: string }) {
  await ensureCommerceSchema();

  const orderRows = await db
    .select()
    .from(orders)
    .where(
      and(
        options?.status ? eq(orders.orderStatus, options.status) : undefined,
        options?.source ? eq(orders.source, options.source) : undefined
      )
    )
    .orderBy(desc(orders.createdAt));

  if (orderRows.length === 0) {
    return [];
  }

  const ids = orderRows.map((order) => order.id);
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, ids))
    .orderBy(asc(orderItems.id));

  return orderRows.map((order) => ({
    ...order,
    items: itemRows
      .filter((item) => item.orderId === order.id)
      .map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        productName: item.productName,
        productImage: item.productImage,
      })),
  }));
}

export async function getCatalogProducts(options?: {
  categorySlug?: string;
  search?: string;
}) {
  await ensureCommerceSchema();

  return db
    .select()
    .from(products)
    .where(
      and(
        options?.categorySlug ? eq(products.categorySlug, options.categorySlug) : undefined,
        options?.search ? ilike(products.name, `%${options.search.trim()}%`) : undefined
      )
    )
    .orderBy(desc(products.createdAt));
}
