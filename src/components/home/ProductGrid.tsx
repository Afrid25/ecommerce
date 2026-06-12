import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

type ProductGridProps = {
  title: string;
  eyebrow?: string;
  products: Product[];
  href?: string;
  actionLabel?: string;
};

export default function ProductGrid({
  title,
  eyebrow,
  products,
  href = "/shop",
  actionLabel = "View more",
}: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="container-nike py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
        </div>
        <Link href={href} className="text-sm font-semibold text-[var(--primary)]">
          {actionLabel}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
