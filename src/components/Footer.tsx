import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--foreground)] py-16 text-[var(--background)]">
      <div className="container-nike">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <h3 className="font-display text-4xl">MATVerse</h3>
            <p className="mt-4 max-w-sm text-sm text-white/70">
              Premium commerce presentation inspired by the reference layout, adapted to your Next.js store.
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
              <li><Link href="/admin/login">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Payment</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>Cash on Delivery</li>
              <li>bKash</li>
              <li>Nagad</li>
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
