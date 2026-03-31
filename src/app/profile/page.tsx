"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";

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

  return (
    <div className="container-nike py-28">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="section-eyebrow">Profile</p>
          <h1 className="mt-4 text-4xl font-semibold">{session.user.name}</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{session.user.email}</p>
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
        </section>

        <section className="rounded-[2.5rem] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-soft)]">
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
              <article key={order.id} className="rounded-[2rem] bg-[var(--surface)] p-5">
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
              <div className="rounded-[2rem] bg-[var(--surface)] p-5 text-sm text-[var(--text-secondary)]">
                No account-linked orders yet. Guest checkout still works even without logging in.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
