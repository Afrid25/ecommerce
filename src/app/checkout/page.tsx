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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-4">No items to checkout</h2>
        <Link href="/" className="text-sm font-semibold opacity-60 hover:opacity-100 transition">
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
    <div className="bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-12">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
            {/* Delivery Information */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Delivery Information</h2>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold tracking-wide uppercase opacity-60 mb-3">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-bold tracking-wide uppercase opacity-60 mb-3">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-bold tracking-wide uppercase opacity-60 mb-3">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={4}
                    placeholder="Enter your full delivery address"
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Payment Method</h2>

              <div className="space-y-4">
                {[
                  { value: "cod", label: "💵 Cash on Delivery", desc: "Pay when you receive your order" },
                  { value: "bkash", label: "📱 bKash", desc: "Pay via bKash mobile banking" },
                  { value: "nagad", label: "📱 Nagad", desc: "Pay via Nagad mobile banking" },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center p-4 border cursor-pointer transition ${
                      form.paymentMethod === method.value
                        ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                        : "border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={form.paymentMethod === method.value}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="mr-4 w-5 h-5 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold">{method.label}</p>
                      <p className="text-sm opacity-60">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 font-bold text-lg tracking-wide hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Placing Order..." : `Place Order - ৳${getTotalPrice().toLocaleString()}`}
            </button>
          </form>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 dark:border-gray-800 p-8 sticky top-24">
              <h2 className="text-xl font-bold tracking-tight mb-8">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs opacity-60">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold mt-1">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                <div className="flex justify-between text-sm opacity-60">
                  <span>Subtotal</span>
                  <span>৳{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm opacity-60">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm opacity-60">
                  <span>Tax</span>
                  <span>Calculated</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold">Total</span>
                <span className="text-3xl font-black">
                  ৳{getTotalPrice().toLocaleString()}
                </span>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 text-xs opacity-60 border-t border-gray-200 dark:border-gray-800 pt-6">
                <p>✓ Secure checkout</p>
                <p>✓ Order confirmation via SMS</p>
                <p>✓ Easy returns within 7 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
