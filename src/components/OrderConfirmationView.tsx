import Link from "next/link";

type Props = {
  orderId?: string | null;
};

export default function OrderConfirmationView({ orderId }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="rounded-[40px] border border-[var(--border)] bg-white/80 p-8 text-center shadow-[var(--shadow-soft)] lg:p-14">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--accent)] text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <p className="section-eyebrow mt-8">Order Confirmed</p>
        <h1 className="mt-3 font-[family-name:var(--font-brand)] text-5xl leading-tight">
          Your home edit is on its way.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
          Thank you for choosing MATVerse. We&apos;ve received your order and will keep you informed
          as it moves from confirmation to delivery.
        </p>

        {orderId ? (
          <div className="mx-auto mt-8 max-w-xl rounded-[28px] bg-[var(--surface)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              Order ID
            </p>
            <p className="mt-3 font-mono text-3xl font-bold">{orderId}</p>
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {[
            ["1", "Confirmed", "We verify payment choice and reserve stock."],
            ["2", "Prepared", "Your pieces are packed and quality checked."],
            ["3", "Dispatched", "Delivery is arranged for your location."],
            ["4", "Delivered", "You receive your order and aftercare support."],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-[24px] bg-[var(--surface)] p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Step {step}
              </p>
              <h2 className="mt-3 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/shop" className="btn-editorial-primary">
            Continue Shopping
          </Link>
          <Link href="/shop?sort=popular" className="btn-secondary">
            Browse Best Sellers
          </Link>
        </div>
      </div>
    </div>
  );
}
