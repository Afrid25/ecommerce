"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import { useToastStore } from "@/store/toast";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import Image from "next/image";

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
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, addItem } = useCartStore();
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
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 md:py-16 lg:py-24">
        <div className="space-y-6">
          <div className="skeleton h-10 w-1/4" />
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-32 w-full" />
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

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
      <div className="max-w-7xl mx-auto px-4 py-32 text-center sm:px-6 lg:px-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6 h-24 w-24 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="mb-4 text-3xl font-black md:text-4xl">Your cart is empty</h2>
        <p className="mb-8 text-lg opacity-60">Add some products to get started.</p>
        <Link
          href="/"
          className="btn-primary inline-block bg-black text-white hover:opacity-80 dark:bg-white dark:text-black"
        >
          Continue Shopping
        </Link>
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

          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-gray-200 p-8 dark:border-gray-800">
              <h2 className="mb-8 text-xl font-black">Order Summary</h2>

              <div className="mb-8 space-y-4 border-b border-gray-200 pb-8 dark:border-gray-800">
                <div className="flex justify-between text-sm opacity-60">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm opacity-60">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm opacity-60">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="mb-8 flex items-center justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-black">{formatCurrency(totalPrice)}</span>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="block w-full bg-black py-4 text-center font-bold tracking-wide text-white transition hover:opacity-80 dark:bg-white dark:text-black"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/"
                  className="block w-full border border-black py-4 text-center font-bold tracking-wide text-black transition hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-8 space-y-3 border-t border-gray-200 pt-8 text-xs opacity-60 dark:border-gray-800">
                <p>Secure checkout</p>
                <p>Free returns within 7 days</p>
                <p>Multiple payment options</p>
              </div>

              {upsells.length > 0 ? (
                <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
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
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
