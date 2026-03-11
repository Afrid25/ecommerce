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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No items to checkout</h2>
        <Link href="/" className="text-indigo-600 hover:text-indigo-700 hover:underline">
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-all duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           outline-none transition-all duration-200
                           hover:border-gray-400 dark:hover:border-slate-500
                           shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           outline-none transition-all duration-200
                           hover:border-gray-400 dark:hover:border-slate-500
                           shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Delivery Address *
                </label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  placeholder="Enter your full delivery address"
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           outline-none transition-all duration-200
                           hover:border-gray-400 dark:hover:border-slate-500
                           shadow-sm resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-all duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>

            <div className="space-y-3">
              {[
                { value: "cod", label: "💵 Cash on Delivery", desc: "Pay when you receive" },
                { value: "bkash", label: "📱 bKash", desc: "Pay via bKash mobile banking" },
                { value: "nagad", label: "📱 Nagad", desc: "Pay via Nagad mobile banking" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    form.paymentMethod === method.value
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={form.paymentMethod === method.value}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="mr-3 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{method.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* bKash Payment Instructions */}
            {form.paymentMethod === "bkash" && (
              <div className="mt-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800 animate-fade-in">
                <h3 className="font-semibold text-pink-700 dark:text-pink-400 mb-2">bKash Payment Instructions:</h3>
                <ol className="text-sm text-pink-600 dark:text-pink-300 space-y-1 list-decimal list-inside">
                  <li>Open your bKash app and go to Payment</li>
                  <li>Enter ShopBD merchant number: <span className="font-bold">017XXXXXXXX</span></li>
                  <li>Enter amount: <span className="font-bold">৳{getTotalPrice().toLocaleString()}</span></li>
                  <li>Enter reference: <span className="font-bold">ShopBD</span></li>
                  <li>Complete payment and note your Transaction ID</li>
                </ol>
                <p className="text-xs text-pink-500 dark:text-pink-400 mt-2">You will receive a confirmation call within 24 hours.</p>
              </div>
            )}

            {/* Nagad Payment Instructions */}
            {form.paymentMethod === "nagad" && (
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 animate-fade-in">
                <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">Nagad Payment Instructions:</h3>
                <ol className="text-sm text-orange-600 dark:text-orange-300 space-y-1 list-decimal list-inside">
                  <li>Open your Nagad app and go to Payment</li>
                  <li>Enter ShopBD merchant number: <span className="font-bold">017XXXXXXXX</span></li>
                  <li>Enter amount: <span className="font-bold">৳{getTotalPrice().toLocaleString()}</span></li>
                  <li>Enter reference: <span className="font-bold">ShopBD</span></li>
                  <li>Complete payment and note your Transaction ID</li>
                </ol>
                <p className="text-xs text-orange-500 dark:text-orange-400 mt-2">You will receive a confirmation call within 24 hours.</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 
                     text-white py-4 rounded-xl font-semibold text-lg 
                     transition-all duration-200 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5
                     disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0
                     focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Place Order - ৳${getTotalPrice().toLocaleString()}`
            )}
          </button>
        </form>

        {/* Order Summary */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 sticky top-24 transition-all duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-slate-700 mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">৳{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
