"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

export default function AdminSettingsPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((s) => s.showToast);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    business_email: "",
    business_phone: "",
    business_address: "",
    facebook_url: "",
    instagram_url: "",
    whatsapp_number: "",
    footer_text: "",
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
          business_email: data.business_email || "",
          business_phone: data.business_phone || "",
          business_address: data.business_address || "",
          facebook_url: data.facebook_url || "",
          instagram_url: data.instagram_url || "",
          whatsapp_number: data.whatsapp_number || "",
          footer_text: data.footer_text || "",
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
        showToast("Settings saved successfully", "success");
      } else {
        showToast("Failed to save settings", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  if (isPending || !session) return null;

  return (
    <AdminShell title="Settings" subtitle="Manage your business contact information and social media links.">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Email</label>
                <input
                  type="email"
                  value={settings.business_email}
                  onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  placeholder="matversebd@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.business_phone}
                  onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={settings.business_address}
                  onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  rows={2}
                  placeholder="Dhaka, Bangladesh"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="text-lg font-semibold mb-4">Social Media</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={settings.facebook_url}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  placeholder="https://facebook.com/matverse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={settings.instagram_url}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  placeholder="https://instagram.com/matverse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  placeholder="+8801XXXXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="text-lg font-semibold mb-4">Footer</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Footer Text</label>
              <textarea
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                rows={3}
                placeholder="MATVerse — Eco-Friendly Modern Commerce"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#16311a] px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      )}
    </AdminShell>
  );
}
