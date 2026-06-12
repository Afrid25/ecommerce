import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema, getOfferList, stringifyIdList } from "@/lib/commerce";
import { db } from "@/lib/db";
import { offers } from "@/lib/db/schema";

export async function GET() {
  try {
    return NextResponse.json(await getOfferList());
  } catch (error) {
    console.error("Offers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const body = await req.json();
    const [created] = await db
      .insert(offers)
      .values({
        title: String(body.title ?? "").trim(),
        discount: Number(body.discount ?? 0),
        discountType: body.discountType === "fixed" ? "fixed" : "percentage",
        productIds: stringifyIdList(
          Array.isArray(body.productIds) ? body.productIds.map((value: unknown) => Number(value)) : []
        ),
        image: String(body.image ?? "").trim(),
        priority: Number(body.priority ?? 0),
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: Boolean(body.isActive),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Offer create error:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
