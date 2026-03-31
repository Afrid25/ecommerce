"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type SupportSettings = {
  whatsappNumber: string;
  messengerLink: string;
  supportEmail: string;
  supportHours: string;
};

type Props = {
  product?: {
    name: string;
    price: number;
    url?: string;
  };
  inline?: boolean;
};

export default function SupportChat({ product, inline = false }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SupportSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const response = await fetch("/api/support/settings", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (response.ok && data) {
        setSettings(data);
      }
    };

    void loadSettings();
  }, []);

  const productMessage = useMemo(() => {
    if (!product) {
      return "Hello MATVerse! I have a question about your products.";
    }

    return `Hi MATVerse! I'm interested in ${product.name}. Price: Tk ${product.price}. URL: ${product.url ?? pathname}. Is this available?`;
  }, [pathname, product]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  if (!settings) {
    return null;
  }

  const whatsappHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(productMessage)}`;

  const content = (
    <>
      {open ? (
        <div className="mb-3 w-72 rounded-[28px] border border-[var(--border)] bg-white/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur">
          <p className="text-sm font-semibold text-[#16311a]">Need help?</p>
          <p className="mt-2 text-xs leading-6 text-[var(--text-secondary)]">
            Customer support available. Usually replies within minutes.
          </p>
          <div className="mt-4 grid gap-2">
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="rounded-2xl bg-[#16311a] px-4 py-3 text-sm font-semibold text-white">
              WhatsApp Support
            </a>
            <a href={settings.messengerLink} target="_blank" rel="noreferrer" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">
              Messenger Support
            </a>
            <a href={`mailto:${settings.supportEmail}?subject=MATVerse Support&body=${encodeURIComponent(productMessage)}`} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">
              Email Support
            </a>
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            {settings.supportHours}
          </p>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((value) => !value)}
        className="rounded-full bg-[#16311a] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(22,49,26,0.35)] transition hover:scale-[1.02]"
      >
        Need Help?
      </button>
    </>
  );

  if (inline) {
    return <div>{content}</div>;
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 lg:bottom-6">
      {content}
    </div>
  );
}
