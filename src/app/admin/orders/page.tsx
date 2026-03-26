"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";
import { useToastStore } from "@/store/toast";

type OrderItem = {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
};

type OrderRecord = {
  id: number;
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  orderStatus: string;
  source: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
};

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((state) => state.showToast);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!session) {
      return;
    }

    const loadOrders = async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        setOrders(res.ok ? data : []);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [session]);

  if (isPending || !session) {
    return null;
  }

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((order) => order.orderStatus === filterStatus);

  return (
    <AdminShell title="Order Management" subtitle="Update statuses, distinguish online vs offline sales, and review exactly what each order contains.">
      <div className="mb-6 flex flex-wrap gap-3">
        {["all", ...statuses].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${filterStatus === status ? "bg-[#16311a] text-white" : "bg-[var(--surface)]"}`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-28" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <article key={order.id} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs">{order.orderId}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize">{order.source}</span>
                    <span className="rounded-full bg-[#FFEEE0] px-3 py-1 text-xs font-semibold capitalize text-[#FF6A00]">{order.orderStatus}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{order.customerName}</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{order.phone} · {order.address}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
                        {item.productName} x {item.quantity}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4 lg:items-end">
                  <p className="text-2xl font-semibold">{formatCurrency(Number(order.totalPrice))}</p>
                  <p className="text-sm capitalize text-[var(--text-secondary)]">{order.paymentMethod}</p>
                  <select
                    value={order.orderStatus}
                    onChange={async (e) => {
                      const res = await fetch(`/api/orders/${order.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderStatus: e.target.value }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        showToast(data.error || "Failed to update order", "error");
                        return;
                      }
                      setOrders((current) =>
                        current.map((entry) =>
                          entry.id === order.id ? { ...entry, orderStatus: e.target.value } : entry
                        )
                      );
                      showToast("Order updated.", "success");
                    }}
                    className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
