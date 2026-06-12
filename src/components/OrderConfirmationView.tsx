"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";

type ConfirmationItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
};

type ConfirmationSnapshot = {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  paymentMethod: string;
  totalPrice: number;
  items: ConfirmationItem[];
};

type Props = {
  orderId?: string | null;
};

export default function OrderConfirmationView({ orderId }: Props) {
  const [snapshot] = useState<ConfirmationSnapshot | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.sessionStorage.getItem("lastOrderConfirmation");
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as ConfirmationSnapshot;
      return !orderId || parsed.orderId === orderId ? parsed : null;
    } catch {
      return null;
    }
  });

  const displayOrderId = orderId || snapshot?.orderId;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="rounded-[32px] border border-[var(--border)] bg-white/82 p-6 shadow-[var(--shadow-soft)] dark:bg-white/5 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6A00] text-3xl font-semibold text-white">
              OK
            </div>
            <p className="section-eyebrow mt-8">Order confirmed</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Thanks, your order is in the queue.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              We received your order and will move it through confirmation, packing, dispatch, and delivery.
            </p>

            {displayOrderId ? (
              <div className="mt-7 rounded-[24px] bg-[var(--surface)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  Order ID
                </p>
                <p className="mt-2 break-all font-mono text-2xl font-bold">{displayOrderId}</p>
              </div>
            ) : null}

            {snapshot ? (
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] bg-[var(--surface)] p-5">
                  <p className="section-eyebrow">Customer</p>
                  <p className="mt-3 font-semibold">{snapshot.customerName}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{snapshot.phone}</p>
                  {snapshot.customerEmail ? (
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{snapshot.customerEmail}</p>
                  ) : null}
                </div>
                <div className="rounded-[24px] bg-[var(--surface)] p-5">
                  <p className="section-eyebrow">Delivery</p>
                  <p className="mt-3 text-sm leading-6">{snapshot.address}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    Status placeholder: preparing for confirmation
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-7 rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text-secondary)]">
                Full product and customer details are available immediately after checkout in this browser session.
                Backend order lookup for guest confirmation pages can be connected later.
              </div>
            )}
          </div>

          <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            {snapshot?.items?.length ? (
              <div className="mt-5 space-y-4">
                {snapshot.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      sizes="64px"
                      className="h-16 w-16 rounded-[14px] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">Qty {item.quantity}</p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-[var(--border)] pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Payment</span>
                    <span>{snapshot.paymentMethod}</span>
                  </div>
                  <div className="mt-3 flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(snapshot.totalPrice)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                Product summary will appear here when checkout provides a local confirmation snapshot.
              </p>
            )}
          </aside>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Confirmed", "We verify order details."],
            ["Packed", "Products are prepared for handoff."],
            ["Dispatched", "Courier and delivery status will appear here."],
            ["Delivered", "Customer receives the order."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-[20px] bg-[var(--surface)] p-4">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/shop" className="btn-editorial-primary">
            Continue Shopping
          </Link>
          <Link href="/profile" className="btn-secondary">
            View Account
          </Link>
        </div>
      </div>
    </div>
  );
}
