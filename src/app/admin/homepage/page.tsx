"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { AdminField, adminInputClassName } from "@/components/admin/AdminField";
import AdminImageField from "@/components/admin/AdminImageField";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

type HomepageSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaText: string;
  bannerText: string;
  featuredProductIds: string;
};

type Product = {
  id: number;
  name: string;
};

export default function AdminHomepagePage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((state) => state.showToast);
  const [form, setForm] = useState<HomepageSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const load = async () => {
      const [settingsRes, productsRes] = await Promise.all([
        fetch("/api/homepage", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);
      const settings = await settingsRes.json().catch(() => null);
      const productRows = await productsRes.json().catch(() => []);
      setForm(settings);
      setProducts(Array.isArray(productRows) ? productRows : []);
    };

    void load();
  }, [session]);

  if (isPending || !session || !form) {
    return null;
  }

  const selectedIds = form.featuredProductIds
    .split(",")
    .map((entry) => Number(entry))
    .filter((entry) => Number.isInteger(entry) && entry > 0);

  return (
    <AdminShell
      title="Homepage Control"
      subtitle="Update hero copy, hero media, and featured products without touching code."
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const response = await fetch("/api/homepage", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...form,
              featuredProductIds: selectedIds,
            }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            showToast(data.error || "Failed to update homepage", "error");
            return;
          }
          showToast("Homepage settings updated.", "success");
        }}
        className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-xl font-semibold">Hero Content</h3>
          <div className="mt-6 space-y-5">
            <AdminField
              label="Hero Title"
              helperText="Keep this short and premium. It is the first line customers see on the homepage."
            >
              <input
                value={form.heroTitle}
                onChange={(event) => setForm({ ...form, heroTitle: event.target.value })}
                placeholder="Enter the main homepage headline"
                className={adminInputClassName}
              />
            </AdminField>

            <AdminField
              label="Hero Subtitle"
              helperText="Use two or three short lines that describe the brand feeling and product focus."
            >
              <textarea
                value={form.heroSubtitle}
                onChange={(event) => setForm({ ...form, heroSubtitle: event.target.value })}
                rows={4}
                placeholder="Write a short emotional description for the hero section"
                className={adminInputClassName}
              />
            </AdminField>

            <AdminImageField
              label="Hero Image"
              value={form.heroImage}
              onChange={(heroImage) => setForm({ ...form, heroImage })}
              uploadFolder="homepage"
              helperText="Upload a hero banner image or paste a hosted image URL. This image is used in the main storefront hero."
              placeholder="Enter hero image URL or upload a banner"
            />

            <AdminField
              label="CTA Button Text"
              helperText="Example: Shop Now. This label is shown on the main hero call-to-action button."
            >
              <input
                value={form.heroCtaText}
                onChange={(event) => setForm({ ...form, heroCtaText: event.target.value })}
                placeholder="Enter button text"
                className={adminInputClassName}
              />
            </AdminField>

            <AdminField
              label="Banner Text"
              helperText="This supporting message can be used for shipping notes, campaign messaging, or trust-building copy."
            >
              <textarea
                value={form.bannerText}
                onChange={(event) => setForm({ ...form, bannerText: event.target.value })}
                rows={3}
                placeholder="Write a short promotional or trust-focused banner message"
                className={adminInputClassName}
              />
            </AdminField>

            <button
              type="submit"
              className="rounded-full bg-[#16311a] px-5 py-3 text-sm font-semibold text-white"
            >
              Save Homepage
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-xl font-semibold">Featured Products</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
            Choose the products that should appear in curated homepage sections.
          </p>
          <div className="mt-6 grid gap-3">
            {products.map((product) => (
              <label
                key={product.id}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={(event) => {
                    const nextIds = event.target.checked
                      ? [...selectedIds, product.id]
                      : selectedIds.filter((id) => id !== product.id);
                    setForm({ ...form, featuredProductIds: nextIds.join(",") });
                  }}
                />
                {product.name}
              </label>
            ))}
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
