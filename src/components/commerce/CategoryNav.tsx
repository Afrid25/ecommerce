import Link from "next/link";

type CategoryNavItem = {
  slug: string;
  name: string;
  count?: number;
};

type CategoryNavProps = {
  categories: CategoryNavItem[];
  activeSlug?: string;
  baseHref?: "shop" | "category";
};

export default function CategoryNav({
  categories,
  activeSlug,
  baseHref = "shop",
}: CategoryNavProps) {
  const getHref = (slug?: string) => {
    if (!slug) {
      return "/shop";
    }

    return baseHref === "category" ? `/category/${slug}` : `/shop?category=${slug}`;
  };

  return (
    <>
      <aside className="hidden rounded-[24px] border border-[var(--border)] bg-white/75 p-4 shadow-[var(--shadow-soft)] dark:bg-white/5 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Categories
          </h2>
          <Link href="/shop" className="text-xs font-semibold text-[var(--primary)]">
            All
          </Link>
        </div>
        <nav className="grid gap-2" aria-label="Product categories">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={getHref(category.slug)}
              className={`flex items-center justify-between rounded-[16px] px-4 py-3 text-sm transition ${
                activeSlug === category.slug
                  ? "bg-[#FF6A00] font-semibold text-white"
                  : "bg-[var(--surface)] hover:text-[var(--primary)]"
              }`}
            >
              <span>{category.name}</span>
              {typeof category.count === "number" ? <span>{category.count}</span> : null}
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="no-scrollbar flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label="Product categories">
        <Link
          href="/shop"
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            !activeSlug ? "bg-[#FF6A00] text-white" : "bg-[var(--surface)]"
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={getHref(category.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              activeSlug === category.slug ? "bg-[#FF6A00] text-white" : "bg-[var(--surface)]"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </>
  );
}
