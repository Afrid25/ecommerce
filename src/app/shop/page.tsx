import Link from "next/link";
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
        <div className="rounded-[2.5rem] border border-[var(--border)] bg-white px-6 py-8 shadow-[var(--shadow-soft)] md:px-8">
          <p className="section-eyebrow">Catalog</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-5xl leading-none md:text-7xl">Shop All</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                Explore products by category, material, and urgency cues. The catalog now keeps category pages, filters, and stock messaging in sync.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={createShopHref({ ...params, view: "grid", page: "1" })} className={`rounded-full px-4 py-2 text-sm font-semibold ${view === "grid" ? "bg-[var(--primary)] text-white" : "border border-[var(--border)]"}`}>Grid</Link>
              <Link href={createShopHref({ ...params, view: "list", page: "1" })} className={`rounded-full px-4 py-2 text-sm font-semibold ${view === "list" ? "bg-[var(--primary)] text-white" : "border border-[var(--border)]"}`}>List</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-28 lg:h-fit">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Filters</h2>
              <Link href="/shop" className="text-sm text-[var(--primary)]">Reset</Link>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {catalog.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={createShopHref({ ...params, category: category.slug, page: "1" })}
                      className={`rounded-full px-4 py-2 text-sm ${params.category === category.slug ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] text-[var(--foreground)]"}`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {catalog.materials.map((material) => (
                    <Link
                      key={material}
                      href={createShopHref({ ...params, material, page: "1" })}
                      className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm"
                    >
                      {material}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Sort</h3>
                <div className="grid gap-2">
                  {[
                    ["Most Popular", "popular"],
                    ["Newest", "newest"],
                    ["Price Low to High", "price-asc"],
                    ["Price High to Low", "price-desc"],
                  ].map(([label, value]) => (
                    <Link key={value} href={createShopHref({ ...params, sort: value, page: "1" })} className="rounded-2xl bg-[var(--surface)] px-4 py-3 text-sm">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">{catalog.pagination.totalItems} products found</p>
              <p className="text-sm text-[var(--text-secondary)]">Page {catalog.pagination.page} of {catalog.pagination.totalPages}</p>
            </div>
            <div className={`grid ${view === "grid" ? "grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 gap-6"}`}>
              {catalog.items.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={view} />
              ))}
            </div>

            {catalog.items.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[var(--border)] px-6 py-16 text-center text-[var(--text-secondary)]">
                No products found matching your current filters.
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
