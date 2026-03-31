"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OrderConfirmationView from "@/components/OrderConfirmationView";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return <OrderConfirmationView orderId={orderId} />;
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-20 text-center">Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
