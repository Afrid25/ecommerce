"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { useToastStore } from "@/store/toast";

type ProductOption = {
  id: number;
  name: string;
  stock: number;
  price: number;
};

type ManualOrderLine = {
  productId: number;
  quantity: number;
};

export default function ManualOrderForm() {
  const showToast = useToastStore((state) => state.showToast);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "Offline / showroom sale",
    paymentMethod: "cash",
    notes: "",
  });
  const [lines, setLines] = useState<ManualOrderLine[]>([{ productId: 0, quantity: 1 }]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const detailedLines = lines
    .map((line) => ({
      ...line,
      product: products.find((product) => product.id === line.productId),
    }))
    .filter((line) => line.product);

  const total = detailedLines.reduce(
    (sum, line) => sum + Number(line.product?.price || 0) * line.quantity,
    0
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "manual",
          items: lines.filter((line) => line.productId > 0),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Failed to create manual order", "error");
        return;
      }

      showToast("Manual order saved.", "success");
      setForm({
        customerName: "",
        phone: "",
        address: "Offline / showroom sale",
        paymentMethod: "cash",
        notes: "",
      });
      setLines([{ productId: 0, quantity: 1 }]);
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Manual Order Entry</h3>
          <p className="text-sm text-[var(--text-secondary)]">Track cash and offline sales in the same analytics pipeline.</p>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold">{formatCurrency(total)}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          required
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          placeholder="Customer name"
          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
        />
        <input
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone number"
          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
        />
        <select
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
        >
          <option value="cash">Cash</option>
          <option value="offline">Offline</option>
        </select>
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Sale source / address"
          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
        />
      </div>

      <textarea
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        placeholder="Notes"
        rows={3}
        className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
      />

      <div className="mt-6 space-y-3">
        {lines.map((line, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_80px]">
            <select
              value={line.productId}
              onChange={(e) =>
                setLines((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, productId: Number(e.target.value) } : item
                  )
                )
              }
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
            >
              <option value={0}>{loadingProducts ? "Loading products..." : "Select product"}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.stock} in stock)
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(e) =>
                setLines((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, quantity: Number(e.target.value) || 1 } : item
                  )
                )
              }
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
            />
            <button
              type="button"
              onClick={() => setLines((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setLines((current) => [...current, { productId: 0, quantity: 1 }])}
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
        >
          Add product
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#16311a] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save manual order"}
        </button>
      </div>
    </form>
  );
}
