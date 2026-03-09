"use client";

import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
  });

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No items to checkout</h2>
        <Link href="/" className="text-indigo-600 hover:underline">
          ← Continue Shopping
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        const orders = await res.json();
        clearCart();
        router.push(`/order-confirmation?orderId=${orders[0]?.orderId}`);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to place order");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter your full delivery address"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>

            <div className="space-y-3">
              {[
                { value: "cod", label: "💵 Cash on Delivery", desc: "Pay when you receive" },
                { value: "bkash", label: "📱 bKash", desc: "Pay via bKash mobile banking" },
                { value: "nagad", label: "📱 Nagad", desc: "Pay via Nagad mobile banking" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                    form.paymentMethod === method.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={form.paymentMethod === method.value}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="mr-3 text-indigo-600"
                  />
                  <div>
                    <p className="font-medium">{method.label}</p>
                    <p className="text-sm text-gray-500">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold text-lg disabled:bg-gray-400"
          >
            {loading ? "Placing Order..." : `Place Order - ৳${getTotalPrice().toLocaleString()}`}
          </button>
        </form>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-indigo-600">৳{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
