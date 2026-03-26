import { db, isDatabaseConfigured } from "@/lib/db";
import { products, orderItems } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema, getCategoryRecords } from "@/lib/commerce";
import { getFallbackCatalogProducts } from "@/lib/catalog-fallback";
import { parseProductFormData, parseProductJson } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isDatabaseConfigured()) {
      const product = getFallbackCatalogProducts().find((item) => item.id === parseInt(id));
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    await ensureCommerceSchema();
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)));

    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product[0]);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";
    const parsed = contentType.includes("multipart/form-data")
      ? parseProductFormData(await req.formData())
      : parseProductJson(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid product payload" },
        { status: 400 }
      );
    }

    const { name, description, price, image, stock } = parsed.data;
    const categories = await getCategoryRecords();
    const matchedCategory = categories.find((entry) => entry.slug === parsed.data.categorySlug);

    if (!matchedCategory) {
      return NextResponse.json({ error: "Selected category was not found" }, { status: 400 });
    }

    const updated = await db
      .update(products)
      .set({
        name: name.trim(),
        description: description.trim(),
        price,
        image: image.trim(),
        category: matchedCategory.name,
        categorySlug: matchedCategory.slug,
        stock,
      })
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    revalidateTag("analytics", "max");
    revalidateTag("catalog", "max");
    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    const { id } = await params;
    const productId = parseInt(id);

    // Check if product has existing orders
    const existingOrders = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.productId, productId))
      .limit(1);

    if (existingOrders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with existing orders. Consider setting stock to 0 instead." },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    revalidateTag("analytics", "max");
    revalidateTag("catalog", "max");
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
