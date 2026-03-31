"use client";

import { useEffect } from "react";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductViewTracker({ product }: Props) {
  useEffect(() => {
    const stored = window.localStorage.getItem("recently-viewed-products");
    const items = stored ? (JSON.parse(stored) as Product[]) : [];
    const nextItems = [product, ...items.filter((item) => Number(item.id) !== Number(product.id))].slice(0, 6);
    window.localStorage.setItem("recently-viewed-products", JSON.stringify(nextItems));
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "product_view", productId: Number(product.id) }),
    }).catch(() => null);
  }, [product]);

  return null;
}
