"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { AdminField, adminInputClassName } from "@/components/admin/AdminField";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

type Offer = {
  id: number;
  title: string;
  discount: number;
  productIds: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
};

type Product = {
  id: number;
  name: string;
};

const emptyForm = {
  title: "",
  discount: 10,
  productIds: [] as number[],
  startDate: "",
  endDate: "",
  isActive: true,
};

function parseIdList(value: string) {
  return value
    .split(",")
    .map((entry) => Number(entry))
    .filter((entry) => Number.isInteger(entry) && entry > 0);
}

export default function AdminOffersPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((state) => state.showToast);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const refresh = async () => {
    const [offersRes, productsRes] = await Promise.all([
      fetch("/api/offers", { cache: "no-store" }),
      fetch("/api/products", { cache: "no-store" }),
    ]);
    const nextOffers = await offersRes.json().catch(() => []);
    const nextProducts = await productsRes.json().catch(() => []);
    setOffers(Array.isArray(nextOffers) ? nextOffers : []);
    setProducts(Array.isArray(nextProducts) ? nextProducts : []);
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      const [offersRes, productsRes] = await Promise.all([
        fetch("/api/offers", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);
      const nextOffers = await offersRes.json().catch(() => []);
      const nextProducts = await productsRes.json().catch(() => []);

      if (!cancelled) {
        setOffers(Array.isArray(nextOffers) ? nextOffers : []);
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
      title="Offers"
      subtitle="Create, activate, and schedule discount campaigns without editing storefront code."
    >
      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const url = editingId ? `/api/offers/${editingId}` : "/api/offers";
            const method = editingId ? "PUT" : "POST";
            const response = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              showToast(data.error || "Failed to save offer", "error");
              return;
            }
            setEditingId(null);
            setForm(emptyForm);
            showToast("Offer saved.", "success");
            void refresh();
          }}
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <h3 className="text-xl font-semibold">{editingId ? "Edit Offer" : "Create Offer"}</h3>
          <div className="mt-6 space-y-5">
            <AdminField
              label="Offer Title"
              helperText="Give this campaign a name that your team can quickly recognize in the admin panel."
            >
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Enter offer title (e.g. Eid Kitchen Sale)"
                className={adminInputClassName}
              />
            </AdminField>

            <AdminField
              label="Discount Percentage"
              helperText="Example: 15. This percentage is applied to all products attached to the offer."
            >
              <input
                type="number"
                min={1}
                max={90}
                value={form.discount}
                onChange={(event) => setForm({ ...form, discount: Number(event.target.value) || 0 })}
                placeholder="Enter discount percentage"
                className={adminInputClassName}
              />
            </AdminField>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField
                label="Start Date"
                helperText="Optional. Leave blank if the offer should start immediately."
              >
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                  className={adminInputClassName}
                />
              </AdminField>
              <AdminField
                label="End Date"
                helperText="Optional. Set an end date if the campaign should stop automatically."
              >
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                  className={adminInputClassName}
                />
              </AdminField>
            </div>

            <AdminField
              label="Offer Status"
              helperText="Inactive offers are saved but will not affect storefront pricing."
            >
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                />
                Active offer
              </label>
            </AdminField>

            <AdminField
              label="Attach Products"
              helperText="Choose every product that should be affected by this campaign."
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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="flex-1 rounded-full border border-[var(--border)] px-4 py-3 text-sm font-semibold"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-[#16311a] px-4 py-3 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    {offer.isActive ? "Active" : "Inactive"}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{offer.title}</h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">
                  {offer.discount}% off
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Products: {parseIdList(offer.productIds).length} attached
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setEditingId(offer.id);
                    setForm({
                      title: offer.title,
                      discount: offer.discount,
                      productIds: parseIdList(offer.productIds),
                      startDate: offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 10) : "",
                      endDate: offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 10) : "",
                      isActive: offer.isActive,
                    });
                  }}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    await fetch(`/api/offers/${offer.id}`, { method: "DELETE" });
                    showToast("Offer deleted.", "info");
                    void refresh();
                  }}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
