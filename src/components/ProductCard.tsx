"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import type { Product } from "@/types/product";

type Props = {
  product?: Product;
  viewMode?: "grid" | "list";
};

function ProductCard({ product, viewMode = "grid" }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const startBuyNow = useCartStore((state) => state.startBuyNow);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const isWishlisted = useCartStore((state) => state.isWishlisted(Number(product?.id ?? 0)));
  const showToast = useToastStore((state) => state.showToast);
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!product) {
    return null;
  }

  const href = `/product/${product.id}`;
  const safeImage = product.image || "/images/products/air-max-pulse-1.jpg";
  const lowStock = product.stock > 0 && product.stock <= 5;
  const compareAtPrice =
    typeof product.compareAtPrice === "number" ? product.compareAtPrice : null;
  const hasDiscount = typeof compareAtPrice === "number" && compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100)
    : 0;
  const safeWishlisted = mounted ? isWishlisted : false;
  const disabled = product.stock <= 0;
  const cartPayload = {
    id: Number(product.id),
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: safeImage,
    stock: product.stock,
  };

  const handleAddToCart = async () => {
    if (isAdding || disabled) {
      return;
    }

    setIsAdding(true);
    try {
      addItem(cartPayload);
      await fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "add_to_cart", productId: Number(product.id) }),
      }).catch(() => null);
      showToast(`${product.name} added to cart.`, "success");
    } finally {
      window.setTimeout(() => setIsAdding(false), 400);
    }
  };

  const handleBuyNow = () => {
    if (isBuying || disabled) {
      return;
    }

    setIsBuying(true);
    startBuyNow(cartPayload, 1);
    router.push("/checkout?mode=buy-now");
  };

  const handleWishlist = () => {
    toggleWishlist(cartPayload);
    showToast(
      safeWishlisted
        ? `${product.name} removed from wishlist.`
        : `${product.name} saved to wishlist.`,
      "info"
    );
  };

  const badges = (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[72%] flex-wrap gap-2">
      {product.isTrending ? (
        <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          Trending
        </span>
      ) : null}
      {product.isHot ? (
        <span className="rounded-full bg-[#FF6A00] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          Hot
        </span>
      ) : null}
      {hasDiscount ? (
        <span className="rounded-full bg-black/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          Save {discountPercent}%
        </span>
      ) : null}
      {lowStock ? (
        <span className="rounded-full bg-[#16311a] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          Only {product.stock} left
        </span>
      ) : null}
    </div>
  );

  if (viewMode === "list") {
    return (
      <article className="group overflow-hidden rounded-[24px] border border-[var(--border)] bg-white/80 shadow-[var(--shadow-soft)] dark:bg-white/5">
        <div className="flex h-full flex-col sm:flex-row">
          <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-square sm:w-56 sm:flex-shrink-0">
            <Image
              src={safeImage}
              alt={product.name}
              fill
              sizes="(max-width: 639px) 100vw, 224px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            {badges}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {product.category}
              </p>
              <Link href={href} className="block">
                <h3 className="mt-2 line-clamp-2 break-words text-2xl font-semibold leading-tight transition hover:text-[var(--primary)]">
                  {product.name}
                </h3>
              </Link>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
                {product.description}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
                {hasDiscount ? (
                  <p className="text-sm text-[var(--text-secondary)] line-through">
                    {formatCurrency(compareAtPrice ?? product.price)}
                  </p>
                ) : null}
              </div>
              <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleWishlist}
                  className="rounded-[16px] border border-[var(--border)] px-4 py-3 text-sm font-semibold"
                >
                  {safeWishlisted ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={disabled}
                  className="rounded-[16px] border border-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAdding ? "Adding" : "Cart"}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={disabled}
                  className="rounded-[16px] bg-[#FF6A00] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBuying ? "..." : "Buy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-white/80 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 dark:bg-white/5">
      <div className="relative aspect-square w-full overflow-hidden">
        <Link href={href} className="block h-full w-full" aria-label={`View ${product.name}`}>
          <Image
            src={safeImage}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        {badges}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute right-3 top-3 z-20 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
            safeWishlisted ? "bg-white text-[#16311a]" : "bg-black/45 text-white"
          }`}
        >
          {safeWishlisted ? "Saved" : "Wish"}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            {product.category}
          </p>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {product.stock > 0 ? `${product.stock} left` : "Sold out"}
          </span>
        </div>
        <Link href={href} className="block min-w-0">
          <h3 className="mt-2 line-clamp-2 break-words text-base font-semibold leading-snug transition hover:text-[var(--primary)] sm:text-lg">
            {product.name}
          </h3>
        </Link>
        <div className="mt-3">
          <span className="text-xl font-bold">{formatCurrency(product.price)}</span>
          {hasDiscount ? (
            <span className="ml-2 text-xs text-[var(--text-secondary)] line-through">
              {formatCurrency(compareAtPrice ?? product.price)}
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[var(--text-secondary)]">
          <span>Rating 4.8</span>
          <span>120 sold</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={disabled}
            className="rounded-[14px] border border-[var(--primary)] px-3 py-3 text-sm font-semibold text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdding ? "Adding" : "Add"}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={disabled}
            className="rounded-[14px] bg-[#FF6A00] px-3 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBuying ? "..." : "Buy"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
