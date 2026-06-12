"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CategoryPillBar from "@/components/storefront/CategoryPillBar";
import { useSession } from "@/lib/auth-client";

type HomepageSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaText: string;
  bannerText: string;
  featuredProductIds: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
};

type Offer = {
  id: number;
  title: string;
  discount: number;
  discountType: string;
  image: string;
  priority: number;
  startDate: string | Date | null;
  endDate: string | Date | null;
  isActive: boolean;
};

type Product = {
  id: number | string;
  name: string;
  description: string;
  category: string;
  categorySlug?: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  image: string;
  isTrending?: boolean;
  isHot?: boolean;
  isLimited?: boolean;
};

type Testimonial = {
  name: string;
  quote: string;
};

type Props = {
  homepage: HomepageSettings;
  categories: Category[];
  trending: Product[];
  recommended: Product[];
  offers: Offer[];
  testimonials: Testimonial[];
  googleAuthEnabled: boolean;
};

const GUEST_MODE_STORAGE_KEY = "matverse-guest-mode";

function buildOfferLabel(offer: Offer) {
  return offer.discountType === "fixed" ? `Tk ${offer.discount} off` : `${offer.discount}% off`;
}

export default function StorefrontHomeExperience({
  homepage,
  categories,
  trending,
  recommended,
  offers,
  testimonials,
}: Props) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [guestModeActive, setGuestModeActive] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(GUEST_MODE_STORAGE_KEY) === "true",
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [promoIndex, setPromoIndex] = useState(0);
  const featuredProducts = recommended.length > 0 ? recommended : trending;
  const visibleProducts =
    activeCategory === "all"
      ? featuredProducts
      : featuredProducts.filter((product) => product.categorySlug === activeCategory);
  const featuredCategories = categories.slice(0, 6);
  const promoOffers = offers.filter((offer) => offer.isActive).slice(0, 5);
  const experienceReady = Boolean(session) || guestModeActive;

  useEffect(() => {
    if (promoOffers.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setPromoIndex((current) => (current + 1) % promoOffers.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [promoOffers.length]);

  const categoryItems = [
    { key: "all", label: "All" },
    ...featuredCategories.map((category) => ({ key: category.slug, label: category.name })),
  ];

  return (
    <div className="relative bg-[var(--background)]">
      {!experienceReady && !session && !isPending ? (
        <div className="fixed inset-0 z-[70] overflow-hidden bg-[#07110b]">
          <div className="absolute inset-0">
            <Image src={homepage.heroImage} alt="MATVerse entry experience" fill priority className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,106,70,0.34),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(134,168,82,0.32),_transparent_32%),linear-gradient(180deg,rgba(4,10,7,0.55),rgba(4,10,7,0.9))]" />
          </div>
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#d46a46]/25 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#8baa5c]/20 blur-3xl" />
          <div className="container-nike relative flex min-h-screen items-center justify-center py-16">
            <div className="glass-panel max-w-2xl rounded-[2.5rem] px-8 py-10 text-white shadow-[0_45px_120px_-45px_rgba(0,0,0,0.9)] md:px-12">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-white/85">
                  <Image src="/logo.png" alt="MATVerse logo" fill sizes="64px" className="object-contain p-2" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                    MATVerse
                  </p>
                  <h1 className="mt-1 font-display text-4xl md:text-5xl">Calm materials. Premium living.</h1>
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
                Browse a polished collection of bamboo, wood, and sustainable lifestyle pieces with a quieter, more premium shopping flow.
              </p>

              <div className="mt-8 grid gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/login?provider=google")}
                  className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white px-6 py-4 text-sm font-semibold text-[#16311a] transition duration-300 hover:scale-[1.01]"
                >
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.localStorage.setItem(GUEST_MODE_STORAGE_KEY, "true");
                    setGuestModeActive(true);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur transition duration-300 hover:bg-white/16"
                >
                  Continue as Guest
                </button>
              </div>

              <div className="mt-8 grid gap-3 rounded-[2rem] border border-white/10 bg-black/15 p-5 text-sm text-white/70 md:grid-cols-2">
                <p>Guest sessions can browse, filter, and use a temporary cart, but activity resets after the session ends.</p>
                <p>Signed-in shoppers can keep order history, remembered preferences, and eligibility for personalized offers.</p>
              </div>

              <div className="mt-6 flex flex-col gap-2 text-xs leading-6 text-white/55 md:flex-row md:items-center md:justify-between">
                <p>By continuing, you agree to the terms, privacy notice, and store policies.</p>
                <p>We only retain account data needed to improve your shopping experience.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="relative overflow-hidden border-b border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,248,241,0.92))] pt-28">
        <div className="container-nike relative py-6">
          {promoOffers.length > 0 ? (
            <div className="glass-panel grid gap-5 rounded-[2rem] px-5 py-5 md:grid-cols-[1.1fr_0.9fr] md:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                  Campaign Spotlight
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[#16311a] md:text-3xl">
                  {promoOffers[promoIndex]?.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
                  Admin-controlled promotions now feed the storefront directly, including live dates, visibility, priority, and pricing logic.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full bg-[#16311a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    {buildOfferLabel(promoOffers[promoIndex])}
                  </span>
                  <Link href="/shop?sort=popular" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[#16311a]">
                    Explore campaign
                  </Link>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {promoOffers.map((offer, index) => (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => setPromoIndex(index)}
                    className={`overflow-hidden rounded-[1.5rem] border text-left transition duration-300 ${
                      promoIndex === index
                        ? "border-[#16311a] bg-[#16311a] text-white"
                        : "border-white/50 bg-white/70 text-[#16311a]"
                    }`}
                  >
                    <div className="relative h-28">
                      <Image
                        src={offer.image || homepage.heroImage}
                        alt={offer.title}
                        fill
                        sizes="(max-width: 767px) 100vw, 240px"
                        className={`object-cover ${promoIndex === index ? "opacity-60" : "opacity-75"}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                          Priority {offer.priority}
                        </p>
                        <p className="mt-1 text-base font-semibold text-white">{offer.title}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-[2rem] px-5 py-4 text-sm text-[var(--text-secondary)]">
              {homepage.bannerText}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden pb-14">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(128,166,82,0.22),_transparent_32%),radial-gradient(circle_at_right,_rgba(212,106,70,0.16),_transparent_28%)]" />
        <div className="container-nike relative grid gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div className="space-y-8">
            <div className="glass-panel max-w-2xl rounded-[2.5rem] px-7 py-7 md:px-8 md:py-8">
              <p className="inline-flex rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#16311a]">
                Premium sustainable commerce
              </p>
              <h1 className="mt-6 font-display text-5xl leading-[0.9] text-[#16311a] md:text-7xl">
                {homepage.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-[var(--text-secondary)] md:text-base">
                {homepage.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/shop" className="btn-primary bg-[#D46A46] hover:bg-[#c65f3d]">
                  {homepage.heroCtaText}
                </Link>
                <Link href="/profile" className="btn-secondary border-[#16311a] text-[#16311a]">
                  Personalize my shop
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Guest mode", "Session-only browsing and temporary cart memory"],
                ["Personalized", "Saved order history and smarter offer eligibility"],
                ["Operational", "Admin-managed campaigns and live inventory-aware checkout"],
              ].map(([title, body]) => (
                <div key={title} className="glass-panel rounded-[1.8rem] px-5 py-5">
                  <p className="text-sm font-semibold text-[#16311a]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[28rem]">
            <div className="absolute left-0 top-10 h-80 w-80 rounded-full bg-[#d46a46]/18 blur-3xl" />
            <div className="absolute right-0 top-5 h-72 w-72 rounded-full bg-[#89a85d]/18 blur-3xl" />
            <div className="absolute left-0 top-10 w-[52%] rotate-[-8deg] overflow-hidden rounded-[2.4rem] border border-white/35 bg-white/45 p-4 shadow-[0_25px_60px_-28px_rgba(0,0,0,0.6)] backdrop-blur animate-float">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                <Image src={homepage.heroImage} alt="MATVerse interior editorial" fill priority sizes="(max-width: 1023px) 50vw, 320px" className="object-cover" />
              </div>
            </div>
            <div className="absolute right-0 top-0 w-[58%] overflow-hidden rounded-[2.4rem] border border-white/35 bg-white/55 p-4 shadow-[0_25px_60px_-28px_rgba(0,0,0,0.55)] backdrop-blur animate-float-delay">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                <Image src={featuredCategories[0]?.image || homepage.heroImage} alt="Featured category aesthetic" fill priority sizes="(max-width: 1023px) 55vw, 360px" className="object-cover" />
              </div>
            </div>
            <div className="glass-panel absolute bottom-2 right-8 w-[48%] rounded-[1.8rem] px-5 py-5 animate-float-slow">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Store status</p>
              <p className="mt-2 text-2xl font-semibold text-[#16311a]">{trending[0]?.stock ?? 0} units moving fastest</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Product urgency, promo pricing, and checkout totals are now aligned around the same live catalog data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container-nike">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-eyebrow">Category Flow</p>
              <h2 className="section-title">Filter the catalog by intent, not clutter.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              These category pills now behave like a clean discovery layer: fast, mobile-friendly, horizontally scrollable, and consistent with the dedicated shop experience.
            </p>
          </div>
          <CategoryPillBar items={categoryItems} activeKey={activeCategory} onSelect={setActiveCategory} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-[2rem] border border-white/40"
              >
                <div className="relative aspect-[5/4]">
                  <Image src={category.image} alt={category.name} fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/22 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Shop now</p>
                  <h3 className="mt-2 text-2xl font-semibold">{category.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/80">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0.4),rgba(247,242,235,0.85))] py-16">
        <div className="container-nike">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-eyebrow">Featured Picks</p>
              <h2 className="section-title">A cleaner, more premium product grid.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
              The mobile layout now supports two products side-by-side, while discounts and urgency states stay mathematically consistent with active campaigns.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(visibleProducts.length > 0 ? visibleProducts : featuredProducts).slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-nike grid gap-6 lg:grid-cols-2">
          {(promoOffers.length > 0 ? promoOffers : offers.slice(0, 2)).map((offer) => (
            <article key={offer.id} className="glass-panel overflow-hidden rounded-[2.4rem]">
              <div className="relative h-48">
                <Image src={offer.image || homepage.heroImage} alt={offer.title} fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">{buildOfferLabel(offer)}</p>
                  <h3 className="mt-2 text-3xl font-semibold">{offer.title}</h3>
                </div>
              </div>
              <div className="px-6 py-6">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  Controlled from the admin panel with schedule windows, visibility toggles, pricing logic, and homepage priority.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {offer.endDate ? `Ends ${new Date(offer.endDate).toLocaleDateString()}` : "No expiry set"}
                  </span>
                  <Link href="/shop?sort=popular" className="rounded-full bg-[#D46A46] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c65f3d]">
                    Shop campaign
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <div className="container-nike">
          <div className="mb-8 text-center">
            <p className="section-eyebrow">Customer Trust</p>
            <h2 className="section-title">A calmer storefront needs stronger proof.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="glass-panel rounded-[2rem] px-6 py-7">
                <p className="text-lg leading-8 text-[var(--text-secondary)]">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#16311a]">
                  {testimonial.name}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-[2.6rem] bg-[linear-gradient(135deg,#16311a_0%,#243c1f_52%,#314821_100%)] px-8 py-10 text-white md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Next Step</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
              {homepage.bannerText}
            </h2>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/shop" className="rounded-full bg-white px-6 py-3 font-semibold text-[#16311a]">
                Shop the collection
              </Link>
              <Link href="/admin/homepage" className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white">
                Manage homepage
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
