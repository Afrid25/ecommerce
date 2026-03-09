import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { NextResponse } from "next/server";

const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life. Crystal clear sound quality with deep bass.",
    price: 2999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    category: "Electronics",
    stock: 50,
  },
  {
    name: "Smart Watch Pro",
    description: "Feature-packed smartwatch with heart rate monitor, GPS tracking, and water resistance up to 50m.",
    price: 4599,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    category: "Electronics",
    stock: 30,
  },
  {
    name: "Premium Cotton T-Shirt",
    description: "Ultra-soft 100% organic cotton t-shirt. Available in multiple colors. Perfect for everyday wear.",
    price: 599,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    category: "Clothing",
    stock: 100,
  },
  {
    name: "Leather Crossbody Bag",
    description: "Handcrafted genuine leather crossbody bag with adjustable strap. Multiple compartments for organization.",
    price: 1899,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
    category: "Accessories",
    stock: 25,
  },
  {
    name: "Running Shoes Ultra",
    description: "Lightweight running shoes with responsive cushioning and breathable mesh upper. Perfect for daily runs.",
    price: 3499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    category: "Footwear",
    stock: 40,
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-wall insulated water bottle keeps drinks cold for 24hrs or hot for 12hrs. BPA-free, 750ml capacity.",
    price: 799,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
    category: "Lifestyle",
    stock: 80,
  },
  {
    name: "Mechanical Keyboard RGB",
    description: "Full-size mechanical keyboard with Cherry MX switches, per-key RGB lighting, and aluminum frame.",
    price: 5999,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500",
    category: "Electronics",
    stock: 20,
  },
  {
    name: "Denim Jacket Classic",
    description: "Classic fit denim jacket with button closure. Timeless style that goes with everything.",
    price: 2499,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500",
    category: "Clothing",
    stock: 35,
  },
  {
    name: "Portable Power Bank 20000mAh",
    description: "High-capacity power bank with fast charging support. Charge 3 devices simultaneously.",
    price: 1499,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
    category: "Electronics",
    stock: 60,
  },
  {
    name: "Sunglasses Aviator",
    description: "Classic aviator sunglasses with UV400 protection and polarized lenses. Lightweight metal frame.",
    price: 999,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    category: "Accessories",
    stock: 45,
  },
  {
    name: "Yoga Mat Premium",
    description: "Extra thick 6mm yoga mat with non-slip surface. Eco-friendly TPE material. Includes carrying strap.",
    price: 1299,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
    category: "Fitness",
    stock: 55,
  },
  {
    name: "Wireless Mouse Ergonomic",
    description: "Ergonomic wireless mouse with silent clicks, adjustable DPI, and USB-C rechargeable battery.",
    price: 899,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
    category: "Electronics",
    stock: 70,
  },
];

export async function POST() {
  try {
    const inserted = await db.insert(products).values(sampleProducts).returning();
    return NextResponse.json({
      message: `Successfully seeded ${inserted.length} products`,
      products: inserted,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed products" }, { status: 500 });
  }
}
