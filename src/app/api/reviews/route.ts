import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import { ensureCommerceSchema } from "@/lib/commerce";
import { db } from "@/lib/db";
import { products, reviews } from "@/lib/db/schema";
import { reviewSchema } from "@/lib/validators";

function parseReviewImages(
  imagesValue: string | null | undefined,
  legacyImage?: string | null
) {
  const parsedImages = (() => {
    if (!imagesValue) {
      return [];
    }

    try {
      const value = JSON.parse(imagesValue);
      return Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  })();

  if (legacyImage && !parsedImages.includes(legacyImage)) {
    parsedImages.unshift(legacyImage);
  }

  return parsedImages;
}

function serializeReview(row: typeof reviews.$inferSelect) {
  return {
    ...row,
    images: parseReviewImages(row.images, row.image),
  };
}

export async function GET(req: NextRequest) {
  try {
    await ensureCommerceSchema();
    const productId = Number(req.nextUrl.searchParams.get("productId"));
    const status = req.nextUrl.searchParams.get("status");
    const adminMode = req.nextUrl.searchParams.get("admin") === "1";

    if (adminMode) {
      const { response } = await requireAdmin();
      if (response) {
        return response;
      }
    }

    const rows = await db
      .select()
      .from(reviews)
      .where(
        and(
          Number.isInteger(productId) && productId > 0 ? eq(reviews.productId, productId) : undefined,
          adminMode ? (status ? eq(reviews.status, status) : undefined) : eq(reviews.status, "approved")
        )
      )
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json(rows.map(serializeReview));
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureCommerceSchema();
    const body = await req.json();
    const parsed = reviewSchema.safeParse({
      productId: Number(body.productId),
      userName: String(body.userName ?? ""),
      rating: Number(body.rating ?? 0),
      comment: String(body.comment ?? ""),
      images: Array.isArray(body.images)
        ? body.images.map((image: unknown) => String(image))
        : [],
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid review payload" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const [matchedProduct] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, parsed.data.productId))
      .limit(1);

    if (!matchedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const reviewTitle = parsed.data.comment.slice(0, 60).trim() || `${parsed.data.rating} star review`;

    const [created] = await db
      .insert(reviews)
      .values({
        productId: parsed.data.productId,
        userId: session?.user?.id ?? null,
        userName:
          session?.user?.name ||
          parsed.data.userName.trim() ||
          "Guest Customer",
        rating: parsed.data.rating,
        title: reviewTitle,
        comment: parsed.data.comment.trim(),
        image: parsed.data.images[0] ?? null,
        images: JSON.stringify(parsed.data.images),
        status: "pending",
      })
      .returning();

    return NextResponse.json(serializeReview(created), { status: 201 });
  } catch (error) {
    console.error("Review create error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
