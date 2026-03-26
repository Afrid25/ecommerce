"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useHydrated } from "@/hooks/useHydrated";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";

function CheckoutContent() {
  const mounted = useHydrated();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, checkoutItems, clearCart, clearCheckoutItems } = useCartStore();
  const showToast = useToastStore((state) => state.showToast);
  const [loading, setLoading] = useState(false);
  const [dbAvailable, setDbAvailable] = useState(true);
  const [dbMessage, setDbMessage] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
    mobileWalletNumber: "",
    otpCode: "",
    paymentReference: "",
  });

  const isBuyNowCheckout = searchParams.get("mode") === "buy-now";
  const lineItems = isBuyNowCheckout && checkoutItems.length > 0 ? checkoutItems : items;
  const totalPrice = lineItems.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const res = await fetch("/api/place-order", { method: "GET", cache: "no-store" });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.available) {
          setDbAvailable(false);
          setDbMessage(data?.error || "Checkout is temporarily unavailable.");
          return;
        }

        setDbAvailable(true);
        setDbMessage("");
      } catch {
        setDbAvailable(false);
        setDbMessage("Checkout is temporarily unavailable.");
      }
    };

    checkAvailability();
  }, []);

  if (!mounted) {
    return null;
  }

  if (lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-black md:text-4xl">No items to checkout</h2>
        <Link href="/shop" className="text-sm font-semibold opacity-60 transition hover:opacity-100">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isMobilePayment = form.paymentMethod === "bkash" || form.paymentMethod === "nagad";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!dbAvailable) {
      showToast(dbMessage || "Checkout is temporarily unavailable.", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "online",
          items: lineItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        showToast(error.error || "Failed to place order", "error");
        return;
      }

      const order = await res.json();
      if (isBuyNowCheckout) {
        clearCheckoutItems();
      } else {
        clearCart();
      }
      showToast("Order placed successfully.", "success");
      router.push(`/order-confirmation?orderId=${order.orderId}`);
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10">
        <p className="section-eyebrow">Checkout</p>
        <h1 className="section-title">Complete your MATVerse order.</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-8 rounded-[36px] border border-[var(--border)] bg-white/80 p-8 shadow-[var(--shadow-soft)]">
          {!dbAvailable ? (
            <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {dbMessage || "Checkout is temporarily unavailable."}
            </div>
          ) : null}

          <div>
            <h2 className="text-2xl font-semibold">Delivery Information</h2>
            <div className="mt-6 grid gap-5">
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Full name"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 outline-none"
              />
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                placeholder="Email address (optional)"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 outline-none"
              />
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 outline-none"
              />
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={4}
                placeholder="Delivery address"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 outline-none"
              />
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-8">
            <h2 className="text-2xl font-semibold">Payment Method</h2>
            <div className="mt-6 grid gap-4">
              {[
                { value: "cod", label: "Cash on Delivery", desc: "Pay upon delivery anywhere in Bangladesh" },
                { value: "bkash", label: "bKash Merchant", desc: "Use merchant payment with OTP verification" },
                { value: "nagad", label: "Nagad Merchant", desc: "Use merchant payment with OTP verification" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`rounded-[24px] border p-5 transition ${
                    form.paymentMethod === method.value
                      ? "border-[var(--primary)] bg-[#E8D8C3]/40"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={form.paymentMethod === method.value}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  <span className="font-semibold">{method.label}</span>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{method.desc}</p>
                </label>
              ))}
            </div>

            {isMobilePayment ? (
              <div className="mt-6 grid gap-4 rounded-[28px] bg-[var(--surface)] p-5">
                <input
                  type="text"
                  required
                  value={form.mobileWalletNumber}
                  onChange={(e) => setForm({ ...form, mobileWalletNumber: e.target.value })}
                  placeholder={`${form.paymentMethod === "bkash" ? "bKash" : "Nagad"} wallet number`}
                  className="rounded-[20px] border border-[var(--border)] bg-white px-5 py-4 outline-none"
                />
                <input
                  type="text"
                  value={form.paymentReference}
                  onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
                  placeholder="Transaction reference (optional in sandbox mode)"
                  className="rounded-[20px] border border-[var(--border)] bg-white px-5 py-4 outline-none"
                />
                <input
                  type="text"
                  required
                  value={form.otpCode}
                  onChange={(e) => setForm({ ...form, otpCode: e.target.value })}
                  placeholder="OTP verification code"
                  className="rounded-[20px] border border-[var(--border)] bg-white px-5 py-4 outline-none"
                />
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading || !dbAvailable}
            className="btn-editorial-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Placing Order..." : `Place Order - ${formatCurrency(totalPrice)}`}
          </button>
          {loading ? (
            <p className="text-center text-sm text-[var(--text-secondary)]">
              Reserving stock and creating your order securely.
            </p>
          ) : null}
        </form>

        <div className="rounded-[36px] border border-[var(--border)] bg-white/80 p-8 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-semibold">Order Summary</h2>

          <div className="mt-8 space-y-4 border-b border-[var(--border)] pb-8">
            {lineItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={88}
                  height={88}
                  sizes="88px"
                  className="h-20 w-20 rounded-[18px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    Qty {item.quantity}
                  </p>
                  <p className="mt-2 text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4 border-b border-[var(--border)] pb-8 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Shipping</span>
              <span>Calculated at dispatch</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Payment</span>
              <span className="uppercase">{form.paymentMethod}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-3xl font-bold">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-20 text-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
