import { and, desc, eq, ilike } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getFallbackCatalogProducts, getFallbackCategoryRecords } from "@/lib/catalog-fallback";
import { getCategoryBySlug, resolveCategorySlug } from "@/lib/categories";
import { ensureCommerceSchema, getCategoryRecords } from "@/lib/commerce";
import { db, isDatabaseConfigured } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { getMaterialForProduct } from "@/lib/product-content";

export type CatalogQuery = {
  category?: string;
  search?: string;
  material?: string;
  sort?: "popular" | "newest" | "price-asc" | "price-desc";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
};

export type CatalogProduct = typeof products.$inferSelect;
export type CatalogCategory = Awaited<ReturnType<typeof getCategoryRecords>>[number];

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 24;

function normalizePage(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return DEFAULT_PAGE;
  }

  return Math.floor(value);
}

function normalizePageSize(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.floor(value), MAX_PAGE_SIZE);
}

function normalizeSort(sort?: string): CatalogQuery["sort"] {
  if (sort === "newest" || sort === "price-asc" || sort === "price-desc") {
    return sort;
  }

  return "popular";
}

function applyRichFilters(items: CatalogProduct[], query: CatalogQuery) {
  const normalizedSearch = query.search?.trim().toLowerCase();
  const normalizedCategory =
    query.category && query.category !== "All" ? resolveCategorySlug(query.category.trim()) : undefined;
  const normalizedMaterial = query.material?.trim();
  const normalizedSort = normalizeSort(query.sort);

  const filtered = items.filter((product) => {
    const matchesCategory = normalizedCategory ? product.categorySlug === normalizedCategory : true;
    const matchesSearch = normalizedSearch
      ? `${product.name} ${product.description}`.toLowerCase().includes(normalizedSearch)
      : true;
    const matchesMaterial = normalizedMaterial
      ? getMaterialForProduct(product) === normalizedMaterial
      : true;
    const matchesMinPrice =
      typeof query.minPrice === "number" && !Number.isNaN(query.minPrice)
        ? product.price >= query.minPrice
        : true;
    const matchesMaxPrice =
      typeof query.maxPrice === "number" && !Number.isNaN(query.maxPrice)
        ? product.price <= query.maxPrice
        : true;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesMaterial &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  filtered.sort((left, right) => {
    if (normalizedSort === "newest") {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    if (normalizedSort === "price-asc") {
      return left.price - right.price;
    }

    if (normalizedSort === "price-desc") {
      return right.price - left.price;
    }

    return right.stock - left.stock;
  });

  return filtered;
}

const getCachedDbCategories = unstable_cache(async () => getCategoryRecords(), ["catalog-categories"], {
  revalidate: 300,
  tags: ["catalog"],
});

export async function getCatalog(query: CatalogQuery = {}) {
  const currentPage = normalizePage(query.page);
  const currentPageSize = normalizePageSize(query.pageSize);

  let catalogSource = getFallbackCatalogProducts();

  if (isDatabaseConfigured()) {
    try {
      await ensureCommerceSchema();
      catalogSource = await db
        .select()
        .from(products)
        .where(
          and(
            query.category && query.category !== "All"
              ? eq(products.categorySlug, resolveCategorySlug(query.category.trim()))
              : undefined,
            query.search ? ilike(products.name, `%${query.search.trim()}%`) : undefined
          )
        )
        .orderBy(desc(products.createdAt));
    } catch (error) {
      console.warn("Falling back to local catalog data:", error);
    }
  }

  const filteredItems = applyRichFilters(catalogSource, query);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * currentPageSize,
    currentPage * currentPageSize
  );
  const categories = isDatabaseConfigured()
    ? await getCachedDbCategories()
    : getFallbackCategoryRecords();
  const materials = Array.from(
    new Set(catalogSource.map((product) => getMaterialForProduct(product)))
  ).sort((left, right) => left.localeCompare(right));

  return {
    items: paginatedItems,
    categories,
    materials,
    pagination: {
      page: currentPage,
      pageSize: currentPageSize,
      totalItems: filteredItems.length,
      totalPages: Math.max(1, Math.ceil(filteredItems.length / currentPageSize)),
    },
  };
}

export async function getProductById(id: number) {
  if (!isDatabaseConfigured()) {
    return getFallbackCatalogProducts().find((product) => product.id === id) ?? null;
  }

  try {
    await ensureCommerceSchema();
    const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return product[0] ?? null;
  } catch (error) {
    console.warn("Falling back to local product data:", error);
    return getFallbackCatalogProducts().find((product) => product.id === id) ?? null;
  }
}

export async function getCategoryBySlugWithProducts(slug: string) {
  const normalizedSlug = resolveCategorySlug(slug);
  const catalog = await getCatalog({ category: normalizedSlug, pageSize: 99 });
  const categories = isDatabaseConfigured()
    ? await getCachedDbCategories()
    : getFallbackCategoryRecords();

  return {
    category: categories.find((entry) => entry.slug === normalizedSlug) ?? getCategoryBySlug(normalizedSlug) ?? null,
    products: catalog.items,
  };
}
