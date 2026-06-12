import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedDeals from "@/components/home/FeaturedDeals";
import HeroSection from "@/components/home/HeroSection";
import ProductGrid from "@/components/home/ProductGrid";
import { getCatalog } from "@/lib/catalog";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [popularCatalog, newestCatalog, ecoCatalog] = await Promise.all([
    getCatalog({ sort: "popular", pageSize: 10 }),
    getCatalog({ sort: "newest", pageSize: 10 }),
    getCatalog({ category: "eco-lifestyle", pageSize: 5 }),
  ]);

  const dealProducts = popularCatalog.items
    .filter((product) => product.isHot || product.isTrending || product.compareAtPrice)
    .slice(0, 5);
  const fallbackDeals = popularCatalog.items.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f6f7fb] pt-20 text-[var(--foreground)]">
      <HeroSection />
      <CategoryGrid />
      <FeaturedDeals products={dealProducts.length > 0 ? dealProducts : fallbackDeals} />
      <ProductGrid
        eyebrow="Recommended"
        title="Picked for your next order"
        products={newestCatalog.items}
        href="/shop?sort=newest"
        actionLabel="Browse recommended"
      />
      <ProductGrid
        eyebrow="Eco-Friendly"
        title="Eco-friendly picks"
        products={ecoCatalog.items}
        href="/shop?category=eco-lifestyle"
        actionLabel="Shop eco-friendly"
      />
    </div>
  );
}
