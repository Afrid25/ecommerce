"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

type SiteSettings = {
  businessEmail: string;
  phone: string;
  address: string;
  footerContent: string;
};

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (response.ok && data) {
        setSettings(data);
      }
    };

    void loadSettings();
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[var(--foreground)] py-16 text-[var(--background)]">
      <div className="container-nike">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Logo href="/" className="bg-white/6" />
            <p className="mt-4 max-w-sm text-sm text-white/70">
              {settings?.footerContent || "Premium, mobile-first commerce for eco lifestyle essentials."}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Shop</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li><Link href="/shop">All Products</Link></li>
              <li><Link href="/shop?sort=newest">New Arrivals</Link></li>
              <li><Link href="/shop?sort=popular">Best Sellers</Link></li>
              <li><Link href="/category/bamboo-products">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Support</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li><Link href="/cart">Cart</Link></li>
              <li><Link href="/checkout">Checkout</Link></li>
              <li><Link href="/profile">Profile</Link></li>
              <li><Link href="/admin/login">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>{settings?.businessEmail || "matversebd@gmail.com"}</li>
              <li>{settings?.phone || "+880 1712-345678"}</li>
              <li>{settings?.address || "Dhaka, Bangladesh"}</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-sm text-white/60">
          &copy; {new Date().getFullYear()} MATVerse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
