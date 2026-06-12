import ProductGrid from "@/components/home/ProductGrid";
import type { Product } from "@/types/product";

type FeaturedDealsProps = {
  products: Product[];
};

export default function FeaturedDeals({ products }: FeaturedDealsProps) {
  return (
    <div className="bg-[#fff7ed] py-4">
      <ProductGrid
        eyebrow="Flash deals"
        title="Today's featured deals"
        products={products}
        href="/shop?sort=popular"
        actionLabel="Shop deals"
      />
    </div>
  );
}
