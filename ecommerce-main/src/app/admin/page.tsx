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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {session.user?.name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white border text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            Manage Orders
          </Link>
          <button
            onClick={() => signOut().then(() => router.push("/admin/login"))}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      ) : analytics ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ৳{Number(analytics.totalRevenue).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Number(analytics.totalOrders).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Best Seller</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                    {analytics.bestSelling[0]?.productName || "N/A"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Low Stock Items</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analytics.lowStock.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h2>
            <SalesChart
              dailyRevenue={analytics.dailyRevenue}
              monthlyRevenue={analytics.monthlyRevenue}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Best Selling Products */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Best Selling Products</h2>
              {analytics.bestSelling.length === 0 ? (
                <p className="text-gray-500 text-sm">No sales data yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.bestSelling.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <span className="font-medium text-gray-900">{item.productName}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{item.totalSold} sold</p>
                        <p className="text-xs text-gray-500">৳{Number(item.revenue).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h2>
              {analytics.lowStock.length === 0 ? (
                <p className="text-gray-500 text-sm">All products are well stocked</p>
              ) : (
                <div className="space-y-3">
                  {analytics.lowStock.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <span className="text-red-600 font-bold text-sm">
                        {item.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/admin/orders" className="text-indigo-600 text-sm hover:underline">
                View All →
              </Link>
            </div>
            {analytics.recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Order ID</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Customer</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Product</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Amount</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Payment</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 px-2 font-mono text-xs">{order.orderId}</td>
                        <td className="py-3 px-2">{order.customerName}</td>
                        <td className="py-3 px-2">{order.productName}</td>
                        <td className="py-3 px-2 font-bold">৳{Number(order.totalPrice).toLocaleString()}</td>
                        <td className="py-3 px-2 capitalize">{order.paymentMethod}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[order.orderStatus] || ""}`}>
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
        <p className="text-gray-500">Failed to load analytics</p>
      )}
    </div>
  );
}
