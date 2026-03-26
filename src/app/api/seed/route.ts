import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-guards";
import { categoryDefinitions } from "@/lib/categories";
import { ensureCommerceSchema } from "@/lib/commerce";
import { NextResponse } from "next/server";

const sampleProducts = [
  {
    name: "Bamboo Cutlery Set",
    description: "Reusable bamboo fork, spoon, knife, and straw set designed for daily eco-friendly dining.",
    price: 1200,
    image: "/images/matverse/product_bamboo_cutlery.jpg",
    category: "Bamboo Products",
    categorySlug: "bamboo-products",
    stock: 18,
  },
  {
    name: "Oak Floating Shelf",
    description: "Solid oak wall shelf with minimalist brackets to display books, ceramics, and decor.",
    price: 5400,
    image: "/images/matverse/product_oak_shelf.jpg",
    category: "Wooden Decor",
    categorySlug: "wooden-decor",
    stock: 7,
  },
  {
    name: "Woven Storage Basket",
    description: "Handwoven natural fiber basket for stylish storage in living rooms, bedrooms, and entryways.",
    price: 2300,
    image: "/images/matverse/product_woven_basket.jpg",
    category: "Handmade Crafts",
    categorySlug: "handmade-crafts",
    stock: 9,
  },
  {
    name: "Bamboo Utensil Holder",
    description: "Countertop bamboo organizer that keeps wooden spoons and kitchen tools neatly in reach.",
    price: 1450,
    image: "/images/matverse/product_utensil_holder.jpg",
    category: "Eco Lifestyle",
    categorySlug: "eco-lifestyle",
    stock: 11,
  },
  {
    name: "Organic Cotton Overshirt",
    description: "Relaxed-fit overshirt made with breathable organic cotton and soft natural dye.",
    price: 3200,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&auto=format&fit=crop&q=80",
    category: "Cloths / Fashion",
    categorySlug: "cloths-fashion",
    stock: 14,
  },
  {
    name: "Cork Travel Wallet",
    description: "Slim vegan wallet built with cork leather for cards, cash, and travel documents.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&auto=format&fit=crop&q=80",
    category: "Accessories",
    categorySlug: "accessories",
    stock: 22,
  },
  {
    name: "Solar Power Bank",
    description: "Portable backup charger with solar-assisted top-up for travel, emergencies, and daily carry.",
    price: 4200,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
    category: "Electronics",
    categorySlug: "electronics",
    stock: 5,
  },
];

export async function POST() {
  // Only allow seeding in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seeding is not allowed in production" },
      { status: 403 }
    );
  }

  try {
    const { response } = await requireAdmin();
    if (response) {
      return response;
    }

    await ensureCommerceSchema();
    const inserted = await db.insert(products).values(sampleProducts).returning();
    return NextResponse.json({
      message: `Successfully seeded ${inserted.length} products`,
      categories: categoryDefinitions.length,
      products: inserted,
    });
  } catch {
    return NextResponse.json({ error: "Failed to seed products" }, { status: 500 });
  }
}
