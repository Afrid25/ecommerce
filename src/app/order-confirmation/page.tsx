"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for your order. We&apos;ll process it shortly.
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="text-xl font-bold text-indigo-600">{orderId}</p>
          </div>
        )}

        <div className="space-y-3 text-left bg-indigo-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-indigo-900">What happens next?</h3>
          <ul className="text-sm text-indigo-800 space-y-2">
            <li>✅ Your order has been received</li>
            <li>📦 We&apos;ll confirm and prepare your order</li>
            <li>🚚 Your order will be shipped to your address</li>
            <li>📱 You&apos;ll receive updates on your order status</li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Continue Shopping
        </Link>
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
