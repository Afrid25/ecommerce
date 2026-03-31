"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";

type Analytics = {
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
};

export default function AdminAnalyticsPage() {
  const { data: session, isPending } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    const load = async () => {
      const response = await fetch("/api/admin/analytics", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      setAnalytics(data);
    };

    void load();
  }, [session]);

  if (isPending || !session || !analytics) {
    return null;
  }

  return (
    <AdminShell title="Analytics" subtitle="Monitor revenue, profit, pending order pressure, and best-selling products in one place.">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Revenue", formatCurrency(Number(analytics.totalRevenue))],
          ["Profit", formatCurrency(Number(analytics.totalProfit))],
          ["Orders", analytics.totalOrders.toLocaleString()],
          ["Pending", analytics.pendingOrders.toLocaleString()],
          ["Products", analytics.totalProducts.toLocaleString()],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#16311a]">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-xl font-semibold">Top Selling Products</h3>
        <div className="mt-4 space-y-3">
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
      </section>
    </AdminShell>
  );
}
