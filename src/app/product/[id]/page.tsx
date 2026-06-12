import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductReviewsSection from "@/components/ProductReviewsSection";
import ProductViewTracker from "@/components/ProductViewTracker";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import SupportChat from "@/components/SupportChat";
import { getCatalog, getProductById } from "@/lib/catalog";
import { getApprovedProductReviews, getRecommendedProducts } from "@/lib/commerce";
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
  const activeOffer =
    "activeOffer" in product && product.activeOffer && typeof product.activeOffer === "object"
      ? (product.activeOffer as { title?: string | null })
      : null;
  const approvedReviews = await getApprovedProductReviews(Number(product.id));
  const discountPercent =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;
  const recommendedProducts = await getRecommendedProducts(Number(product.id));
  const relatedCatalog =
    recommendedProducts.length === 0
      ? await getCatalog({
          category: product.categorySlug || product.category,
          pageSize: 6,
        })
      : null;
  const relatedProducts = (recommendedProducts.length > 0 ? recommendedProducts : relatedCatalog?.items ?? [])
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <ProductViewTracker product={product} />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/shop"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
        >
          Back to Shop
        </Link>
        <Link
          href={`/category/${product.categorySlug || ""}`}
          className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]"
        >
          {product.category}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[36px] bg-[var(--surface)]">
            <Image
              src={enhancement.gallery[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 55vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {enhancement.gallery.slice(0, 3).map((image, index) => (
              <div
                key={`${product.id}-${index}`}
                className="relative aspect-square overflow-hidden rounded-[24px] bg-[var(--surface)]"
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  sizes="(max-width: 1023px) 33vw, 180px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[36px] border border-[var(--border)] bg-white/80 p-6 shadow-[var(--shadow-soft)] dark:bg-white/5 md:p-8">
          <p className="section-eyebrow">{enhancement.material}</p>
          <h1 className="mt-4 break-words font-[family-name:var(--font-brand)] text-4xl leading-tight md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--text-secondary)]">
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

          <div className="mt-8 flex flex-col gap-4 border-y border-[var(--border)] py-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Price
              </p>
              <p className="mt-2 text-4xl font-bold">{formatCurrency(product.price)}</p>
              {typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)] line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                  <span className="rounded-full bg-[#FF6A00]/10 px-3 py-1 text-xs font-semibold text-[#C65300]">
                    {discountPercent}% off
                  </span>
                </div>
              ) : null}
              {activeOffer?.title ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#D46A46]">
                  {activeOffer.title}
                </p>
              ) : null}
            </div>
            <p
              className={`text-sm font-semibold uppercase tracking-[0.18em] ${
                product.stock > 0 ? "text-[#FF6A00]" : "text-red-500"
              }`}
            >
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

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Delivery", "Nationwide delivery placeholder. Carrier rates and delivery windows will connect to logistics later."],
              ["Returns", "7-day return policy placeholder. Final eligibility rules will be configured by operations."],
              ["Seller", "MATVerse Official Store. Seller score, response rate, and shop chat hooks can be added here."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[24px] bg-[var(--surface)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  {title}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] bg-[var(--surface)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              Payment
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              Cash on Delivery is available now. SSLCommerz, Stripe, and mobile banking slots are
              reserved for future gateway integration.
            </p>
          </div>

          <div className="mt-6 rounded-[28px] bg-[var(--surface)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              Product Support
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              Ask about this product before ordering and get quick support on WhatsApp or Messenger.
            </p>
            <div className="mt-4">
              <SupportChat
                product={{
                  name: product.name,
                  price: product.price,
                  url: `/product/${product.id}`,
                }}
                inline
              />
            </div>
          </div>
        </div>
      </div>

      <ProductReviewsSection productId={Number(product.id)} reviews={approvedReviews} />

      <section className="mt-10 rounded-[28px] border border-dashed border-[var(--border)] bg-white/70 p-6 dark:bg-white/5">
        <p className="section-eyebrow">Reviews and ratings</p>
        <h2 className="mt-3 text-2xl font-semibold">Customer proof will live here.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
          Rating breakdowns, verified-purchase badges, media reviews, and review sorting are ready
          to be layered on top of the existing reviews module.
        </p>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-16">
          <div className="mb-8">
            <p className="section-eyebrow">You May Also Like</p>
            <h2 className="section-title">More from this collection story.</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
