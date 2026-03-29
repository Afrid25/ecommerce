"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

export default function AdminHomepagePage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((s) => s.showToast);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_image: "",
    hero_cta_text: "",
    banner_text: "",
    featured_product_ids: "[]",
  });

  useEffect(() => {
    if (!session) return;
    loadSettings();
  }, [session]);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          hero_title: data.hero_title || "",
          hero_subtitle: data.hero_subtitle || "",
          hero_image: data.hero_image || "",
          hero_cta_text: data.hero_cta_text || "",
          banner_text: data.banner_text || "",
          featured_product_ids: data.featured_product_ids || "[]",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast("Homepage settings saved", "success");
      } else {
        showToast("Failed to save settings", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  if (isPending || !session) return null;

  return (
    <AdminShell title="Homepage Control" subtitle="Customize your homepage hero section, banners, and featured products.">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hero Title</label>
                <input
                  type="text"
                  value={settings.hero_title}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  placeholder="Design to Elevate Your Space"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
                <input
                  type="text"
                  value={settings.hero_subtitle}
                  onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  placeholder="Discover premium eco-friendly products"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={settings.hero_image}
                  onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={settings.hero_cta_text}
                  onChange={(e) => setSettings({ ...settings, hero_cta_text: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  placeholder="Shop Now"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="text-lg font-semibold mb-4">Banner</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Banner Text</label>
              <textarea
                value={settings.banner_text}
                onChange={(e) => setSettings({ ...settings, banner_text: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                rows={3}
                placeholder="Free shipping on orders over ৳2000!"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Featured Product IDs (comma-separated)</label>
              <input
                type="text"
                value={settings.featured_product_ids}
                onChange={(e) => setSettings({ ...settings, featured_product_ids: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                placeholder="1, 2, 3"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#16311a] px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </AdminShell>
  );
}
