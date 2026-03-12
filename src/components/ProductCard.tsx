"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group">
      {/* Image Container */}
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900 mb-4 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-3">
        {/* Category */}
        <span className="text-xs font-bold tracking-widest uppercase opacity-60">
          {product.category}
        </span>

        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold leading-tight group-hover:opacity-70 transition line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs opacity-60 line-clamp-1">{product.description}</p>

        {/* Price and Stock */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-bold">৳{product.price.toLocaleString()}</span>
          <span className={`text-xs font-medium ${product.stock > 0 ? "opacity-60" : "text-red-600 dark:text-red-400"}`}>
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              stock: product.stock,
            })
          }
          disabled={product.stock === 0}
          className="w-full mt-4 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
