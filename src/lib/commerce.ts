import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import {
  createTransactionalDb,
  db,
  describeDatabaseFailure,
  isDatabaseConfigured,
  logDatabaseError,
} from "@/lib/db";
import { categoryDefinitions, getCategoryBySlug, resolveCategorySlug } from "@/lib/categories";
import {
  analyticsEvents,
  bundles,
  cartUpsells,
  homepageSettings,
  offers,
  orderItems,
  orders,
  productRecommendations,
  products,
  reviews,
  siteSettings,
} from "@/lib/db/schema";
import { defaultHomepageSettings, defaultSiteSettings, seededProducts } from "@/lib/matverse-data";
import { applyOfferPricingToProduct, isOfferActive } from "@/lib/pricing";

export type OrderPayload = {
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  paymentMethod: "cod" | "bkash" | "nagad" | "cash" | "offline";
  source: "online" | "manual";
  notes?: string;
  userId?: string | null;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
};

export type OrderErrorCode =
  | "INSUFFICIENT_STOCK"
  | "INVALID_CART"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR";

type LockedProduct = {
  id: number;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice: number;
  stock: number;
};

let schemaEnsured = false;

export class OrderFlowError extends Error {
  code: OrderErrorCode;
  details?: Record<string, unknown>;

  constructor(code: OrderErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "OrderFlowError";
    this.code = code;
    this.details = details;
  }
}

function buildSeedIdentity(name: string, image: string) {
  return `${name.trim().toLowerCase()}::${image.trim()}`;
}

function getOrderStatusForPaymentMethod(paymentMethod: OrderPayload["paymentMethod"]) {
  if (paymentMethod === "bkash" || paymentMethod === "nagad") {
    return "pending_payment";
  }

  return "confirmed";
}

function parseStoredImages(imagesValue?: string | null, legacyImage?: string | null) {
  const parsedImages = (() => {
    if (!imagesValue) {
      return [];
    }

    try {
      const value = JSON.parse(imagesValue);
      return Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  })();

  if (legacyImage && !parsedImages.includes(legacyImage)) {
    parsedImages.unshift(legacyImage);
  }

  return parsedImages;
}

function isMissingRelationError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as { code?: string; cause?: { code?: string } };
  return record.code === "42P01" || record.cause?.code === "42P01";
}

async function backfillLegacyOrderItems() {
  const legacyOrderColumnsResult = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name IN ('product_id', 'quantity')
  `);

  const legacyOrderColumns = new Set(
    legacyOrderColumnsResult.rows.map((row) => String((row as Record<string, unknown>).column_name))
  );

  if (!legacyOrderColumns.has("product_id") || !legacyOrderColumns.has("quantity")) {
    return;
  }

  await db.execute(sql`
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      unit_price,
      total_price,
      product_name,
      product_image
    )
    SELECT
      o.id,
      o.product_id,
      GREATEST(COALESCE(o.quantity, 1), 1),
      CASE
        WHEN COALESCE(o.quantity, 0) > 0
          THEN COALESCE(o.total_price, 0) / o.quantity
        ELSE COALESCE(o.total_price, 0)
      END,
      COALESCE(o.total_price, 0),
      COALESCE(p.name, 'Legacy product'),
      COALESCE(p.image, '')
    FROM orders o
    LEFT JOIN products p ON p.id = o.product_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.product_id IS NOT NULL
      AND o.quantity IS NOT NULL
      AND oi.id IS NULL;
  `);
}

async function relaxLegacyOrderColumns() {
  const legacyOrderColumnsResult = await db.execute(sql`
    SELECT column_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name IN ('product_id', 'quantity')
  `);

  const blockingColumns = new Set(
    legacyOrderColumnsResult.rows
      .filter((row) => String((row as Record<string, unknown>).is_nullable) === "NO")
      .map((row) => String((row as Record<string, unknown>).column_name))
  );

  if (blockingColumns.has("product_id")) {
    await db.execute(sql`ALTER TABLE orders ALTER COLUMN product_id DROP NOT NULL;`);
  }

  if (blockingColumns.has("quantity")) {
    await db.execute(sql`ALTER TABLE orders ALTER COLUMN quantity DROP NOT NULL;`);
  }
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
  const compareAtPrice =
    record.compare_at_price === null || record.compare_at_price === undefined
      ? null
      : Number(record.compare_at_price);
  const costPrice = Number(record.cost_price ?? record.costPrice ?? 0);
  const stock = Number(record.stock);

  if (!Number.isInteger(id) || !name || !image || Number.isNaN(price) || Number.isNaN(costPrice) || !Number.isInteger(stock)) {
    return null;
  }

  return {
    id,
    name,
    image,
    price,
    compareAtPrice: compareAtPrice !== null && !Number.isNaN(compareAtPrice) ? compareAtPrice : null,
    costPrice,
    stock,
  };
}

function buildOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MAT-${stamp}-${random}`;
}

export function parseIdList(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => Number.parseInt(entry.trim(), 10))
    .filter((entry) => Number.isInteger(entry) && entry > 0);
}

export function stringifyIdList(ids: number[]) {
  return Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0))).join(",");
}

async function seedSingletonRows() {
  await db
    .insert(homepageSettings)
    .values({ id: 1, ...defaultHomepageSettings })
    .onConflictDoNothing();

  await db
    .insert(siteSettings)
    .values({ id: 1, ...defaultSiteSettings })
    .onConflictDoNothing();
}

async function seedCatalogProducts() {
  const existingProducts = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      categorySlug: products.categorySlug,
      costPrice: products.costPrice,
      compareAtPrice: products.compareAtPrice,
      image: products.image,
      isFeatured: products.isFeatured,
      isTrending: products.isTrending,
      isHot: products.isHot,
      isLimited: products.isLimited,
    })
    .from(products);

  const existingByIdentity = new Map(
    existingProducts.map((product) => [buildSeedIdentity(product.name, product.image), product])
  );

  for (const seededProduct of seededProducts) {
    const existing = existingByIdentity.get(buildSeedIdentity(seededProduct.name, seededProduct.image));

    if (!existing) {
      await db.insert(products).values({
        ...seededProduct,
        compareAtPrice: seededProduct.compareAtPrice ?? null,
      });
      continue;
    }

    await db
      .update(products)
      .set({
        category: seededProduct.category,
        categorySlug: seededProduct.categorySlug,
        image: existing.image || seededProduct.image,
        costPrice: existing.costPrice > 0 ? existing.costPrice : seededProduct.costPrice,
        compareAtPrice: existing.compareAtPrice ?? seededProduct.compareAtPrice ?? null,
        isFeatured: existing.isFeatured || Boolean(seededProduct.isFeatured),
        isTrending: existing.isTrending || Boolean(seededProduct.isTrending),
        isHot: existing.isHot || Boolean(seededProduct.isHot),
        isLimited: existing.isLimited || Boolean(seededProduct.isLimited),
      })
      .where(eq(products.id, existing.id));
  }
}

export async function ensureCommerceSchema(options?: { throwOnError?: boolean; reason?: string }) {
  if (!isDatabaseConfigured() || schemaEnsured) {
    return;
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id serial PRIMARY KEY,
        name text NOT NULL,
        description text NOT NULL,
        price real NOT NULL,
        compare_at_price real,
        cost_price real NOT NULL DEFAULT 0,
        image text NOT NULL,
        category text NOT NULL,
        category_slug text NOT NULL DEFAULT '',
        stock integer NOT NULL DEFAULT 0,
        is_featured boolean NOT NULL DEFAULT false,
        is_trending boolean NOT NULL DEFAULT false,
        is_hot boolean NOT NULL DEFAULT false,
        is_limited boolean NOT NULL DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

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
      CREATE TABLE IF NOT EXISTS orders (
        id serial PRIMARY KEY,
        order_id text NOT NULL,
        user_id text,
        customer_name text NOT NULL,
        customer_email text,
        phone text NOT NULL,
        address text NOT NULL,
        payment_method text NOT NULL,
        source text NOT NULL DEFAULT 'online',
        order_status text NOT NULL DEFAULT 'pending',
        notes text,
        total_price real NOT NULL DEFAULT 0,
        total_cost real NOT NULL DEFAULT 0,
        profit real NOT NULL DEFAULT 0,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id serial PRIMARY KEY,
        order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id integer NOT NULL REFERENCES products(id),
        quantity integer NOT NULL,
        unit_price real NOT NULL,
        total_price real NOT NULL,
        product_name text NOT NULL DEFAULT '',
        product_image text NOT NULL DEFAULT ''
      );
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS orders_order_id_idx ON orders (order_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (order_status);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS order_items_product_idx ON order_items (product_id);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS homepage_settings (
        id serial PRIMARY KEY,
        hero_title text NOT NULL DEFAULT 'Design to Elevate Your Space',
        hero_subtitle text NOT NULL DEFAULT 'Premium bamboo, wood, and low-waste essentials curated for calm modern homes.',
        hero_image text NOT NULL DEFAULT '/images/matverse/interior_scene_collage.jpg',
        hero_cta_text text NOT NULL DEFAULT 'Shop Now',
        banner_text text NOT NULL DEFAULT 'Curated drops, responsive support, and checkout that actually converts.',
        featured_product_ids text NOT NULL DEFAULT '',
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id serial PRIMARY KEY,
        business_email text NOT NULL DEFAULT 'matversebd@gmail.com',
        phone text NOT NULL DEFAULT '+880 1712-345678',
        address text NOT NULL DEFAULT 'Dhaka, Bangladesh',
        facebook text NOT NULL DEFAULT 'https://facebook.com',
        instagram text NOT NULL DEFAULT 'https://instagram.com',
        whatsapp_number text NOT NULL DEFAULT '8801712345678',
        messenger_link text NOT NULL DEFAULT 'https://m.me',
        support_email text NOT NULL DEFAULT 'matversebd@gmail.com',
        support_hours text NOT NULL DEFAULT '10:00 AM - 10:00 PM, every day',
        footer_content text NOT NULL DEFAULT 'Premium, mobile-first commerce for eco lifestyle essentials.',
        primary_color text NOT NULL DEFAULT '#ff6a00',
        accent_color text NOT NULL DEFAULT '#ff6a00',
        background_color text NOT NULL DEFAULT '#ffffff',
        button_style text NOT NULL DEFAULT 'pill',
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#ff6a00',
      ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#ff6a00',
      ADD COLUMN IF NOT EXISTS background_color text DEFAULT '#ffffff',
      ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'pill';
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS offers (
        id serial PRIMARY KEY,
        title text NOT NULL,
        discount integer NOT NULL DEFAULT 0,
        discount_type text NOT NULL DEFAULT 'percentage',
        product_ids text NOT NULL DEFAULT '',
        image text NOT NULL DEFAULT '',
        priority integer NOT NULL DEFAULT 0,
        start_date timestamp,
        end_date timestamp,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE offers
      ADD COLUMN IF NOT EXISTS discount_type text DEFAULT 'percentage',
      ADD COLUMN IF NOT EXISTS image text DEFAULT '',
      ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bundles (
        id serial PRIMARY KEY,
        title text NOT NULL,
        product_ids text NOT NULL DEFAULT '',
        bundle_price real NOT NULL DEFAULT 0,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cart_upsells (
        id serial PRIMARY KEY,
        product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        discount integer NOT NULL DEFAULT 0,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_recommendations (
        id serial PRIMARY KEY,
        product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        recommended_product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id serial PRIMARY KEY,
        product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id text,
        user_name text NOT NULL,
        rating integer NOT NULL,
        title text NOT NULL,
        comment text NOT NULL,
        image text,
        images text NOT NULL DEFAULT '[]',
        status text NOT NULL DEFAULT 'pending',
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id serial PRIMARY KEY,
        event_type text NOT NULL,
        product_id integer,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS category_slug text DEFAULT '',
      ADD COLUMN IF NOT EXISTS compare_at_price real,
      ADD COLUMN IF NOT EXISTS cost_price real DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_hot boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_limited boolean DEFAULT false;
    `);

    await db.execute(sql`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_email text,
      ADD COLUMN IF NOT EXISTS source text DEFAULT 'online',
      ADD COLUMN IF NOT EXISTS notes text,
      ADD COLUMN IF NOT EXISTS user_id text,
      ADD COLUMN IF NOT EXISTS total_cost real DEFAULT 0,
      ADD COLUMN IF NOT EXISTS profit real DEFAULT 0;
    `);

    await db.execute(sql`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS product_name text DEFAULT '',
      ADD COLUMN IF NOT EXISTS product_image text DEFAULT '';
    `);

    await db.execute(sql`
      ALTER TABLE reviews
      ADD COLUMN IF NOT EXISTS images text DEFAULT '[]';
    `);

    await backfillLegacyOrderItems();
    await relaxLegacyOrderColumns();

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

    await seedSingletonRows();
    await seedCatalogProducts();
    schemaEnsured = true;
  } catch (error) {
    if (!isMissingRelationError(error)) {
      logDatabaseError(
        "[COMMERCE_SCHEMA_BOOTSTRAP_FAILED]",
        error,
        "ensure-commerce-schema",
        { reason: options?.reason ?? "unspecified" }
      );
    }

    if (options?.throwOnError) {
      throw error;
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

export async function getHomepageSettings() {
  if (!isDatabaseConfigured()) {
    return { id: 1, ...defaultHomepageSettings };
  }

  await ensureCommerceSchema();
  const [settings] = await db.select().from(homepageSettings).where(eq(homepageSettings.id, 1)).limit(1);
  return settings ?? { id: 1, ...defaultHomepageSettings };
}

export async function getSiteSettings() {
  if (!isDatabaseConfigured()) {
    return { id: 1, ...defaultSiteSettings };
  }

  await ensureCommerceSchema();
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return settings ?? { id: 1, ...defaultSiteSettings };
}

export async function createOrder(payload: OrderPayload) {
  let stage = "schema-bootstrap";
  let transactionalDb: ReturnType<typeof createTransactionalDb> | null = null;

  const aggregatedItems = Array.from(
    payload.items.reduce((map, item) => {
      if (Number.isInteger(item.productId) && item.productId > 0 && Number.isInteger(item.quantity) && item.quantity > 0) {
        map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
      }
      return map;
    }, new Map<number, number>())
  ).map(([productId, quantity]) => ({ productId, quantity }));

  if (aggregatedItems.length === 0) {
    throw new OrderFlowError("INVALID_CART", "Your cart is empty.", {
      reason: "EMPTY_CART",
    });
  }

  const orderId = buildOrderId();
  console.info("[ORDER_ATTEMPT]", {
    user: payload.userId ?? "guest",
    items: aggregatedItems.length,
    orderId,
  });

  try {
    await ensureCommerceSchema({ throwOnError: true, reason: "create-order" });
    stage = "start-transaction";
    transactionalDb = createTransactionalDb();
    const createdOrder = await transactionalDb.db.transaction(async (tx) => {
      const lockedProducts: LockedProduct[] = [];
      const availableOffers = await tx.select().from(offers);

      stage = "lock-products";
      for (const item of aggregatedItems) {
        const result = await tx.execute(sql`
          SELECT id, name, image, price, compare_at_price, cost_price, stock
          FROM products
          WHERE id = ${item.productId}
          FOR UPDATE
        `);

        const product = normalizeLockedProduct(result.rows[0]);
        if (!product) {
          throw new OrderFlowError("INVALID_CART", "One of the products in your cart no longer exists.", {
            productId: item.productId,
          });
        }

        console.info("[STOCK_CHECK]", {
          productId: product.id,
          stock: product.stock,
          requested: item.quantity,
        });

        if (product.stock < item.quantity) {
          throw new OrderFlowError(
            "INSUFFICIENT_STOCK",
            product.stock > 0
              ? `Only ${product.stock} items left for ${product.name}.`
              : `${product.name} is currently out of stock.`,
            {
              productId: product.id,
              productName: product.name,
              availableStock: product.stock,
            }
          );
        }

        lockedProducts.push(product);
      }

      const totalPrice = aggregatedItems.reduce((sum, item) => {
        const product = lockedProducts.find((entry) => entry.id === item.productId)!;
        const pricedProduct = applyOfferPricingToProduct(product, availableOffers);
        return sum + pricedProduct.price * item.quantity;
      }, 0);

      const totalCost = aggregatedItems.reduce((sum, item) => {
        const product = lockedProducts.find((entry) => entry.id === item.productId)!;
        return sum + product.costPrice * item.quantity;
      }, 0);

      const orderStatus = getOrderStatusForPaymentMethod(payload.paymentMethod);

      stage = "insert-order";
      const [created] = await tx
        .insert(orders)
        .values({
          orderId,
          userId: payload.userId ?? null,
          customerName: payload.customerName.trim(),
          customerEmail: payload.customerEmail?.trim() || null,
          phone: payload.phone.trim(),
          address: payload.address.trim(),
          paymentMethod: payload.paymentMethod,
          orderStatus,
          totalPrice,
          totalCost,
          profit: totalPrice - totalCost,
          source: payload.source,
          notes: payload.notes?.trim() || null,
        })
        .returning();

      stage = "write-order-items";
      for (const item of aggregatedItems) {
        const product = lockedProducts.find((entry) => entry.id === item.productId)!;
        const pricedProduct = applyOfferPricingToProduct(product, availableOffers);

        stage = "update-stock";
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, product.id));

        stage = "insert-order-item";
        await tx.insert(orderItems).values({
          orderId: created.id,
          productId: product.id,
          quantity: item.quantity,
          unitPrice: pricedProduct.price,
          totalPrice: pricedProduct.price * item.quantity,
          productName: product.name,
          productImage: product.image,
        });
      }

      return created;
    });

    stage = "record-analytics";
    console.info("[ORDER_CREATED]", {
      orderId: createdOrder.orderId,
      status: createdOrder.orderStatus,
    });

    await recordAnalyticsEvent("order_complete");
    revalidateTag("analytics", "max");
    revalidateTag("catalog", "max");
    revalidateTag("site", "max");

    return createdOrder;
  } catch (error) {
    if (error instanceof OrderFlowError) {
      console.error("[ORDER_FAILED]", {
        reason: error.code,
        details: error.details ?? null,
      });
      throw error;
    }

    const failure = describeDatabaseFailure(error, "create-order", {
      stage,
      itemCount: aggregatedItems.length,
    });

    console.error("[ORDER_FAILED]", {
      reason: "DATABASE_ERROR",
      ...failure.diagnostics,
    });

    throw new OrderFlowError(
      "DATABASE_ERROR",
      `${failure.userMessage} Order creation stopped at stage "${stage}".`,
      failure.diagnostics,
    );
  } finally {
    if (transactionalDb) {
      await transactionalDb.close().catch((closeError) => {
        console.warn("[ORDER_TRANSACTION_CLOSE_FAILED]", closeError);
      });
    }
  }
}

export async function recordAnalyticsEvent(eventType: string, productId?: number) {
  if (!isDatabaseConfigured()) {
    return;
  }

  await ensureCommerceSchema();
  await db.insert(analyticsEvents).values({
    eventType,
    productId: productId ?? null,
  });
}

export async function getOrderList(options?: { status?: string; source?: string; userId?: string }) {
  await ensureCommerceSchema();

  const orderRows = await db
    .select()
    .from(orders)
    .where(
      and(
        options?.status ? eq(orders.orderStatus, options.status) : undefined,
        options?.source ? eq(orders.source, options.source) : undefined,
        options?.userId ? eq(orders.userId, options.userId) : undefined
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

export async function getApprovedProductReviews(productId: number) {
  if (!isDatabaseConfigured()) {
    return [];
  }

  await ensureCommerceSchema();

  const reviewRows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt));

  return reviewRows.map((review) => ({
    ...review,
    images: parseStoredImages(review.images, review.image),
  }));
}

export async function getReviewList(options?: { status?: string; productId?: number }) {
  if (!isDatabaseConfigured()) {
    return [];
  }

  await ensureCommerceSchema();

  const reviewRows = await db
    .select()
    .from(reviews)
    .where(
      and(
        options?.status ? eq(reviews.status, options.status) : undefined,
        options?.productId ? eq(reviews.productId, options.productId) : undefined
      )
    )
    .orderBy(desc(reviews.createdAt));

  return reviewRows.map((review) => ({
    ...review,
    images: parseStoredImages(review.images, review.image),
  }));
}

export async function getActiveUpsells(limit = 4) {
  if (!isDatabaseConfigured()) {
    return [];
  }

  await ensureCommerceSchema();
  const activeOffers = await getActiveOfferList();
  const upsellRows = await db
    .select()
    .from(cartUpsells)
    .where(eq(cartUpsells.isActive, true))
    .orderBy(desc(cartUpsells.createdAt))
    .limit(limit);

  if (upsellRows.length === 0) {
    return [];
  }

  const productRows = await db
    .select()
    .from(products)
    .where(inArray(products.id, upsellRows.map((entry) => entry.productId)));

  return productRows.map((product) => applyOfferPricingToProduct(product, activeOffers));
}

export async function getRecommendedProducts(productId: number, limit = 4) {
  if (!isDatabaseConfigured()) {
    return [];
  }

  await ensureCommerceSchema();
  const activeOffers = await getActiveOfferList();
  const recommendationRows = await db
    .select()
    .from(productRecommendations)
    .where(eq(productRecommendations.productId, productId))
    .limit(limit);

  if (recommendationRows.length === 0) {
    return [];
  }

  const productRows = await db
    .select()
    .from(products)
    .where(inArray(products.id, recommendationRows.map((entry) => entry.recommendedProductId)));

  return productRows.map((product) => applyOfferPricingToProduct(product, activeOffers));
}

export async function getOfferList() {
  if (!isDatabaseConfigured()) {
    return [];
  }

  await ensureCommerceSchema();
  return db.select().from(offers).orderBy(desc(offers.priority), desc(offers.createdAt));
}

export async function getActiveOfferList(now = new Date()) {
  const rows = await getOfferList();
  return rows.filter((offer) => isOfferActive(offer, now));
}

export async function getBundleList() {
  if (!isDatabaseConfigured()) {
    return [];
  }

  await ensureCommerceSchema();
  return db.select().from(bundles).orderBy(desc(bundles.createdAt));
}
