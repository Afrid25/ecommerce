import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { slugifyCategory } from "@/lib/categories";
import { ensureCommerceSchema } from "@/lib/commerce";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().min(1, "Slug is required").optional(),
  image: z.string().trim().min(1, "Image is required"),
  description: z.string().trim().min(1, "Description is required"),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const { slug } = await params;
    const parsed = categorySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid category payload" },
        { status: 400 }
      );
    }

    const nextSlug = slugifyCategory(parsed.data.slug || parsed.data.name);
    const [updated] = await db
      .update(categories)
      .set({
        name: parsed.data.name.trim(),
        slug: nextSlug,
        image: parsed.data.image.trim(),
        description: parsed.data.description.trim(),
      })
      .where(eq(categories.slug, slug))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await db
      .update(products)
      .set({
        category: updated.name,
        categorySlug: updated.slug,
      })
      .where(eq(products.categorySlug, slug));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Category update error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const { slug } = await params;
    const linkedProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categorySlug, slug))
      .limit(1);

    if (linkedProducts.length > 0) {
      return NextResponse.json(
        { error: "Move products out of this category before deleting it." },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(categories)
      .where(eq(categories.slug, slug))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Category delete error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
