import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema, getSiteSettings } from "@/lib/commerce";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export async function GET() {
  try {
    return NextResponse.json(await getSiteSettings());
  } catch (error) {
    console.error("Site settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const body = await req.json();
    const [updated] = await db
      .update(siteSettings)
      .set({
        businessEmail: String(body.businessEmail ?? "").trim(),
        phone: String(body.phone ?? "").trim(),
        address: String(body.address ?? "").trim(),
        facebook: String(body.facebook ?? "").trim(),
        instagram: String(body.instagram ?? "").trim(),
        whatsappNumber: String(body.whatsappNumber ?? "").trim(),
        messengerLink: String(body.messengerLink ?? "").trim(),
        supportEmail: String(body.supportEmail ?? "").trim(),
        supportHours: String(body.supportHours ?? "").trim(),
        footerContent: String(body.footerContent ?? "").trim(),
        primaryColor: String(body.primaryColor ?? "").trim() || "#ff6a00",
        accentColor: String(body.accentColor ?? "").trim() || "#ff6a00",
        backgroundColor: String(body.backgroundColor ?? "").trim() || "#ffffff",
        buttonStyle: String(body.buttonStyle ?? "").trim() || "pill",
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, 1))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Site settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
