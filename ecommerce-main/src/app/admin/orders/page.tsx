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
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
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
      if (res.ok) fetchOrders();
      else alert("Failed to update status");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin" className="text-indigo-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Order Management</h1>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            filterStatus === "all"
              ? "bg-indigo-600 text-white"
              : "bg-white border text-gray-700 hover:border-indigo-300"
          }`}
        >
          All ({orders.length})
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize ${
              filterStatus === status
                ? "bg-indigo-600 text-white"
                : "bg-white border text-gray-700 hover:border-indigo-300"
            }`}
          >
            {status} ({orders.filter((o) => o.orderStatus === status).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {order.productImage && (
                    <img
                      src={order.productImage}
                      alt={order.productName}
                      className="w-16 h-16 object-cover rounded-lg hidden sm:block"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-500">{order.orderId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">{order.productName}</p>
                    <p className="text-sm text-gray-500">
                      {order.customerName} • {order.phone}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{order.address}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      ৳{Number(order.totalPrice).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {order.quantity} • {order.paymentMethod.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Update */}
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
  );
}
