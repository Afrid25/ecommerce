"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: number;
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  productId: number;
  quantity: number;
  totalPrice: number;
  paymentMethod: string;
  orderStatus: string;
  createdAt: string;
  productName: string;
  productImage: string;
}

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  shipped: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
  delivered: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
};

export default function AdminOrdersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/admin/login");
  }, [session, isPending, router]);

  const fetchOrders = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, orderStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === filterStatus);

  if (isPending || !session) return null;

  return (
    <div className="bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/admin" className="text-sm font-bold opacity-60 hover:opacity-100 transition mb-3 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">Order Management</h1>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-6 py-2 text-sm font-semibold tracking-wide transition ${
              filterStatus === "all"
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-gray-100 dark:bg-gray-900 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            All ({orders.length})
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2 text-sm font-semibold tracking-wide capitalize transition ${
                filterStatus === status
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-100 dark:bg-gray-900 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {status} ({orders.filter((o) => o.orderStatus === status).length})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-24 w-full"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-lg opacity-60">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 dark:border-gray-800 p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Order Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {order.productImage && (
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="w-16 h-16 object-cover flex-shrink-0 hidden sm:block"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs opacity-60">{order.orderId}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[order.orderStatus]}`}>
                          {order.orderStatus.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-bold text-lg mb-1">{order.productName}</p>
                      <p className="text-sm opacity-60 mb-1">
                        {order.customerName} • {order.phone}
                      </p>
                      <p className="text-xs opacity-40 truncate">{order.address}</p>
                    </div>
                  </div>

                  {/* Order Details and Status */}
                  <div className="flex flex-col sm:items-end gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-black">
                        ৳{Number(order.totalPrice).toLocaleString()}
                      </p>
                      <p className="text-xs opacity-60 mt-1">
                        Qty: {order.quantity} • {order.paymentMethod.toUpperCase()}
                      </p>
                      <p className="text-xs opacity-40 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Status Update Dropdown */}
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold focus:outline-none focus:border-black dark:focus:border-white transition disabled:opacity-50"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
