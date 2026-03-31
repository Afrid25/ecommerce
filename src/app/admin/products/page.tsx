"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminShell from "@/components/AdminShell";
import { AdminField, adminInputClassName } from "@/components/admin/AdminField";
import AdminImageField from "@/components/admin/AdminImageField";
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
  compareAtPrice?: number | null;
  costPrice: number;
  image: string;
  category: string;
  categorySlug: string;
  stock: number;
  isFeatured: boolean;
  isTrending: boolean;
  isHot: boolean;
  isLimited: boolean;
};

type ProductForm = Omit<Product, "id" | "category"> & { categorySlug: string };

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: 0,
  compareAtPrice: null,
  costPrice: 0,
  image: "",
  categorySlug: "",
  stock: 0,
  isFeatured: false,
  isTrending: false,
  isHot: false,
  isLimited: false,
};

const merchandisingFlags: Array<{
  key: keyof Pick<ProductForm, "isFeatured" | "isTrending" | "isHot" | "isLimited">;
  label: string;
  helperText: string;
}> = [
  {
    key: "isFeatured",
    label: "Featured",
    helperText: "Highlights this product in featured storefront collections.",
  },
  {
    key: "isTrending",
    label: "Trending",
    helperText: "Marks the product as currently popular across the store.",
  },
  {
    key: "isHot",
    label: "Hot Item",
    helperText: "Adds a stronger urgency badge for standout demand.",
  },
  {
    key: "isLimited",
    label: "Limited",
    helperText: "Signals limited availability to the storefront.",
  },
];

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
      subtitle="Create, edit, and monitor products with category-aware inventory, device uploads, and clearer merchandising controls."
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
            <article
              key={product.id}
              className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex gap-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                        {product.category}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {product.description}
                  </p>
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
                          compareAtPrice: product.compareAtPrice ?? null,
                          costPrice: product.costPrice,
                          image: product.image,
                          categorySlug: product.categorySlug,
                          stock: product.stock,
                          isFeatured: product.isFeatured,
                          isTrending: product.isTrending,
                          isHot: product.isHot,
                          isLimited: product.isLimited,
                        });
                        setShowModal(true);
                      }}
                      className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
                        const data = await response.json().catch(() => ({}));
                        if (!response.ok) {
                          showToast(data.error || "Failed to delete product", "error");
                          return;
                        }
                        showToast("Product deleted.", "info");
                        void refresh();
                      }}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                    >
                      Delete
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
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6">
            <h3 className="text-2xl font-semibold">
              {editingId ? "Edit Product" : "Add Product"}
            </h3>
            <form
              className="mt-6 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData();

                Object.entries(form).forEach(([key, value]) => {
                  const normalizedValue = value === null ? "" : String(value);
                  formData.append(key, normalizedValue);
                });

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
                void refresh();
              }}
            >
              <AdminField
                label="Product Title"
                helperText="This name appears in the product grid, product page, and cart."
              >
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Enter product name (e.g. Bamboo Chair)"
                  className={adminInputClassName}
                />
              </AdminField>

              <AdminField
                label="Product Description"
                helperText="Write a short customer-facing description explaining the product materials and use case."
              >
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  rows={4}
                  placeholder="Describe the product, materials, and why customers should buy it."
                  className={adminInputClassName}
                />
              </AdminField>

              <div className="grid gap-4 md:grid-cols-3">
                <AdminField
                  label="Product Price"
                  helperText="Example: 1200. This is the live selling price shown in the storefront."
                >
                  <input
                    type="number"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: Number(event.target.value) || 0 })
                    }
                    placeholder="Enter price in BDT"
                    className={adminInputClassName}
                  />
                </AdminField>
                <AdminField
                  label="Compare-at Price"
                  helperText="Optional. Use this when you want the storefront to show a discount from a higher original price."
                >
                  <input
                    type="number"
                    value={form.compareAtPrice ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        compareAtPrice: event.target.value ? Number(event.target.value) : null,
                      })
                    }
                    placeholder="Optional original price"
                    className={adminInputClassName}
                  />
                </AdminField>
                <AdminField
                  label="Cost Price"
                  helperText="Internal value for profit tracking. Customers do not see this price."
                >
                  <input
                    type="number"
                    value={form.costPrice}
                    onChange={(event) =>
                      setForm({ ...form, costPrice: Number(event.target.value) || 0 })
                    }
                    placeholder="Internal cost in BDT"
                    className={adminInputClassName}
                  />
                </AdminField>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Stock Quantity"
                  helperText="Set how many units are available right now. This drives low-stock warnings and checkout availability."
                >
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(event) =>
                      setForm({ ...form, stock: Number(event.target.value) || 0 })
                    }
                    placeholder="Available units"
                    className={adminInputClassName}
                  />
                </AdminField>

                <AdminField
                  label="Category"
                  helperText="Choose the storefront category this product should appear under."
                >
                  <select
                    value={form.categorySlug}
                    onChange={(event) => setForm({ ...form, categorySlug: event.target.value })}
                    className={adminInputClassName}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </div>

              <AdminImageField
                label="Product Image"
                value={form.image}
                onChange={(image) => setForm({ ...form, image })}
                uploadFolder="products"
                helperText="Paste a hosted image URL or upload a product image from your device. The saved image will be used in the storefront and admin preview."
                placeholder="Enter image URL or upload a product photo"
              />

              <AdminField
                label="Merchandising Flags"
                helperText="Use these controls to decide how this product is surfaced in promotional sections and badges."
              >
                <div className="grid gap-3 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 md:grid-cols-2">
                  {merchandisingFlags.map((flag) => (
                    <label
                      key={flag.key}
                      className="flex items-start gap-3 rounded-[1rem] border border-[var(--border)] px-4 py-3"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(form[flag.key])}
                        onChange={(event) =>
                          setForm({ ...form, [flag.key]: event.target.checked })
                        }
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[#16311a]">
                          {flag.label}
                        </span>
                        <span className="mt-1 block text-xs leading-6 text-[var(--text-secondary)]">
                          {flag.helperText}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </AdminField>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-full border border-[var(--border)] px-4 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-[#16311a] px-4 py-3 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
