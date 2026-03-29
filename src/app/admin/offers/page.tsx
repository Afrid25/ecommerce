"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

type Offer = {
  id: number;
  title: string;
  description: string;
  discountPercent: number;
  productIds: string;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export default function AdminOffersPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((s) => s.showToast);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discountPercent: "10",
    active: true,
    startsAt: "",
    expiresAt: "",
  });

  useEffect(() => {
    if (!session) return;
    loadOffers();
  }, [session]);

  const loadOffers = async () => {
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      setOffers(res.ok ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", discountPercent: "10", active: true, startsAt: "", expiresAt: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      discountPercent: parseInt(form.discountPercent),
      active: form.active,
      productIds: [],
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
    };

    const url = editingId ? `/api/offers/${editingId}` : "/api/offers";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showToast(editingId ? "Offer updated" : "Offer created", "success");
      resetForm();
      loadOffers();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Failed to save offer", "error");
    }
  };

  const handleEdit = (offer: Offer) => {
    setForm({
      title: offer.title,
      description: offer.description,
      discountPercent: String(offer.discountPercent),
      active: offer.active,
      startsAt: offer.startsAt ? new Date(offer.startsAt).toISOString().slice(0, 16) : "",
      expiresAt: offer.expiresAt ? new Date(offer.expiresAt).toISOString().slice(0, 16) : "",
    });
    setEditingId(offer.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this offer?")) return;
    const res = await fetch(`/api/offers/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Offer deleted", "success");
      loadOffers();
    } else {
      showToast("Failed to delete offer", "error");
    }
  };

  const handleToggle = async (offer: Offer) => {
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !offer.active }),
    });
    if (res.ok) {
      showToast(offer.active ? "Offer deactivated" : "Offer activated", "success");
      loadOffers();
    }
  };

  if (isPending || !session) return null;

  return (
    <AdminShell
      title="Offers & Discounts"
      subtitle="Create and manage promotional offers and discounts for your products."
      actions={
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="rounded-2xl bg-[#16311a] px-6 py-3 text-sm font-semibold text-white"
        >
          + New Offer
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <h3 className="text-lg font-semibold">{editingId ? "Edit Offer" : "Create New Offer"}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount %</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
              rows={3}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date (optional)</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date (optional)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
          <div className="flex gap-3">
            <button type="submit" className="rounded-xl bg-[#16311a] px-6 py-3 text-sm font-semibold text-white">
              {editingId ? "Update Offer" : "Create Offer"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : offers.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-secondary)] py-12">No offers yet. Create your first promotional offer.</p>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <article key={offer.id} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{offer.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${offer.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {offer.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{offer.description}</p>
                  <p className="mt-2 text-2xl font-bold text-[#FF6A00]">{offer.discountPercent}% OFF</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(offer)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">
                    {offer.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleEdit(offer)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(offer.id)} className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
