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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started!</p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              <p className="text-indigo-600 font-bold">৳{item.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-3 py-1 hover:bg-gray-100 transition"
              >
                -
              </button>
              <span className="px-3 py-1 border-x text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-3 py-1 hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>
            <p className="font-bold text-gray-900 w-24 text-right">
              ৳{(item.price * item.quantity).toLocaleString()}
            </p>
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:text-red-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-indigo-600">
            ৳{getTotalPrice().toLocaleString()}
          </span>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Continue Shopping
          </Link>
          <Link
            href="/checkout"
            className="flex-1 text-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
