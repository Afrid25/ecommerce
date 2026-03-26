"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminShell from "@/components/AdminShell";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";
import { useToastStore } from "@/store/toast";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  categorySlug: string;
  stock: number;
};

type ProductForm = Omit<Product, "id" | "category"> & { categorySlug: string };

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: 0,
  image: "",
  categorySlug: "",
  stock: 0,
};

export default function AdminProductsPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((state) => state.showToast);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const refresh = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch("/api/products", { cache: "no-store" }),
      fetch("/api/categories", { cache: "no-store" }),
    ]);
    setProducts((await productsRes.json()) || []);
    setCategories((await categoriesRes.json()) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      const nextProducts = await productsRes.json();
      const nextCategories = await categoriesRes.json();

      if (!cancelled) {
        setProducts(Array.isArray(nextProducts) ? nextProducts : []);
        setCategories(Array.isArray(nextCategories) ? nextCategories : []);
        setLoading(false);
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
      title="Product Management"
      subtitle="Create, edit, and monitor products with category-aware inventory and richer product metadata."
      actions={
        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowModal(true);
          }}
          className="rounded-full bg-[#16311a] px-5 py-3 text-sm font-semibold text-white"
        >
          Add Product
        </button>
      }
    >
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex gap-4">
                <Image src={product.image} alt={product.name} width={96} height={96} className="h-24 w-24 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{product.category}</p>
                      <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{product.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">
                      Stock: {product.stock}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(product.id);
                        setForm({
                          name: product.name,
                          description: product.description,
                          price: product.price,
                          image: product.image,
                          categorySlug: product.categorySlug,
                          stock: product.stock,
                        });
                        setShowModal(true);
                      }}
                      className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6">
            <h3 className="text-2xl font-semibold">{editingId ? "Edit Product" : "Add Product"}</h3>
            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData();
                Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
                const res = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
                  method: editingId ? "PUT" : "POST",
                  body: formData,
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  showToast(data.error || "Failed to save product", "error");
                  return;
                }
                showToast(editingId ? "Product updated." : "Product created.", "success");
                setShowModal(false);
                setEditingId(null);
                setForm(emptyForm);
                refresh();
              }}
            >
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="w-full rounded-2xl border border-[var(--border)] px-4 py-3" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description" className="w-full rounded-2xl border border-[var(--border)] px-4 py-3" />
              <div className="grid gap-4 md:grid-cols-2">
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} placeholder="Price" className="rounded-2xl border border-[var(--border)] px-4 py-3" />
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })} placeholder="Stock" className="rounded-2xl border border-[var(--border)] px-4 py-3" />
              </div>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" className="w-full rounded-2xl border border-[var(--border)] px-4 py-3" />
              <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })} className="w-full rounded-2xl border border-[var(--border)] px-4 py-3">
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-full border border-[var(--border)] px-4 py-3 text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 rounded-full bg-[#16311a] px-4 py-3 text-sm font-semibold text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
