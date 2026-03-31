"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { AdminField, adminInputClassName } from "@/components/admin/AdminField";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

type Bundle = {
  id: number;
  title: string;
  productIds: string;
  bundlePrice: number;
  isActive: boolean;
};

type Product = {
  id: number;
  name: string;
};

export default function AdminBundlesPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((state) => state.showToast);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    title: "",
    bundlePrice: 0,
    productIds: [] as number[],
    isActive: true,
  });

  const refresh = async () => {
    const [bundleRes, productRes] = await Promise.all([
      fetch("/api/bundles", { cache: "no-store" }),
      fetch("/api/products", { cache: "no-store" }),
    ]);
    setBundles(await bundleRes.json().catch(() => []));
    setProducts(await productRes.json().catch(() => []));
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      const [bundleRes, productRes] = await Promise.all([
        fetch("/api/bundles", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);
      const nextBundles = await bundleRes.json().catch(() => []);
      const nextProducts = await productRes.json().catch(() => []);

      if (!cancelled) {
        setBundles(Array.isArray(nextBundles) ? nextBundles : []);
        setProducts(Array.isArray(nextProducts) ? nextProducts : []);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (isPending || !session) {
    return null;
  }

  return (
    <AdminShell
      title="Bundles"
      subtitle="Build simple multi-product bundles and set a promotional price."
    >
      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const response = await fetch("/api/bundles", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              showToast(data.error || "Failed to create bundle", "error");
              return;
            }
            showToast("Bundle created.", "success");
            setForm({ title: "", bundlePrice: 0, productIds: [], isActive: true });
            void refresh();
          }}
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <h3 className="text-xl font-semibold">Create Bundle</h3>
          <div className="mt-6 space-y-5">
            <AdminField
              label="Bundle Title"
              helperText="Use a descriptive name customers and your team can immediately understand."
            >
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Enter bundle title (e.g. Kitchen Starter Set)"
                className={adminInputClassName}
              />
            </AdminField>

            <AdminField
              label="Bundle Price"
              helperText="This promotional price is shown when the bundle is surfaced in the storefront."
            >
              <input
                type="number"
                value={form.bundlePrice}
                onChange={(event) =>
                  setForm({ ...form, bundlePrice: Number(event.target.value) || 0 })
                }
                placeholder="Enter bundle price in BDT"
                className={adminInputClassName}
              />
            </AdminField>

            <AdminField
              label="Included Products"
              helperText="Select every product that belongs to this bundle."
            >
              <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <div className="grid gap-2">
                  {products.map((product) => (
                    <label key={product.id} className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(product.id)}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            productIds: event.target.checked
                              ? [...current.productIds, product.id]
                              : current.productIds.filter((id) => id !== product.id),
                          }))
                        }
                      />
                      {product.name}
                    </label>
                  ))}
                </div>
              </div>
            </AdminField>

            <AdminField
              label="Bundle Status"
              helperText="Inactive bundles stay saved but should not be promoted on the storefront."
            >
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                />
                Active bundle
              </label>
            </AdminField>

            <button
              type="submit"
              className="rounded-full bg-[#16311a] px-5 py-3 text-sm font-semibold text-white"
            >
              Save Bundle
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {bundles.map((bundle) => (
            <article
              key={bundle.id}
              className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <h3 className="text-xl font-semibold">{bundle.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Bundle price: Tk {bundle.bundlePrice}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {bundle.productIds.split(",").filter(Boolean).length} products attached
              </p>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
