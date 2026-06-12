import Link from "next/link";

export type MarketplaceCategory = {
  name: string;
  href: string;
  tone: string;
  description: string;
};

export const marketplaceCategories: MarketplaceCategory[] = [
  {
    name: "Electronics",
    href: "/shop?category=electronics",
    tone: "bg-sky-50 text-sky-900",
    description: "Phones, gadgets, accessories",
  },
  {
    name: "Fashion",
    href: "/shop?category=cloths-fashion",
    tone: "bg-rose-50 text-rose-900",
    description: "Clothing, shoes, bags",
  },
  {
    name: "Grocery",
    href: "/shop?search=grocery",
    tone: "bg-lime-50 text-lime-900",
    description: "Daily pantry essentials",
  },
  {
    name: "Home & Living",
    href: "/shop?category=wooden-decor",
    tone: "bg-amber-50 text-amber-900",
    description: "Furniture, decor, storage",
  },
  {
    name: "Beauty",
    href: "/shop?search=beauty",
    tone: "bg-fuchsia-50 text-fuchsia-900",
    description: "Skincare, makeup, personal care",
  },
  {
    name: "Sports",
    href: "/shop?search=sports",
    tone: "bg-orange-50 text-orange-900",
    description: "Fitness, outdoors, team gear",
  },
  {
    name: "Baby & Kids",
    href: "/shop?search=baby%20kids",
    tone: "bg-cyan-50 text-cyan-900",
    description: "Toys, care, clothing",
  },
  {
    name: "Eco-Friendly",
    href: "/shop?category=eco-lifestyle",
    tone: "bg-emerald-50 text-emerald-900",
    description: "Reusable, low-waste picks",
  },
];

export default function CategoryGrid() {
  return (
    <section id="categories" className="container-nike py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Categories</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Browse by department</h2>
        </div>
        <Link href="/shop" className="hidden text-sm font-semibold text-[var(--primary)] sm:inline">
          View all
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-8">
        {marketplaceCategories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className={`flex min-h-28 w-36 shrink-0 flex-col justify-between rounded-[18px] border border-black/5 p-4 shadow-sm transition hover:-translate-y-1 sm:w-auto ${category.tone}`}
          >
            <span className="text-sm font-semibold">{category.name}</span>
            <span className="mt-3 text-xs leading-5 opacity-75">{category.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
