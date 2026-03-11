import { db } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Define query functions with explicit return types to avoid TypeScript issues
    const getRevenue = async () => {
      const result = await db
        .select({ total: sql<number>`COALESCE(SUM(${orders.totalPrice}), 0)` })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled'`);
      return result[0]?.total || 0;
    };

    const getOrdersCount = async () => {
      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders);
      return result[0]?.count || 0;
    };

    const getBestSelling = async () => {
      return db
        .select({
          productId: orders.productId,
          productName: products.name,
          totalSold: sql<number>`SUM(${orders.quantity})`,
          revenue: sql<number>`SUM(${orders.totalPrice})`,
        })
        .from(orders)
        .leftJoin(products, eq(orders.productId, products.id))
        .where(sql`${orders.orderStatus} != 'cancelled'`)
        .groupBy(orders.productId, products.name)
        .orderBy(sql`SUM(${orders.quantity}) DESC`)
        .limit(5);
    };

    const getLowStock = async () => {
      return db
        .select()
        .from(products)
        .where(sql`${products.stock} <= 10`)
        .orderBy(products.stock);
    };

    const getRecentOrders = async () => {
      return db
        .select({
          id: orders.id,
          orderId: orders.orderId,
          customerName: orders.customerName,
          totalPrice: orders.totalPrice,
          orderStatus: orders.orderStatus,
          paymentMethod: orders.paymentMethod,
          createdAt: orders.createdAt,
          productName: products.name,
        })
        .from(orders)
        .leftJoin(products, eq(orders.productId, products.id))
        .orderBy(desc(orders.createdAt))
        .limit(10);
    };

    const getDailyRevenue = async () => {
      return db
        .select({
          date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
          revenue: sql<number>`SUM(${orders.totalPrice})`,
          orderCount: sql<number>`COUNT(*)`,
        })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled' AND ${orders.createdAt} >= NOW() - INTERVAL '30 days'`)
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`);
    };

    const getMonthlyRevenue = async () => {
      return db
        .select({
          month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
          revenue: sql<number>`SUM(${orders.totalPrice})`,
          orderCount: sql<number>`COUNT(*)`,
        })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled' AND ${orders.createdAt} >= NOW() - INTERVAL '12 months'`)
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);
    };

    // Run all independent queries in parallel for better performance
    const [
      totalRevenue,
      totalOrders,
      bestSelling,
      lowStock,
      recentOrders,
      dailyRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      getRevenue(),
      getOrdersCount(),
      getBestSelling(),
      getLowStock(),
      getRecentOrders(),
      getDailyRevenue(),
      getMonthlyRevenue(),
    ]);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      bestSelling,
      lowStock,
      recentOrders,
      dailyRevenue,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
