import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, image, category, stock } = body;

    // Input validation
    if (!name || !description || !image || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, image, category" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    if (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock)) {
      return NextResponse.json(
        { error: "Stock must be a non-negative integer" },
        { status: 400 }
      );
    }

    const newProduct = await db
      .insert(products)
      .values({
        name: name.trim(),
        description: description.trim(),
        price,
        image: image.trim(),
        category: category.trim(),
        stock,
      })
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
