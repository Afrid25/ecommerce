"use client";

import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 lg:py-24">
        <div className="space-y-6">
          <div className="skeleton h-10 w-1/4"></div>
          <div className="skeleton h-32 w-full"></div>
          <div className="skeleton h-32 w-full"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto opacity-20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="text-3xl md:text-4xl font-black mb-4">Your cart is empty</h2>
        <p className="text-lg opacity-60 mb-8">Add some products to get started.</p>
        <Link
          href="/"
          className="btn-primary bg-black text-white hover:opacity-80 dark:bg-white dark:text-black inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 lg:py-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm font-semibold opacity-60 hover:opacity-100 transition"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 group"
              >
                {/* Product Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-lg font-semibold line-clamp-2 mb-2">{item.name}</h3>
                    <p className="text-2xl font-black">৳{item.price.toLocaleString()}</p>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 dark:border-gray-700">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition font-semibold"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 dark:border-gray-700 font-semibold min-w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition font-semibold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 dark:text-red-400 hover:opacity-60 transition font-semibold text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="hidden sm:flex flex-col justify-between items-end">
                  <span className="text-sm opacity-60">Subtotal</span>
                  <span className="text-2xl font-black">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 dark:border-gray-800 p-8 sticky top-24">
              <h2 className="text-xl font-black mb-8">Order Summary</h2>

              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                <div className="flex justify-between text-sm opacity-60">
                  <span>Subtotal</span>
                  <span>৳{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm opacity-60">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm opacity-60">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-black">
                  ৳{getTotalPrice().toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="block text-center w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold tracking-wide hover:opacity-80 transition"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/"
                  className="block text-center w-full py-4 border border-black dark:border-white text-black dark:text-white font-bold tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-3 text-xs opacity-60">
                <p>✓ Secure checkout</p>
                <p>✓ Free returns within 7 days</p>
                <p>✓ Multiple payment options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
