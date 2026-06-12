"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import { useToastStore } from "@/store/toast";
import { formatCurrency } from "@/lib/format";
import Image from "next/image";
import CartSummary from "@/components/commerce/CartSummary";
import EmptyState from "@/components/commerce/EmptyState";
import LoadingSkeleton from "@/components/commerce/LoadingSkeleton";

type UpsellProduct = {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  stock: number;
};

export default function CartPage() {
  const mounted = useHydrated();
  const { items, removeItem, updateQuantity, clearCart, addItem } = useCartStore();
  const showToast = useToastStore((state) => state.showToast);
  const [upsells, setUpsells] = useState<UpsellProduct[]>([]);

  useEffect(() => {
    const loadUpsells = async () => {
      const [upsellRes, productRes] = await Promise.all([
        fetch("/api/upsell", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);
      const upsellRows = await upsellRes.json().catch(() => []);
      const productRows = await productRes.json().catch(() => []);

      if (!Array.isArray(upsellRows) || !Array.isArray(productRows)) {
        return;
      }

      const activeProducts = upsellRows
        .filter((entry) => entry.isActive)
        .map((entry) => productRows.find((product) => product.id === entry.productId))
        .filter(Boolean)
        .slice(0, 3);

      setUpsells(activeProducts);
    };

    if (mounted) {
      void loadUpsells();
    }
  }, [mounted]);

  if (!mounted) {
    return <LoadingSkeleton title="Loading cart" rows={2} />;
  }

  const handleRemove = (id: number, name: string) => {
    removeItem(id);
    showToast(`${name} removed from cart.`, "info");
  };

  const handleClearCart = () => {
    clearCart();
    showToast("Cart cleared.", "info");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-32 sm:px-6 lg:px-8">
        <EmptyState
          title="Your cart is empty"
          description="Products you add will appear here with quantity controls, delivery estimate placeholders, and checkout actions."
          actionHref="/shop"
          actionLabel="Continue Shopping"
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 md:py-16 lg:py-24">
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-sm font-semibold opacity-60 transition hover:opacity-100"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col gap-4 border border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:gap-6 sm:p-6"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900 md:h-32 md:w-32">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={128}
                    height={128}
                    sizes="128px"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{item.name}</h3>
                    <p className="text-2xl font-black">{formatCurrency(item.price)}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 dark:border-gray-700">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-2 font-semibold transition hover:bg-gray-100 dark:hover:bg-gray-900"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <span className="min-w-12 border-x border-gray-300 px-4 py-2 text-center font-semibold dark:border-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 font-semibold transition hover:bg-gray-100 dark:hover:bg-gray-900"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id, item.name)}
                      className="text-sm font-semibold text-red-600 transition hover:opacity-60 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="hidden flex-col items-end justify-between sm:flex">
                  <span className="text-sm opacity-60">Subtotal</span>
                  <span className="text-2xl font-black">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6 lg:col-span-1">
            <CartSummary items={items} />
            <div className="rounded-[28px] border border-[var(--border)] bg-white/80 p-6 shadow-[var(--shadow-soft)] dark:bg-white/5">
              {upsells.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold">Add one more item</p>
                  <div className="mt-4 space-y-3">
                    {upsells.map((product) => (
                      <div key={product.id} className="rounded-2xl bg-[var(--surface)] p-4">
                        <p className="text-sm font-semibold">{product.name}</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatCurrency(product.price)}</p>
                        <button
                          onClick={() => {
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              compareAtPrice: product.compareAtPrice,
                              image: product.image,
                              stock: product.stock,
                            });
                            showToast(`${product.name} added as an upsell.`, "success");
                          }}
                          className="mt-3 rounded-full border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)]"
                        >
                          Add this item
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm leading-6 text-[var(--text-secondary)]">
                  Delivery fee, courier assignment, and campaign vouchers will appear here once
                  those integrations are connected.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
