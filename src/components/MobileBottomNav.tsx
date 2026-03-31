"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Categories" },
  { href: "/cart", label: "Cart" },
  { href: "/profile", label: "Profile" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const mounted = useHydrated();
  const totalItems = useCartStore((state) => state.getTotalItems());

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 px-3 py-2 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-2xl px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] ${
                active ? "bg-[#16311a] text-white" : "text-[var(--text-secondary)]"
              }`}
            >
              {item.label}
              {item.href === "/cart" && mounted && totalItems > 0 ? (
                <span className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6A00] px-1 text-[10px] text-white">
                  {totalItems}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
