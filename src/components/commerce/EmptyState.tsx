import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function EmptyState({
  title,
  description,
  actionHref = "/shop",
  actionLabel = "Continue Shopping",
}: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-white/70 px-6 py-14 text-center shadow-[var(--shadow-soft)] dark:bg-white/5">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)] text-2xl">
        <span aria-hidden="true">0</span>
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
      <Link href={actionHref} className="btn-editorial-primary mt-7">
        {actionLabel}
      </Link>
    </div>
  );
}
