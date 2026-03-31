"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { AdminField, adminInputClassName } from "@/components/admin/AdminField";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

type SettingsForm = {
  businessEmail: string;
  phone: string;
  address: string;
  facebook: string;
  instagram: string;
  whatsappNumber: string;
  messengerLink: string;
  supportEmail: string;
  supportHours: string;
  footerContent: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  buttonStyle: string;
};

const fieldMeta: Array<{
  key: keyof Omit<
    SettingsForm,
    "footerContent" | "primaryColor" | "accentColor" | "backgroundColor" | "buttonStyle"
  >;
  label: string;
  placeholder: string;
  helperText: string;
}> = [
  {
    key: "businessEmail",
    label: "Business Email",
    placeholder: "Enter your primary business email",
    helperText: "This address is used for storefront contact details and operational references.",
  },
  {
    key: "phone",
    label: "Phone Number",
    placeholder: "Enter your customer support phone number",
    helperText: "Shown to customers who need direct phone support.",
  },
  {
    key: "address",
    label: "Business Address",
    placeholder: "Enter your business address",
    helperText: "Useful for customer trust, logistics, and footer contact details.",
  },
  {
    key: "facebook",
    label: "Facebook URL",
    placeholder: "https://facebook.com/your-page",
    helperText: "Paste the full Facebook page link customers should visit.",
  },
  {
    key: "instagram",
    label: "Instagram URL",
    placeholder: "https://instagram.com/your-handle",
    helperText: "Paste the full Instagram profile link used for brand discovery.",
  },
  {
    key: "whatsappNumber",
    label: "WhatsApp Number",
    placeholder: "8801XXXXXXXXX",
    helperText: "Used by the floating support chat and product inquiry flows.",
  },
  {
    key: "messengerLink",
    label: "Messenger Link",
    placeholder: "https://m.me/your-page",
    helperText: "Used when customers open support from the storefront chat widget.",
  },
  {
    key: "supportEmail",
    label: "Support Email",
    placeholder: "support@yourstore.com",
    helperText: "This email appears inside customer support and order help surfaces.",
  },
  {
    key: "supportHours",
    label: "Support Hours",
    placeholder: "10:00 AM - 10:00 PM, every day",
    helperText: "Tell customers when they can expect the fastest reply.",
  },
];

export default function AdminSettingsPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((state) => state.showToast);
  const [form, setForm] = useState<SettingsForm | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    const load = async () => {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      setForm(data);
    };

    void load();
  }, [session]);

  if (isPending || !session || !form) {
    return null;
  }

  return (
    <AdminShell
      title="Settings"
      subtitle="Manage contact details, support channels, footer copy, and theme tokens from one place."
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const response = await fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            showToast(data.error || "Failed to update settings", "error");
            return;
          }
          showToast("Settings updated.", "success");
        }}
        className="space-y-8"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {fieldMeta.map((field) => (
            <div
              key={field.key}
              className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <AdminField
                label={field.label}
                helperText={field.helperText}
              >
                <input
                  value={form[field.key]}
                  onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                  placeholder={field.placeholder}
                  className={adminInputClassName}
                />
              </AdminField>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
          <AdminField
            label="Footer Content"
            helperText="This short paragraph appears in the storefront footer and helps reinforce your brand voice."
          >
            <textarea
              value={form.footerContent}
              onChange={(event) => setForm({ ...form, footerContent: event.target.value })}
              rows={4}
              placeholder="Write a short footer description about MATVerse"
              className={adminInputClassName}
            />
          </AdminField>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-[#16311a]">Theme</h3>
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              Adjust site-wide theme variables without changing code. These values update the main CSS tokens used across the storefront and admin UI.
            </p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                key: "primaryColor" as const,
                label: "Primary Color",
                helperText: "Used for key highlights and major call-to-action emphasis.",
              },
              {
                key: "accentColor" as const,
                label: "Accent Color",
                helperText: "Used for supporting accents and secondary brand highlights.",
              },
              {
                key: "backgroundColor" as const,
                label: "Background Color",
                helperText: "Sets the base site background token while preserving the existing layout.",
              },
            ].map((field) => (
              <AdminField key={field.key} label={field.label} helperText={field.helperText}>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form[field.key]}
                    onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                    className="h-12 w-14 cursor-pointer rounded-2xl border border-[var(--border)] bg-white p-1"
                  />
                  <input
                    value={form[field.key]}
                    onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                    placeholder="#ffffff"
                    className={adminInputClassName}
                  />
                </div>
              </AdminField>
            ))}

            <AdminField
              label="Button Style"
              helperText="Choose how rounded buttons should feel across the interface."
            >
              <select
                value={form.buttonStyle}
                onChange={(event) => setForm({ ...form, buttonStyle: event.target.value })}
                className={adminInputClassName}
              >
                <option value="pill">Pill</option>
                <option value="soft">Soft Rounded</option>
                <option value="rounded">Rounded</option>
              </select>
            </AdminField>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-full bg-[#16311a] px-5 py-3 text-sm font-semibold text-white"
        >
          Save Settings
        </button>
      </form>
    </AdminShell>
  );
}
