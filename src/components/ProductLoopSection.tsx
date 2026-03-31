import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
};

export default function ProductLoopSection({ products }: Props) {
  const loopProducts = [...products, ...products].slice(0, 8);

  return (
    <section className="bg-[var(--surface)] py-20">
      <div className="container-nike">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-eyebrow">Discovery Loop</p>
            <h2 className="section-title">Keep browsing until something clicks.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
            A continuous mix of trending, low-stock, and giftable pieces designed to keep discovery flowing.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loopProducts.map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
