import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductLoopSection from "@/components/ProductLoopSection";
import { getCatalog } from "@/lib/catalog";
import { getHomepageSettings } from "@/lib/commerce";
import { campaignOffers, testimonials } from "@/lib/site-content";


export const revalidate = 0;           // ISR reset
export const dynamic = "force-dynamic"; // Always render fresh
export default async function HomePage() {
  const homepage = await getHomepageSettings();
  const catalog = await getCatalog({ sort: "popular", pageSize: 12 });
  const trending = catalog.items.slice(0, 6);
  const recommended = catalog.items.slice(6, 12);
  const featuredCategories = catalog.categories.slice(0, 7);

  return (
    <div className="bg-[var(--background)]">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(107,142,35,0.28),_transparent_34%),linear-gradient(135deg,#16311a_0%,#0f2213_42%,#f5e6d3_42%,#fff8f1_100%)]">
        <div className="absolute inset-0">
          <Image src={homepage.heroImage} alt="MATVerse hero" fill priority className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        </div>
        <div className="container-nike relative grid min-h-[92vh] items-center gap-12 py-28 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-5 inline-flex rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white ring-1 ring-white/20">
              Eco modern commerce experience
            </p>
            <h1 className="font-display text-6xl leading-[0.88] text-white sm:text-7xl lg:text-8xl">
              <i>MATVERSE</i>
              <span className="block text-[#F5E6D3]">{homepage.heroTitle}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/80">
              {homepage.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary bg-[#FF6A00] hover:bg-[#e25f00]">
                {homepage.heroCtaText}
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["7", "curated categories"],
                ["24h", "average order response"],
                ["Low waste", "materials first"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[24px] border border-white/15 bg-white/8 p-4 text-white backdrop-blur">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-sm text-white/72">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[28rem]">
            <div className="absolute inset-x-8 top-6 hidden h-72 rounded-[3rem] bg-[#6B8E23]/20 blur-3xl lg:block" />
            <div className="absolute left-0 top-14 w-[52%] rotate-[-8deg] rounded-[2.5rem] border border-white/15 bg-white/12 p-4 shadow-2xl backdrop-blur animate-float">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                <Image src={homepage.heroImage} alt="MATVerse collection" fill className="object-cover" priority />
              </div>
            </div>
            <div className="absolute right-0 top-0 w-[58%] rounded-[2.5rem] border border-[#d7c2ab] bg-[#fff9f2] p-4 shadow-2xl animate-float-delay">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                <Image src="/images/matverse/product_oak_shelf.jpg" alt="Wooden decor" fill className="object-cover" priority />
              </div>
            </div>
            <div className="absolute bottom-2 right-10 w-[46%] rotate-[8deg] rounded-[2rem] border border-white/15 bg-[#153119] p-4 text-white shadow-xl animate-float-slow">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Limited stock</p>
              <p className="mt-2 text-2xl font-semibold">Only 5 solar power banks left</p>
              <p className="mt-2 text-sm leading-6 text-white/70">Urgency cues are now connected to real stock levels across the storefront.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-nike">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-eyebrow">Categories</p>
              <h2 className="section-title">Shop by material story and intent.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
              Every category now has a proper slug, image, and description so browsing and filtering feel deliberate instead of improvised.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featuredCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className={`group relative overflow-hidden rounded-[2rem] ${index === 0 ? "sm:col-span-2 xl:col-span-2" : ""}`}
              >
                <div className="relative aspect-[4/5]">
                  <Image src={category.image} alt={category.name} fill className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Browse Collection</p>
                  <h3 className="mt-2 text-3xl font-semibold">{category.name}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/78">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface)] py-20">
        <div className="container-nike">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-eyebrow">Trending</p>
              <h2 className="section-title">Best-performing products this week.</h2>
            </div>
            <Link href="/shop?sort=popular" className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-nike grid gap-6 lg:grid-cols-2">
          {campaignOffers.map((offer) => (
            <article key={offer.code} className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">{offer.code}</p>
              <h2 className="mt-4 text-3xl font-semibold">{offer.title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">{offer.description}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--text-secondary)]">Ends {new Date(offer.expiresAt).toLocaleDateString()}</span>
                <Link href="/shop?sort=price-desc" className="rounded-full bg-[#FF6A00] px-5 py-3 text-sm font-semibold text-white">
                  Claim Offer
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ProductLoopSection products={recommended.length > 0 ? recommended : trending} />

      <section className="py-20">
        <div className="container-nike">
          <div className="mb-10 text-center">
            <p className="section-eyebrow">Testimonials</p>
            <h2 className="section-title">Social proof that reinforces the decision.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-soft)]">
                <p className="text-lg leading-8 text-[var(--text-secondary)]">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">{testimonial.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-nike">
          <div className="rounded-[2.5rem] bg-[linear-gradient(135deg,#6B8E23_0%,#375012_45%,#1c2d0c_100%)] px-8 py-12 text-white md:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Final CTA</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
              {homepage.bannerText}
            </h2>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="rounded-full bg-white px-6 py-3 font-semibold text-[#1c2d0c]">
                Shop the collection
              </Link>
              <Link href="/admin" className="rounded-full border border-white/25 px-6 py-3 font-semibold text-white">
                Open admin dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


