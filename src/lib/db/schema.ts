import { pgTable, text, timestamp, integer, real, serial, boolean, index } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for category filtering
    categoryIdx: index("products_category_idx").on(table.category),
    // Index for price range queries
    priceIdx: index("products_price_idx").on(table.price),
    // Index for sorting by created date
    createdAtIdx: index("products_created_at_idx").on(table.createdAt),
  };
});

// Reviews table for product reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  userId: text("user_id").references(() => user.id),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for fetching reviews by product
    productIdIdx: index("reviews_product_id_idx").on(table.productId),
    // Index for sorting by rating
    ratingIdx: index("reviews_rating_idx").on(table.rating),
  };
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  totalPrice: real("total_price").notNull(),
  paymentMethod: text("payment_method").notNull(), // cod, bkash, nagad
  orderStatus: text("order_status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for filtering by order status (for admin dashboard)
    orderStatusIdx: index("orders_status_idx").on(table.orderStatus),
    // Index for filtering by product
    productIdIdx: index("orders_product_id_idx").on(table.productId),
    // Index for sorting by date (recent orders)
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
    // Index for phone number lookups
    phoneIdx: index("orders_phone_idx").on(table.phone),
  };
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  role: text("role").default("user"),
  banned: boolean("banned").notNull().default(false),
}, (table) => {
  return {
    // Index for email lookups
    emailIdx: index("user_email_idx").on(table.email),
    // Index for role-based queries
    roleIdx: index("user_role_idx").on(table.role),
  };
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id),
}, (table) => {
  return {
    // Index for user sessions
    userIdIdx: index("session_user_id_idx").on(table.userId),
    // Index for token lookups
    tokenIdx: index("session_token_idx").on(table.token),
  };
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for user accounts
    userIdIdx: index("account_user_id_idx").on(table.userId),
  };
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    // Index for verification lookups
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  };
});
