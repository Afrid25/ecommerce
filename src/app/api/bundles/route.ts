import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema, getBundleList, stringifyIdList } from "@/lib/commerce";
import { db } from "@/lib/db";
import { bundles } from "@/lib/db/schema";

export async function GET() {
  try {
    return NextResponse.json(await getBundleList());
  } catch (error) {
    console.error("Bundles fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 });
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
      .insert(bundles)
      .values({
        title: String(body.title ?? "").trim(),
        productIds: stringifyIdList(
          Array.isArray(body.productIds) ? body.productIds.map((value: unknown) => Number(value)) : []
        ),
        bundlePrice: Number(body.bundlePrice ?? 0),
        isActive: Boolean(body.isActive),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Bundle create error:", error);
    return NextResponse.json({ error: "Failed to create bundle" }, { status: 500 });
  }
}
