"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminShell from "@/components/AdminShell";
import { AdminField, adminInputClassName } from "@/components/admin/AdminField";
import AdminImageField from "@/components/admin/AdminImageField";
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

function slugifyDraft(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
    <AdminShell
      title="Category Management"
      subtitle="Control category naming, imagery, and descriptions so storefront discovery stays consistent."
    >
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
            void refresh();
          }}
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <h3 className="text-xl font-semibold">{editingSlug ? "Edit Category" : "Add Category"}</h3>
          <div className="mt-6 space-y-5">
            <AdminField
              label="Category Title"
              helperText="This name appears in navigation, filters, and category landing pages."
            >
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug:
                      !editingSlug &&
                      (!current.slug.trim() || current.slug === slugifyDraft(current.name))
                        ? slugifyDraft(event.target.value)
                        : current.slug,
                  }))
                }
                placeholder="Enter category name (e.g. Bamboo Products)"
                className={adminInputClassName}
              />
            </AdminField>

            <AdminField
              label="Category Slug"
              helperText="Leave this as-is to auto-generate from the name, or edit it if you need a custom URL."
            >
              <input
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: slugifyDraft(event.target.value) })}
                placeholder="example-category-slug"
                className={adminInputClassName}
              />
            </AdminField>

            <AdminImageField
              label="Category Image"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
              uploadFolder="categories"
              helperText="Upload a category cover image or paste an existing image URL. This visual is used on category cards and landing pages."
              placeholder="Enter category image URL or upload from device"
            />

            <AdminField
              label="Category Description"
              helperText="Summarize what customers should expect to find in this category."
            >
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={4}
                placeholder="Describe the products and mood of this category."
                className={adminInputClassName}
              />
            </AdminField>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingSlug(null);
                  setForm(emptyCategory);
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

        <div className="grid gap-4">
          {categories.map((category) => (
            <article
              key={category.slug}
              className="flex gap-4 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <Image
                src={category.image}
                alt={category.name}
                width={112}
                height={112}
                className="h-28 w-28 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {category.slug}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditingSlug(category.slug);
                        setForm(category);
                      }}
                      className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        const response = await fetch(`/api/categories/${category.slug}`, {
                          method: "DELETE",
                        });
                        const data = await response.json().catch(() => ({}));
                        if (!response.ok) {
                          showToast(data.error || "Failed to delete category", "error");
                          return;
                        }
                        showToast("Category deleted.", "info");
                        void refresh();
                      }}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {category.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
