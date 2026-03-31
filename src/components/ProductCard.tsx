"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/format";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!product) {
    return null;
  }

  const safeImage = product.image || "/images/products/air-max-pulse-1.jpg";
  const lowStock = product.stock > 0 && product.stock <= 5;
  const compareAtPrice =
    typeof product.compareAtPrice === "number" ? product.compareAtPrice : null;
  const hasDiscount = typeof compareAtPrice === "number" && compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100)
    : 0;
  const safeWishlisted = mounted ? isWishlisted : false;

  const cartPayload = {
    id: Number(product.id),
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: safeImage,
    stock: product.stock,
  };

  const handleAddToCart = async (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (isAdding || product.stock <= 0) {
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
      showToast(`${product.name} added to cart!`, "success");
    } finally {
      window.setTimeout(() => setIsAdding(false), 400);
    }
  };

  const handleBuyNow = (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (isBuying || product.stock <= 0) {
      return;
    }

    setIsBuying(true);
    startBuyNow(cartPayload, 1);
    router.push("/checkout?mode=buy-now");
  };

  const handleWishlist = (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    toggleWishlist(cartPayload);
    showToast(
      safeWishlisted
        ? `${product.name} removed from wishlist.`
        : `${product.name} saved to wishlist.`,
      "info"
    );
  };

  if (viewMode === "list") {
    return (
      <article className="group overflow-hidden rounded-[1.5rem] bg-[var(--surface)]">
        <Link href={`/product/${product.id}`} className="flex h-full flex-col sm:flex-row">
          <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-square sm:w-56 sm:flex-shrink-0">
            <Image
              src={safeImage}
              alt={product.name}
              fill
              sizes="(max-width: 639px) 100vw, 224px"
              className="object-cover transition duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {product.category}
              </p>
              <h3 className="mt-2 line-clamp-2 break-words font-display text-2xl leading-tight sm:text-3xl">
                {product.name}
              </h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">
                {product.description}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="font-display text-3xl sm:text-4xl">
                  {formatCurrency(product.price)}
                </p>
                {hasDiscount ? (
                  <p className="text-sm text-[var(--text-secondary)] line-through">
                    {formatCurrency(compareAtPrice)}
                  </p>
                ) : null}
              </div>
              <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full rounded-full border border-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary)] transition duration-300 hover:bg-[var(--primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="w-full rounded-full bg-[#D46A46] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#bf5d3c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBuying ? "Redirecting..." : "Buy Now"}
                </button>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-[var(--surface)]">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={safeImage}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
          <div className="absolute left-3 top-3 flex max-w-[72%] flex-wrap gap-2">
            {product.isTrending ? (
              <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                Trending
              </span>
            ) : null}
            {product.isHot ? (
              <span className="rounded-full bg-[#FF6A00] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                Hot Item
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
          <button
            onClick={handleWishlist}
            className={`absolute right-3 top-3 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
              safeWishlisted ? "bg-white text-[#16311a]" : "bg-black/40 text-white"
            }`}
          >
            {safeWishlisted ? "Saved" : "Wish"}
          </button>
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 left-4 right-4 rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition-all duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            {isAdding ? "Adding..." : "Quick Add"}
          </button>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)] md:text-xs">
            {product.category}
          </p>
          {lowStock ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF6A00] md:text-xs">
              Selling fast
            </span>
          ) : null}
        </div>
        <Link href={`/product/${product.id}`} className="block min-w-0">
          <h3 className="mt-2 line-clamp-2 break-words font-display text-2xl leading-tight transition-colors group-hover:text-[var(--primary)] md:text-3xl">
            {product.name}
          </h3>
        </Link>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <span className="font-display text-2xl md:text-4xl">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount ? (
              <span className="ml-0 mt-1 block text-xs text-[var(--text-secondary)] line-through md:ml-2 md:mt-0 md:inline md:text-sm">
                {formatCurrency(compareAtPrice)}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)] md:text-xs">
            {product.stock > 0 ? `${product.stock} left` : "Sold out"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full rounded-full border border-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary)] transition duration-300 hover:bg-[var(--primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="w-full rounded-full bg-[#D46A46] px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#bf5d3c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBuying ? "..." : "Buy"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
