import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { ensureCommerceSchema } from "@/lib/commerce";
import { requireAdmin } from "@/lib/auth-guards";
import { eq, sql } from "drizzle-orm";

const DEFAULT_SETTINGS: Record<string, string> = {
  business_email: "matversebd@gmail.com",
  business_phone: "+880 1XXX-XXXXXX",
  business_address: "Dhaka, Bangladesh",
  facebook_url: "",
  instagram_url: "",
  whatsapp_number: "",
  footer_text: "MATVerse — Eco-Friendly Modern Commerce",
  hero_title: "Design to Elevate Your Space",
  hero_subtitle: "Discover premium eco-friendly products crafted with care",
  hero_image: "",
  hero_cta_text: "Shop Now",
  featured_product_ids: "[]",
  banner_text: "",
};

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    await ensureCommerceSchema();
    const rows = await db.select().from(siteSettings);

    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    await ensureCommerceSchema();
    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string") continue;

      await db.execute(sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES (${key}, ${value}, now())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = now()
      `);
    }

    return NextResponse.json({ message: "Settings updated" });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
