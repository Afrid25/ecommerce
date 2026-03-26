import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductViewTracker from "@/components/ProductViewTracker";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import { getCatalog, getProductById } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { getProductEnhancement } from "@/lib/product-content";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(Number.parseInt(id, 10));

  if (!product) {
    notFound();
  }

  const enhancement = getProductEnhancement(product);
  const relatedCatalog = await getCatalog({
    category: product.categorySlug || product.category,
    pageSize: 6,
  });
  const relatedProducts = relatedCatalog.items.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <ProductViewTracker product={product} />

      <div className="mb-8 flex items-center justify-between">
        <Link href="/shop" className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)] transition hover:text-[var(--primary)]">
          Back to Shop
        </Link>
        <Link href={`/category/${product.categorySlug || ""}`} className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          {product.category}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="group relative overflow-hidden rounded-[36px] bg-[var(--surface)]">
            <Image
              src={enhancement.gallery[0]}
              alt={product.name}
              width={1200}
              height={1400}
              priority
              className="h-auto w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {enhancement.gallery.slice(0, 3).map((image, index) => (
              <div key={`${product.id}-${index}`} className="overflow-hidden rounded-[24px] bg-[var(--surface)]">
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[36px] border border-[var(--border)] bg-white/80 p-8 shadow-[var(--shadow-soft)] dark:bg-white/5">
          <p className="section-eyebrow">{enhancement.material}</p>
          <h1 className="mt-4 font-[family-name:var(--font-brand)] text-5xl leading-tight">
            {product.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {enhancement.materialBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-end justify-between gap-4 border-y border-[var(--border)] py-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Price
              </p>
              <p className="mt-2 text-4xl font-bold">{formatCurrency(product.price)}</p>
            </div>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${product.stock > 0 ? "text-[#FF6A00]" : "text-red-500"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] bg-[var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Sustainability
              </p>
              <p className="mt-3 text-sm leading-7">{enhancement.sustainabilityNote}</p>
            </div>
            <div className="rounded-[28px] bg-[var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Craft
              </p>
              <p className="mt-3 text-sm leading-7">{enhancement.artisanNote}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Dimensions
              </p>
              <p className="mt-2 text-sm leading-7">{enhancement.dimensions}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Care
              </p>
              <p className="mt-2 text-sm leading-7">{enhancement.care}</p>
            </div>
          </div>

          <div className="mt-8">
            <ProductDetailActions product={product} />
          </div>

          <div className="mt-8 rounded-[28px] bg-[var(--surface)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              Payment Methods
            </p>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span>Cash on Delivery</span>
                <span className="text-[var(--text-secondary)]">Nationwide</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>bKash Merchant</span>
                <span className="text-[var(--text-secondary)]">OTP Verified</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Nagad Merchant</span>
                <span className="text-[var(--text-secondary)]">OTP Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16 rounded-[36px] border border-[var(--border)] bg-white/80 p-8 shadow-[var(--shadow-soft)] dark:bg-white/5 lg:p-10">
        <div className="mb-8">
          <p className="section-eyebrow">Client Reviews</p>
          <h2 className="section-title">How these pieces live inside real homes.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {enhancement.reviews.map((review) => (
            <article key={review.id} className="rounded-[28px] bg-[var(--surface)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {review.verified ? "Verified Purchase" : "Review"}
              </p>
              <h3 className="mt-4 text-lg font-semibold">{review.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{review.comment}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {review.userName} · {review.rating}/5
              </p>
            </article>
          ))}
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-16">
          <div className="mb-8">
            <p className="section-eyebrow">You May Also Like</p>
            <h2 className="section-title">More from this collection story.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <RecentlyViewedProducts currentProductId={Number(product.id)} />
    </div>
  );
}
