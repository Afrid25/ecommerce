import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  serial,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  compareAtPrice: real("compare_at_price"),
  costPrice: real("cost_price").notNull().default(0),
  image: text("image").notNull(),
  category: text("category").notNull(),
  categorySlug: text("category_slug").notNull().default(""),
  stock: integer("stock").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  isHot: boolean("is_hot").notNull().default(false),
  isLimited: boolean("is_limited").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull(),
  userId: text("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  paymentMethod: text("payment_method").notNull(), // cod, bkash, nagad
  source: text("source").notNull().default("online"),
  orderStatus: text("order_status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  notes: text("notes"),
  totalPrice: real("total_price").notNull().default(0),
  totalCost: real("total_cost").notNull().default(0),
  profit: real("profit").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: uniqueIndex("orders_order_id_idx").on(table.orderId),
  statusIdx: index("orders_status_idx").on(table.orderStatus),
  createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
}));

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  productName: text("product_name").notNull().default(""),
  productImage: text("product_image").notNull().default(""),
}, (table) => ({
  orderIdx: index("order_items_order_idx").on(table.orderId),
  productIdx: index("order_items_product_idx").on(table.productId),
}));

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  role: text("role").default("user"),
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
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  discount: integer("discount").notNull().default(0),
  discountType: text("discount_type").notNull().default("percentage"),
  productIds: text("product_ids").notNull().default(""),
  image: text("image").notNull().default(""),
  priority: integer("priority").notNull().default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bundles = pgTable("bundles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  productIds: text("product_ids").notNull().default(""),
  bundlePrice: real("bundle_price").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartUpsells = pgTable("cart_upsells", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  discount: integer("discount").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productRecommendations = pgTable("product_recommendations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  recommendedProductId: integer("recommended_product_id").notNull().references(() => products.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const homepageSettings = pgTable("homepage_settings", {
  id: serial("id").primaryKey(),
  heroTitle: text("hero_title").notNull().default("Design to Elevate Your Space"),
  heroSubtitle: text("hero_subtitle").notNull().default("Premium bamboo, wood, and low-waste essentials curated for calm modern homes."),
  heroImage: text("hero_image").notNull().default("/images/matverse/interior_scene_collage.jpg"),
  heroCtaText: text("hero_cta_text").notNull().default("Shop Now"),
  bannerText: text("banner_text").notNull().default("Curated drops, responsive support, and checkout that actually converts."),
  featuredProductIds: text("featured_product_ids").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  businessEmail: text("business_email").notNull().default("matversebd@gmail.com"),
  phone: text("phone").notNull().default("+880 1712-345678"),
  address: text("address").notNull().default("Dhaka, Bangladesh"),
  facebook: text("facebook").notNull().default("https://facebook.com"),
  instagram: text("instagram").notNull().default("https://instagram.com"),
  whatsappNumber: text("whatsapp_number").notNull().default("8801712345678"),
  messengerLink: text("messenger_link").notNull().default("https://m.me"),
  supportEmail: text("support_email").notNull().default("matversebd@gmail.com"),
  supportHours: text("support_hours").notNull().default("10:00 AM - 10:00 PM, every day"),
  footerContent: text("footer_content").notNull().default("Premium, mobile-first commerce for eco lifestyle essentials."),
  primaryColor: text("primary_color").notNull().default("#ff6a00"),
  accentColor: text("accent_color").notNull().default("#ff6a00"),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
  buttonStyle: text("button_style").notNull().default("pill"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: text("user_id"),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  image: text("image"),
  images: text("images").notNull().default("[]"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  productId: integer("product_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

