"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import ManualOrderForm from "@/components/ManualOrderForm";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";

interface Analytics {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
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
    source: string;
    createdAt: string;
  }>;
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
  }, [isPending, router, session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const loadAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics", { cache: "no-store" });
        const data = await res.json();
        setAnalytics(res.ok ? data : null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [session]);

  if (isPending || !session) {
    return null;
  }

  return (
    <AdminShell
      title="Dashboard"
      subtitle="A modern operating view for revenue, order health, stock risk, and offline sales capture."
      actions={
        <>
          <Link href="/admin/products" className="rounded-full bg-[#16311a] px-5 py-3 text-sm font-semibold text-white">
            Manage Products
          </Link>
          <Link href="/admin/orders" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold">
            Manage Orders
          </Link>
        </>
      }
    >
      {loading ? (
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-36" />
          ))}
        </div>
      ) : analytics ? (
        <div className="space-y-8">
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {[
              ["Total Revenue", formatCurrency(Number(analytics.totalRevenue))],
              ["Total Profit", formatCurrency(Number(analytics.totalProfit))],
              ["Total Orders", analytics.totalOrders.toLocaleString()],
              ["Pending Orders", analytics.pendingOrders.toLocaleString()],
              ["Total Products", analytics.totalProducts.toLocaleString()],
              ["Low Stock Alerts", analytics.lowStock.length.toLocaleString()],
            ].map(([label, value]) => (
              <article key={label} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">{label}</p>
                <p className="mt-4 text-3xl font-semibold text-[#16311a]">{value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <ManualOrderForm />

            <div className="space-y-6">
              <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Best Sellers</h3>
                  <span className="text-sm text-[var(--text-secondary)]">Top 5</span>
                </div>
                <div className="space-y-3">
                  {analytics.bestSelling.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{item.totalSold} sold</p>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(Number(item.revenue))}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Low Stock</h3>
                  <span className="text-sm text-[var(--text-secondary)]">Urgent replenishment</span>
                </div>
                <div className="space-y-3">
                  {analytics.lowStock.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{item.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#FF6A00]">{item.stock} left</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Recent Orders</h3>
              <Link href="/admin/orders" className="text-sm font-semibold text-[var(--primary)]">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Source</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-4 font-mono text-xs">{order.orderId}</td>
                      <td className="py-4">{order.customerName}</td>
                      <td className="py-4 font-semibold">{formatCurrency(Number(order.totalPrice))}</td>
                      <td className="py-4 capitalize">{order.source}</td>
                      <td className="py-4 capitalize">{order.orderStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <p className="text-[var(--text-secondary)]">Failed to load analytics.</p>
      )}
    </AdminShell>
  );
}
