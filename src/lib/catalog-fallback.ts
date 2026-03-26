import type { CatalogProduct } from "@/lib/catalog";
import { categoryDefinitions } from "@/lib/categories";

type FallbackProduct = Omit<CatalogProduct, "id" | "createdAt"> & {
  id: number;
  createdAt: Date;
};

const fallbackProducts: FallbackProduct[] = [
  {
    id: 1,
    name: "Bamboo Cutlery Set",
    description:
      "Reusable bamboo fork, spoon, knife, and straw set designed for daily eco-friendly dining.",
    price: 1200,
    image: "/images/matverse/product_bamboo_cutlery.jpg",
    category: "Bamboo Products",
    categorySlug: "bamboo-products",
    stock: 18,
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
  },
  {
    id: 2,
    name: "Oak Floating Shelf",
    description:
      "Solid oak wall shelf with minimalist brackets to display books, ceramics, and decor.",
    price: 5400,
    image: "/images/matverse/product_oak_shelf.jpg",
    category: "Wooden Decor",
    categorySlug: "wooden-decor",
    stock: 7,
    createdAt: new Date("2026-03-02T00:00:00.000Z"),
  },
  {
    id: 3,
    name: "Woven Storage Basket",
    description:
      "Handwoven natural fiber basket for stylish storage in living rooms, bedrooms, and entryways.",
    price: 2300,
    image: "/images/matverse/product_woven_basket.jpg",
    category: "Handmade Crafts",
    categorySlug: "handmade-crafts",
    stock: 9,
    createdAt: new Date("2026-03-03T00:00:00.000Z"),
  },
  {
    id: 4,
    name: "Bamboo Utensil Holder",
    description:
      "Countertop bamboo organizer that keeps wooden spoons and kitchen tools neatly in reach.",
    price: 1450,
    image: "/images/matverse/product_utensil_holder.jpg",
    category: "Eco Lifestyle",
    categorySlug: "eco-lifestyle",
    stock: 11,
    createdAt: new Date("2026-03-04T00:00:00.000Z"),
  },
  {
    id: 5,
    name: "Organic Cotton Overshirt",
    description:
      "Relaxed-fit overshirt made with breathable organic cotton and soft natural dye.",
    price: 3200,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&auto=format&fit=crop&q=80",
    category: "Cloths / Fashion",
    categorySlug: "cloths-fashion",
    stock: 14,
    createdAt: new Date("2026-03-05T00:00:00.000Z"),
  },
  {
    id: 6,
    name: "Cork Travel Wallet",
    description:
      "Slim vegan wallet built with cork leather for cards, cash, and travel documents.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&auto=format&fit=crop&q=80",
    category: "Accessories",
    categorySlug: "accessories",
    stock: 22,
    createdAt: new Date("2026-03-06T00:00:00.000Z"),
  },
  {
    id: 7,
    name: "Solar Power Bank",
    description:
      "Portable backup charger with solar-assisted top-up for travel, emergencies, and daily carry.",
    price: 4200,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
    category: "Electronics",
    categorySlug: "electronics",
    stock: 5,
    createdAt: new Date("2026-03-07T00:00:00.000Z"),
  },
  {
    id: 8,
    name: "Hand-Carved Serving Board",
    description:
      "Mango-wood serving board carved and finished by artisans for elevated hosting moments.",
    price: 2600,
    image: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=1200&auto=format&fit=crop&q=80",
    category: "Handmade Crafts",
    categorySlug: "handmade-crafts",
    stock: 6,
    createdAt: new Date("2026-03-08T00:00:00.000Z"),
  },
  {
    id: 9,
    name: "Bamboo Desk Organizer",
    description: "A clean-lined organizer tray for pens, notes, chargers, and small desktop essentials.",
    price: 1900,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
    category: "Bamboo Products",
    categorySlug: "bamboo-products",
    stock: 13,
    createdAt: new Date("2026-03-09T00:00:00.000Z"),
  },
  {
    id: 10,
    name: "Walnut Accent Mirror",
    description: "Rounded mirror framed in walnut wood to warm up compact corners and hallways.",
    price: 6400,
    image: "https://images.unsplash.com/photo-1616628182509-6f0af44d0da0?w=1200&auto=format&fit=crop&q=80",
    category: "Wooden Decor",
    categorySlug: "wooden-decor",
    stock: 4,
    createdAt: new Date("2026-03-10T00:00:00.000Z"),
  },
  {
    id: 11,
    name: "Refillable Glass Cleaner Kit",
    description: "Reusable spray bottle with plant-based cleaning tablets for a lower-waste routine.",
    price: 950,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80",
    category: "Eco Lifestyle",
    categorySlug: "eco-lifestyle",
    stock: 25,
    createdAt: new Date("2026-03-11T00:00:00.000Z"),
  },
  {
    id: 12,
    name: "Linen Everyday Tote",
    description:
      "Soft structured tote crafted from linen blend fabric for markets, errands, and gifting.",
    price: 1450,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80",
    category: "Cloths / Fashion",
    categorySlug: "cloths-fashion",
    stock: 16,
    createdAt: new Date("2026-03-12T00:00:00.000Z"),
  },
];

export function getFallbackCatalogProducts() {
  return fallbackProducts;
}

export function getFallbackCategoryRecords() {
  return categoryDefinitions;
}
