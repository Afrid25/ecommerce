"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminShell from "@/components/AdminShell";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
};

const emptyCategory = {
  name: "",
  slug: "",
  image: "",
  description: "",
};

export default function AdminCategoriesPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((state) => state.showToast);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyCategory);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (!cancelled) {
        setCategories(Array.isArray(data) ? data : []);
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
    <AdminShell title="Category Management" subtitle="Control category naming, imagery, and descriptions so storefront discovery stays consistent.">
      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const url = editingSlug ? `/api/categories/${editingSlug}` : "/api/categories";
            const method = editingSlug ? "PUT" : "POST";
            const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              showToast(data.error || "Failed to save category", "error");
              return;
            }
            showToast(editingSlug ? "Category updated." : "Category created.", "success");
            setEditingSlug(null);
            setForm(emptyCategory);
            refresh();
          }}
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <h3 className="text-xl font-semibold">{editingSlug ? "Edit Category" : "Add Category"}</h3>
          <div className="mt-6 space-y-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3" />
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3" />
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Description" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3" />
            <div className="flex gap-3">
              <button type="button" onClick={() => { setEditingSlug(null); setForm(emptyCategory); }} className="flex-1 rounded-full border border-[var(--border)] px-4 py-3 text-sm font-semibold">Reset</button>
              <button type="submit" className="flex-1 rounded-full bg-[#16311a] px-4 py-3 text-sm font-semibold text-white">Save</button>
            </div>
          </div>
        </form>

        <div className="grid gap-4">
          {categories.map((category) => (
            <article key={category.slug} className="flex gap-4 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4">
              <Image src={category.image} alt={category.name} width={112} height={112} className="h-28 w-28 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{category.slug}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSlug(category.slug);
                      setForm(category);
                    }}
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                  >
                    Edit
                  </button>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{category.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
