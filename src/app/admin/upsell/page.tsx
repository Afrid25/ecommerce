"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { AdminField, adminInputClassName } from "@/components/admin/AdminField";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

type Upsell = {
  id: number;
  productId: number;
  discount: number;
  isActive: boolean;
};

type Product = {
  id: number;
  name: string;
};

export default function AdminUpsellPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((state) => state.showToast);
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ productId: 0, discount: 0, isActive: true });

  const refresh = async () => {
    const [upsellRes, productRes] = await Promise.all([
      fetch("/api/upsell", { cache: "no-store" }),
      fetch("/api/products", { cache: "no-store" }),
    ]);
    setUpsells(await upsellRes.json().catch(() => []));
    setProducts(await productRes.json().catch(() => []));
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      const [upsellRes, productRes] = await Promise.all([
        fetch("/api/upsell", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);
      const nextUpsells = await upsellRes.json().catch(() => []);
      const nextProducts = await productRes.json().catch(() => []);

      if (!cancelled) {
        setUpsells(Array.isArray(nextUpsells) ? nextUpsells : []);
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
      title="Cart Upsell"
      subtitle="Select products to surface as upsells inside the cart experience."
    >
      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const response = await fetch("/api/upsell", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              showToast(data.error || "Failed to save upsell", "error");
              return;
            }
            showToast("Upsell saved.", "success");
            setForm({ productId: 0, discount: 0, isActive: true });
            void refresh();
          }}
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <h3 className="text-xl font-semibold">Create Upsell</h3>
          <div className="mt-6 space-y-5">
            <AdminField
              label="Upsell Product"
              helperText="Choose the product you want to recommend inside the cart."
            >
              <select
                value={form.productId}
                onChange={(event) => setForm({ ...form, productId: Number(event.target.value) })}
                className={adminInputClassName}
              >
                <option value={0}>Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField
              label="Upsell Discount"
              helperText="Example: 10. This discount helps make the upsell feel more compelling in the cart."
            >
              <input
                type="number"
                value={form.discount}
                onChange={(event) => setForm({ ...form, discount: Number(event.target.value) || 0 })}
                placeholder="Enter discount percentage"
                className={adminInputClassName}
              />
            </AdminField>

            <AdminField
              label="Upsell Status"
              helperText="Inactive upsells stay saved but will not appear to customers."
            >
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                />
                Active upsell
              </label>
            </AdminField>

            <button
              type="submit"
              className="rounded-full bg-[#16311a] px-5 py-3 text-sm font-semibold text-white"
            >
              Save Upsell
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {upsells.map((upsell) => (
            <article
              key={upsell.id}
              className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <p className="text-sm font-semibold">Product #{upsell.productId}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {upsell.discount}% discount
              </p>
              <button
                onClick={async () => {
                  await fetch(`/api/upsell?id=${upsell.id}`, { method: "DELETE" });
                  showToast("Upsell removed.", "info");
                  void refresh();
                }}
                className="mt-4 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
