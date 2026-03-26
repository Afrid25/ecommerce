import { db, isDatabaseConfigured } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-guards";
import { getCatalog } from "@/lib/catalog";
import { getFallbackCatalogProducts } from "@/lib/catalog-fallback";
import { ensureCommerceSchema, getCategoryRecords } from "@/lib/commerce";
import { parseProductFormData, parseProductJson } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    if (isDatabaseConfigured()) {
      await ensureCommerceSchema();
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const wantsPaginatedResponse =
      category !== undefined ||
      search !== undefined ||
      pageParam !== null ||
      pageSizeParam !== null;

    if (!wantsPaginatedResponse) {
      if (!isDatabaseConfigured()) {
        return NextResponse.json(getFallbackCatalogProducts());
      }

      const allProducts = await db.select().from(products);
      return NextResponse.json(allProducts);
    }

    const catalog = await getCatalog({
      category,
      search,
      page: pageParam ? Number.parseInt(pageParam, 10) : undefined,
      pageSize: pageSizeParam ? Number.parseInt(pageSizeParam, 10) : undefined,
    });

    return NextResponse.json(catalog);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

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

    const newProduct = await db
      .insert(products)
      .values({
        name: name.trim(),
        description: description.trim(),
        price,
        image: image.trim(),
        category: matchedCategory.name,
        categorySlug: matchedCategory.slug,
        stock,
      })
      .returning();

    revalidateTag("analytics", "max");
    revalidateTag("catalog", "max");
    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

