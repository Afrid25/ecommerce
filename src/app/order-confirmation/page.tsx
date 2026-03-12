"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="bg-white dark:bg-black min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            Order Confirmed
          </h1>
          <p className="text-lg opacity-60 max-w-md mx-auto">
            Thank you for your order. We&apos;re preparing it for shipment.
          </p>
        </div>

        {/* Order ID */}
        {orderId && (
          <div className="border border-gray-200 dark:border-gray-800 p-8 mb-12 text-center">
            <p className="text-sm font-bold tracking-widest uppercase opacity-60 mb-3">Order ID</p>
            <p className="text-3xl md:text-4xl font-black font-mono">{orderId}</p>
          </div>
        )}

        {/* What Happens Next */}
        <div className="border border-gray-200 dark:border-gray-800 p-8 mb-12">
          <h3 className="text-xl font-bold tracking-tight mb-6">What Happens Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0 font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-semibold mb-1">Order Received</p>
                <p className="text-sm opacity-60">We&apos;ve received your order and are processing it.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0 font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-semibold mb-1">Order Confirmed</p>
                <p className="text-sm opacity-60">We&apos;ll confirm and prepare your items for shipment.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0 font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-semibold mb-1">Shipped</p>
                <p className="text-sm opacity-60">Your order is on its way to your address.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0 font-bold text-sm">
                4
              </div>
              <div>
                <p className="font-semibold mb-1">Delivered</p>
                <p className="text-sm opacity-60">You&apos;ll receive SMS updates about your delivery.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-200 dark:border-gray-800 p-6 text-center">
            <p className="text-2xl mb-2">📧</p>
            <p className="text-sm font-semibold mb-1">Confirmation Email</p>
            <p className="text-xs opacity-60">Check your email for order details</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-800 p-6 text-center">
            <p className="text-2xl mb-2">📱</p>
            <p className="text-sm font-semibold mb-1">SMS Updates</p>
            <p className="text-xs opacity-60">Track your order via SMS</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-800 p-6 text-center">
            <p className="text-2xl mb-2">🔄</p>
            <p className="text-sm font-semibold mb-1">Easy Returns</p>
            <p className="text-xs opacity-60">7-day return policy</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block text-center w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold tracking-wide hover:opacity-80 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/cart"
            className="block text-center w-full py-4 border border-black dark:border-white text-black dark:text-white font-bold tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
          >
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-20 text-center">Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
