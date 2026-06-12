import Link from "next/link";
import CategoryNav from "@/components/commerce/CategoryNav";
import EmptyState from "@/components/commerce/EmptyState";
import SearchBar from "@/components/commerce/SearchBar";
import ProductCard from "@/components/ProductCard";
import { getCatalog } from "@/lib/catalog";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    search?: string;
    material?: string;
    sort?: "popular" | "newest" | "price-asc" | "price-desc";
    view?: "grid" | "list";
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
};

function createShopHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `/shop?${query}` : "/shop";
}

const sortOptions = [
  ["Popular", "popular"],
  ["Newest", "newest"],
  ["Price low to high", "price-asc"],
  ["Price high to low", "price-desc"],
] as const;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;
  const view = params.view === "list" ? "list" : "grid";
  const catalog = await getCatalog({
    category: params.category,
    search: params.search,
    material: params.material,
    sort: params.sort,
    minPrice: params.minPrice ? Number.parseInt(params.minPrice, 10) : undefined,
    maxPrice: params.maxPrice ? Number.parseInt(params.maxPrice, 10) : undefined,
    page,
    pageSize: 12,
  });

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20 pt-28">
      <div className="container-nike">
        <section className="rounded-[32px] border border-[var(--border)] bg-white/82 p-5 shadow-[var(--shadow-soft)] dark:bg-white/5 md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="section-eyebrow">Store</p>
              <h1 className="mt-2 text-4xl font-semibold leading-tight md:text-5xl">
                Find products faster
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                Search, filter by category, compare products, and move straight into cart or buy now.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={createShopHref({ ...params, view: "grid", page: "1" })}
                className={`rounded-[14px] px-4 py-3 text-sm font-semibold ${
                  view === "grid" ? "bg-[#FF6A00] text-white" : "bg-[var(--surface)]"
                }`}
              >
                Grid
              </Link>
              <Link
                href={createShopHref({ ...params, view: "list", page: "1" })}
                className={`rounded-[14px] px-4 py-3 text-sm font-semibold ${
                  view === "list" ? "bg-[#FF6A00] text-white" : "bg-[var(--surface)]"
                }`}
              >
                List
              </Link>
            </div>
          </div>
          <div className="mt-6">
            <SearchBar defaultValue={params.search} />
          </div>
        </section>

        <div className="mt-6 lg:hidden">
          <CategoryNav categories={catalog.categories} activeSlug={params.category} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <CategoryNav categories={catalog.categories} activeSlug={params.category} />
            <div className="mt-4 rounded-[24px] border border-[var(--border)] bg-white/75 p-4 shadow-[var(--shadow-soft)] dark:bg-white/5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Materials
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {catalog.materials.map((material) => (
                  <Link
                    key={material}
                    href={createShopHref({ ...params, material, page: "1" })}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${
                      params.material === material ? "bg-[#FF6A00] text-white" : "bg-[var(--surface)]"
                    }`}
                  >
                    {material}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <section>
            <div className="mb-5 flex flex-col gap-3 rounded-[24px] border border-[var(--border)] bg-white/75 p-4 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[var(--text-secondary)]">
                {catalog.pagination.totalItems} products found
              </p>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map(([label, value]) => (
                  <Link
                    key={value}
                    href={createShopHref({ ...params, sort: value, page: "1" })}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${
                      (params.sort ?? "popular") === value
                        ? "bg-[#FF6A00] text-white"
                        : "bg-[var(--surface)]"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {catalog.items.length === 0 ? (
              <EmptyState
                title="No products matched your filters"
                description="Try a broader search, clear the category, or browse all available products."
                actionHref="/shop"
                actionLabel="Reset Filters"
              />
            ) : (
              <div className={`grid ${view === "grid" ? "grid-cols-2 gap-4 lg:grid-cols-4" : "grid-cols-1 gap-4"}`}>
                {catalog.items.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={view} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
