"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCartStore } from "@/store/cart";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link href="/" className="text-indigo-600 mt-4 inline-block hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="text-indigo-600 hover:underline mb-6 inline-block">
        ← Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{product.name}</h1>
          <p className="text-3xl font-bold text-indigo-600 mt-4">
            ৳{product.price.toLocaleString()}
          </p>

          <div className="mt-4">
            <span
              className={`text-sm font-medium ${
                product.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.stock > 0 ? `${product.stock} items in stock` : "Out of stock"}
            </span>
          </div>

          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          {product.stock > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold text-lg"
              >
                {added ? "✓ Added to Cart!" : "Add to Cart"}
              </button>

              <Link
                href="/cart"
                className="block text-center w-full border border-indigo-600 text-indigo-600 py-3 rounded-lg hover:bg-indigo-50 transition font-semibold"
              >
                View Cart
              </Link>
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Methods</h3>
            <div className="flex flex-wrap gap-3">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">💵 Cash on Delivery</span>
              <span className="bg-pink-50 px-3 py-1 rounded-full text-sm text-pink-700">📱 bKash</span>
              <span className="bg-orange-50 px-3 py-1 rounded-full text-sm text-orange-700">📱 Nagad</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
