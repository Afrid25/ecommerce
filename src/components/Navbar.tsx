"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCartStore } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/category/bamboo-products", label: "Categories" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/shop?sort=price-desc", label: "Top Picks" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mounted = useHydrated();
  const { resolvedTheme, setTheme } = useTheme();
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onHome = pathname === "/";
  const darkText = isScrolled || !onHome;
  const themeText = darkText ? "text-[var(--foreground)]" : "text-white";

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !onHome
          ? "top-0 border-b border-[var(--border)] bg-white/90 shadow-lg backdrop-blur-xl dark:bg-black/90"
          : "top-10 bg-transparent"
      }`}
    >
      <div className="container-nike">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className={`font-display text-4xl leading-none ${themeText}`}>
            MATVerse
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`nav-link text-sm font-medium uppercase tracking-[0.18em] ${themeText}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className={`rounded-full p-2 text-sm font-semibold ${themeText}`}
              aria-label="Toggle theme"
            >
              {mounted ? (resolvedTheme === "dark" ? "Light" : "Dark") : "Theme"}
            </button>
            <Link href="/cart" className={`relative rounded-full p-2 text-sm font-semibold ${themeText}`}>
              Cart
              {mounted && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen((value) => !value)}
              className={`rounded-full p-2 text-sm font-semibold lg:hidden ${themeText}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[var(--border)] bg-white py-4 dark:bg-black lg:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-2 py-2 text-sm font-medium uppercase tracking-[0.18em]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
