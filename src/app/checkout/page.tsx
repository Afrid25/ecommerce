"use client";

import { Suspense, useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useHydrated } from "@/hooks/useHydrated";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import CartSummary from "@/components/commerce/CartSummary";
import CheckoutSteps from "@/components/commerce/CheckoutSteps";
import EmptyState from "@/components/commerce/EmptyState";
import LoadingSkeleton from "@/components/commerce/LoadingSkeleton";
import PaymentMethodSelector from "@/components/commerce/PaymentMethodSelector";
import { paymentMethods } from "@/lib/payment/payment-config";
import type { PaymentMethodId } from "@/lib/payment/payment-types";

type LiveStockEntry = {
  stock: number;
  name: string;
};

type StockConflict = {
  productId: number;
  message: string;
};

async function fetchLiveProduct(productId: number) {
  const response = await fetch(`/api/products/${productId}`, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  return response.json().catch(() => null);
}

function CheckoutContent() {
  const mounted = useHydrated();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, checkoutItems, clearCart, clearCheckoutItems } = useCartStore();
  const showToast = useToastStore((state) => state.showToast);
  const [loading, setLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [databaseAvailable, setDatabaseAvailable] = useState(true);
  const [databaseMessage, setDatabaseMessage] = useState("");
  const [liveStock, setLiveStock] = useState<Record<number, LiveStockEntry>>({});
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    phone: "",
    address: "",
    paymentMethod: "cod" as PaymentMethodId,
    mobileWalletNumber: "",
    otpCode: "",
    paymentReference: "",
  });

  const isBuyNowCheckout = searchParams.get("mode") === "buy-now";
  const lineItems = isBuyNowCheckout && checkoutItems.length > 0 ? checkoutItems : items;
  const totalPrice = lineItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const selectedPayment = paymentMethods.find((method) => method.id === form.paymentMethod);

  const hasKnownStockConflict = lineItems.some((item) => {
    const snapshot = liveStock[item.id];
    return snapshot ? item.quantity > snapshot.stock : false;
  });

  async function refreshLiveStock(currentItems = lineItems) {
    const uniqueItems = Array.from(
      currentItems.reduce((map, item) => {
        map.set(item.id, item);
        return map;
      }, new Map<number, (typeof currentItems)[number]>())
    ).map(([, item]) => item);

    if (uniqueItems.length === 0) {
      setLiveStock({});
      return { snapshot: {}, conflicts: [] as StockConflict[] };
    }

    setStockLoading(true);

    try {
      const rows = await Promise.all(
        uniqueItems.map(async (item) => ({
          item,
          product: await fetchLiveProduct(Number(item.id)),
        }))
      );

      const snapshot: Record<number, LiveStockEntry> = {};
      const conflicts: StockConflict[] = [];

      for (const row of rows) {
        const productId = Number(row.item.id);
        if (!row.product || !Number.isInteger(Number(row.product.id))) {
          conflicts.push({
            productId,
            message: `${row.item.name} is no longer available.`,
          });
          continue;
        }

        const stock = Number(row.product.stock ?? 0);
        snapshot[productId] = {
          stock,
          name: String(row.product.name ?? row.item.name),
        };

        if (stock < row.item.quantity) {
          conflicts.push({
            productId,
            message:
              stock > 0
                ? `Only ${stock} items left for ${row.product.name}.`
                : `${row.product.name} is currently out of stock.`,
          });
        }
      }

      setLiveStock(snapshot);
      return { snapshot, conflicts };
    } finally {
      setStockLoading(false);
    }
  }

  const syncLiveStock = useEffectEvent(async () => {
    await refreshLiveStock();
  });

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (lineItems.length === 0) {
      setLiveStock({});
      return;
    }

    void syncLiveStock();
  }, [mounted, lineItems.length, isBuyNowCheckout, items, checkoutItems]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const verifyDatabase = async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "GET",
          headers: { "x-internal-probe": "1" },
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);
        setDatabaseAvailable(response.ok && payload?.available === true);
        setDatabaseMessage(payload?.error || payload?.message || "Checkout is temporarily unavailable.");
      } catch {
        setDatabaseAvailable(false);
        setDatabaseMessage("Checkout is temporarily unavailable because the database connection could not be verified.");
      }
    };

    void verifyDatabase();
  }, [mounted]);

  if (!mounted) {
    return <LoadingSkeleton title="Preparing checkout" rows={4} />;
  }

  if (lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-32 sm:px-6 lg:px-8">
        <EmptyState
          title="No items to checkout"
          description="Your checkout is ready, but there are no products in the current cart session."
          actionHref="/shop"
          actionLabel="Continue Shopping"
        />
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    try {
      if (!databaseAvailable) {
        showToast(databaseMessage || "Checkout is temporarily unavailable", "error");
        return;
      }

      if (form.paymentMethod !== "cod") {
        showToast("This payment method is not connected yet. Please use Cash on Delivery.", "error");
        return;
      }

      const stockCheck = await refreshLiveStock();
      if (stockCheck.conflicts.length > 0) {
        showToast(stockCheck.conflicts[0].message, "error");
        return;
      }

      await fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "checkout_start" }),
      }).catch(() => null);

      const validItems = lineItems
        .map((item) => ({
          productId: Number(item.id),
          quantity: Math.max(1, Number(item.quantity)),
        }))
        .filter((item) => Number.isInteger(item.productId) && item.productId > 0);

      if (validItems.length === 0) {
        showToast("Your cart is empty", "error");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "online",
          items: validItems,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result.success) {
        if (result.code === "INSUFFICIENT_STOCK" && result.message) {
          showToast(result.message, "error");
          await refreshLiveStock();
          return;
        }

        if (result.code === "INVALID_CART") {
          showToast(result.message || "Your cart is empty", "error");
          return;
        }

        showToast(result.message || "Failed to place order", "error");
        return;
      }

      if (isBuyNowCheckout) {
        clearCheckoutItems();
      } else {
        clearCart();
      }
      window.sessionStorage.setItem(
        "lastOrderConfirmation",
        JSON.stringify({
          orderId: result.orderId,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          phone: form.phone,
          address: form.address,
          paymentMethod: "Cash on Delivery",
          totalPrice,
          items: lineItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        })
      );
      showToast("Order placed successfully.", "success");
      router.push(`/order-confirmation/${result.orderId}`);
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
        <div className="mt-6">
          <CheckoutSteps />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-[36px] border border-[var(--border)] bg-white/80 p-8 shadow-[var(--shadow-soft)]"
        >
          {!databaseAvailable ? (
            <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {databaseMessage || "Checkout is temporarily unavailable while the database connection is offline."}
            </div>
          ) : null}

          <div>
            <p className="section-eyebrow">Step 1</p>
            <h2 className="mt-2 text-2xl font-semibold">Customer Information</h2>
            <div className="mt-6 grid gap-5">
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                placeholder="Full name"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 outline-none"
              />
              <input
                type="email"
                value={form.customerEmail}
                onChange={(event) => setForm({ ...form, customerEmail: event.target.value })}
                placeholder="Email address (optional)"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 outline-none"
              />
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-8">
            <p className="section-eyebrow">Step 2</p>
            <h2 className="mt-2 text-2xl font-semibold">Delivery Address</h2>
            <div className="mt-6 grid gap-5">
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="Phone number"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 outline-none"
              />
              <textarea
                required
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                rows={4}
                placeholder="Delivery address"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 outline-none"
              />
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-8">
            <p className="section-eyebrow">Step 3</p>
            <h2 className="mt-2 text-2xl font-semibold">Payment Method</h2>
            <div className="mt-6">
              <PaymentMethodSelector
                methods={paymentMethods}
                value={form.paymentMethod}
                onChange={(paymentMethod) => setForm({ ...form, paymentMethod })}
              />
            </div>
            <div className="mt-5 rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              TODO: connect SSLCommerz, Stripe, and mobile banking intent creation after provider
              credentials, webhook verification, and order status reconciliation are ready.
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-8">
            <p className="section-eyebrow">Step 4</p>
            <h2 className="mt-2 text-2xl font-semibold">Review Order</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              Review your cart, delivery details, and payment choice before placing the order.
              Stock is checked again at submit time.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || stockLoading || hasKnownStockConflict || !databaseAvailable}
            className="btn-editorial-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Placing Order..."
              : stockLoading
                ? "Checking Stock..."
                : `Place Order - ${formatCurrency(totalPrice)}`}
          </button>
          <p className="text-center text-sm text-[var(--text-secondary)]">
            {hasKnownStockConflict
              ? "One or more items need a stock update before you can place the order."
              : "Reserving stock and creating your order securely."}
          </p>
        </form>

        <div className="space-y-6">
          <div className="rounded-[36px] border border-[var(--border)] bg-white/80 p-8 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-semibold">Order Summary</h2>

          <div className="mt-8 space-y-4 border-b border-[var(--border)] pb-8">
            {lineItems.map((item) => {
              const stockSnapshot = liveStock[item.id];
              const hasConflict = stockSnapshot ? item.quantity > stockSnapshot.stock : false;

              return (
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
                    {stockSnapshot ? (
                      <p
                        className={`mt-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                          hasConflict ? "text-red-500" : "text-[var(--text-secondary)]"
                        }`}
                      >
                        Available: {stockSnapshot.stock}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm font-bold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
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
              <span>{selectedPayment?.label ?? "Cash on Delivery"}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-3xl font-bold">{formatCurrency(totalPrice)}</span>
          </div>
          </div>
          <CartSummary
            items={lineItems}
            paymentLabel={selectedPayment?.label ?? "Cash on Delivery"}
            showCheckoutAction={false}
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={<LoadingSkeleton title="Loading checkout" rows={4} />}
    >
      <CheckoutContent />
    </Suspense>
  );
}
