"use client";

import Link from "next/link";

type CategoryPill = {
  key: string;
  label: string;
  href?: string;
};

type Props = {
  items: CategoryPill[];
  activeKey: string;
  onSelect?: (key: string) => void;
};

export default function CategoryPillBar({ items, activeKey, onSelect }: Props) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const className = `inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
          isActive
            ? "border-transparent bg-[#16311a] text-white shadow-[0_18px_36px_-18px_rgba(22,49,26,0.65)]"
            : "border-white/50 bg-white/70 text-[var(--foreground)] backdrop-blur hover:border-[var(--primary)] hover:text-[var(--primary)]"
        }`;

        if (item.href) {
          return (
            <Link key={item.key} href={item.href} className={className}>
              {item.label}
            </Link>
          );
        }

        return (
          <button key={item.key} type="button" onClick={() => onSelect?.(item.key)} className={className}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
