import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { categoryDefinitions, slugifyCategory } from "@/lib/categories";
import { ensureCommerceSchema, getCategoryRecords } from "@/lib/commerce";
import { db, isDatabaseConfigured } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.union([z.string().trim().min(1, "Slug is required"), z.literal("")]).optional(),
  image: z.string().trim().min(1, "Image is required"),
  description: z.string().trim().min(1, "Description is required"),
});

export async function GET() {
  try {
    return NextResponse.json(
      isDatabaseConfigured() ? await getCategoryRecords() : categoryDefinitions
    );
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const parsed = categorySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid category payload" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(categories)
      .values({
        name: parsed.data.name.trim(),
        slug: slugifyCategory(parsed.data.slug || parsed.data.name),
        image: parsed.data.image.trim(),
        description: parsed.data.description.trim(),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
