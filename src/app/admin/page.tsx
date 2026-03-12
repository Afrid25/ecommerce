"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const SalesChart = dynamic(() => import("@/components/SalesChart"), { ssr: false });

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  bestSelling: Array<{
    productId: number;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  lowStock: Array<{
    id: number;
    name: string;
    stock: number;
    category: string;
  }>;
  recentOrders: Array<{
    id: number;
    orderId: string;
    customerName: string;
    totalPrice: number;
    orderStatus: string;
    paymentMethod: string;
    createdAt: string;
    productName: string;
  }>;
  dailyRevenue: Array<{ date: string; revenue: number; orderCount: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; orderCount: number }>;
}

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (isPending || !session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          <div className="skeleton h-10 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-32 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    shipped: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    delivered: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  };

  return (
    <div className="bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Dashboard</h1>
            <p className="text-lg opacity-60">Welcome back, {session.user?.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold text-sm tracking-wide hover:opacity-80 transition"
            >
              Manage Products
            </Link>
            <Link
              href="/admin/orders"
              className="px-6 py-3 border border-black dark:border-white text-black dark:text-white font-bold text-sm tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
            >
              Manage Orders
            </Link>
            <button
              onClick={() => signOut().then(() => router.push("/admin/login"))}
              className="px-6 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-bold text-sm tracking-wide hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-32 w-full"></div>
              ))}
            </div>
          </div>
        ) : analytics ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold tracking-widest uppercase opacity-60 mb-2">Total Revenue</p>
                    <p className="text-3xl font-black">
                      ৳{Number(analytics.totalRevenue).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold tracking-widest uppercase opacity-60 mb-2">Total Orders</p>
                    <p className="text-3xl font-black">
                      {Number(analytics.totalOrders).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-4xl">📦</div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold tracking-widest uppercase opacity-60 mb-2">Best Seller</p>
                    <p className="text-lg font-bold truncate">
                      {analytics.bestSelling[0]?.productName || "N/A"}
                    </p>
                  </div>
                  <div className="text-4xl">⭐</div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold tracking-widest uppercase opacity-60 mb-2">Low Stock</p>
                    <p className="text-3xl font-black">
                      {analytics.lowStock.length}
                    </p>
                  </div>
                  <div className="text-4xl">⚠️</div>
                </div>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="border border-gray-200 dark:border-gray-800 p-8 mb-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Sales Overview</h2>
              <SalesChart
                dailyRevenue={analytics.dailyRevenue}
                monthlyRevenue={analytics.monthlyRevenue}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              {/* Best Selling Products */}
              <div className="border border-gray-200 dark:border-gray-800 p-8">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Best Selling Products</h2>
                {analytics.bestSelling.length === 0 ? (
                  <p className="opacity-60 text-sm">No sales data yet</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.bestSelling.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </span>
                          <span className="font-semibold">{item.productName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{item.totalSold} sold</p>
                          <p className="text-xs opacity-60">৳{Number(item.revenue).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Products */}
              <div className="border border-gray-200 dark:border-gray-800 p-8">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Low Stock Alert</h2>
                {analytics.lowStock.length === 0 ? (
                  <p className="opacity-60 text-sm">All products are well stocked</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.lowStock.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs opacity-60">{item.category}</p>
                        </div>
                        <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                          {item.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="border border-gray-200 dark:border-gray-800 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Recent Orders</h2>
                <Link href="/admin/orders" className="text-sm font-bold opacity-60 hover:opacity-100 transition">
                  View All →
                </Link>
              </div>
              {analytics.recentOrders.length === 0 ? (
                <p className="opacity-60 text-sm">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left py-3 px-4 font-bold text-xs tracking-widest uppercase opacity-60">Order ID</th>
                        <th className="text-left py-3 px-4 font-bold text-xs tracking-widest uppercase opacity-60">Customer</th>
                        <th className="text-left py-3 px-4 font-bold text-xs tracking-widest uppercase opacity-60">Product</th>
                        <th className="text-left py-3 px-4 font-bold text-xs tracking-widest uppercase opacity-60">Amount</th>
                        <th className="text-left py-3 px-4 font-bold text-xs tracking-widest uppercase opacity-60">Payment</th>
                        <th className="text-left py-3 px-4 font-bold text-xs tracking-widest uppercase opacity-60">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-200 dark:border-gray-800 last:border-0">
                          <td className="py-3 px-4 font-mono text-xs">{order.orderId}</td>
                          <td className="py-3 px-4">{order.customerName}</td>
                          <td className="py-3 px-4">{order.productName}</td>
                          <td className="py-3 px-4 font-bold">৳{Number(order.totalPrice).toLocaleString()}</td>
                          <td className="py-3 px-4 capitalize text-sm">{order.paymentMethod}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[order.orderStatus] || ""}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="opacity-60">Failed to load analytics</p>
        )}
      </div>
    </div>
  );
}
