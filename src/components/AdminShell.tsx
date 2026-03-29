"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

type Props = {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminShell({ title, subtitle, actions, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="bg-[#f7f2eb]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] bg-[#16311a] p-6 text-white shadow-2xl">
          <Link href="/admin" className="block">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">MATVerse Admin</p>
            <h1 className="mt-3 text-3xl font-semibold">Commerce OS</h1>
          </Link>
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  pathname === item.href ? "bg-white text-[#16311a]" : "text-white/72 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">Operational focus</p>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Track revenue, keep inventory healthy, and record offline sales so analytics reflect the full business.
            </p>
          </div>
          <button
            onClick={() => signOut().then(() => router.push("/admin/login"))}
            className="mt-8 w-full rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Logout
          </button>
        </aside>

        <main className="rounded-[2rem] bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.08)] md:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Admin Panel</p>
              <h2 className="mt-3 text-4xl font-semibold text-[#16311a]">{title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{subtitle}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
