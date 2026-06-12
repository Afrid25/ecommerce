import Image from "next/image";
import Link from "next/link";
import CategoryNav from "@/components/commerce/CategoryNav";
import EmptyState from "@/components/commerce/EmptyState";
import ProductCard from "@/components/ProductCard";
import { getCatalog, getCategoryBySlugWithProducts } from "@/lib/catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: "popular" | "newest" | "price-asc" | "price-desc";
    view?: "grid" | "list";
  }>;
};

function categoryHref(slug: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `/category/${slug}?${query}` : `/category/${slug}`;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const view = query.view === "list" ? "list" : "grid";
  const data = await getCategoryBySlugWithProducts(slug);
  const catalog = await getCatalog({ category: slug, sort: query.sort, pageSize: 24 });
  const allCategories = await getCatalog({ pageSize: 1 });

  if (!data?.category) {
    return (
      <div className="container-nike py-32">
        <EmptyState
          title="Category not found"
          description="This category may have been renamed or removed."
          actionHref="/shop"
          actionLabel="Return to shop"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20 pt-28">
      <div className="container-nike">
        <section className="relative overflow-hidden rounded-[32px] bg-[#16311a] px-6 py-12 text-white shadow-[var(--shadow-soft)] md:px-10">
          <Image
            src={data.category.image || "/images/matverse/interior_scene_collage.jpg"}
            alt={data.category.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
              Category
            </p>
            <h1 className="mt-4 text-4xl font-semibold md:text-6xl">{data.category.name}</h1>
            <p className="mt-5 text-base leading-8 text-white/80">
              {data.category.description || "Browse products selected for this category."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-full bg-[#FF6A00] px-5 py-3 text-sm font-semibold text-white">
                All products
              </Link>
              <Link href={`/shop?category=${data.category.slug}`} className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold">
                Open in store
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-6 lg:hidden">
          <CategoryNav categories={allCategories.categories} activeSlug={slug} baseHref="category" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <CategoryNav categories={allCategories.categories} activeSlug={slug} baseHref="category" />
          </div>
          <section>
            <div className="mb-5 flex flex-col gap-3 rounded-[24px] border border-[var(--border)] bg-white/75 p-4 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[var(--text-secondary)]">
                {catalog.pagination.totalItems} items in {data.category.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  ["Popular", "popular"],
                  ["Newest", "newest"],
                  ["Low price", "price-asc"],
                  ["High price", "price-desc"],
                ].map(([label, value]) => (
                  <Link
                    key={value}
                    href={categoryHref(slug, { ...query, sort: value })}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${
                      (query.sort ?? "popular") === value ? "bg-[#FF6A00] text-white" : "bg-[var(--surface)]"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {catalog.items.length === 0 ? (
              <EmptyState
                title="No products in this category yet"
                description="The category exists, but products have not been assigned to it yet."
                actionHref="/shop"
                actionLabel="Browse all products"
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
