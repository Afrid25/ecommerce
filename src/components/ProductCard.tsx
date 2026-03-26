"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";
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
  const showToast = useToastStore((state) => state.showToast);
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  if (!product) {
    return null;
  }

  const safeImage = product.image || "/images/products/air-max-pulse-1.jpg";
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = async (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (isAdding || product.stock <= 0) {
      return;
    }

    setIsAdding(true);
    try {
      addItem({
        id: Number(product.id),
        name: product.name,
        price: product.price,
        image: safeImage,
        stock: product.stock,
      });
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
    startBuyNow(
      {
        id: Number(product.id),
        name: product.name,
        price: product.price,
        image: safeImage,
        stock: product.stock,
      },
      1
    );
    router.push("/checkout?mode=buy-now");
  };

  if (viewMode === "list") {
    return (
      <article className="group overflow-hidden rounded-[1.5rem] bg-[var(--surface)]">
        <Link href={`/product/${product.id}`} className="flex flex-col sm:flex-row">
          <div className="relative h-56 w-full overflow-hidden sm:w-56">
            <Image src={safeImage} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-110" />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{product.category}</p>
              <h3 className="mt-2 font-display text-3xl leading-none">{product.name}</h3>
              <p className="mt-3 max-w-xl text-sm text-[var(--text-secondary)]">{product.description}</p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <p className="font-display text-4xl">{formatCurrency(product.price)}</p>
              <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="rounded-full border border-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary)] transition duration-300 hover:bg-[var(--primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="rounded-full bg-[#D46A46] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#bf5d3c] disabled:cursor-not-allowed disabled:opacity-50"
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
    <article className="group overflow-hidden rounded-[1.5rem] bg-[var(--surface)]">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={safeImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold uppercase text-white">
              Trending
            </span>
            {lowStock ? (
              <span className="rounded-full bg-[#FF6A00] px-3 py-1 text-xs font-bold uppercase text-white">
                Only {product.stock} left
              </span>
            ) : null}
          </div>
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 left-4 right-4 translate-y-4 rounded-full bg-[var(--primary)] py-3 font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            {isAdding ? "Adding..." : "Quick Add"}
          </button>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{product.category}</p>
          {lowStock ? (
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6A00]">
              Selling fast
            </span>
          ) : null}
        </div>
        <Link href={`/product/${product.id}`}>
          <h3 className="mt-2 font-display text-3xl leading-none transition-colors group-hover:text-[var(--primary)]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-display text-4xl">{formatCurrency(product.price)}</span>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            {product.stock > 0 ? `${product.stock} left` : "Sold out"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="rounded-full border border-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary)] transition duration-300 hover:bg-[var(--primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="rounded-full bg-[#D46A46] px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#bf5d3c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBuying ? "Redirecting..." : "Buy Now"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
