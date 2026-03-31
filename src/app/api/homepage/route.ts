import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema, getHomepageSettings, stringifyIdList } from "@/lib/commerce";
import { db } from "@/lib/db";
import { homepageSettings } from "@/lib/db/schema";

export async function GET() {
  try {
    return NextResponse.json(await getHomepageSettings());
  } catch (error) {
    console.error("Homepage settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch homepage settings" }, { status: 500 });
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
      .update(homepageSettings)
      .set({
        heroTitle: String(body.heroTitle ?? "").trim(),
        heroSubtitle: String(body.heroSubtitle ?? "").trim(),
        heroImage: String(body.heroImage ?? "").trim(),
        heroCtaText: String(body.heroCtaText ?? "").trim(),
        bannerText: String(body.bannerText ?? "").trim(),
        featuredProductIds: stringifyIdList(
          Array.isArray(body.featuredProductIds)
            ? body.featuredProductIds.map((value: unknown) => Number(value))
            : []
        ),
        updatedAt: new Date(),
      })
      .where(eq(homepageSettings.id, 1))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Homepage settings update error:", error);
    return NextResponse.json({ error: "Failed to update homepage settings" }, { status: 500 });
  }
}
