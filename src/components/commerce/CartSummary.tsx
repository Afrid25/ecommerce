import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/store/cart";

type CartSummaryProps = {
  items: CartItem[];
  checkoutHref?: string;
  paymentLabel?: string;
  showCheckoutAction?: boolean;
};

export default function CartSummary({
  items,
  checkoutHref = "/checkout",
  paymentLabel,
  showCheckoutAction = true,
}: CartSummaryProps) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <aside className="rounded-[28px] border border-[var(--border)] bg-white/80 p-6 shadow-[var(--shadow-soft)] dark:bg-white/5 lg:sticky lg:top-28">
      <h2 className="text-xl font-semibold">Order Summary</h2>
      <div className="mt-6 space-y-4 border-b border-[var(--border)] pb-6 text-sm">
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Delivery</span>
          <span>Calculated after address</span>
        </div>
        {paymentLabel ? (
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Payment</span>
            <span>{paymentLabel}</span>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-base font-semibold">Estimated Total</span>
        <span className="text-2xl font-bold">{formatCurrency(subtotal)}</span>
      </div>
      {showCheckoutAction ? (
        <Link href={checkoutHref} className="mt-6 flex w-full items-center justify-center rounded-[18px] bg-[#FF6A00] px-6 py-4 text-sm font-semibold text-white">
          Proceed to Checkout
        </Link>
      ) : null}
      <Link href="/shop" className="mt-3 flex w-full items-center justify-center rounded-[18px] border border-[var(--border)] px-6 py-4 text-sm font-semibold">
        Continue Shopping
      </Link>
      <div className="mt-6 rounded-[20px] bg-[var(--surface)] p-4 text-xs leading-6 text-[var(--text-secondary)]">
        Delivery partner, shipping fee, and delivery window will be finalized during dispatch.
      </div>
    </aside>
  );
}
