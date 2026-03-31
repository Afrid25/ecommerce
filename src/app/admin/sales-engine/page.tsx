import Link from "next/link";
import AdminShell from "@/components/AdminShell";

export default function AdminSalesEnginePage() {
  return (
    <AdminShell
      title="Sales Engine"
      subtitle="Control offers, bundles, upsells, and promotional levers from one operating layer."
      actions={
        <>
          <Link href="/admin/offers" className="rounded-full bg-[#16311a] px-5 py-3 text-sm font-semibold text-white">
            Manage Offers
          </Link>
          <Link href="/admin/upsell" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold">
            Manage Upsells
          </Link>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        {[
          ["Offers", "Run product-specific discounts and activate/deactivate campaigns."],
          ["Bundles", "Package multiple products together at a promotional price."],
          ["Upsells", "Promote admin-chosen add-ons inside the cart journey."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
