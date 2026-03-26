"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

type Props = {
  currentProductId?: number;
};

export default function RecentlyViewedProducts({ currentProductId }: Props) {
  const [items] = useState<Product[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = window.localStorage.getItem("recently-viewed-products");
    const parsed = stored ? (JSON.parse(stored) as Product[]) : [];
    return parsed.filter((item) => Number(item.id) !== Number(currentProductId)).slice(0, 4);
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="mb-8">
        <p className="section-eyebrow">Recently Viewed</p>
        <h2 className="section-title">Pick up where you left off.</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
