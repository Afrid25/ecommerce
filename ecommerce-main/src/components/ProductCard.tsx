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
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-4">
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
          {product.category}
        </span>
        <Link href={`/product/${product.id}`}>
          <h3 className="mt-2 font-semibold text-gray-900 hover:text-indigo-600 transition line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">৳{product.price.toLocaleString()}</span>
          <span className={`text-xs ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
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
          className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
