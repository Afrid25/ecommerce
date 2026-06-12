import Link from "next/link";
import ResponsiveSearchBar from "@/components/home/ResponsiveSearchBar";

const HERO_BACKGROUND_IMAGE = "/images/hero-bg.jpg";

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#111827] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(9, 15, 28, 0.82), rgba(9, 15, 28, 0.58), rgba(9, 15, 28, 0.35)), url("${HERO_BACKGROUND_IMAGE}")`,
      }}
    >
      {/* Replace HERO_BACKGROUND_IMAGE with a final marketplace campaign image when ready. */}
      <div className="container-nike flex min-h-[520px] items-center py-20 sm:min-h-[580px] lg:min-h-[640px]">
        <div className="w-full max-w-3xl text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
            MATVerse marketplace
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-6xl">
            Everything you need, across every category.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
            Shop electronics, fashion, grocery, home, beauty, sports, baby products, eco-friendly
            picks, and whatever category comes next.
          </p>
          <div className="mt-8 max-w-2xl">
            <ResponsiveSearchBar />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center rounded-[16px] bg-[#FF6A00] px-6 text-sm font-semibold text-white transition hover:bg-[#e65f00]"
            >
              Shop Now
            </Link>
            <Link
              href="#categories"
              className="inline-flex min-h-12 items-center justify-center rounded-[16px] border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
