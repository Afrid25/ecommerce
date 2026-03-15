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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          <div className="skeleton aspect-square w-full"></div>
          <div className="space-y-6">
            <div className="skeleton h-6 w-1/4"></div>
            <div className="skeleton h-12 w-3/4"></div>
            <div className="skeleton h-8 w-1/3"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-2/3"></div>
            <div className="skeleton h-14 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Product not found</h2>
        <p className="opacity-60 mb-8">The product you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary bg-black text-white hover:opacity-80 dark:bg-white dark:text-black">
          Back to Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition">
          ← Back to Shopping
        </Link>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
          {/* Image Section */}
          <div className="flex items-center">
            <div className="w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-center">
            {/* Category */}
            <span className="text-xs font-bold tracking-widest uppercase opacity-60 mb-4">
              {product.category}
            </span>

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 md:mb-6 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6 md:mb-8">
              <p className="text-2xl sm:text-3xl md:text-4xl font-black">
                ৳{product.price.toLocaleString()}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
              <span
                className={`text-sm font-bold tracking-wide uppercase ${
                  product.stock > 0 ? "opacity-60" : "text-red-600 dark:text-red-400"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Description */}
            <p className="text-lg leading-relaxed opacity-70 mb-8">
              {product.description}
            </p>

            {/* Add to Cart Section */}
            {product.stock > 0 && (
              <div className="space-y-4 mb-12">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold tracking-wide uppercase opacity-60">Quantity:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-700">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 transition font-semibold"
                    >
                      −
                    </button>
                    <span className="px-6 py-3 border-x border-gray-300 dark:border-gray-700 font-semibold min-w-16 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 transition font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 px-8 bg-black dark:bg-white text-white dark:text-black font-bold text-lg tracking-wide transition-all duration-300 ${
                    added ? "opacity-60" : "hover:opacity-80"
                  }`}
                >
                  {added ? "✓ Added to Cart" : "Add to Cart"}
                </button>

                {/* View Cart Button */}
                <Link
                  href="/cart"
                  className="block text-center w-full py-4 px-8 border border-black dark:border-white text-black dark:text-white font-bold text-lg tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                >
                  View Cart
                </Link>
              </div>
            )}

            {/* Payment Methods */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
              <h3 className="text-sm font-bold tracking-widest uppercase opacity-60 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-lg">💵</span>
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-lg">📱</span>
                  <span>bKash</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-lg">📱</span>
                  <span>Nagad</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4 text-sm opacity-60">
              <p>✓ Free shipping on orders over ৳5,000</p>
              <p>✓ Easy returns within 7 days</p>
              <p>✓ Secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
