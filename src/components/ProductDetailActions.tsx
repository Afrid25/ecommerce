"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import { Product } from "@/types/product";

type Props = {
  product: Product & { stock: number };
};

export default function ProductDetailActions({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const startBuyNow = useCartStore((s) => s.startBuyNow);
  const showToast = useToastStore((state) => state.showToast);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i += 1) {
      addItem({
        id: Number(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      });
    }

    showToast(`${quantity} x ${product.name} added to cart.`, "success");
  };

  const handleBuyNow = () => {
    startBuyNow(
      {
        id: Number(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      quantity
    );
    router.push("/checkout?mode=buy-now");
  };

  if (product.stock <= 0) {
    return null;
  }

  return (
    <div className="mb-12 space-y-4">
      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm font-medium text-[var(--text-secondary)]">
        {product.stock <= 5
          ? `Low stock alert: only ${product.stock} left in this drop.`
          : "Ready to ship with secure checkout and live inventory updates."}
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm font-bold uppercase tracking-wide opacity-60">Quantity:</span>
        <div className="flex items-center border border-gray-300 dark:border-gray-700">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-3 font-semibold transition hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            -
          </button>
          <span className="min-w-16 border-x border-gray-300 px-6 py-3 text-center font-semibold dark:border-gray-700">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-4 py-3 font-semibold transition hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            +
          </button>
        </div>
      </div>

      <div className="hidden gap-3 md:grid-cols-2 md:grid">
        <button
          onClick={handleAddToCart}
          className="w-full rounded-full border border-[var(--primary)] px-8 py-4 text-lg font-bold tracking-wide text-[var(--primary)] transition-all duration-300 hover:bg-[var(--primary)] hover:text-white"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="w-full rounded-full bg-[#D46A46] px-8 py-4 text-lg font-bold tracking-wide text-white transition-all duration-300 hover:bg-[#bf5d3c]"
        >
          Buy Now
        </button>
      </div>

      <Link
        href="/cart"
        className="hidden w-full border border-black px-8 py-4 text-center text-lg font-bold tracking-wide text-black transition-all duration-300 hover:bg-black hover:text-white md:block dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
      >
        View Cart
      </Link>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 px-4 py-3 shadow-[0_-10px_35px_rgba(0,0,0,0.08)] backdrop-blur md:hidden dark:bg-black/95">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 rounded-full border border-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary)]"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 rounded-full bg-[#FF6A00] px-4 py-3 text-sm font-semibold text-white"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
