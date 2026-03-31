import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { orderItems, orders, products } from "@/lib/db/schema";
import { ensureCommerceSchema } from "@/lib/commerce";

const getCachedAnalytics = unstable_cache(
  async () => {
    await ensureCommerceSchema();
    let totalRevenue = 0;
    let totalProfit = 0;
    try {
      const revenueResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${orders.totalPrice}), 0)` })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled'`);
      totalRevenue = revenueResult[0]?.total || 0;
    } catch (err) {
      console.error("Failed to fetch total revenue:", err);
    }

    try {
      const profitResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${orders.profit}), 0)` })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled'`);
      totalProfit = profitResult[0]?.total || 0;
    } catch (err) {
      console.error("Failed to fetch total profit:", err);
    }

    let totalOrders = 0;
    let pendingOrders = 0;
    try {
      const ordersCount = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
      totalOrders = ordersCount[0]?.count || 0;
    } catch (err) {
      console.error("Failed to fetch total orders:", err);
    }

    try {
      const pendingCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(sql`${orders.orderStatus} in ('pending', 'processing')`);
      pendingOrders = pendingCount[0]?.count || 0;
    } catch (err) {
      console.error("Failed to fetch pending orders:", err);
    }

    let totalProducts = 0;
    try {
      const productCount = await db.select({ count: sql<number>`COUNT(*)` }).from(products);
      totalProducts = productCount[0]?.count || 0;
    } catch (err) {
      console.error("Failed to fetch total products:", err);
    }

    let bestSelling: Array<{
      productId: number;
      productName: string | null;
      totalSold: number;
      revenue: number;
    }> = [];
    try {
      bestSelling = await db
        .select({
          productId: orderItems.productId,
          productName: products.name,
          totalSold: sql<number>`COALESCE(SUM(${orderItems.quantity}),0)`,
          revenue: sql<number>`COALESCE(SUM(${orderItems.totalPrice}),0)`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(sql`${orders.orderStatus} != 'cancelled'`)
        .groupBy(orderItems.productId, products.name)
        .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
        .limit(5);
    } catch (err) {
      console.error("Failed to fetch best selling products:", err);
    }

    let lowStock: Array<{
      id: number;
      name: string;
      description: string;
      price: number;
      image: string;
      category: string;
      stock: number;
      createdAt: Date;
    }> = [];
    try {
      lowStock = await db
        .select()
        .from(products)
        .where(sql`${products.stock} <= 10`)
        .orderBy(products.stock);
    } catch (err) {
      console.error("Failed to fetch low stock products:", err);
    }

    let recentOrders: Array<{
      id: number;
      orderId: string;
      customerName: string;
      totalPrice: number;
      orderStatus: string;
      paymentMethod: string;
      createdAt: Date;
      source: string;
    }> = [];
    try {
      recentOrders = await db
        .select({
          id: orders.id,
          orderId: orders.orderId,
          customerName: orders.customerName,
          totalPrice: orders.totalPrice,
          orderStatus: orders.orderStatus,
          paymentMethod: orders.paymentMethod,
          createdAt: orders.createdAt,
          source: orders.source,
        })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(10);
    } catch (err) {
      console.error("Failed to fetch recent orders:", err);
    }

    let dailyRevenue: Array<{ date: unknown; revenue: number }> = [];
    try {
      dailyRevenue = await db
        .select({
          date: sql`DATE(${orders.createdAt})`,
          revenue: sql<number>`COALESCE(SUM(${orders.totalPrice}), 0)`,
        })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled'`)
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt}) DESC`)
        .limit(30);
    } catch (err) {
      console.error("Failed to fetch daily revenue:", err);
    }

    let monthlyRevenue: Array<{ month: unknown; revenue: number }> = [];
    try {
      monthlyRevenue = await db
        .select({
          month: sql`DATE_TRUNC('month', ${orders.createdAt})`,
          revenue: sql<number>`COALESCE(SUM(${orders.totalPrice}), 0)`,
        })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled'`)
        .groupBy(sql`DATE_TRUNC('month', ${orders.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${orders.createdAt}) DESC`)
        .limit(12);
    } catch (err) {
      console.error("Failed to fetch monthly revenue:", err);
    }

    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      pendingOrders,
      totalProducts,
      bestSelling,
      lowStock,
      recentOrders,
      dailyRevenue,
      monthlyRevenue,
    };
  },
  ["analytics-dashboard"],
  { revalidate: 60, tags: ["analytics"] }
);

export async function GET() {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    return NextResponse.json(await getCachedAnalytics());
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
