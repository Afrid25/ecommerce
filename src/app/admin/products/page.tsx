"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

const emptyProduct = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  stock: 0,
};

export default function AdminProductsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/admin/login");
  }, [session, isPending, router]);

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setForm(emptyProduct);
        fetchProducts();
      } else {
        alert("Failed to save product");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
      else alert("Failed to delete product");
    } catch {
      alert("Something went wrong");
    }
  };

  if (isPending || !session) return null;

  return (
    <div className="bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link href="/admin" className="text-sm font-bold opacity-60 hover:opacity-100 transition mb-3 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Product Management</h1>
          </div>
          <button
            onClick={() => {
              setForm(emptyProduct);
              setEditingId(null);
              setShowModal(true);
            }}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold text-sm tracking-wide hover:opacity-80 transition"
          >
            + Add Product
          </button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-20 w-full"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-lg opacity-60 mb-6">No products yet. Add your first product!</p>
            <button
              onClick={() => {
                setForm(emptyProduct);
                setEditingId(null);
                setShowModal(true);
              }}
              className="btn-primary bg-black text-white hover:opacity-80 dark:bg-white dark:text-black inline-block"
            >
              Create First Product
            </button>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="text-left py-4 px-6 font-bold text-xs tracking-widest uppercase opacity-60">Product</th>
                    <th className="text-left py-4 px-6 font-bold text-xs tracking-widest uppercase opacity-60">Category</th>
                    <th className="text-left py-4 px-6 font-bold text-xs tracking-widest uppercase opacity-60">Price</th>
                    <th className="text-left py-4 px-6 font-bold text-xs tracking-widest uppercase opacity-60">Stock</th>
                    <th className="text-right py-4 px-6 font-bold text-xs tracking-widest uppercase opacity-60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs opacity-60 truncate max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold tracking-widest uppercase opacity-60">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold">৳{product.price.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`font-bold ${
                            product.stock <= 10 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-4">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-sm font-bold opacity-60 hover:opacity-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-sm font-bold text-red-600 dark:text-red-400 opacity-60 hover:opacity-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-black tracking-tight mb-6">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-bold tracking-widest uppercase opacity-60 mb-3">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Product name"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold tracking-widest uppercase opacity-60 mb-3">
                      Description *
                    </label>
                    <textarea
                      required
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      placeholder="Product description"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition resize-none"
                    />
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold tracking-widest uppercase opacity-60 mb-3">
                        Price (৳) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                        placeholder="0"
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold tracking-widest uppercase opacity-60 mb-3">
                        Stock *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
                        placeholder="0"
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-bold tracking-widest uppercase opacity-60 mb-3">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold tracking-widest uppercase opacity-60 mb-3">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. Electronics, Clothing"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingId(null);
                        setForm(emptyProduct);
                      }}
                      className="flex-1 border border-gray-300 dark:border-gray-700 text-black dark:text-white py-3 font-bold tracking-wide hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 font-bold tracking-wide hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {saving ? "Saving..." : editingId ? "Update" : "Add Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
