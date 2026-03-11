import { db } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Run all independent queries in parallel for better performance
    const [
      revenueResult,
      ordersCount,
      bestSelling,
      lowStock,
      recentOrders,
      dailyRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      // Total revenue
      db
        .select({ total: sql<number>`COALESCE(SUM(${orders.totalPrice}), 0)` })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled'`),

      // Total orders
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders),

      // Best selling products
      db
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
        .limit(5),

      // Low stock products
      db
        .select()
        .from(products)
        .where(sql`${products.stock} <= 10`)
        .orderBy(products.stock),

      // Recent orders
      db
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
        .limit(10),

      // Daily revenue (last 30 days)
      db
        .select({
          date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
          revenue: sql<number>`SUM(${orders.totalPrice})`,
          orderCount: sql<number>`COUNT(*)`,
        })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled' AND ${orders.createdAt} >= NOW() - INTERVAL '30 days'`)
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`),

      // Monthly revenue (last 12 months)
      db
        .select({
          month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
          revenue: sql<number>`SUM(${orders.totalPrice})`,
          orderCount: sql<number>`COUNT(*)`,
        })
        .from(orders)
        .where(sql`${orders.orderStatus} != 'cancelled' AND ${orders.createdAt} >= NOW() - INTERVAL '12 months'`)
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`),
    ]);

    return NextResponse.json({
      totalRevenue: revenueResult[0]?.total || 0,
      totalOrders: ordersCount[0]?.count || 0,
      bestSelling,
      lowStock,
      recentOrders,
      dailyRevenue,
      monthlyRevenue,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
