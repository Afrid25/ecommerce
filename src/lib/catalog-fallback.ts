import type { CatalogProduct } from "@/lib/catalog";
import { categoryDefinitions } from "@/lib/categories";
import { seededProducts } from "@/lib/matverse-data";

type FallbackProduct = Omit<CatalogProduct, "id" | "createdAt"> & {
  id: number;
  createdAt: Date;
};

const fallbackProducts: FallbackProduct[] = seededProducts.map((product, index) => ({
  id: index + 1,
  name: product.name,
  description: product.description,
  price: product.price,
  compareAtPrice: product.compareAtPrice ?? null,
  costPrice: product.costPrice,
  image: product.image,
  category: product.category,
  categorySlug: product.categorySlug,
  stock: product.stock,
  isFeatured: product.isFeatured ?? false,
  isTrending: product.isTrending ?? false,
  isHot: product.isHot ?? false,
  isLimited: product.isLimited ?? false,
  createdAt: new Date(`2026-03-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
}));

export function getFallbackCatalogProducts() {
  return fallbackProducts;
}

export function getFallbackCategoryRecords() {
  return categoryDefinitions;
}
