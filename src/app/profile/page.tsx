"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart";

type Order = {
  id: number;
  orderId: string;
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const wishlistCount = useCartStore((state) => state.wishlist.length);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
      return;
    }

    if (!session) {
      return;
    }

    const loadOrders = async () => {
      const response = await fetch("/api/orders?mine=1", { cache: "no-store" });
      const data = await response.json().catch(() => []);
      setOrders(Array.isArray(data) ? data : []);
    };

    void loadOrders();
  }, [isPending, router, session]);

  if (isPending || !session) {
    return null;
  }

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
  const completedOrders = orders.filter((order) => order.orderStatus === "delivered" || order.orderStatus === "confirmed").length;
  const recentOrder = orders[0];
  const purchaseFrequencyLabel =
    orders.length >= 6 ? "Highly active" : orders.length >= 3 ? "Returning shopper" : orders.length > 0 ? "Early relationship" : "New profile";

  return (
    <div className="container-nike py-28">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel rounded-[2.5rem] px-8 py-8">
          <p className="section-eyebrow">Profile</p>
          <h1 className="mt-4 text-4xl font-semibold">{session.user.name}</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{session.user.email}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["Total spent", formatCurrency(totalSpent)],
              ["Completed orders", String(completedOrders)],
              ["Saved items", String(wishlistCount)],
              ["Offer eligibility", totalSpent >= 10000 ? "Priority offers" : "Growing profile"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] border border-white/40 bg-white/55 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#16311a]">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-full bg-[#16311a] px-5 py-3 text-sm font-semibold text-white">
              Continue Shopping
            </Link>
            <button
              onClick={() => signOut().then(() => router.push("/login"))}
              className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold"
            >
              Sign Out
            </button>
          </div>
          <div className="mt-8 rounded-[1.8rem] border border-white/40 bg-black/[0.02] px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Shopping Profile
            </p>
            <p className="mt-2 text-lg font-semibold text-[#16311a]">{purchaseFrequencyLabel}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
              {recentOrder
                ? `Your latest order was placed on ${new Date(recentOrder.createdAt).toLocaleDateString()}. We use your account history to keep checkout smoother and future offers more relevant.`
                : "Once your first account-linked order is placed, this profile will begin surfacing shopping history and personalized offer signals."}
            </p>
          </div>
        </section>

        <section className="glass-panel rounded-[2.5rem] px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-eyebrow">Order History</p>
              <h2 className="mt-3 text-3xl font-semibold">Your MATVerse orders</h2>
            </div>
            <Link href="/checkout" className="text-sm font-semibold text-[var(--primary)]">
              New checkout
            </Link>
          </div>
          <div className="mt-8 space-y-4">
            {orders.length > 0 ? orders.map((order) => (
              <article key={order.id} className="rounded-[2rem] border border-white/40 bg-white/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs">{order.orderId}</p>
                    <p className="mt-2 text-sm capitalize text-[var(--text-secondary)]">{order.orderStatus}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(Number(order.totalPrice))}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-[2rem] border border-white/40 bg-white/60 p-5 text-sm text-[var(--text-secondary)]">
                No account-linked orders yet. Guest checkout still works even without logging in.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
